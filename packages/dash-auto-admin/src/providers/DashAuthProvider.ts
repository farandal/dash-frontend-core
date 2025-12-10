/**
 * Dash Auth Provider
 * 
 * Default authentication provider for Dash applications.
 * This provider handles login, logout, identity, and auth checks.
 * 
 * Can be extended or overridden by apps for custom behavior.
 */
import type { AuthProvider } from 'react-admin';

// ============================================================================
// TYPES
// ============================================================================

export interface DashAuthProviderConfig {
    /**
     * Axios instance or hook to use for API calls
     */
    useAxios: () => any;
    
    /**
     * Storage utility (dashStorage from dash-utils)
     */
    storage: {
        getItem: (key: string) => string | null;
        setItem: (key: string, value: string) => void;
        removeItem: (key: string) => void;
        clear: () => void;
    };
    
    /**
     * Auth persistence service
     */
    authPersistence: {
        saveAuth: (auth: any) => void;
        getAuth: () => any;
        clearAuth: () => void;
    };
    
    /**
     * Function to sync localStorage to device store (for Electron/Capacitor)
     */
    syncToDeviceStore: () => Promise<void>;
    
    /**
     * Function to sync device store to localStorage
     */
    syncFromDeviceStore: () => Promise<void>;
    
    /**
     * Function to trigger auth context events
     */
    setAuthEvent?: (data: any) => void;
    
    /**
     * Logout utility function
     */
    logoutFromStorage: (reason?: string) => Promise<void>;
    
    /**
     * Get the auth endpoint URL
     */
    getAuthEndpoint: () => string;
    
    /**
     * Default guest role
     */
    guestRole?: any;
    
    /**
     * Enable tenant impersonation
     */
    enableTenantImpersonation?: boolean;
}

export interface DashAuthProviderOverrides {
    /**
     * Custom login handler
     */
    login?: AuthProvider['login'];
    
    /**
     * Custom logout handler
     */
    logout?: AuthProvider['logout'];
    
    /**
     * Custom getIdentity handler
     */
    getIdentity?: AuthProvider['getIdentity'];
    
    /**
     * Custom checkAuth handler
     */
    checkAuth?: AuthProvider['checkAuth'];
    
    /**
     * Custom checkError handler
     */
    checkError?: AuthProvider['checkError'];
    
    /**
     * Custom getPermissions handler (if needed)
     */
    getPermissions?: AuthProvider['getPermissions'];
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create a Dash auth provider with the given configuration
 * 
 * @param config - Configuration for the auth provider
 * @param overrides - Optional method overrides
 * @returns AuthProvider compatible with react-admin
 * 
 * @example
 * ```tsx
 * import { createDashAuthProvider } from 'dash-auto-admin';
 * 
 * const authProvider = createDashAuthProvider({
 *     useAxios: () => axiosInstance,
 *     storage: dashStorage,
 *     authPersistence: AuthPersistenceService,
 *     // ... other config
 * });
 * ```
 */
export const createDashAuthProvider = (
    config: DashAuthProviderConfig,
    overrides: DashAuthProviderOverrides = {}
): AuthProvider => {
    const {
        useAxios,
        storage,
        authPersistence,
        syncToDeviceStore,
        syncFromDeviceStore,
        setAuthEvent,
        logoutFromStorage,
        getAuthEndpoint,
        guestRole = { name: 'guest' },
        enableTenantImpersonation = false
    } = config;

    const defaultProvider: AuthProvider = {
        login: async ({ username, password }) => {
            await syncFromDeviceStore();
            
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
                        storage.setItem('token', loginResponse.data.token);
                    }

                    try {
                        const { data: auth } = await axios.get(getAuthEndpoint());
                        
                        authPersistence.saveAuth(auth);
                        
                        storage.setItem('authenticated', 'true');
                        storage.setItem('user', JSON.stringify(auth.user));
                        storage.setItem(
                            'roles',
                            auth.user?.roles
                                ? JSON.stringify(auth.user.roles)
                                : JSON.stringify(guestRole),
                        );

                        if (setAuthEvent) {
                            setAuthEvent({
                                authenticated: true,
                                user: auth.user,
                                auth: auth.auth,
                                token: loginResponse.data.token,
                                roles: auth.user?.roles
                            });
                        }

                        await syncToDeviceStore();

                        if (redirectTo) {
                            return Promise.resolve({ redirectTo });
                        } else {
                            return Promise.resolve(auth);
                        }

                    } catch (error) {
                        console.error('Error getting user auth data');
                        await logoutFromStorage("login get auth error");
                        return Promise.reject(error);
                    }
                }
            } catch (error) {
                console.error(error);
                await logoutFromStorage("login error logout");
                return Promise.reject(error);
            }

            await logoutFromStorage("login default error logout");
            return Promise.reject();
        },

        logout: async (params?: any) => {
            await logoutFromStorage("logout");
            return Promise.resolve("/login");
        },

        getIdentity: async () => {
            const axios = useAxios();
            const token = storage.getItem('token');
            
            if (!token) {
                return Promise.reject('No token present');
            }

            try {
                const { data: auth } = await axios.get(getAuthEndpoint());

                storage.setItem(
                    'roles',
                    auth.user?.roles
                        ? JSON.stringify(auth.user.roles)
                        : JSON.stringify(guestRole),
                );
                storage.setItem('authenticated', 'true');
                storage.setItem('user', JSON.stringify(auth.user));

                if (enableTenantImpersonation && auth.user?.tenant_id) {
                    storage.setItem('tenant_id', auth.user?.tenant_id);
                    storage.setItem('user_id', auth.user?.id);
                }

                return await Promise.resolve(auth);
            } catch (error) {
                await logoutFromStorage("get identity error logout");
                return Promise.reject(error);
            } finally {
                await syncToDeviceStore();
            }
        },

        checkAuth: async () => {
            const isAuthenticated = JSON.parse(storage.getItem('authenticated') || 'false');
            const user = JSON.parse(storage.getItem('user') || 'null');
            
            if (isAuthenticated && user?.id) {
                const persistedAuth = authPersistence.getAuth();
                if (persistedAuth) {
                    return Promise.resolve();
                }
            }
            
            return Promise.reject();
        },

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
                            'An undefined error occurred, please try again later';
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

    // Merge default provider with overrides
    return {
        ...defaultProvider,
        ...overrides,
        // Ensure required methods are always present
        login: overrides.login || defaultProvider.login,
        logout: overrides.logout || defaultProvider.logout,
        checkAuth: overrides.checkAuth || defaultProvider.checkAuth,
        checkError: overrides.checkError || defaultProvider.checkError,
        getIdentity: overrides.getIdentity || defaultProvider.getIdentity,
    };
};

export default createDashAuthProvider;
