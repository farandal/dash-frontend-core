/**
 * Dash Default Data Provider Extension
 * 
 * This file wraps the dash-auto-admin DashDataProvider factory,
 * providing default app overrides and customizations.
 */

import { 
    createDashDataProvider, 
    type DashDataProviderConfig, 
    type DashDataProviderOverrides 
} from 'dash-auto-admin';
import { AxiosError } from 'axios';
import queryString from 'query-string';
import { processAxiosError, useAxios } from 'dash-axios-hook';
import { cacheInvalidatorHash } from 'dash-admin/src/utils/cache/CacheInvalidatorContext';
import { IDashAutoAdminDefaultBackendStructure } from 'dash-axios-hook/src/interfaces/IDashAutoAdminBackendError';
import { getResourceConfig, processFormData, processPostData } from 'dash-utils';
import { dashStorage } from 'dash-utils';

/**
 * Dash default data provider configuration
 */
export const dashDefaultDataProviderConfig: DashDataProviderConfig = {
    useAxios: useAxios,
    storage: dashStorage,
    getCacheHash: cacheInvalidatorHash,
    getResourceConfig: getResourceConfig,
    processPostData: processPostData as (resource: string, data: any, operation: string) => any,
    processFormData: processFormData,
    processAxiosError: processAxiosError,
};

/**
 * Dash default data provider overrides
 * These override the default implementations from dash-auto-admin
 */
export const dashDefaultDataProviderOverrides: DashDataProviderOverrides = {
    /**
     * Dash default getList implementation with Dash-specific logic
     */
    getList: async (resource, params) => {
        const tenant_id = dashStorage.getItem('tenant_id');

        let payload = processPostData(
            resource,
            { ...params.filter, ...{ tenant_id: tenant_id } },
            'getList',
        );

        const axios = useAxios();

        const pagination =
            params.filter && !!params.filter.pagination
                ? params.filter.pagination
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

        const hash = cacheInvalidatorHash(resource);

        if (hash) {
            payload = {
                ...payload,
                hash
            };
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

    /**
     * Default getOne implementation
     */
    getOne: async (resource, params) => {
        const axios = useAxios();

        try {
            const response = await axios.get(
                `${resource}/${params.id}`,
                params.meta ? { params: params.meta } : {},
            );

            return {
                data: response.data,
            };
        } catch (e: any) {
            // Error handling can be customized here
        }
    },

    /**
     * Default getMany implementation
     */
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

        const hash = cacheInvalidatorHash(resource);
        if (hash) {
            query = {
                ...query,
                hash
            };
        }

        const _query = queryString.stringify(query, {
            arrayFormat: 'bracket',
        });

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
            // Error handling can be customized here
        }
    },

    /**
     * Default getManyReference implementation
     */
    getManyReference: async (resource, params) => {
        const tenant_id = dashStorage.getItem('tenant_id');
        const pagination =
            params.filter && (params.filter as any).pagination
                ? (params.filter as any).pagination
                : false;

        const axios = useAxios();

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

        const url = `${resource}/getManyReference?${queryString.stringify(query, {
            arrayFormat: 'bracket',
        })}`;

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
            // Error handling can be customized here
        }
    },

    /**
     * Default update implementation
     */
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
                : dashStorage.getItem('tenant_id');

        const resourcePath = /\/\d+(?:\/[^\/]*)?$/.test(resource) ? resource : (params.id ? `${resource}/${params.id}` : resource);

        const postData = processPostData(
            resourcePath,
            { ...params.data, ...{ tenant_id: tenant_id } },
            'update',
        );

        let method: 'POST' | 'PUT' = params.meta?.method
            ? params.meta.method
            : 'PUT';

        method = postData?.axiosMethod ? postData.axiosMethod : method;
        delete postData.axiosMethod;

        const action = axios.post;
        if (method === "PUT") {
            postData._method = "PUT";
        }

        try {
            if (isFormData) {
                const form: FormData = processFormData(resource, postData);
                const response = await action(resourcePath, form, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                return response;
            }

            const response = await action(resourcePath, postData);

            return response;
        } catch (e: unknown) {
            const error = e as AxiosError<IDashAutoAdminDefaultBackendStructure>;
            throw processAxiosError(error, resource, 'update');
        }
    },

    /**
     * Default create implementation
     */
    create: async (resource, params) => {
        const axios = useAxios();
        const resourceConfig = getResourceConfig(resource);
        const isFormData =
            resourceConfig?.isFormData === true ||
            params.data?.isFormData === true ||
            params.meta?.isFormData === true;

        const resourcePath =  /\/[\w-]+$/.test(resource) ? resource : ((params.meta as any)?.id ? `${resource}/${(params.meta as any).id}` : resource);

        let tenant_id = params.data?.tenant_id;

        if (resource !== 'system/user' && !tenant_id) {
            tenant_id = dashStorage.getItem('tenant_id');
        }

        const method: 'POST' | 'PUT' = params.meta?.method
            ? params.meta.method
            : 'POST';

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
            const error = e as AxiosError<IDashAutoAdminDefaultBackendStructure>;
            throw processAxiosError(error, resource, 'create');
        }
    },

    /**
     * Default updateMany implementation
     */
    updateMany: async (resource, params) => {
        const tenant_id = dashStorage.getItem('tenant_id');
        const axios = useAxios();

        const query = {
            filter: JSON.stringify({ ids: params.ids }),
            tenant_id,
        };

        const method: 'POST' | 'PUT' = params.meta?.method
            ? params.meta.method
            : 'POST';
        const action = method === 'POST' ? axios.post : axios.put;

        try {
            const response = await action(
                `${resource}/updateMany?${queryString.stringify(query, {
                    arrayFormat: 'bracket',
                })}`,
                params.data,
            );

            return response;
        } catch (e: any) {
            window.dispatchEvent(
                new MessageEvent('dash-global-loader', { data: false }),
            );
        }
    },

    /**
     * Default delete implementation
     */
    delete: async (resource, params) => {
        const tenant_id = dashStorage.getItem('tenant_id');
        const axios = useAxios();

        const { data } = await axios.delete(`${resource}/${params.id}`, {
            data: { tenant_id: tenant_id },
        });

        return {
            data,
        };
    },

    /**
     * Default deleteMany implementation
     */
    deleteMany: async (resource, params) => {
        const tenant_id = dashStorage.getItem('tenant_id');
        const axios = useAxios();

        const query = {
            ids: params.ids ? params.ids : [],
            tenant_id,
        };

        const data = await axios.post(
            `${resource}/deleteMany?${queryString.stringify(query, {
                arrayFormat: 'bracket',
            })}`,
        );

        return data;
    },
};

