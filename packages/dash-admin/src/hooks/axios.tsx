import axios from 'axios';
import constants from 'dash-constants/src/DASHAdminSystemConstants';
import { dashStorage } from 'dash-utils';

// Track refresh state to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];

const processQueue = (error: any, token?: string) => {
	failedQueue.forEach(prom => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token!);
		}
	});

	isRefreshing = false;
	failedQueue = [];
};

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
		async (error) => {
			const originalRequest = error.config;

			// Skip refresh for auth-related endpoints to prevent infinite loops
			const authEndpoints = ['/login', '/auth/refresh', '/logout', '/register'];
			const isAuthEndpoint = authEndpoints.some(endpoint =>
				originalRequest.url?.includes(endpoint)
			);

			// Handle 401 Unauthorized
			if (error.response?.status === 401 && !isAuthEndpoint && !originalRequest._retry) {
				if (isRefreshing) {
					// If already refreshing, queue this request
					return new Promise((resolve, reject) => {
						failedQueue.push({ resolve, reject });
					}).then(token => {
						originalRequest.headers.Authorization = 'Bearer ' + token;
						return instance(originalRequest);
					}).catch(err => {
						return Promise.reject(err);
					});
				}

				originalRequest._retry = true;
				isRefreshing = true;

				try {
					const refreshToken = dashStorage.getItem('refreshToken');

					if (!refreshToken) {
						// No refresh token available, logout user
						await handleAuthFailure();
						return Promise.reject(error);
					}

					// Attempt to refresh the access token
					const refreshResponse = await axios.post(
						`${constants.system.ADMIN_API_URL}/auth/refresh`,
						{ refresh_token: refreshToken }
					);

					const { token, refresh_token } = refreshResponse.data;

					// Store new tokens
					dashStorage.setItem('token', token);
					dashStorage.setItem('refreshToken', refresh_token);

					// Update original request with new token
					originalRequest.headers.Authorization = 'Bearer ' + token;

					// Process queued requests
					processQueue(null, token);

					// Retry original request
					return instance(originalRequest);
				} catch (refreshError) {
					// Refresh failed, logout user
					await handleAuthFailure();
					processQueue(refreshError, null);
					return Promise.reject(refreshError);
				}
			}

			// Dispatch global error event for other errors
			if (error.response?.status !== 401) {
				window.dispatchEvent(new MessageEvent('GlobalError', { data: { error } }));
			}

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

// Helper function to handle authentication failure
async function handleAuthFailure() {
	// Clear auth data
	dashStorage.removeItem('token');
	dashStorage.removeItem('refreshToken');
	dashStorage.removeItem('user');
	dashStorage.removeItem('auth');
	dashStorage.removeItem('authenticated');
	dashStorage.removeItem('roles');

	// Dispatch logout event. useLogoutEventListener (DashBootstrapUtils) clears
	// Redux auth state on this, which the private route guard (dashDefaultPrivateRoutes /
	// DashDefaultPrivateApp) already reacts to with an in-app redirect to /login.
	// Do NOT also do a hard window.location.href navigation here: the packaged
	// Electron app is loaded from file://.../index.html, so an absolute-path
	// navigation resolves against that origin (file:///login) instead of the
	// SPA router, permanently breaking the app on first auth failure.
	window.dispatchEvent(new MessageEvent('auth:logout'));
}

const useAxios = () => {
	const axios = initAxios();
	return {
		axios,
	};
};

export default useAxios;
