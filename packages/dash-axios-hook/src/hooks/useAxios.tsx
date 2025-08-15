import axios, { Axios, AxiosError, AxiosRequestConfig } from 'axios';

import {DASHAdminSystemConstants} from  'dash-constants'

import { dashStorage } from 'dash-utils';

import processAxiosError from './processAxiosErrorFunction';
import { IDashAutoAdminDefaultBackendStructure } from '../interfaces/IDashAutoAdminBackendError';

//import { getCookie } from '../utils/cookies';

export const initAxios = (
	options: Partial<AxiosRequestConfig<any>>,
	CSRFAuth?: boolean,
) => {
  const browserLanguage = typeof navigator !== 'undefined' && navigator.language ? navigator.language.split('-')[0] : 'es';
  const _options = {
    headers: {
      'Content-Type': 'application/json',
      //'Accept-Language': browserLanguage || 'es', // fallback to 'es' if not available
      'Accept-Language':'es',
      Accept: 'application/json',
    },
    ...options,
  };

	const instance = axios.create(_options);

	if (CSRFAuth) {
		instance.defaults.withCredentials = true;
		instance.get('/csrf-cookie').then((response) => {
			console.log('sanctum', response);
		});
	}

	instance.interceptors.request.use(function (config) {
		const token = dashStorage.getItem('token');
		//console.log("axios Hook", axios, token);
		if (token !== undefined && token !== 'undefined') {
			config.headers.Authorization = 'Bearer ' + token;
		}
		return config;
	});

	instance.interceptors.response.use(
		(response) => {
			//console.log("Axios Success", response);
			return response;
		},
		(error:AxiosError<IDashAutoAdminDefaultBackendStructure, any>) => {
			//window.dispatchEvent(new MessageEvent('DASHGlobalError', { data: {error:error} }));

      window.dispatchEvent(
        new MessageEvent('DASHGlobalError', {
            data: processAxiosError(error, null, "list"),
            origin: "AxiosInterceptor"
        }),
    );

			return Promise.reject(error);
		},
	);

	return instance;
};

// Hook version (for use in React components)
const useAxios = (options?: Partial<AxiosRequestConfig<any>>) => {
	const a = initAxios({
		baseURL: DASHAdminSystemConstants.system.ADMIN_API_URL,
		...(options) && {...options}
	});
	return a;
};

// Non-hook version (for use in classes and regular functions)
export const createAxiosInstance = (options?: Partial<AxiosRequestConfig<any>>) => {
	return initAxios({
		baseURL: DASHAdminSystemConstants.system.ADMIN_API_URL,
		...(options) && {...options}
	});
};

// Default export is the hook
export default useAxios;

// Named export for non-hook usage
export { useAxios };
