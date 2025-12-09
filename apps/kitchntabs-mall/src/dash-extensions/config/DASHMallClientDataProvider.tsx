import { AuthPersistenceService } from "dash-auth";
import { AxiosError } from 'axios';
import { processAxiosError } from 'dash-axios-hook';
import { IDashAutoAdminDefaultBackendStructure } from 'dash-axios-hook/src/interfaces/IDashAutoAdminBackendError';
import { getResourceConfig, processFormData, processPostData } from 'kt-utils/src/dataProviderUtils';
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

// Helper function to get mall_id
const getMallId = () => {
  try {
    return AuthPersistenceService.getSystemValues()["mall"]["id"] || null;
  } catch (error) {
    console.warn('Failed to get mall_id from AuthPersistenceService:', error);
    return null;
  }
};

const getSessionId = () => {
    try {
        const appPath = dashStorage.getItem('currentAppPath');
        // Also check for mall-session-hash as fallback (set by MallClientWrapper)
        const sessionHash = dashStorage.getItem('mall-session-hash');
        
        if (sessionHash) {
            console.log('[MallClientDataProvider] getSessionId from mall-session-hash:', sessionHash);
            return sessionHash;
        }
        
        if (!appPath) {
            console.warn('[MallClientDataProvider] No currentAppPath in storage');
            return null;
        }
        
        const segments = appPath.split('/');
        const sessionId = segments[segments.length - 1] || null;
        console.log('[MallClientDataProvider] getSessionId from path:', appPath, '-> sessionId:', sessionId);
        return sessionId;
    } catch (error) {
        console.warn('Failed to get session_id from localStorage:', error);
        return null;
    }
};

// Helper function to add mall_id and mall_session to params
const addMallIdToParams = (params: any) => {
  const mall_id = getMallId();
  const mall_session = getSessionId();
  
  // Build filter object - mall_session is required for tab filtering
  const additionalFilters: Record<string, any> = {};
  const additionalMeta: Record<string, any> = {};
  
  if (mall_id) {
    additionalFilters.mall_id = mall_id;
    additionalMeta.mall_id = mall_id;
  }
  
  if (mall_session) {
    additionalFilters.mall_session = mall_session;
    additionalMeta.mall_session = mall_session;
  }
  
  // Only warn if BOTH are missing
  if (!mall_id && !mall_session) {
    console.warn('No mall_id or mall_session available for mall data provider request');
    return params;
  }

  return {
    ...params,
    filter: {
      ...params.filter,
      ...additionalFilters
    },
    meta: {
      ...params.meta,
      ...additionalMeta
    }
  };
};

