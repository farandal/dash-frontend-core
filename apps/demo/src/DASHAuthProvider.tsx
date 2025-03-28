import { getCookie, removeCookie, setCookie } from 'dash-admin/src/utils/cookies';

import DASHAdminSystemConstants from 'dash-admin/src/config/DASHAdminSystemConstants';

import { setAuthContext } from 'dash-admin/src/contexts/auth';
import DASHAppConstants from 'dash-constants';
import { useAxios } from 'dash-axios-hook';
const GET_AUTH_ENDPOINT = "auth/getauth";

export const logoutFromStorage = () => {

  removeCookie('tenant_id');
  removeCookie('token');
  localStorage.removeItem('socketConnectionState');
  localStorage.removeItem('user');
  localStorage.removeItem('tenantSettings');
  localStorage.setItem('authenticated', 'false');
  localStorage.setItem(
    'roles',
    JSON.stringify([DASHAppConstants.system.GUEST_ROLE]),
  );

};

export const updateAuth = async () => {

  const axios = useAxios();

  const { data: auth } = await axios.get(GET_AUTH_ENDPOINT);

  localStorage.setItem('roles', JSON.stringify(auth.user.roles));
  localStorage.setItem('authenticated', 'true');
  localStorage.setItem('user', JSON.stringify(auth.user));
  // TODO
  //localStorage.setItem('tenantSettings',..,);
  setAuthContext({ authenticated: true, user: auth.user, auth: auth });


};

export default {

  login: async ({ username, password }) => {
    const axios = useAxios();

    if (!(username && password)) {
      return Promise.reject();
    }

    try {
      const loginResponse = await axios.post('/login', {
        email: username,
        password,
      });

      if (loginResponse.status >= 200 && loginResponse.status <= 299) {

        const today = new Date();
        const expires = new Date();
        expires.setDate(today.getDate() + 2);

        if (loginResponse.data !== "") {
          setCookie('token', loginResponse.data.token, { expires });
          localStorage.setItem('token', loginResponse.data.token);
        }

        try {

          const { data: auth } = await axios.get(GET_AUTH_ENDPOINT);
          localStorage.setItem('roles', JSON.stringify(auth.user.roles));
          localStorage.setItem('authenticated', 'true');
          localStorage.setItem('user', JSON.stringify(auth.user));
          // TODO
          //localStorage.setItem('tenantSettings',..,);
          setAuthContext({ authenticated: true, user: auth.user, auth: auth });

          return await Promise.resolve();
        } catch (error) {

          console.error('Error al obtener al usuario');
          logoutFromStorage();
          return Promise.reject(error);
        }


      }
    } catch (error) {
      console.error(error);
      logoutFromStorage();
      return Promise.reject(error);
    }

    logoutFromStorage();

    return Promise.reject();
  },
  logout: () => {
    logoutFromStorage();

    // TODO: Hack to fix the roles dependant resource loading issue.
    // Usually The application doesnt have to reload when logging in;
    // Nevertheless, resource definitions are statcally loaded, then when the user logout from a role, and login with another role, then the application menu and resources requires to be regenerated.
    // This has not been possible with the current React implementation, therefore the entire application requires to be reloaded.
    //window.location.href = "/login"

    return Promise.resolve();
  },
  checkError: (error) => {

    const errorStatus = error?.response?.status;

    window.dispatchEvent(
      new MessageEvent('ra-auto-global-loader', { data: false }),
    );
    if (errorStatus) {
      const errors: any = {};
      switch (errorStatus) {
        case 400:

          window.dispatchEvent(
            new MessageEvent('GlobalError', {
              data: { error: error.response.data || error }
            }),
          );
          return Promise.resolve();
        case 401:

          window.dispatchEvent(
            new MessageEvent('GlobalError', {
              data: { error: error.response.data || error }
            }),
          );
          //return Promise.reject(error); //Promise.reject logs off the user
          return Promise.resolve();
        case 403:

          window.dispatchEvent(
            new MessageEvent('GlobalError', {
              data: { error: error.response.data || error }
            }),
          );
          //return Promise.reject(error); //Promise.reject logs off the user
          return Promise.resolve();
        case 500:

          window.dispatchEvent(
            new MessageEvent('GlobalError', {
              data: { error: error.response.data || error }
            }),
          );
          return Promise.resolve();
        case 422:
        case 409:

          errors.error =
            'Ha ocurrido un error indefinido, vuelva a intentarlo más tarde';
          if (error.response.data?.errors) {
            Object.keys(error.response.data?.errors).forEach((key) => {
              errors[key] = error.response.data?.errors[key].join(' , ');
            });
          } else if (error.response.data?.message) {
            errors.error = error.response.data?.message;
          }

          window.dispatchEvent(
            new MessageEvent('GlobalError', { data: { error: errors } }),
          );

          return Promise.resolve();
        default:

          window.dispatchEvent(
            new MessageEvent('GlobalError', {
              data: { error: error.response.data || error }
            }),
          );

          return Promise.resolve();
      }
    } else {
      const _errors: any = {};
      Object.keys(error).forEach((key) => {
        _errors[key] = Array.isArray(error[key])
          ? error[key].join(' , ')
          : error[key];
      });
      //localStorage.setItem('axiosError', JSON.stringify(_errors));
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

    try {
      if (localStorage.getItem('roles') === 'guest')
        return Promise.resolve('guest');

      const roles = localStorage.getItem('roles');
      if (!roles) return Promise.resolve('null');

      const processedPermissions = {
        roles: JSON.parse(roles).map((item) => item.name)
      };

      if (processedPermissions) {
        Promise.resolve(processedPermissions)
      } else {
        Promise.resolve('null');
      }
    } catch (error) {
      return Promise.resolve('null');
    }
  },

  getIdentity: async () => {

    const axios = useAxios();

    //const currentUser = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    if (!token) {
      //logoutFromStorage();
      // return Promise.reject();
      logoutFromStorage();
      return Promise.reject('No token present');
    }

    try {
      const { data: auth } = await axios.get(GET_AUTH_ENDPOINT);


      localStorage.setItem(
        'roles',
        auth.user?.roles
          ? JSON.stringify(auth.user.roles)
          : JSON.stringify(DASHAppConstants.system.GUEST_ROLE),
      );
      localStorage.setItem('authenticated', 'true');
      localStorage.setItem('user', JSON.stringify(auth.user));

      if (
        JSON.parse(
          DASHAdminSystemConstants.system.ENABLE_TENANT_IMPERSONATION.toString(),
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
      return await Promise.resolve(auth.user);
    } catch (error) {
      //console.error('Error al auténicar al usuario');
      logoutFromStorage();

      return Promise.reject(error);
    }
  },
};