import DASHStorageClass from '../classes/DASHStorageClass';
import { initAxios } from '../hooks/axios';
import { getCookie, removeCookie, setCookie } from '../utils/cookies';

export const logoutFromStorage = () => {
	removeCookie('tenant_id');
	removeCookie('token');
	localStorage.removeItem('user');
	localStorage.removeItem('auth');
	localStorage.setItem('authenticated', 'false');
	localStorage.setItem('roles', null); // before it was guest role.
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
				var today = new Date();
				var expires = new Date();
				expires.setDate(today.getDate() + 2);
				setCookie('token', loginResponse.data.token, { expires });

				localStorage.setItem('token', loginResponse.data.token);

				try {
					let { data: auth } = await axios.get('/auth/getauth');

					localStorage.setItem('roles', JSON.stringify(auth.user.roles));
					localStorage.setItem('authenticated', 'true');
					localStorage.setItem('user', JSON.stringify(auth.user));
					localStorage.setItem('auth', JSON.stringify(auth));

					return Promise.resolve();
				} catch (error) {
					console.error('Error al auténicar al usuario');
					logoutFromStorage();
					return Promise.reject();
				}
			}
		} catch (error) {
			console.error(error);
			logoutFromStorage();
			return Promise.reject();
		}

		logoutFromStorage();
		return Promise.reject();
	},
	logout: () => {
		logoutFromStorage();

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
		return JSON.parse(localStorage.getItem('authenticated')) === true
			? Promise.resolve()
			: Promise.reject();
	},
	getPermissions: () => {
		if (localStorage.getItem('roles') === 'guest')
			return Promise.resolve('guest');
		let processedPermissions = {
			roles: localStorage.getItem('roles')
				? JSON.parse(localStorage.getItem('roles')).map((item) => item.name)
				: {},
		};
		return processedPermissions
			? Promise.resolve(processedPermissions)
			: Promise.resolve('null');
	},

	getIdentity: async () => {
		const axios = initAxios();

		//const currentUser = JSON.parse(localStorage.getItem('user'));

		try {
			let { data: auth } = await axios.get('/auth/getauth');

			localStorage.setItem(
				'roles',
				auth.user?.roles
					? JSON.stringify(auth.user.roles)
					: JSON.stringify(DASHStorageClass.constants.system.GUEST_ROLE),
			);
			localStorage.setItem('authenticated', 'true');
			localStorage.setItem('user', JSON.stringify(auth.user));

			if (
				JSON.parse(
					DASHStorageClass.constants.system.ENABLE_TENANT_IMPERSONATION,
				) &&
				auth.user?.tenant_id
			) {
				
                const existingTenantCookie = getCookie('tenant_id');
                if (!existingTenantCookie) {
                    localStorage.setItem('tenant_id', auth.user?.tenant_id);
                    setCookie('tenant_id', auth.user?.tenant_id);
                }

			}
			// TODO: this should return the entire oauth object; nevertheless, only user data is being used.
			return Promise.resolve(auth.user);
		} catch (error) {
			console.error('Error al auténicar al usuario');
			logoutFromStorage();
			return Promise.reject();
		}
	},
};
