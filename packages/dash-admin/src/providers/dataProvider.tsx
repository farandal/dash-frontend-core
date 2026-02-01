
import queryString from 'query-string';
import { IDashAutoAdminAttribute } from 'dash-auto-admin';
import { IDashAutoAdminDefaultBackendStructure, processAxiosError, useAxios } from 'dash-axios-hook';
import { AxiosError } from 'axios';
import DASHStorageClass from '../classes/DASHStorageClass';
import { getCookie } from '../utils';
import { cacheInvalidatorHash } from '../utils/cache/CacheInvalidatorContext';

/**
 * Retrieves the resource configuration for the specified model.
 * 
 * @param model - The name of the model to retrieve the resource configuration for.
 * @returns The resource configuration for the specified model.
 */
export const getResourceConfig = (model: string) => {
    const resources = DASHStorageClass.resources;
    // Try exact match first
    const exactMatch = resources.find((resource) => resource.model === model);
    if (exactMatch) return exactMatch;

    const normalizedModel = model.replace(/\/[\w-]+$/, '');
    return resources.find((resource) => resource.model === normalizedModel);
};


export const deepReplace = (
	obj: object,
	keyName: string,
	replacer: (from: any) => string,
) => {
	for (const key in obj) {
		if (key === keyName) {
			obj[key] = replacer(obj[key]);
		} else if (Array.isArray(obj[key])) {
			(obj[key] as any[]).forEach((member) =>
				deepReplace(member, keyName, replacer),
			);
		} else if (typeof obj[key] === 'object') {
			deepReplace(obj[key], keyName, replacer);
		}
	}
};



/**
 * Processes form data for a given resource and parameters.
 * 
 * @param resource - The name of the resource to process the form data for.
 * @param params - The parameters to include in the form data.
 * @returns A FormData object containing the processed form data.
 */
export const processFormData = (resource: string, params: any): FormData => {

    const resourceConfig = getResourceConfig(resource);

    const form = new FormData();

    /**
      * Iterates over the key-value pairs in the `params` object and appends them to the `form` FormData object.
      * This function is used to process the form data for a given resource and parameters.
      * @param element - A tuple containing the key and value of a parameter in the `params` object.
      */
    Object.entries(params).forEach((element) => {
        const [key, value]: [string, any] = element;

        if (value !== undefined) {

            if (Array.isArray(value)) {
                if (!value.length) {
                    form.append(key + '[]', '');
                    return;
                } else {
                    value.forEach((val) => {
                        form.append(key + '[]', val);
                    });
                    return;
                }
            } else if (!!value && typeof value === "object" && !(value instanceof File) && !value.rawFile) {
                // In certain cases for example, the attribute is called client.name; 
                // when the form is submitted, the attribute comes with the name client, and the value is an object with a key { name: 'xxx' }
                const _objKeys = Object.keys(value)
                _objKeys.forEach((objKey) => {
                    form.append(key + '[' + objKey + ']', value[objKey]);
                });
                // skip processor stage
                return;
            }

            if (value === undefined || value === null) return;

            if (resourceConfig) {
                const fieldConfig: IDashAutoAdminAttribute = resourceConfig.schema.find(
                    (field) => field.attribute.split(".")[0] === key,
                );

                if (!fieldConfig) {
                    form.append(key, value);
                    return;
                }

                if (fieldConfig?.processor === 'Blob') {
                    form.append(key, value as Blob);
                    return;
                }

                if (fieldConfig?.processor === 'Stringify') {
                    form.append(key, JSON.stringify(value));
                    return;
                }

                if (fieldConfig?.processor === 'File') {
                    if (value.rawFile) {
                        form.append(key, value.rawFile);
                    } else {
                        form.append(key, value as File);
                    }
                    return;
                }

                if (fieldConfig?.processor === 'RawFile') {

                    form.append(key, value.rawFile as Blob);
                    return;
                }

                if (fieldConfig?.processor === 'Boolean') {
                    form.append(key, Number(value).toString());
                    return;
                }

                if (fieldConfig?.processor === 'BooleanOnOff') {

                    form.append(key, Number(value) === 1 ? 'on' : 'off');
                    return;
                }

                if (fieldConfig?.processor === 'BooleanActiveInactive') {
                    form.append(key, Number(value) === 1 ? 'active' : 'inactive');
                    return;
                }

                if (value === null && fieldConfig?.processor === 'Null') {
                    form.append(key, '');
                    return;
                }
            }

            if (value instanceof File) {
                form.append(key, value);
            } else if (typeof value === 'object') {
                form.append(key, JSON.stringify(value));
            } else {
                form.append(key, value);
            }
        }
    });

    return resourceConfig.formPostFormatter
        ? resourceConfig.formPostFormatter(params, form)
        : form;
};

