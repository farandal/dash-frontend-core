/**
 * DASHMallClientDataProvider
 * 
 * Data provider for public mall client (guest ordering).
 * 
 * IMPORTANT: This provider only requires `mall_session` (the session hash).
 * The backend resolves the mall_id from the session using ResolveMallFromSessionTrait.
 * We do NOT send mall_id from the frontend - the backend handles this.
 */
import { AxiosError } from 'axios';
import { processAxiosError } from 'dash-axios-hook';
import { IDashAutoAdminDefaultBackendStructure } from 'dash-axios-hook/interfaces/IDashAutoAdminBackendError';
import { getResourceConfig, processFormData, processPostData } from 'kt-utils/dataProviderUtils';
import genericDataProvider from "./DASHDataProvider";
import { dashStorage } from 'dash-utils';

// Resource path mapping: frontend resource name → backend API path
const RESOURCE_PATH_MAP: Record<string, string> = {
  'tab': 'public/mall/tab',
  // Add more mappings as needed for other mall client resources
};

// Helper function to extract the base resource name (without ID)
const getBaseResourceName = (resource: string): string => {
  // Remove any trailing ID (e.g., "tab/36" -> "tab", "tab/36/edit" -> "tab")
  const match = resource.match(/^([a-zA-Z_-]+)/);
  return match ? match[1] : resource;
};

// Helper function to map frontend resource to backend API path
const mapResourceToApiPath = (resource: string): string => {
  const baseResource = getBaseResourceName(resource);
  return RESOURCE_PATH_MAP[baseResource] || resource;
};

/**
 * Get the session hash from localStorage.
 * This is the only identifier needed - backend resolves mall from session.
 */
const getSessionId = (): string | null => {
    try {
        // Primary source: mall-session-hash (set by MallClientWrapper)
        const sessionHash = dashStorage.getItem('mall-session-hash');
        
        if (sessionHash) {
            return sessionHash;
        }
        
        // @deprecated - removed currentAppPath fallback that caused issues
        // Use mall-session-hash which is set by MallClientWrapper
        
        console.warn('[MallClientDataProvider] No session hash found in storage');
        return null;
    } catch (error) {
        console.warn('[MallClientDataProvider] Failed to get session_id:', error);
        return null;
    }
};

/**
 * Add mall_session to request params.
 * The backend uses this to resolve the mall context via ResolveMallFromSessionTrait.
 */
const addSessionToParams = (params: any) => {
  const mall_session = getSessionId();
  
  if (!mall_session) {
    console.warn('[MallClientDataProvider] No mall_session available - request may fail');
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
    const apiResource = mapResourceToApiPath(resource);
    const session_id = getSessionId();
    
    if (!session_id) {
      console.warn('[MallClientDataProvider] No session_id for getOne - using generic provider');
      return genericDataProvider.getOne(apiResource, params);
    }

    // Add mall_session to the URL query - backend resolves mall from session
    const { useAxios } = await import('dash-axios-hook');
    const axios = useAxios();

    try {
      const url = `${apiResource}/${params.id}?mall_session=${session_id}`;
      const response = await axios.get(url, params.meta ? { params: params.meta } : {});

      return {
        data: response.data,
      };
    } catch (e: any) {
      console.error('[MallClientDataProvider] Error in getOne:', e);
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
   * Only mall_session is required - backend resolves mall from session.
   */
  create: async (resource: string, params: any) => {
    const apiResource = mapResourceToApiPath(resource);
    const { useAxios } = await import('dash-axios-hook');
    const axios = useAxios();
    
    const mall_session = getSessionId();
    if (!mall_session) {
      throw new Error('No mall_session available. Please scan a valid QR code to start a session.');
    }

    const resourceConfig = getResourceConfig(apiResource);
    const isFormData =
        resourceConfig?.isFormData === true ||
        params.data?.isFormData === true ||
        params.meta?.isFormData === true;

    const resourcePath =  /\/[\w-]+$/.test(apiResource) ? apiResource : (params.id ? `${apiResource}/${params.id}` : apiResource);

    const method: 'POST' | 'PUT' = params.meta?.method
        ? params.meta.method
        : 'POST';

    const action = method === 'POST' ? axios.post : axios.put;

    // Only add mall_session - backend resolves mall from session
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
   * Only mall_session is required - backend resolves mall from session.
   */
  update: async (resource: string, params: any) => {
    const apiResource = mapResourceToApiPath(resource);
    const { useAxios } = await import('dash-axios-hook');
    const axios = useAxios();

    const mall_session = getSessionId();
    if (!mall_session) {
      throw new Error('No mall_session available. Please scan a valid QR code to start a session.');
    }

    const resourceConfig = getResourceConfig(apiResource);
    const isFormData =
        resourceConfig?.isFormData === true ||
        params.data?.isFormData === true ||
        params.meta?.isFormData === true;

    const id = params.id;
    const resourcePath = `${apiResource}/${id}`;

    // Only add mall_session - backend resolves mall from session
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

  // Disable delete operations for public mall client
  delete: async () => {
    throw new Error('Delete operation is not allowed for mall client.');
  },

  deleteMany: async () => {
    throw new Error('Delete operation is not allowed for mall client.');
  },

  updateMany: async () => {
    throw new Error('Bulk update is not allowed for mall client.');
  },
};

export default dataProvider;
