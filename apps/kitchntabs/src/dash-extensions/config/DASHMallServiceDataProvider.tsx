/**
 * DASHSelfServiceClientDataProvider
 * 
 * Data provider for public self-service kiosk client (guest ordering).
 * 
 * This provider uses `selfservice_session` (the session hash) to identify the session.
 * The backend resolves the tenant from the session.
 */
import { AxiosError } from 'axios';
import { processAxiosError } from 'dash-axios-hook';
import { IDashAutoAdminDefaultBackendStructure } from 'dash-axios-hook/src/interfaces/IDashAutoAdminBackendError';
import { getResourceConfig, processFormData, processPostData } from 'kt-utils/src/dataProviderUtils';
import genericDataProvider from "./DASHDataProvider";
import { dashStorage } from 'dash-utils';

// Resource path mapping: frontend resource name → backend API path template
// Use {hash} as placeholder for session hash
const RESOURCE_PATH_MAP: Record<string, string> = {
  'tab': 'public/selfservice/{hash}/tab',
  // Add more mappings as needed for other self-service resources
};

// Helper function to extract the base resource name (without ID)
const getBaseResourceName = (resource: string): string => {
  const match = resource.match(/^([a-zA-Z_-]+)/);
  return match ? match[1] : resource;
};

// Helper function to map frontend resource to backend API path
// Replaces {hash} placeholder with actual session hash
const mapResourceToApiPath = (resource: string, sessionHash?: string | null): string => {
  const baseResource = getBaseResourceName(resource);
  let path = RESOURCE_PATH_MAP[baseResource] || resource;
  
  // Replace {hash} placeholder with session hash if available
  if (sessionHash && path.includes('{hash}')) {
    path = path.replace('{hash}', sessionHash);
  }
  
  return path;
};

/**
 * Get the session hash from localStorage.
 */
const getSessionId = (): string | null => {
    try {
        const sessionHash = dashStorage.getItem('selfservice-session-hash');
        
        if (sessionHash) {
            return sessionHash;
        }
        
        console.warn('[SelfServiceClientDataProvider] No session hash found in storage');
        return null;
    } catch (error) {
        console.warn('[SelfServiceClientDataProvider] Failed to get session_id:', error);
        return null;
    }
};

/**
 * Add selfservice_session to request params.
 */
const addSessionToParams = (params: any) => {
  const selfservice_session = getSessionId();
  
  if (!selfservice_session) {
    console.warn('[SelfServiceClientDataProvider] No selfservice_session available - request may fail');
    return params;
  }

  return {
    ...params,
    filter: {
      ...params.filter,
      selfservice_session
    },
    meta: {
      ...params.meta,
      selfservice_session
    }
  };
};

const dataProvider = {
  ...genericDataProvider,
  
  getList: async (resource: string, params: any, options?: any) => {
    const sessionHash = getSessionId();
    const apiResource = mapResourceToApiPath(resource, sessionHash);
    const enhancedParams = addSessionToParams(params);
    const result = await genericDataProvider.getList(apiResource, enhancedParams, options);
    return result;
  },

  getOne: async (resource: string, params: any) => {
    const session_id = getSessionId();
    const apiResource = mapResourceToApiPath(resource, session_id);
    
    if (!session_id) {
      console.warn('[SelfServiceClientDataProvider] No session_id for getOne - using generic provider');
      return genericDataProvider.getOne(apiResource, params);
    }

    const { useAxios } = await import('dash-axios-hook');
    const axios = useAxios();

    try {
      const url = `${apiResource}/${params.id}?selfservice_session=${session_id}`;
      const response = await axios.get(url, params.meta ? { params: params.meta } : {});

      return {
        data: response.data,
      };
    } catch (e: any) {
      console.error('[SelfServiceClientDataProvider] Error in getOne:', e);
      throw e;
    }
  },

  getMany: async (resource: string, params: any) => {
    const sessionHash = getSessionId();
    const apiResource = mapResourceToApiPath(resource, sessionHash);
    const enhancedParams = addSessionToParams(params);
    return genericDataProvider.getMany(apiResource, enhancedParams);
  },

  getManyReference: async (resource: string, params: any) => {
    const sessionHash = getSessionId();
    const apiResource = mapResourceToApiPath(resource, sessionHash);
    const enhancedParams = addSessionToParams(params);
    return genericDataProvider.getManyReference(apiResource, enhancedParams);
  },

  /**
   * Create a new resource (e.g., create a tab/order).
   */
  create: async (resource: string, params: any) => {
    const selfservice_session = getSessionId();
    if (!selfservice_session) {
      throw new Error('No session available. Please scan a valid QR code to start a session.');
    }
    
    const apiResource = mapResourceToApiPath(resource, selfservice_session);
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
            selfservice_session: selfservice_session
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
    const selfservice_session = getSessionId();
    if (!selfservice_session) {
      throw new Error('No session available. Please scan a valid QR code to start a session.');
    }
    
    const apiResource = mapResourceToApiPath(resource, selfservice_session);
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
            selfservice_session: selfservice_session
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

  // Disable delete operations for public self-service client
  delete: async () => {
    throw new Error('Delete operation is not allowed for self-service client.');
  },

  deleteMany: async () => {
    throw new Error('Delete operation is not allowed for self-service client.');
  },

  updateMany: async () => {
    throw new Error('Bulk update is not allowed for self-service client.');
  },
};

export default dataProvider;
