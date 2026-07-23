/**
 * DASHMallServiceClientDataProvider
 * 
 * Data provider for public mall service client (guest ordering in food courts).
 * 
 * This provider uses `mall_session` (the session hash) to identify the session.
 * The backend resolves the mall and tenants from the session.
 * 
 * Key differences from SelfService:
 * - Storage key: 'mall-session-hash' (not 'selfservice-session-hash')
 * - API paths: 'public/mall/{hash}/...' (not 'public/selfservice/{hash}/...')
 * - Supports multi-tenant product aggregation
 */
import { AxiosError } from 'axios';
import { processAxiosError } from 'dash-axios-hook';
import { IDashAutoAdminDefaultBackendStructure } from 'dash-axios-hook/interfaces/IDashAutoAdminBackendError';
import { getResourceConfig, processFormData, processPostData } from 'kt-utils/dataProviderUtils';
import genericDataProvider from "./DASHDataProvider";
import { dashStorage } from 'dash-utils';

// Resource path mapping: frontend resource name → backend API path template
// Use {hash} as placeholder for session hash
const RESOURCE_PATH_MAP: Record<string, string> = {
  'tab': 'public/mall/tab',
  'stores': 'public/mall/stores',
  'products': 'public/mall/products',
  'categories': 'public/mall/categories',
  // Add more mappings as needed for other mall service resources
};

// Helper function to extract the base resource name (without ID)
const getBaseResourceName = (resource: string): string => {
  const match = resource.match(/^([a-zA-Z_-]+)/);
  return match ? match[1] : resource;
};

// Helper function to map frontend resource to backend API path
const mapResourceToApiPath = (resource: string): string => {
  const baseResource = getBaseResourceName(resource);
  return RESOURCE_PATH_MAP[baseResource] || resource;
};

/**
 * Get the mall session hash from localStorage.
 */
const getSessionId = (): string | null => {
    try {
        const sessionHash = dashStorage.getItem('mall-session-hash');
        
        if (sessionHash) {
            return sessionHash;
        }
        
        console.warn('[MallServiceClientDataProvider] No session hash found in storage');
        return null;
    } catch (error) {
        console.warn('[MallServiceClientDataProvider] Failed to get session_id:', error);
        return null;
    }
};

/**
 * Get the mall slug from localStorage.
 */
const getMallSlug = (): string | null => {
    try {
        return dashStorage.getItem('mall-slug');
    } catch (error) {
        console.warn('[MallServiceClientDataProvider] Failed to get mall_slug:', error);
        return null;
    }
};

/**
 * Add mall_session to request params.
 */
const addSessionToParams = (params: any) => {
  const mall_session = getSessionId();
  
  if (!mall_session) {
    console.warn('[MallServiceClientDataProvider] No mall_session available - request may fail');
    return params;
  }

  return {
    ...params,
    filter: {
      ...params.filter,
      mall_session
    },
    meta: {
      ...params.meta,
      mall_session
    }
  };
};

const dataProvider = {
  ...genericDataProvider,
  
  getList: async (resource: string, params: any, options?: any) => {
    const apiResource = mapResourceToApiPath(resource);
    const enhancedParams = addSessionToParams(params);
    const result = await genericDataProvider.getList(apiResource, enhancedParams, options);
    return result;
  },

  getOne: async (resource: string, params: any) => {
    const session_id = getSessionId();
    const apiResource = mapResourceToApiPath(resource);
    
    if (!session_id) {
      console.warn('[MallServiceClientDataProvider] No session_id for getOne - using generic provider');
      return genericDataProvider.getOne(apiResource, params);
    }

    const { useAxios } = await import('dash-axios-hook');
    const axios = useAxios();

    try {
      const url = `${apiResource}/${params.id}?mall_session=${session_id}`;
      const response = await axios.get(url, params.meta ? { params: params.meta } : {});

      return {
        data: response.data,
      };
    } catch (e: any) {
      console.error('[MallServiceClientDataProvider] Error in getOne:', e);
      throw e;
    }
  },

  getMany: async (resource: string, params: any) => {
    const apiResource = mapResourceToApiPath(resource);
    const enhancedParams = addSessionToParams(params);
    return genericDataProvider.getMany(apiResource, enhancedParams);
  },

  getManyReference: async (resource: string, params: any) => {
    const apiResource = mapResourceToApiPath(resource);
    const enhancedParams = addSessionToParams(params);
    return genericDataProvider.getManyReference(apiResource, enhancedParams);
  },

  /**
   * Create a new resource (e.g., create a tab/order).
   */
  create: async (resource: string, params: any) => {
    const mall_session = getSessionId();
    if (!mall_session) {
      throw new Error('No session available. Please scan a valid QR code to start a session.');
    }
    
    const apiResource = mapResourceToApiPath(resource);
    const { useAxios } = await import('dash-axios-hook');
    const axios = useAxios();

    const resourceConfig = getResourceConfig(apiResource);
    const isFormData =
        resourceConfig?.isFormData === true ||
        params.data?.isFormData === true ||
        params.meta?.isFormData === true;

    const resourcePath = /\/[\w-]+$/.test(apiResource) ? apiResource : (params.id ? `${apiResource}/${params.id}` : apiResource);

    const method: 'POST' | 'PUT' = params.meta?.method
        ? params.meta.method
        : 'POST';

    const action = method === 'POST' ? axios.post : axios.put;

    const postData = processPostData(
        resourcePath,
        {
            ...params.data,
            mall_session: mall_session
        },
        'create',
    );

    try {
        if (isFormData) {
            const form: FormData = processFormData(apiResource, postData);
            return await action(resourcePath, form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        }

        return await action(resourcePath, postData);

    } catch (e: unknown) {
        const error = e as AxiosError<IDashAutoAdminDefaultBackendStructure>;
        throw processAxiosError(error, apiResource, 'create');
    }
  },

  /**
   * Update an existing resource.
   */
  update: async (resource: string, params: any) => {
    const mall_session = getSessionId();
    if (!mall_session) {
      throw new Error('No session available. Please scan a valid QR code to start a session.');
    }
    
    const apiResource = mapResourceToApiPath(resource);
    const { useAxios } = await import('dash-axios-hook');
    const axios = useAxios();

    const resourceConfig = getResourceConfig(apiResource);
    const isFormData =
        resourceConfig?.isFormData === true ||
        params.data?.isFormData === true ||
        params.meta?.isFormData === true;

    const id = params.id;
    const resourcePath = `${apiResource}/${id}`;

    const postData = processPostData(
        resourcePath,
        {
            ...params.data,
            mall_session: mall_session
        },
        'update',
    );

    try {
        if (isFormData) {
            const form: FormData = processFormData(apiResource, postData);
            return await axios.put(resourcePath, form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        }

        return await axios.put(resourcePath, postData);

    } catch (e: unknown) {
        const error = e as AxiosError<IDashAutoAdminDefaultBackendStructure>;
        throw processAxiosError(error, apiResource, 'update');
    }
  },

  // Disable delete operations for public mall service client
  delete: async () => {
    throw new Error('Delete operation is not allowed for mall service client.');
  },

  deleteMany: async () => {
    throw new Error('Delete operation is not allowed for mall service client.');
  },

  updateMany: async () => {
    throw new Error('Bulk update is not allowed for mall service client.');
  },
};

export default dataProvider;
