/**
 * Dash Default Auth Provider Extension
 * 
 * This file wraps the dash-auto-admin DashAuthProvider factory,
 * providing default app overrides and customizations.
 */

import { 
    createDashAuthProvider, 
    type DashAuthProviderConfig, 
    type DashAuthProviderOverrides 
} from 'dash-auto-admin';
import { getEnv } from 'dash-constants';
import { DASHAppConstants, DASHAdminSystemConstants } from 'dash-constants';
import { setAuthEvent } from 'dash-admin/src/contexts/auth';
import { AuthPersistenceService, syncDeviceStoreToLocalStorage, syncLocalStorageToDeviceStore } from 'dash-auth';
import { useAxios } from 'dash-axios-hook';
import { dashStorage } from 'dash-utils';
import { dashDefaultLogoutFromStorage } from '../utils/dashDefaultAuthProviderUtils';


/**
 * Dash default auth provider configuration
 */
export const dashDefaultAuthProviderConfig: DashAuthProviderConfig = {
    useAxios: useAxios,
    storage: dashStorage,
    authPersistence: AuthPersistenceService,
    syncToDeviceStore: syncLocalStorageToDeviceStore,
    syncFromDeviceStore: syncDeviceStoreToLocalStorage,
    setAuthEvent: setAuthEvent,
    logoutFromStorage: dashDefaultLogoutFromStorage,
    getAuthEndpoint: () => getEnv('APP_GETAUTH_ENDPOINT') || '/auth',
    guestRole: DASHAppConstants.system.GUEST_ROLE,
    enableTenantImpersonation: JSON.parse(
        DASHAdminSystemConstants.system.ENABLE_TENANT_IMPERSONATION?.toString() || 'false'
    ),
};

/**
 * Dash default auth provider overrides
 * These override the default implementations from dash-auto-admin
 */
export const dashDefaultAuthProviderOverrides: DashAuthProviderOverrides = {
    /**
     * Dash default login implementation with Dash-specific logic
     */
    login: async ({ username, password }) => {
        await syncDeviceStoreToLocalStorage();

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
                const redirectTo = loginResponse.data.redirectTo;

                if (loginResponse.data !== "") {
                    dashStorage.setItem('token', loginResponse.data.token);
                }

                try {
                    // Get complete auth data
                    const { data: auth } = await axios.get(getEnv('APP_GETAUTH_ENDPOINT'));

                    // Use AuthPersistenceService to save auth data
                    AuthPersistenceService.saveAuth(auth);

                    // Set basic localStorage for react-admin compatibility
                    dashStorage.setItem('authenticated', 'true');
                    dashStorage.setItem('user', JSON.stringify(auth.user));
                    dashStorage.setItem(
                        'roles',
                        auth.user?.roles
                            ? JSON.stringify(auth.user.roles)
                            : JSON.stringify(DASHAppConstants.system.GUEST_ROLE),
                    );

                    // Trigger auth context update
                    setAuthEvent({
                        authenticated: true,
                        user: auth.user,
                        auth: auth.auth,
                        token: loginResponse.data.token,
                        roles: auth.user?.roles
                    });

                    await syncLocalStorageToDeviceStore();

                    // Handle redirect from backend response
                    if (redirectTo) {
                        return Promise.resolve({ redirectTo });
                    } else {
                        return Promise.resolve(auth);
                    }

                } catch (error) {
                    console.error('Error getting user auth');
                    dashDefaultLogoutFromStorage("login get auth error");
                    return Promise.reject(error);
                }
            }
        } catch (error) {
            console.error(error);
            dashDefaultLogoutFromStorage("login error logout");
            return Promise.reject(error);
        }

        dashDefaultLogoutFromStorage("login default error logout");
        return Promise.reject();
    },

    /**
     * Dash default logout implementation
     */
    logout: async (params?: any, redirectTo?: string | false) => {
        await dashDefaultLogoutFromStorage("logout");
        return Promise.resolve(redirectTo || "/login");
    },

    /**
     * Dash default getIdentity implementation
     */
    getIdentity: async () => {
        const axios = useAxios();
        const token = dashStorage.getItem('token');

        if (!token) {
            return Promise.reject('No token present');
        }

        try {
            const { data: auth } = await axios.get(getEnv('APP_GETAUTH_ENDPOINT'));

            dashStorage.setItem(
                'roles',
                auth.user?.roles
                    ? JSON.stringify(auth.user.roles)
                    : JSON.stringify(DASHAppConstants.system.GUEST_ROLE),
            );
            dashStorage.setItem('authenticated', 'true');
            dashStorage.setItem('user', JSON.stringify(auth.user));

            if (
                JSON.parse(
                    DASHAdminSystemConstants.system.ENABLE_TENANT_IMPERSONATION.toString(),
                ) &&
                auth.user?.tenant_id
            ) {
                dashStorage.setItem('tenant_id', auth.user?.tenant_id);
                dashStorage.setItem('user_id', auth.user?.id);
            }

            return await Promise.resolve(auth);
        } catch (error) {
            dashDefaultLogoutFromStorage("get identity error logout");
            return Promise.reject(error);
        } finally {
            await syncLocalStorageToDeviceStore();
        }
    },

    /**
     * Dash default checkAuth implementation
     */
    checkAuth: async () => {
        const isAuthenticated = JSON.parse(dashStorage.getItem('authenticated') || 'false');
        const user = JSON.parse(dashStorage.getItem('user') || 'null');

        if (isAuthenticated && user?.id) {
            const persistedAuth = AuthPersistenceService.getAuth();
            if (persistedAuth) {
                return Promise.resolve();
            }
        }

        return Promise.reject();
    },

    /**
     * Dash default checkError implementation with Dash error handling
     */
    checkError: (error) => {
        const errorStatus = error?.response?.status;

        window.dispatchEvent(
            new MessageEvent('dash-global-loader', { data: false }),
        );

        if (errorStatus) {
            const errors: any = {};
            switch (errorStatus) {
                case 400:
                case 401:
                case 403:
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
                        'An undefined error has occurred, please try again later';
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
            return Promise.resolve();
        }
    },
};

/**
 * Create the dash default auth provider using the factory
 * This combines the base implementation with app-specific overrides
 */
export const dashDefaultAuthProvider = createDashAuthProvider(
    dashDefaultAuthProviderConfig,
    dashDefaultAuthProviderOverrides
);

export default dashDefaultAuthProvider;
