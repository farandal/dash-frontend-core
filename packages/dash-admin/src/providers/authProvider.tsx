import DASHStorageClass from '../classes/DASHStorageClass';
import { initAxios } from '../hooks/axios';
import { getCookie, removeCookie, setCookie } from '../utils/cookies';
import { dashStorage } from 'dash-utils';
import { clearDeviceStoreAuth } from 'dash-auth';

export const logoutFromStorage = async () => {
	removeCookie('tenant_id');
	removeCookie('token');
	dashStorage.removeItem('user');
	dashStorage.removeItem('auth');
	dashStorage.removeItem('token');
	dashStorage.removeItem('refreshToken'); // Clear refresh token for security
	dashStorage.setItem('authenticated', 'false');
	dashStorage.setItem('roles', null); // before it was guest role.

	// Clear auth data from device store (Electron/Capacitor)
	await clearDeviceStoreAuth();
};

export default {
	login: async ({ username, password }) => {
		if (!(username && password)) {
			return Promise.reject();
			//return;
		}
		const axios = initAxios();

		try {
			const loginResponse = await axios.post('/login', {
				email: username,
				password,
			});

			if (loginResponse.status >= 200 && loginResponse.status <= 299) {
				/*var today = new Date();
				var expires = new Date();
				expires.setDate(today.getDate() + 2);
				setCookie('token', loginResponse.data.token, { expires });*/

                setCookie('token', loginResponse.data.token);

				dashStorage.setItem('token', loginResponse.data.token);

				// Store refresh token for automatic token refresh
				if (loginResponse.data.refresh_token) {
					dashStorage.setItem('refreshToken', loginResponse.data.refresh_token);
				}

				try {
					let { data: auth } = await axios.get('/auth/getauth');

					dashStorage.setItem('roles', JSON.stringify(auth.user.roles));
					dashStorage.setItem('authenticated', 'true');
					dashStorage.setItem('user', JSON.stringify(auth.user));
					dashStorage.setItem('auth', JSON.stringify(auth));

					return Promise.resolve();
				} catch (error) {
					console.error('Error al auténicar al usuario');
					await logoutFromStorage();
					return Promise.reject();
				}
			}
		} catch (error) {
			console.error(error);
			await logoutFromStorage();
			return Promise.reject();
		}

		await logoutFromStorage();
		return Promise.reject();
	},
	logout: async () => {
		await logoutFromStorage();

		return Promise.resolve();
	},
	checkError: (error) => {
		const errorStatus = error?.response?.status;
		
		window.dispatchEvent(
			new MessageEvent('dash-global-loader', { data: false }),
		);
		if (errorStatus) {
			switch (errorStatus) {
				case 400:
					
					window.dispatchEvent(
						new MessageEvent('GlobalError', {
							data: {error: error.response.data || error},
						}),
					);
					return Promise.resolve();
				case 401:
		
					window.dispatchEvent(
						new MessageEvent('GlobalError', {
							data: {error: error.response.data || error},
						}),
					);
					return Promise.reject(error); //Logs put the user;
				case 403:
					
					window.dispatchEvent(
						new MessageEvent('GlobalError', {
							data: {error:error.response.data || error},
						}),
					);
					return Promise.reject(error); //Logs put the user;
				case 500:
					
					window.dispatchEvent(
						new MessageEvent('GlobalError', {
							data: {error:error.response.data || error},
						}),
					);
					return Promise.resolve();
				case 422:
				case 409:
					let errors: any = {};
					errors['error'] =
						'Ha ocurrido un error indefinido, vuelva a intentarlo más tarde';
					if (error.response.data?.errors) {
						Object.keys(error.response.data?.errors).forEach((key) => {
							errors[key] = error.response.data?.errors[key].join(' , ');
						});
					} else if (error.response.data?.message) {
						errors['error'] = error.response.data?.message;
					}

					window.dispatchEvent(
						new MessageEvent('GlobalError', { data:{error: errors} }),
					);

					return Promise.resolve();
				default:
			
					window.dispatchEvent(
						new MessageEvent('GlobalError', {
							data: {error:error.response.data || error},
						}),
					);

					return Promise.resolve();
			}
		} else {
			let _errors: any = {};
			Object.keys(error).forEach((key) => {
				_errors[key] = Array.isArray(error[key])
					? error[key].join(' , ')
					: error[key];
			});
			
			window.dispatchEvent(new MessageEvent('GlobalError', { data: {error:_errors} }));
			return Promise.resolve();
		}
	},
	checkAuth: () => {
		// TODO: Revisar esto, invalidar el token del usuario antes de ingresar al panel para testear
		return JSON.parse(dashStorage.getItem('authenticated')) === true
			? Promise.resolve()
			: Promise.reject();
	},
	getPermissions: () => {
		if (dashStorage.getItem('roles') === 'guest')
			return Promise.resolve('guest');
		let processedPermissions = {
			roles: dashStorage.getItem('roles')
				? JSON.parse(dashStorage.getItem('roles')).map((item) => item.name)
				: {},
		};
		return processedPermissions
			? Promise.resolve(processedPermissions)
			: Promise.resolve('null');
	},

	getIdentity: async () => {
		const axios = initAxios();

		//const currentUser = JSON.parse(dashStorage.getItem('user'));

		try {
			let { data: auth } = await axios.get('/auth/getauth');

			dashStorage.setItem(
				'roles',
				auth.user?.roles
					? JSON.stringify(auth.user.roles)
					: JSON.stringify(DASHStorageClass.constants.system.GUEST_ROLE),
			);
			dashStorage.setItem('authenticated', 'true');
			dashStorage.setItem('user', JSON.stringify(auth.user));

			if (
				JSON.parse(
					DASHStorageClass.constants.system.ENABLE_TENANT_IMPERSONATION,
				) &&
				auth.user?.tenant_id
			) {
				
              
                    dashStorage.setItem('tenant_id', auth.user?.tenant_id);
                    setCookie('tenant_id', auth.user?.tenant_id);
                    dashStorage.setItem('user_id', auth.user?.id);
                    setCookie('user_id', auth.user?.id);
                
			}
			// TODO: this should return the entire oauth object; nevertheless, only user data is being used.
			return Promise.resolve(auth.user);
		} catch (error) {
			console.error('Error al auténicar al usuario');
			await logoutFromStorage();
			return Promise.reject();
		}
	},
};