const dataProvider = {
  ...genericDataProvider,
  
  getList: async (resource: string, params: any, options?: any) => {
    console.log('🔥🔥🔥 [MallClientDataProvider] getList CALLED 🔥🔥🔥', { resource, params });
    const apiResource = mapResourceToApiPath(resource);
    const enhancedParams = addMallIdToParams(params);
    console.log('[MallClientDataProvider] getList:', { 
      resource, 
      apiResource, 
      originalFilter: params.filter, 
      enhancedFilter: enhancedParams.filter 
    });
    return genericDataProvider.getList(apiResource, enhancedParams, options);
  },

  getOne: async (resource: string, params: any) => {
    const apiResource = mapResourceToApiPath(resource);
    const mall_id = getMallId();
    if (!mall_id) {
      console.warn('No mall_id available for getOne request');
      return genericDataProvider.getOne(apiResource, params);
    }

    const session_id = getSessionId();
    if (!session_id) {
      console.warn('No session_id available for getOne request');
      return genericDataProvider.getOne(apiResource, params);
    }

    // Create a custom getOne that adds mall_id to the URL
    const { useAxios } = await import('dash-axios-hook');
    const axios = useAxios();

    try {
      const url = `${apiResource}/${params.id}?mall_id=${mall_id}&mall_session=${session_id}`;
      const response = await axios.get(url, params.meta ? { params: params.meta } : {});

      return {
        data: response.data,
      };
    } catch (e: any) {
      // Handle error similar to original getOne
      console.error('Error in mall getOne:', e);
      throw e;
    }
  },

  getMany: async (resource: string, params: any) => {
    const apiResource = mapResourceToApiPath(resource);
    const enhancedParams = addMallIdToParams(params);
    return genericDataProvider.getMany(apiResource, enhancedParams);
  },

  getManyReference: async (resource: string, params: any) => {
    const apiResource = mapResourceToApiPath(resource);
    const enhancedParams = addMallIdToParams(params);
    return genericDataProvider.getManyReference(apiResource, enhancedParams);
  },

  create: async (resource: string, params: any) => {
    const apiResource = mapResourceToApiPath(resource);
    const { useAxios } = await import('dash-axios-hook');
    const axios = useAxios();
    
    const mall_id = getMallId();
    if (!mall_id) {
      throw new Error('No mall_id available for create request. Mall context is required.');
    }

    const mall_session = getSessionId();
    if (!mall_session) {
      throw new Error('No mall_session available for create request. Mall context is required.');
    }

    const resourceConfig = getResourceConfig(apiResource);
    const isFormData =
        resourceConfig?.isFormData === true ||
        params.data?.isFormData === true ||
        params.meta?.isFormData === true;

    const resourcePath = /\/\d+$/.test(apiResource) ? apiResource : (params.id ? `${apiResource}/${params.id}` : apiResource);

    const method: 'POST' | 'PUT' = params.meta?.method
        ? params.meta.method
        : 'POST';

    const action = method === 'POST' ? axios.post : axios.put;

    const postData = processPostData(
        resourcePath,
        {
            ...params.data,
            mall_id: mall_id, // Add mall_id to the data
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
        throw processAxiosError(error, apiResource, 'create')
    }
  },

  update: async (resource: string, params: any) => {
    const apiResource = mapResourceToApiPath(resource);
    const { useAxios } = await import('dash-axios-hook');
    const axios = useAxios();
    
    const mall_id = getMallId();
    if (!mall_id) {
      throw new Error('No mall_id available for update request. Mall context is required.');
    }

    const mall_session = getSessionId();
    if (!mall_session) {
      throw new Error('No mall_session available for update request. Mall context is required.');
    }

    // Get the record ID - try params.id first, then params.data.id
    const recordId = params.id ?? params.data?.id;
    if (!recordId) {
      throw new Error('No record ID available for update request.');
    }

    const resourcePath = `${apiResource}/${recordId}`;

    console.log('[MallClientDataProvider] update:', {
      originalResource: resource,
      apiResource,
      recordId,
      resourcePath,
      mall_session
    });

    const postData = {
      ...params.data,
      mall_id: mall_id,
      mall_session: mall_session
    };

    try {
      const response = await axios.put(resourcePath, postData);
      
      // Check if there was a partial update with warnings
      if (response.data?.meta?.partial_update) {
        // Dispatch a warning event for the UI to handle
        window.dispatchEvent(new MessageEvent('DASHGlobalWarning', { 
          data: { 
            warning: {
              status: 206, // Partial Content
              body: response.data.meta.message || 'Algunos productos no pudieron actualizarse',
              warnings: response.data.meta.warnings
            }
          } 
        }));
      }
      
      return {
        data: response.data.data || response.data,
      };
    } catch (e: unknown) {
      const error = e as AxiosError<IDashAutoAdminDefaultBackendStructure>;
      throw processAxiosError(error, apiResource, 'update');
    }
  },

  updateMany: async (resource: string, params: any) => {
    throw new Error('Bulk store updates are not supported through the Mall interface. Use the main Tenant interface instead.');
  },

  delete: async (resource: string, params: any) => {
    const apiResource = mapResourceToApiPath(resource);
    const { useAxios } = await import('dash-axios-hook');
    const axios = useAxios();
    
    const mall_id = getMallId();
    const mall_session = getSessionId();

    if (!mall_id || !mall_session) {
      throw new Error('Mall context is required for delete operation.');
    }

    // Get the record ID - try params.id first, then params.data.id
    const recordId = params.id ?? params.data?.id ?? params.previousData?.id;
    if (!recordId) {
      throw new Error('No record ID available for delete request.');
    }

    const resourcePath = `${apiResource}/${recordId}`;

    console.log('[MallClientDataProvider] delete:', {
      originalResource: resource,
      apiResource,
      recordId,
      resourcePath,
      mall_session
    });

    try {
      const response = await axios.delete(resourcePath, {
        params: {
          mall_id,
          mall_session
        }
      });
      
      // Check if there was a partial delete with warnings
      if (response.data?.meta?.partial_delete) {
        window.dispatchEvent(new MessageEvent('DASHGlobalWarning', { 
          data: { 
            warning: {
              status: 206,
              body: response.data.meta.message || 'Algunos productos no pudieron eliminarse',
              warnings: response.data.meta.warnings
            }
          } 
        }));
      }
      
      return {
        data: response.data.data || response.data || { id: params.id },
      };
    } catch (e: unknown) {
      const error = e as AxiosError<IDashAutoAdminDefaultBackendStructure>;
      throw processAxiosError(error, apiResource, 'delete');
    }
  },

  deleteMany: async (resource: string, params: any) => {
    throw new Error('Bulk store deletion is not supported through the Mall interface. Use the main Tenant interface instead.');
  },

  import: async (resource: string, params: any) => {
    throw new Error('Store import is not supported through the Mall interface. Use the main Tenant interface instead.');
  }
};

export default dataProvider;
