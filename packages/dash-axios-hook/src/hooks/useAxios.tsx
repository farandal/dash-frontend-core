import axios, { Axios, AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import {DASHAdminSystemConstants} from  'dash-constants'

import { dashStorage } from 'dash-utils';

import processAxiosError from './processAxiosErrorFunction';
import { IDashAutoAdminDefaultBackendStructure } from '../interfaces/IDashAutoAdminBackendError';

//import { getCookie } from '../utils/cookies';

// Flag to prevent multiple simultaneous refresh requests
let isRefreshing = false;
// Queue of requests waiting for token refresh
let failedQueue: Array<{
	resolve: (value?: unknown) => void;
	reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
	failedQueue.forEach(prom => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token);
		}
	});
	failedQueue = [];
};

// Function to refresh the token
const refreshAccessToken = async (axiosInstance: any): Promise<string | null> => {
	const refreshToken = dashStorage.getItem('refreshToken');
	
	if (!refreshToken) {
		console.log('[Axios] No refresh token available');
		return null;
	}

	try {
		console.log('[Axios] Attempting to refresh access token...');
		
		// Create a new axios instance without interceptors to avoid infinite loops
		const refreshAxios = axios.create({
			baseURL: DASHAdminSystemConstants.system.ADMIN_API_URL,
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
		});

		const response = await refreshAxios.post('/auth/refresh', {
			refresh_token: refreshToken,
		});

		if (response.status === 200 && response.data.token) {
			const newToken = response.data.token;
			const newRefreshToken = response.data.refresh_token;
			
			// Store new tokens
			dashStorage.setItem('token', newToken);
			if (newRefreshToken) {
				dashStorage.setItem('refreshToken', newRefreshToken);
			}
			
			console.log('[Axios] Token refresh successful');
			return newToken;
		}

		return null;
	} catch (error) {
		console.error('[Axios] Token refresh failed:', error);
		return null;
	}
};

// Function to handle logout
const handleLogout = () => {
	console.log('[Axios] Logging out due to authentication failure');
	debugger;
	// Clear all auth data
	//dashStorage.removeItem('token');
	//dashStorage.removeItem('refreshToken');
	//dashStorage.removeItem('authenticated');
	//dashStorage.removeItem('user');
	//dashStorage.removeItem('roles');
    dashStorage.clear();
	localStorage.clear();
	// Dispatch logout event for the app to handle
	window.dispatchEvent(new CustomEvent('auth:logout', { 
		detail: { reason: 'token_refresh_failed' } 
	}));
};

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

		// Inject X-Tenant-Id header when tenant impersonation is active
		const activeTenantId = dashStorage.getItem('active_tenant_id');
		if (activeTenantId) {
			config.headers['X-Tenant-Id'] = activeTenantId;
		}

		return config;
	});

	instance.interceptors.response.use(
		(response) => {
			//console.log("Axios Success", response);
			return response;
		},
		async (error: AxiosError<IDashAutoAdminDefaultBackendStructure, any>) => {
			const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

			// Handle 401 Unauthorized errors
			if (error.response?.status === 401 && !originalRequest._retry) {
				// Skip refresh for auth endpoints to prevent infinite loops
				const isAuthEndpoint = originalRequest.url?.includes('/login') || 
					originalRequest.url?.includes('/auth/refresh') ||
					originalRequest.url?.includes('/logout');

				if (isAuthEndpoint) {
					return Promise.reject(error);
				}

				if (isRefreshing) {
					// If already refreshing, queue this request
					return new Promise((resolve, reject) => {
						failedQueue.push({ resolve, reject });
					}).then(token => {
						if (token && originalRequest.headers) {
							originalRequest.headers.Authorization = `Bearer ${token}`;
						}
						return instance(originalRequest);
					}).catch(err => {
						return Promise.reject(err);
					});
				}

				originalRequest._retry = true;
				isRefreshing = true;

				try {
					const newToken = await refreshAccessToken(instance);
					
					if (newToken) {
						// Update the authorization header
						if (originalRequest.headers) {
							originalRequest.headers.Authorization = `Bearer ${newToken}`;
						}
						
						// Process queued requests
						processQueue(null, newToken);
						
						// Retry the original request
						return instance(originalRequest);
					} else {
						// Refresh failed - logout user
						processQueue(error, null);
						handleLogout();
						return Promise.reject(error);
					}
				} catch (refreshError) {
					processQueue(refreshError, null);
					handleLogout();
					return Promise.reject(refreshError);
				} finally {
					isRefreshing = false;
				}
			}

			// Dispatch global error event for non-401 errors
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
		...(options && {...options})
	});
	return a;
};

// Non-hook version (for use in classes and regular functions)
export const createAxiosInstance = (options?: Partial<AxiosRequestConfig<any>>) => {
	console.log('Creating Axios instance with options:', options);
	console.log('Base URL:', DASHAdminSystemConstants.system.ADMIN_API_URL);
	return initAxios({
		baseURL: DASHAdminSystemConstants.system.ADMIN_API_URL,
		...(options && {...options})
	});
};

// Default export is the hook
export default useAxios;

// Named export for non-hook usage
export { useAxios };