/**
 * Additional dash default methods for the data provider
 * These are app-specific and not part of the base react-admin DataProvider
 */
export const dashDefaultDataProviderExtensions = {
    /**
     * Dash default import method for bulk data import
     */
    import: async (resource: string, params: any) => {
        const axios = useAxios();
        const processedData = processPostData(resource, params.data, 'import');

        if (dashStorage.getItem('tenant_id')) {
            if (processedData && !processedData.tenant_id)
                processedData.tenant_id = dashStorage.getItem('tenant_id');
        }

        const form: FormData = processFormData(resource, processedData);

        const method: 'POST' | 'PUT' = params.meta?.method
            ? params.meta.method
            : 'POST';
        const action = method === 'POST' ? axios.post : axios.put;

        try {
            const results = await action(`${resource}`, form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            return results;
        } catch (e: any) {
            window.dispatchEvent(
                new MessageEvent('dash-global-loader', { data: false }),
            );
        }
    },

    /**
     * @deprecated Use the auth provider's checkError instead
     */
    checkError: (error: any) => {
        const status = error.status;
        if (status >= 400 && status < 499) {
            let message = error.message;
            if (status === 401) message = 'You are not authenticated';
            if (status === 403) message = 'You do not have permission to access this resource';
            if (status === 404) message = 'The requested resource was not found';
            if (status === 422) message = 'Validation error';

            const formattedError = new Error(message);
            (formattedError as any).status = status;
            (formattedError as any).body = error.body;

            return Promise.reject(formattedError);
        }

        if (status >= 500) {
            console.error('Server error', error);
            return Promise.reject(new Error('A server error occurred. Please try again later.'));
        }

        return Promise.resolve();
    }
};

/**
 * Create the dash default data provider using the factory
 * This combines the base implementation with app-specific overrides
 */
const baseDataProvider = createDashDataProvider(
    dashDefaultDataProviderConfig,
    dashDefaultDataProviderOverrides
);

/**
 * Extend the base provider with dash default methods
 */
export const dashDefaultDataProvider = {
    ...baseDataProvider,
    ...dashDefaultDataProviderExtensions,
};

export default dashDefaultDataProvider;