export const processPostData = (
    resource: string,
    params: any,
    method: 'getList' | 'update' | 'create' | 'import',
): any => {
    const resourceConfig = getResourceConfig(resource);

    Object.entries(params).forEach((element) => {
        const [key, value]: [string, any] = element;

        if (resourceConfig) {
            const fieldConfig: IDashAutoAdminAttribute = resourceConfig.schema.find(
                (field) => field.attribute === key,
            );
            if (fieldConfig?.processor === 'Boolean') {
                params[key] = Number(value).toString();
            }

            if (fieldConfig?.processor === 'BooleanOnOff') {
                params[key] = value ? 'on' : 'off';
            }

            if (fieldConfig?.processor === 'BooleanActiveInactive') {
                params[key] = value ? 'active' : 'inactive';
            }

        }
    });

    if (resourceConfig?.postFormatter && method !== 'getList') {
        params = resourceConfig.postFormatter(params, method);
    }

    return params;
};


const dataProvider = {
	getList: async (resource, params, _options) => {
        const tenant_id = getCookie('tenant_id');
        
        

        let payload = processPostData(
            resource,
            { ...params.data, ...params.filter, ...{ tenant_id: tenant_id } },
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

        const url = `${resource}?${processedQuery}`;

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

            const results = response.data;
            const ret = {
                data: results.data,
                total:
                    results && results.total
                        ? results.total
                        : parseInt(response.headers['content-range']) || 0,
            };

            window.dispatchEvent(
                new MessageEvent('auto-admin-loading-state', {
                    data: false,
                    origin: origin,
                    lastEventId: url,
                }),
            );

            return ret;
        } catch (e: any) {
            window.dispatchEvent(new MessageEvent('GlobalError', { data: { error: e } }));
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

            return {
                data: response.data,

            };
        } catch (e: any) {
            window.dispatchEvent(new MessageEvent('GlobalError', { data: { error: e } }));
        }
	},

	getMany: async (resource, params) => {
	
        const axios = useAxios();

        const pagination =
            params.filter && params.filter.pagination
                ? params.filter.pagination
                : false;

        /**
         * Ugly Hack:
         * the ids in often cases comes as a double nested array, reason unknown yet.
         */
        const paramsIds =
            Array.isArray(params.ids) &&
                params.ids.length > 0 &&
                Array.isArray(params.ids[0])
                ? params.ids[0]
                : params.ids;

        let query = {
            ids:
                Array.isArray(paramsIds) &&
                    paramsIds.length > 0 &&
                    paramsIds[0].id
                    ? paramsIds.map((object) => object.id)
                    : paramsIds,
            ...params.sort,
            ...params.filter,
        };

        if (pagination) {
            query = { ...query, pagination: true, ...pagination };
        } else {
            query = { ...query, pagination: false };
        }

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
            window.dispatchEvent(new MessageEvent('GlobalError', { data: { error: e } }));
        }
	},

	getManyReference: async (resource, params) => {
	
        const tenant_id = getCookie('tenant_id');
        const pagination =
            params.filter && params.filter.pagination
                ? params.filter.pagination
                : false;

        const axios = useAxios();



        let query = {




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
            window.dispatchEvent(new MessageEvent('GlobalError', { data: { error: e } }));
        }
	},

    updateMany: async (resource, params) => {
    
            const tenant_id = getCookie('tenant_id');
    
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
                window.dispatchEvent(new MessageEvent('GlobalError', { data: { error: e } }));
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
                : getCookie('tenant_id');
    

        const resourcePath = (params.id && resource.includes(params.id.toString())) ? resource : (params.id ? `${resource}/${params.id}` : resource);

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
            throw processAxiosError(error,resource,'update')
        }
	},

	import: async (resource, params) => {
        params.data = processPostData(resource, params.data, 'import');

        if (getCookie('tenant_id')) {
            if (params.data && !params.data.tenant_id)
                params.data.tenant_id = getCookie('tenant_id');
        }

        const axios = useAxios();

        const form: FormData = processFormData(resource, params.data);

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
            window.dispatchEvent(new MessageEvent('GlobalError', { data: { error: e } }));
        }
	},

	create: async (resource, params) => {
        const axios = useAxios();
        const resourceConfig = getResourceConfig(resource);
        const isFormData =
            resourceConfig?.isFormData === true ||
            params.data?.isFormData === true ||
            params.meta?.isFormData === true;
    

        
        const resourcePath = (params.id && resource.includes(params.id.toString())) ? resource : (params.id ? `${resource}/${params.id}` : resource);

        const tenant_id =
            params && params.data && params.data.tenant_id
                ? params.data.tenant_id
                : getCookie('tenant_id');
    
        const method: 'POST' | 'PUT' = params.meta?.method
            ? params.meta.method
            : 'POST';
    
        const action = method === 'POST' ? axios.post : axios.put;
    
        const postData = processPostData(
            resourcePath,
            { ...params.data, ...{ tenant_id: tenant_id } },
            'create',
        );
    
       
    
        try {
            if (isFormData) {
                const form: FormData = processFormData(resource, postData);
                return action(resourcePath, form, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }
    
            return action(resourcePath, postData);
        }  catch (e: unknown) {
            const error = e as AxiosError<IDashAutoAdminDefaultBackendStructure>;
            throw processAxiosError(error,resource,'create')
        }
	},

	delete: async (resource, params) => {
        const tenant_id = getCookie('tenant_id');
        const axios = useAxios();
        
        const resourcePath = (params.id && resource.includes(params.id.toString())) ? resource : `${resource}/${params.id}`;

       // try {
            const { data } = await axios.delete(resourcePath, {
                ...params.data,
                tenant_id: tenant_id,
            });
            return {
                data,
            };
       /* } catch (e: any) {
            window.dispatchEvent(
                new MessageEvent('dash-global-loader', { data: false }),
            );
            window.dispatchEvent(new MessageEvent('GlobalError', { data: { error: e } }));
        } */
	},

	deleteMany: async (resource, params) => {
        const tenant_id = getCookie('tenant_id');

        const axios = useAxios();

        const query = {

            ids: params.ids ? params.ids : [],
            tenant_id,
        };

       // try {
            const data = await axios.post(
                `${resource}/deleteMany?${queryString.stringify(query, {
                    arrayFormat: 'bracket',
                })}`,
            );

            return data;
        /*} catch (e: any) {
            window.dispatchEvent(
                new MessageEvent('dash-global-loader', { data: false }),
            );
            window.dispatchEvent(new MessageEvent('GlobalError', { data: { error: e } }));
        }*/
	},


    checkError: (error) => {
        const status = error.status;
        if (status >= 400 && status < 499) {
            
            // Format client errors
            console.error('checkError', JSON.stringify(error));
            
            // Create a nicely formatted message based on status code
            let message = error.message;
            if (status === 401) message = 'You are not authenticated';
            if (status === 403) message = 'You do not have permission to access this resource';
            if (status === 404) message = 'The requested resource was not found';
            if (status === 422) message = 'Validation error';
            
            // Create a properly formatted error that React Admin understands
            const formattedError = new Error(message);
            (formattedError as any).status = status;
            (formattedError as any).body = error.body; // Pass along validation errors
            
            return Promise.reject(formattedError);
        }
        
        // For other errors, just pass them through
        if (status >= 500) {
            console.error('Server error', error);
            return Promise.reject(new Error('A server error occurred. Please try again later.'));
        }
        
        return Promise.resolve();
    }
};

export default dataProvider;
