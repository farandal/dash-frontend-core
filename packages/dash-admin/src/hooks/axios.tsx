import axios from 'axios';
import constants from 'dash-constants/src/DASHAdminSystemConstants';
import { dashStorage } from 'dash-utils';

export const initAxios = () => {
	let CSRFAuth = false;

	let options = {
		baseURL: constants.system.ADMIN_API_URL,
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
	};

	const instance = axios.create(options);

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
		(error) => {
			window.dispatchEvent(new MessageEvent('GlobalError', { data: {error:error} }));
			if (error.response && error.response.status === 422) {
				/**
				 * Error Handling This is important for the system to parse Form field errors within AutoAdmin.
				 * therefore, an extra handling for errors are implemented in dataProvider and authProvider
				 **/
				return Promise.reject(error.response.data?.errors || error);
			}
			return Promise.reject(error);
		},
	);

	return instance;
};

const useAxios = () => {
	const axios = initAxios();
	return {
		axios,
	};
};

export default useAxios;
