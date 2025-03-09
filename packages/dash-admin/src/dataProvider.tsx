import { getCookie } from './utils/cookies';
import DASHStorageClass from './classes/DASHStorageClass';
import queryString from 'query-string';
import useAxios from './hooks/axios';
import { IDashAutoAdminAttribute } from 'dash-auto-admin';

Object.defineProperty(Boolean.prototype, 'toInt', {
	value: function () {
		return this & 1;
	},
});

export const getResourceConfig = (model: string) => {
	const resources = DASHStorageClass.resources;
	return resources.find((resource) => resource.model === model);
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

export const processFormData = (resource: string, params: any): FormData => {
	//let _resource = resource.split('/')[0];
	const resourceConfig = getResourceConfig(resource);

	const form = new FormData();

	Object.entries(params).forEach((element) => {
		const [key, value]: [string, any] = element;

		if (value !== undefined /*&& value !== null*/) {
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
			}

			if (resourceConfig) {
				const fieldConfig: IDashAutoAdminAttribute = resourceConfig.schema.find(
					(field) => field.attribute === key,
				);

				if (!fieldConfig) {
					form.append(key, value);
					return;
				}

				if (fieldConfig?.processor === 'Blob') {
					form.append(key, value as Blob);
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

				if (value === null && fieldConfig?.processor === 'Null') {
					form.append(key, '');
					return;
				}
			}

			if (value instanceof File) {
				form.append(key, value);
			} else if (typeof value === 'object') {
				form.append(key, JSON.stringify(value));
				/* } else if (typeof value === "boolean") {
                    form.append(key, (Number(value)).toString()); */
			} else {
				form.append(key, value);
			}
		}
	});

	// TODO! no se encontró una referencia para products_file en el resource 'campaign'
	/*
    if ((_resource == "product" || _resource == "product_import_instance" || _resource == "campaign") && params && params.products_file) {

        form.delete("products_file");
        if (params.products_file?.file) {
            form.append("products_file", params.products_file.file as Blob);
        } else {
            form.append("products_file", params.products_file.rawFile as Blob);
        }

    }
*/

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
		/*const roles = JSON.parse(localStorage.getItem('roles')).map(
			(role) => role.name,
		);*/

		let payload = processPostData(
			resource,
			{ ...params.data, ...params.filter, ...{ tenant_id: tenant_id } },
			'getList',
		);

		const { axios } = useAxios();

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
				...{ ...params.sort, order: params.sort.order.toLowerCase() },
			};
		}

		const processedQuery = queryString.stringify(payload, {
			arrayFormat: 'bracket',
		});

		const url = `${resource}?${processedQuery}`;

		const origin = url.includes('forSelect') ? 'forSelect' : 'getList';

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
			window.dispatchEvent(new MessageEvent('GlobalError', { data: {error:e} }));
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
		const { axios } = useAxios();

		try {
			const response = await axios.get(
				`${resource}/${params.id}`,
				params.meta ? { params: params.meta } : {},
			);

			return {
				data: response.data,
				//total: parseInt(request.headers['content-range']),
			};
		} catch (e: any) {
			window.dispatchEvent(new MessageEvent('GlobalError', { data: {error:e} }));
		}
	},

	getMany: async (resource, params) => {
		//const tenant_id = getCookie('tenant_id');
		const { axios } = useAxios();

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
				Array.isArray(paramsIds) && paramsIds.length > 0 && paramsIds[0].id
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

		const url = `${resource}/getMany?${queryString.stringify(query, {
			arrayFormat: 'bracket',
		})}`;

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
			window.dispatchEvent(new MessageEvent('GlobalError', { data: {error:e} }));
		}
	},

	getManyReference: async (resource, params) => {
		//const tenant_id = localStorage.getItem('tenant_id');
		const tenant_id = getCookie('tenant_id');
		const pagination =
			params.filter && params.filter.pagination
				? params.filter.pagination
				: false;

		const { axios } = useAxios();

		//const { page, perPage } = params.pagination;
		//const { field, order } = params.sort;
		let query = {
			//sort: JSON.stringify([field, order]),
			//range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
			// TODO: deprecar esto, eliminar el envio de parametros dentro de filters
			/*filter: JSON.stringify({
                ...params.filter,
                [params.target]: params.id,
            }),*/
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
			window.dispatchEvent(new MessageEvent('GlobalError', { data: {error:e} }));
		}
	},

	update: async (resource, params) => {
		const { axios } = useAxios();
		const resourceConfig = getResourceConfig(resource);
		const isFormData =
			resourceConfig?.isFormData === true ||
			params.data?.isFormData === true ||
			params.meta?.isFormData === true;

		const tenant_id =
			params && params.data && params.data.tenant_id
				? params.data.tenant_id
				: getCookie('tenant_id');

		// RULE: Always when the method is update, the http client method is PUT; hopefully there are no further exceptions!

		//if (isFormData) {
		params.data._method = 'PUT';
		//}

		const postData = processPostData(
			resource,
			{ ...params.data, ...{ tenant_id: tenant_id } },
			'update',
		);

		let method: 'POST' | 'PUT' = params.meta?.method
			? params.meta.method
			: 'POST';

		method = postData?.axiosMethod ? postData.axiosMethod : method;

		delete postData.axiosMethod;

		const action = method === 'POST' ? axios.post : axios.put;

		const excludeResourceId = params.meta?.excludeResourceId ? true : false;
		const resourceUrl = excludeResourceId
			? `${resource}`
			: `${resource}/${params.id}`;

		/* if (isFormData) {
      let form: FormData = processFormData(resource, postData);
      
      try {
        const result = await action(resourceUrl, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return result;
      } catch(error) {
        return error;      
      }
    
    }
  
    
    try {
      const result = await action(resourceUrl, postData);
      return result;
    } catch(error) {
      return error;      
    }*/

		// WHY! data.data????
		if (isFormData) {
			const form: FormData = processFormData(resource, postData);
			const response = await action(resourceUrl, form, {
				headers: { 'Content-Type': 'multipart/form-data' },
			});

			return {
				data: response.data.data,
			};
		}

		const response = await action(resourceUrl, postData);

		return {
			data: response.data.data,
		};
	},

	updateMany: async (resource, params) => {
		//const tenant_id = localStorage.getItem('tenant_id');
		const tenant_id = getCookie('tenant_id');

		const { axios } = useAxios();

		const query = {
			filter: JSON.stringify({ ids: params.ids }),
			tenant_id,
		};

		const method: 'POST' | 'PUT' = params.meta?.method
			? params.meta.method
			: 'POST';
		const action = method === 'POST' ? axios.post : axios.put;
		try {
			const { data } = await action(
				`${resource}/updateMany?${queryString.stringify(query, {
					arrayFormat: 'bracket',
				})}`,
				params.data,
			);

			return {
				data,
			};
		} catch (e: any) {
			window.dispatchEvent(
				new MessageEvent('ra-auto-global-loader', { data: false }),
			);
			window.dispatchEvent(new MessageEvent('GlobalError', { data: {error:e} }));
		}
	},

	import: async (resource, params) => {
		params.data = processPostData(resource, params.data, 'import');

		if (getCookie('tenant_id')) {
			if (params.data && !params.data.tenant_id)
				params.data.tenant_id = getCookie('tenant_id');
		}

		const { axios } = useAxios();

		const form: FormData = processFormData(resource, params.data);

		const method: 'POST' | 'PUT' = params.meta?.method
			? params.meta.method
			: 'POST';
		const action = method === 'POST' ? axios.post : axios.put;
		try {
			const { data } = await action(`${resource}`, form, {
				headers: { 'Content-Type': 'multipart/form-data' },
			});

			return {
				data: data,
			};
		} catch (e: any) {
			window.dispatchEvent(
				new MessageEvent('ra-auto-global-loader', { data: false }),
			);
			window.dispatchEvent(new MessageEvent('GlobalError', { data: {error:e} }));
		}
	},

	create: async (resource, params) => {
		const { axios } = useAxios();
		const resourceConfig = getResourceConfig(resource);
		const isFormData =
			resourceConfig?.isFormData === true ||
			params.data?.isFormData === true ||
			params.meta?.isFormData === true;

		const tenant_id =
			params && params.data && params.data.tenant_id
				? params.data.tenant_id
				: getCookie('tenant_id');

		const method: 'POST' | 'PUT' = params.meta?.method
			? params.meta.method
			: 'POST';

		const action = method === 'POST' ? axios.post : axios.put;

		/*if (isFormData) {
      params.data._method = "PUT";
    }*/

		const postData = processPostData(
			resource,
			{ ...params.data, ...{ tenant_id: tenant_id } },
			'create',
		);

		const resourceUrl = `${resource}`;

		if (isFormData) {
			const form: FormData = processFormData(resource, postData);
			return action(resourceUrl, form, {
				headers: { 'Content-Type': 'multipart/form-data' },
			});
		}

		return action(resourceUrl, postData);
	},

	delete: async (resource, params) => {
		const tenant_id = getCookie('tenant_id');
		const { axios } = useAxios();

		try {
			const { data } = await axios.delete(`${resource}/${params.id}`, {
				...params.data,
				tenant_id: tenant_id,
			});
			return {
				data,
			};
		} catch (e: any) {
			window.dispatchEvent(
				new MessageEvent('ra-auto-global-loader', { data: false }),
			);
			window.dispatchEvent(new MessageEvent('GlobalError', { data: {error:e} }));
		}
	},

	deleteMany: async (resource, params) => {
		const tenant_id = getCookie('tenant_id');

		const { axios } = useAxios();

		const query = {
			//filter: JSON.stringify({ ids: params.ids }),
			ids: params.ids ? params.ids : [],
			tenant_id,
		};

		try {
			const data = await axios.post(
				`${resource}/deleteMany?${queryString.stringify(query, {
					arrayFormat: 'bracket',
				})}`,
			);

			return {
				data: data.data,
			};
		} catch (e: any) {
			window.dispatchEvent(
				new MessageEvent('ra-auto-global-loader', { data: false }),
			);
			window.dispatchEvent(new MessageEvent('GlobalError', { data: {error:e} }));
		}
	},

	checkError: (error) => {
		const status = error.status;
		if (status >= 400 && status < 499) {
			//logoutFromStorage();
			console.error('checkError', JSON.stringify(error));
			return Promise.reject();
		}
		// other error code (404, 500, etc): no need to log out
		return Promise.resolve();
	},
};

export default dataProvider;
