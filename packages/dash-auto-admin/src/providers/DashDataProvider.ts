/**
 * Dash Data Provider
 * 
 * Default data provider for Dash applications.
 * This provider handles CRUD operations with the backend API.
 * 
 * Can be extended or overridden by apps for custom behavior.
 */
import type { DataProvider } from 'ra-core';
import queryString from 'query-string';

// ============================================================================
// TYPES
// ============================================================================

export interface DashDataProviderConfig {
    /**
     * Axios instance or hook to use for API calls
     */
    useAxios: () => any;
    
    /**
     * Storage utility (dashStorage from dash-utils)
     */
    storage: {
        getItem: (key: string) => string | null;
        setItem: (key: string, value: string) => void;
    };
    
    /**
     * Cache invalidator hash function
     */
    getCacheHash?: (resource: string) => string | null;
    
    /**
     * Get resource configuration
     */
    getResourceConfig?: (resource: string) => any;
    
    /**
     * Process post data for a resource
     */
    processPostData?: (resource: string, data: any, operation: string) => any;
    
    /**
     * Process form data for multipart uploads
     */
    processFormData?: (resource: string, data: any) => FormData;
    
    /**
     * Process axios errors
     */
    processAxiosError?: (error: any, resource: string, operation: string) => any;
}

export interface DashDataProviderOverrides {
    getList?: DataProvider['getList'];
    getOne?: DataProvider['getOne'];
    getMany?: DataProvider['getMany'];
    getManyReference?: DataProvider['getManyReference'];
    create?: DataProvider['create'];
    update?: DataProvider['update'];
    updateMany?: DataProvider['updateMany'];
    delete?: DataProvider['delete'];
    deleteMany?: DataProvider['deleteMany'];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const defaultProcessPostData = (resource: string, data: any, operation: string) => data;

const defaultProcessFormData = (resource: string, data: any): FormData => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
            if (data[key] instanceof File) {
                formData.append(key, data[key]);
            } else if (typeof data[key] === 'object') {
                formData.append(key, JSON.stringify(data[key]));
            } else {
                formData.append(key, String(data[key]));
            }
        }
    });
    return formData;
};

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create a Dash data provider with the given configuration
 * 
 * @param config - Configuration for the data provider
 * @param overrides - Optional method overrides
 * @returns DataProvider compatible with react-admin
 * 
 * @example
 * ```tsx
 * import { createDashDataProvider } from 'dash-auto-admin';
 * 
 * const dataProvider = createDashDataProvider({
 *     useAxios: () => axiosInstance,
 *     storage: dashStorage,
 *     // ... other config
 * });
 * ```
 */
