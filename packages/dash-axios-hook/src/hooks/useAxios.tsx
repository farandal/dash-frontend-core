import axios, { AxiosRequestConfig } from 'axios';
import DASHAdminSystemConstants from 'dash-admin/src/config/DASHAdminSystemConstants';

//import { getCookie } from '../utils/cookies';

export const initAxios = (
	options: Partial<AxiosRequestConfig<any>>,
	CSRFAuth?: boolean,
) => {
	const _options = {
		headers: {
			'Content-Type': 'application/json',
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
		const token = localStorage.getItem('token');
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
		(error) => {
			window.dispatchEvent(new MessageEvent('GlobalError', { data: {error:error} }));
			if (error.response && error.response.status === 422) {
				/**
				 * Error Handling This is important for the system to parse Form field errors within AutoAdmin.
				 * therefore, an extra handling for errors are implemented in dataProvider and authProvider
				 */
				return Promise.reject(error.response.data?.errors || error);
			}
			return Promise.reject(error);
		},
	);

	return instance;
};

const useAxios = (options?:Partial<AxiosRequestConfig<any>>) => {

	const a = initAxios({
		baseURL: DASHAdminSystemConstants.system.ADMIN_API_URL,
    ...(options) && {...options}
	});
	return a;
};

export default useAxios;
