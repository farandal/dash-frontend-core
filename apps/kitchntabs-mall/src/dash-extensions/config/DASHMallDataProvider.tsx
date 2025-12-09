import { AuthPersistenceService } from "dash-auth";
import { AxiosError } from 'axios';
import { processAxiosError } from 'dash-axios-hook';
import { IDashAutoAdminDefaultBackendStructure } from 'dash-axios-hook/src/interfaces/IDashAutoAdminBackendError';
import { getResourceConfig, processFormData, processPostData } from 'kt-utils/src/dataProviderUtils';
import genericDataProvider from "./DASHDataProvider";

// Helper function to get mall_id
const getMallId = () => {
  try {
    return AuthPersistenceService.getSystemValues()["mall"]["id"] || null;
  } catch (error) {
    console.warn('Failed to get mall_id from AuthPersistenceService:', error);
    return null;
  }
};

// Helper function to add mall_id to params
const addMallIdToParams = (params: any) => {
  const mall_id = getMallId();
  if (!mall_id) {
    console.warn('No mall_id available for mall data provider request');
    return params;
  }

  return {
    ...params,
    filter: {
      ...params.filter,
      mall_id
    },
    meta: {
      ...params.meta,
      mall_id
    }
  };
};

const dataProvider = {
  ...genericDataProvider,
  
  getList: async (resource: string, params: any, options?: any) => {
    const enhancedParams = addMallIdToParams(params);
    return genericDataProvider.getList(resource, enhancedParams, options);
  },

  getOne: async (resource: string, params: any) => {
    const mall_id = getMallId();
    if (!mall_id) {
      console.warn('No mall_id available for getOne request');
      return genericDataProvider.getOne(resource, params);
    }

    // Create a custom getOne that adds mall_id to the URL
    const { useAxios } = await import('dash-axios-hook');
    const axios = useAxios();

    try {
      const url = `${resource}/${params.id}?mall_id=${mall_id}`;
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
    const enhancedParams = addMallIdToParams(params);
    return genericDataProvider.getMany(resource, enhancedParams);
  },

  getManyReference: async (resource: string, params: any) => {
    const enhancedParams = addMallIdToParams(params);
    return genericDataProvider.getManyReference(resource, enhancedParams);
  },

  create: async (resource: string, params: any) => {
    const { useAxios } = await import('dash-axios-hook');
    const axios = useAxios();
    
    const mall_id = getMallId();
    if (!mall_id) {
      throw new Error('No mall_id available for create request. Mall context is required.');
    }

    const resourceConfig = getResourceConfig(resource);
    const isFormData =
        resourceConfig?.isFormData === true ||
        params.data?.isFormData === true ||
        params.meta?.isFormData === true;

    const resourcePath = /\/\d+$/.test(resource) ? resource : (params.id ? `${resource}/${params.id}` : resource);

    const method: 'POST' | 'PUT' = params.meta?.method
        ? params.meta.method
        : 'POST';

    const action = method === 'POST' ? axios.post : axios.put;

    const postData = processPostData(
        resourcePath,
        {
            ...params.data,
            mall_id: mall_id // Add mall_id to the data
        },
        'create',
    );

    try {
        if (isFormData) {
            const form: FormData = processFormData(resource, postData);
            return await action(resourcePath, form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        }

        return await action(resourcePath, postData);

    } catch (e: unknown) {
        const error = e as AxiosError<IDashAutoAdminDefaultBackendStructure>;
        throw processAxiosError(error, resource, 'create')
    }
  },

  update: async (resource: string, params: any) => {
    throw new Error('Store updates are not supported through the Mall interface. Use the main Tenant interface instead.');
  },

  updateMany: async (resource: string, params: any) => {
    throw new Error('Bulk store updates are not supported through the Mall interface. Use the main Tenant interface instead.');
  },

  delete: async (resource: string, params: any) => {
    throw new Error('Store deletion is not supported through the Mall interface. Use the main Tenant interface instead.');
  },

  deleteMany: async (resource: string, params: any) => {
    throw new Error('Bulk store deletion is not supported through the Mall interface. Use the main Tenant interface instead.');
  },

  import: async (resource: string, params: any) => {
    throw new Error('Store import is not supported through the Mall interface. Use the main Tenant interface instead.');
  }
};

export default dataProvider;