export const createDashDataProvider = (
    config: DashDataProviderConfig,
    overrides: DashDataProviderOverrides = {}
): DataProvider => {
    const {
        useAxios,
        storage,
        getCacheHash = () => null,
        getResourceConfig = () => undefined,
        processPostData = defaultProcessPostData,
        processFormData = defaultProcessFormData,
        processAxiosError = (error) => { throw error; }
    } = config;

    const defaultProvider: DataProvider = {
        getList: async (resource, params) => {
            const tenant_id = storage.getItem('tenant_id');
            const axios = useAxios();

            let payload = processPostData(
                resource,
                { ...params.filter, tenant_id: tenant_id },
                'getList',
            );

            const pagination =
                params.filter && !!(params.filter as any).pagination
                    ? (params.filter as any).pagination
                    : params.pagination
                        ? params.pagination
                        : false;

            if (pagination) {
                payload = { ...payload, pagination: true, ...pagination };
            } else {
                payload = { ...payload, pagination: false };
            }

            payload = { ...payload, ...params.meta };

            const hasSort = params.sort && params.sort.field && params.sort.order;

            if (hasSort && !params.meta?.removeSortFilters) {
                payload = {
                    ...payload,
                    ...{ ...params.sort, order: (params.sort.order).toLowerCase() },
                };
            }

            const hash = getCacheHash(resource);
            if (hash) {
                payload = { ...payload, hash };
            }

            const processedQuery = queryString.stringify(payload, { arrayFormat: 'bracket' });
            let url = `${resource}?${processedQuery}`;

            const origin = url.includes('forSelect') ? 'forSelect' : url.includes('getMany') ? 'getMany' : 'getList';

            window.dispatchEvent(
                new MessageEvent('auto-admin-loading-state', {
                    data: true,
                    origin: origin,
                    lastEventId: url,
                }),
            );

            try {
                const response = await axios.get(url);
                let results: { data: any[]; total: number };
               
                if (typeof response.data?.data?.total !== 'undefined') {
                    results = response.data.data;
                } else if (response?.data?.data && Array.isArray(response.data.data)) {
                    results = { data: response.data.data, total: response.data.total || response.data.data.length };
                } else if (response?.data && Array.isArray(response.data)) {
                    results = { data: response.data, total: response.data.length };
                } else {
                    results = { data: [], total: 0 };
                }

                window.dispatchEvent(
                    new MessageEvent('auto-admin-loading-state', {
                        data: false,
                        origin: origin,
                        lastEventId: url,
                    }),
                );

                return results;
            } catch (e: any) {
                window.dispatchEvent(new MessageEvent('DASHGlobalError', { data: { error: e, config: { dialog: true } } }));
                return { data: [], total: 0 };
            } finally {
                window.dispatchEvent(
                    new MessageEvent('auto-admin-loading-state', {
                        data: false,
                        origin: origin,
                        lastEventId: url,
                    }),
                );
            }
        },

        getOne: async (resource, params) => {
            const axios = useAxios();

            try {
                const response = await axios.get(
                    `${resource}/${params.id}`,
                    params.meta ? { params: params.meta } : {},
                );

                return { data: response.data };
            } catch (e: any) {
                throw e;
            }
        },

        getMany: async (resource, params) => {
            const axios = useAxios();

            const paramsIds =
                Array.isArray(params.ids) &&
                    params.ids.length > 0 &&
                    Array.isArray(params.ids[0])
                    ? params.ids[0]
                    : params.ids;

            let query: any = {
                ids:
                    Array.isArray(paramsIds) &&
                        paramsIds.length > 0 &&
                        (paramsIds[0] as any)?.id
                        ? paramsIds.map((object: any) => object.id)
                        : paramsIds,
            };

            query = { ...query, pagination: false };

            const hash = getCacheHash(resource);
            if (hash) {
                query = { ...query, hash };
            }

            const _query = queryString.stringify(query, { arrayFormat: 'bracket' });
            const url = `${resource}/getMany?${_query}`;

            try {
                const response = await axios.get(url);
                const results = response.data;

                return {
                    data: results.data,
                    total:
                        results.data && results.data.total
                            ? results.data.total
                            : parseInt(response.headers['content-range']) || 0,
                };
            } catch (e: any) {
                throw e;
            }
        },

        getManyReference: async (resource, params) => {
            const tenant_id = storage.getItem('tenant_id');
            const axios = useAxios();

            const pagination =
                params.filter && (params.filter as any).pagination
                    ? (params.filter as any).pagination
                    : false;

            let query: any = {
                ...params.filter,
                [params.target]: params.id,
                tenant_id,
            };

            if (pagination) {
                query = { ...query, pagination: true, ...pagination };
            } else {
                query = { ...query, pagination: false };
            }

            const url = `${resource}/getManyReference?${queryString.stringify(query, { arrayFormat: 'bracket' })}`;

            try {
                const response = await axios.get(url);
                const results = response.data;

                return {
                    data: results,
                    total:
                        results.data && results.data.total
                            ? results.data.total
                            : parseInt(response.headers['content-range']) || 0,
                };
            } catch (e: any) {
                throw e;
            }
        },

        update: async (resource, params) => {
            const axios = useAxios();
            const resourceConfig = getResourceConfig(resource);
            const isFormData =
                resourceConfig?.isFormData === true ||
                params.data?.isFormData === true ||
                params.meta?.isFormData === true;

            const tenant_id =
                params && params.data && params.data.tenant_id
                    ? params.data.tenant_id
                    : storage.getItem('tenant_id');

            const resourcePath = /\/\d+(?:\/[^\/]*)?$/.test(resource) 
                ? resource 
                : (params.id ? `${resource}/${params.id}` : resource);

            const postData = processPostData(
                resourcePath,
                { ...params.data, ...{ tenant_id: tenant_id } },
                'update',
            );

            let method: 'POST' | 'PUT' = params.meta?.method || 'PUT';
            method = postData?.axiosMethod || method;
            delete postData.axiosMethod;

            if (method === "PUT") {
                postData._method = "PUT";
            }

            try {
                if (isFormData) {
                    const form: FormData = processFormData(resource, postData);
                    const response = await axios.post(resourcePath, form, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    return response;
                }

                const response = await axios.post(resourcePath, postData);
                return response;
            } catch (e: unknown) {
                throw processAxiosError(e, resource, 'update');
            }
        },

        create: async (resource, params) => {
            const axios = useAxios();
            const resourceConfig = getResourceConfig(resource);
            const isFormData =
                resourceConfig?.isFormData === true ||
                params.data?.isFormData === true ||
                params.meta?.isFormData === true;

            const resourcePath = /\/\d+$/.test(resource) 
                ? resource 
                : ((params.meta as any)?.id ? `${resource}/${(params.meta as any).id}` : resource);

            let tenant_id = params.data?.tenant_id;
            if (resource !== 'system/user' && !tenant_id) {
                tenant_id = storage.getItem('tenant_id');
            }

            const method: 'POST' | 'PUT' = params.meta?.method || 'POST';
            const action = method === 'POST' ? axios.post : axios.put;

            const postData = processPostData(
                resourcePath,
                {
                    ...params.data,
                    ...(tenant_id ? { tenant_id: tenant_id } : {})
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
                throw processAxiosError(e, resource, 'create');
            }
        },

        updateMany: async (resource, params) => {
            const tenant_id = storage.getItem('tenant_id');
            const axios = useAxios();

            const query = {
                filter: JSON.stringify({ ids: params.ids }),
                tenant_id,
            };

            const method: 'POST' | 'PUT' = params.meta?.method || 'POST';
            const action = method === 'POST' ? axios.post : axios.put;

            try {
                const response = await action(
                    `${resource}/updateMany?${queryString.stringify(query, { arrayFormat: 'bracket' })}`,
                    params.data,
                );
                return response;
            } catch (e: any) {
                window.dispatchEvent(
                    new MessageEvent('dash-global-loader', { data: false }),
                );
                throw e;
            }
        },

        delete: async (resource, params) => {
            const tenant_id = storage.getItem('tenant_id');
            const axios = useAxios();

            const { data } = await axios.delete(`${resource}/${params.id}`, {
                data: { tenant_id: tenant_id },
            });
            
            return { data };
        },

        deleteMany: async (resource, params) => {
            const tenant_id = storage.getItem('tenant_id');
            const axios = useAxios();

            const query = {
                ids: params.ids || [],
                tenant_id,
            };

            const data = await axios.post(
                `${resource}/deleteMany?${queryString.stringify(query, { arrayFormat: 'bracket' })}`,
            );

            return data;
        },
    };

    // Merge default provider with overrides
    return {
        ...defaultProvider,
        ...overrides,
    };
};

export default createDashDataProvider;
