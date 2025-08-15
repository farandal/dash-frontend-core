/**
 * Lightweight authentication service for public app
 * This service handles authentication without react-admin dependencies
 */

import { createAxiosInstance } from 'dash-axios-hook';
import { getCookie, setCookie } from '../../utils/cookies';
import { getEnv } from '../../config/DASHAdminSystemConstants';
import { AuthPersistenceService } from 'dash-auth';
import { setAuthEvent } from './AuthContext';
import {DASHAppConstants} from 'dash-constants';

import {DASHAdminSystemConstants} from  'dash-constants'

import { dashStorage } from 'dash-utils';

import { DASH_REDUX_ACTIONS, dispatchToRedux } from 'dash-admin-state';
import { ACTION_UPDATE_AUTH } from 'dash-admin-state/src/redux/reducers/Auth';
export interface DASHAuthenticationServiceLoginCredentials {
    username: string;
    password: string;
    redirect?: string;
    meta?: any;
}

export interface DASHAuthenticationServiceAuthResponse {
    success: boolean;
    token?: string;
    user?: any;
    auth?: any;
    refreshToken?: string;
    error?: string;
    redirectAfterLogin?: string;
}

/*
@TechDebt: refresh token strategy not implemented neither in backend or frontend.
*/
class DASHAuthenticationService {
    private axiosInstance: any;
    private readonly REDIRECT_STORAGE_KEY = 'redirectAfterLogin';

    constructor() {
        // Initialize axios instance in constructor
        this.axiosInstance = createAxiosInstance();
    }

    // Method to recreate axios instance with new options if needed
    reinitializeAxios(options?: any) {
        this.axiosInstance = createAxiosInstance(options);
    }

    // Method to set pending redirect URL
    setPendingRedirect(url: string): void {

        console.log('Setting pending redirect:', url);
        dashStorage.setItem(this.REDIRECT_STORAGE_KEY, url);
    }

    // Method to get pending redirect URL
    getPendingRedirect(): string | null {
        return dashStorage.getItem(this.REDIRECT_STORAGE_KEY);
    }

    // Method to clear pending redirect URL

    clearPendingRedirect(): void {
        console.log('Clearing pending redirect');
        dashStorage.removeItem(this.REDIRECT_STORAGE_KEY);
    }

    // Method to determine final redirect URL (backend takes precedence over localStorage)
    private determineRedirectUrl(backendRedirect?: string): string | null {

        let val = null;
        // Backend redirect takes precedence
        if (backendRedirect) {
            console.log('Using backend redirect:', backendRedirect);
            // Clear any pending localStorage redirect since backend provided one
            //this.clearPendingRedirect();
            val = backendRedirect;
            this.setPendingRedirect(val);
            return val;
        }

        // Fall back to localStorage redirect
        const localStorageRedirect = this.getPendingRedirect();
        if (localStorageRedirect) {
            console.log('Using localStorage redirect:', localStorageRedirect);
            //this.clearPendingRedirect();
            val = localStorageRedirect;
            this.setPendingRedirect(val);
            return val;
        }

        val = getEnv("APP_DEFAULT_REDIRECT");

        this.setPendingRedirect(val);

        return val;


    }

    // Update the login method to dispatch to Redux directly
    async login(credentials: DASHAuthenticationServiceLoginCredentials): Promise<DASHAuthenticationServiceAuthResponse> {
        console.log("=== DASH AUTH SERVICE LOGIN START ===");
        console.log("Credentials:", { username: credentials.username, password: "***", redirect: credentials.redirect, meta: credentials.meta });

        if (!(credentials.username && credentials.password)) {
            console.log("❌ Missing credentials");
            return Promise.resolve({
                success: false,
                error: 'Username and password are required'
            });
        }

        try {
            console.log("Making login request to /login");

            const loginResponse = await this.axiosInstance.post('/login', {
                email: credentials.username,
                password: credentials.password,
                redirect: credentials.redirect,
                meta: credentials.meta
            });

            console.log("Login response status:", loginResponse.status);
            console.log("Login response data:", loginResponse.data);



            if (loginResponse.status >= 200 && loginResponse.status <= 299) {
                console.log("✅ Login response successful");

                // ✅ Extract redirectTo from backend response FIRST
                const backendRedirectTo = loginResponse.data.redirectTo;

                console.log("🎯 Backend redirectTo:", backendRedirectTo);

                const today = new Date();
                const expires = new Date();
                expires.setDate(today.getDate() + 2);

                // Check if we have token data
                if (loginResponse.data && loginResponse.data.token) {

                    console.log("Setting token in storage");
                    setCookie('token', loginResponse.data.token, { expires });
                    dashStorage.setItem('token', loginResponse.data.token);
                    if (loginResponse.data?.refreshToken) {
                        console.log("Setting refresh token in storage");
                        setCookie('refreshToken', loginResponse.data.refreshToken, { expires });
                        dashStorage.setItem('refreshToken', loginResponse.data.refreshToken);
                    }
                    if (loginResponse.data?.meta) {
                        console.log("Setting app");
                        dashStorage.setItem('app', loginResponse.data.meta.app);
                    }
                } else {
                    console.warn("⚠️ No token in login response");
                }

                try {
                    console.log("Getting auth data from:", getEnv('APP_GETAUTH_ENDPOINT'));

                    // Get complete auth data
                    const authResponse = await this.axiosInstance.get(getEnv('APP_GETAUTH_ENDPOINT'));
                    console.log("Auth response status:", authResponse.status);
                    console.log("Auth response data:", authResponse.data);

                    const auth = authResponse.data;

                    // ✅ Use backend redirectTo as the primary redirect
                    let finalRedirect = backendRedirectTo;

                    // Only fall back to other redirects if backend didn't provide one
                    if (!finalRedirect) {
                        // Check auth response redirect
                        const authRedirect = auth.redirect || auth.user?.redirect || null;
                        console.log("Auth response redirect:", authRedirect);

                        if (authRedirect) {
                            finalRedirect = authRedirect;
                        } else if (credentials.redirect && credentials.redirect !== '/login') {
                            finalRedirect = credentials.redirect;
                        } else {
                            finalRedirect = getEnv("APP_DEFAULT_REDIRECT") || '/';
                        }
                    }

                    console.log("🎯 Final redirect determined:", finalRedirect);

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

                    // Handle tenant impersonation if enabled
                    if (
                        JSON.parse(
                            DASHAdminSystemConstants.system.ENABLE_TENANT_IMPERSONATION.toString(),
                        ) &&
                        auth.user?.tenant_id
                    ) {
                        const existingTenantCookie = getCookie('tenant_id');
                        if (!existingTenantCookie) {
                            dashStorage.setItem('tenant_id', auth.user?.tenant_id);
                            setCookie('tenant_id', auth.user?.tenant_id);
                            dashStorage.setItem('user_id', auth.user?.id);
                            setCookie('user_id', auth.user?.id);
                        }
                    }

                    const resultObject = {
                        authenticated: true,
                        user: auth.user,
                        auth: auth.auth,
                        token: loginResponse.data.token || dashStorage.getItem('token'),
                        roles: auth.user?.roles
                    }

                    // Dispatch directly to Redux instead of using setAuthEvent
                    console.log('🔄 DASHAuthenticationService: Dispatching to Redux:', resultObject);
                    dispatchToRedux(
                        DASH_REDUX_ACTIONS.updateAuth(ACTION_UPDATE_AUTH, {
                            user: resultObject.user,
                            authenticated: resultObject.authenticated,
                            auth: resultObject.auth,
                        })
                    );

                    console.log("✅ Login completed successfully");
                    return Promise.resolve({
                        success: true,
                        token: resultObject.token,
                        user: resultObject.user,
                        auth: resultObject.auth,
                        redirectAfterLogin: finalRedirect, // ✅ Use the backend redirectTo
                    });
                } catch (error) {
                    console.error('❌ Error getting auth data:', error);
                    this.logoutFromStorage("login get auth error");
                    return Promise.resolve({
                        success: false,
                        error: 'Failed to get user authentication data'
                    });
                }
            } else {
                console.log("❌ Login response status not successful:", loginResponse.status);
                this.logoutFromStorage("login status error logout");
                return Promise.reject({
                    success: false,
                    error: `Login failed with status: ${loginResponse.status}`
                });
            }
        } catch (error: any) {
            console.error('❌ Login error:', error);
            console.error('Error details:', {
                message: error?.message,
                response: error?.response?.data,
                status: error?.response?.status
            });
            this.logoutFromStorage("login error logout");
            return Promise.reject({
                success: false,
                error: error?.response?.data?.message || error?.message || 'Login failed'
            });
        }
    }

    // Update the initializeFromToken method to dispatch to Redux directly
    async initializeFromToken(): Promise<DASHAuthenticationServiceAuthResponse> {
        const token = dashStorage.getItem('token');

        if (!token) {
            return {
                success: false,
                error: 'No token found'
            };
        }

        try {
            console.log('Initializing auth from existing token...');

            // Get complete auth data using existing token
            const { data: auth } = await this.axiosInstance.get(getEnv('APP_GETAUTH_ENDPOINT'));

            // Extract redirect from backend auth response
            const backendRedirect = auth.redirect || auth.user?.redirect || null;
            console.log("Backend redirect found during token initialization:", backendRedirect);

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

            // Handle tenant impersonation if enabled
            if (
                JSON.parse(
                    DASHAdminSystemConstants.system.ENABLE_TENANT_IMPERSONATION.toString(),
                ) &&
                auth.user?.tenant_id
            ) {
                const existingTenantCookie = getCookie('tenant_id');
                if (!existingTenantCookie) {
                    dashStorage.setItem('tenant_id', auth.user?.tenant_id);
                    setCookie('tenant_id', auth.user?.tenant_id);
                    dashStorage.setItem('user_id', auth.user?.id);
                    setCookie('user_id', auth.user?.id);
                }
            }

            const resultObject = {
                authenticated: true,
                user: auth.user,
                auth: auth.auth,
                token: token,
                roles: auth.user?.roles
            };

            // Dispatch directly to Redux instead of using setAuthEvent
            console.log('🔄 DASHAuthenticationService: Dispatching token init to Redux:', resultObject);
            dispatchToRedux(
                DASH_REDUX_ACTIONS.updateAuth(ACTION_UPDATE_AUTH, {
                    user: resultObject.user,
                    authenticated: resultObject.authenticated,
                    auth: resultObject.auth,
                })
            );

            console.log('Auth initialized successfully from existing token');

            // Determine final redirect URL (backend takes precedence)
            const redirectAfterLogin = this.determineRedirectUrl(backendRedirect);

            return {
                success: true,
                token: token,
                user: auth.user,
                auth: auth.auth,
                redirectAfterLogin: redirectAfterLogin
            };
        } catch (error) {
            console.error('Error initializing auth from token:', error);
            this.logoutFromStorage("initialize from token error");
            return {
                success: false,
                error: 'Failed to initialize authentication from token'
            };
        }
    }

    async refreshToken(refreshToken: string): Promise<DASHAuthenticationServiceAuthResponse> {
        try {
            const response = await this.axiosInstance.post('/auth/refresh', {
                refreshToken
            });

            if (response.status >= 200 && response.status <= 299) {
                const data = response.data;

                // Update stored auth data using the same pattern as login
                if (data.token) {
                    debugger;
                    /*const today = new Date();
                    const expires = new Date();
                    expires.setDate(today.getDate() + 2);
                    setCookie('token', data.token, { expires });*/
                    setCookie('token', data.token);
                    dashStorage.setItem('token', data.token);
                }

                return {
                    success: true,
                    token: data.token,
                    refreshToken: data.refreshToken
                };
            } else {
                return {
                    success: false,
                    error: 'Token refresh failed'
                };
            }
        } catch (error) {
            console.error('Token refresh error:', error);
            return {
                success: false,
                error: 'Network error occurred'
            };
        }
    }

    private logoutFromStorage = async (reason: string) => {
        console.log("logoutFromStorage", reason);

        // Clear pending redirect on logout
        //this.clearPendingRedirect();
        // Store current path as pending redirect



        // Use the centralized persistence service instead of manual cleanup
        AuthPersistenceService.markAsLoggedOut();

        // Keep only the IPC service cleanup
        const { DashIPCService } = window as any;
        DashIPCService && DashIPCService.action('stop-bg-service');
    };

    async checkAuth(): Promise<boolean> {
        // First check localStorage for basic auth state
        const isAuthenticated = JSON.parse(dashStorage.getItem('authenticated') || 'false');
        const user = JSON.parse(dashStorage.getItem('user') || 'null');

        if (isAuthenticated && user?.id) {
            // Also check if we have valid persisted auth data
            const persistedAuth = AuthPersistenceService.getAuth();
            if (persistedAuth) {
                return true;
            }
        }

        return false;
    }

    async getIdentity(): Promise<any> {
        const token = dashStorage.getItem('token');
        if (!token) {
            throw new Error('No token present');
        }

        try {
            const { data: auth } = await this.axiosInstance.get(getEnv('APP_GETAUTH_ENDPOINT'));

            dashStorage.setItem(
                'roles',
                auth.user?.roles
                    ? JSON.stringify(auth.user.roles)
                    : JSON.stringify(DASHAppConstants.system.GUEST_ROLE),
            );
            dashStorage.setItem('authenticated', 'true');
            dashStorage.setItem('user', JSON.stringify(auth.user));

            // Handle tenant impersonation if enabled
            if (
                JSON.parse(
                    DASHAdminSystemConstants.system.ENABLE_TENANT_IMPERSONATION.toString(),
                ) &&
                auth.user?.tenant_id
            ) {
                const existingTenantCookie = getCookie('tenant_id');
                if (!existingTenantCookie) {
                    dashStorage.setItem('tenant_id', auth.user?.tenant_id);
                    setCookie('tenant_id', auth.user?.tenant_id);
                    dashStorage.setItem('user_id', auth.user?.id);
                    setCookie('user_id', auth.user?.id);
                }
            }

            return auth;
        } catch (error) {
            this.logoutFromStorage("get identity error logout");
            throw error;
        }
    }

    // Rest of your methods remain the same...
    async shouldRefreshToken(): Promise<boolean> {
        const token = dashStorage.getItem('token');
        if (!token) return false;

        const refreshToken = dashStorage.getItem('refreshToken');
        return !!refreshToken;
    }

    async handleTokenRefresh(): Promise<boolean> {
        const refreshToken = dashStorage.getItem('refreshToken');
        if (!refreshToken) return false;

        try {
            const refreshResponse = await this.refreshToken(refreshToken);
            if (refreshResponse.success) {

                // Update localStorage with new token
                dashStorage.setItem('token', refreshResponse.token!);
                if (refreshResponse.refreshToken) {
                    dashStorage.setItem('refreshToken', refreshResponse.refreshToken);
                }
                return true;
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
            this.logoutFromStorage("token refresh failed");
        }
        return false;
    }

    // Method to check if we should initialize from token on app load
    async shouldInitializeFromToken(forceGetAuth?: boolean): Promise<boolean> {

        if (forceGetAuth) { return true };

        const token = dashStorage.getItem('token');
        const isAuthenticated = JSON.parse(dashStorage.getItem('authenticated') || 'false');
        const user = dashStorage.getItem('user');

        // If we have a token but are not fully authenticated, we should initialize
        return !!(token && (!isAuthenticated || !user));
    }

    // Update the initializeApp method to dispatch to Redux directly
    async initializeApp(forceGetAuth?: boolean): Promise<DASHAuthenticationServiceAuthResponse> {
        
      
        console.log('Initializing DASH app authentication...');
        const USES_GET_AUTH = true; // TODO: add the get auth to the env and retrieve it through getEnv. nevertheless all apps uses getAuth. 

        const shouldInit = await this.shouldInitializeFromToken(forceGetAuth);

        if (shouldInit) {
            console.log('Token found but not fully authenticated, initializing...');
            return await this.initializeFromToken();
        } else {
            const token = dashStorage.getItem('token');
            const isAuthenticated = JSON.parse(dashStorage.getItem('authenticated') || 'false');
            const user = dashStorage.getItem('user');

            if (token && isAuthenticated && user) {
                console.log('Already authenticated, checking if auth refresh needed');

                // If shouldGetAuth is true, refresh auth data to get latest tenant/user info
                if (USES_GET_AUTH) {
                    try {
                        console.log('Refreshing auth data for latest tenant/user information...');

                        // Get fresh auth data
                        const authResponse = await this.axiosInstance.get(getEnv('APP_GETAUTH_ENDPOINT'));
                        console.log("Fresh auth response:", authResponse.data);

                        const auth = authResponse.data;

                        // Extract redirect from backend auth response
                        const backendRedirect = auth.redirect || auth.user?.redirect || null;
                        console.log("Backend redirect found during app initialization:", backendRedirect);

                        // Update stored auth data
                        AuthPersistenceService.saveAuth(auth);

                        // Update localStorage with fresh data
                        dashStorage.setItem('user', JSON.stringify(auth.user));
                        dashStorage.setItem(
                            'roles',
                            auth.user?.roles
                                ? JSON.stringify(auth.user.roles)
                                : JSON.stringify(DASHAppConstants.system.GUEST_ROLE),
                        );

                        // Handle tenant impersonation with fresh data
                        if (
                            JSON.parse(
                                DASHAdminSystemConstants.system.ENABLE_TENANT_IMPERSONATION.toString(),
                            ) &&
                            auth.user?.tenant_id
                        ) {
                            // Update tenant information even if it exists (in case it changed)
                            dashStorage.setItem('tenant_id', auth.user?.tenant_id);
                            setCookie('tenant_id', auth.user?.tenant_id);
                            dashStorage.setItem('user_id', auth.user?.id);
                            setCookie('user_id', auth.user?.id);
                        }

                        const resultObject = {
                            authenticated: true,
                            user: auth.user,
                            auth: auth.auth,
                            token: token,
                            roles: auth.user?.roles
                        };

                        // Dispatch directly to Redux with fresh data
                        console.log('🔄 DASHAuthenticationService: Dispatching fresh auth to Redux:', resultObject);
                        dispatchToRedux(
                            DASH_REDUX_ACTIONS.updateAuth(ACTION_UPDATE_AUTH, {
                                user: resultObject.user,
                                authenticated: resultObject.authenticated,
                                auth: resultObject.auth,
                            })
                        );

                        // Determine final redirect URL (backend takes precedence)
                        const redirectAfterLogin = this.determineRedirectUrl(backendRedirect);

                        console.log('Auth data refreshed successfully');

                    

                        return {
                            success: true,
                            token: token,
                            user: auth.user,
                            auth: auth.auth,
                            redirectAfterLogin: redirectAfterLogin
                        };

                    } catch (error) {
                        console.error('Error refreshing auth data:', error);

                        // If refresh fails, fall back to existing data but don't fail the initialization
                        console.log('Falling back to existing auth data');

                        const existingUser = JSON.parse(user);
                        const persistedAuth = AuthPersistenceService.getAuth();

                        // Dispatch existing data to Redux
                        console.log('🔄 DASHAuthenticationService: Dispatching existing auth to Redux');
                        dispatchToRedux(
                            DASH_REDUX_ACTIONS.updateAuth(ACTION_UPDATE_AUTH, {
                                user: existingUser,
                                authenticated: true,
                                auth: persistedAuth?.auth || null,
                            })
                        );

                        // Still check for localStorage redirect as fallback
                        const redirectAfterLogin = this.determineRedirectUrl();
                        
                

                        return {
                            success: true,
                            token: token,
                            user: existingUser,
                            auth: persistedAuth?.auth || null,
                            redirectAfterLogin: redirectAfterLogin
                        };
                    }
                } else {
                    console.log('No auth refresh needed, using existing data');

                    const existingUser = JSON.parse(user);
                    const persistedAuth = AuthPersistenceService.getAuth();

                    // Dispatch existing data to Redux
                    console.log('🔄 DASHAuthenticationService: Dispatching existing auth to Redux');
                    dispatchToRedux(
                        DASH_REDUX_ACTIONS.updateAuth(ACTION_UPDATE_AUTH, {
                            user: existingUser,
                            authenticated: true,
                            auth: persistedAuth?.auth || null,
                        })
                    );

                    // Still check for pending redirect even if not refreshing auth
                    const redirectAfterLogin = this.determineRedirectUrl();

                  
                    return {
                        success: true,
                        token: token,
                        user: existingUser,
                        auth: persistedAuth?.auth || null,
                        redirectAfterLogin: redirectAfterLogin
                    };
                }
            } else {
                console.log('No valid authentication found');

                return {
                    success: false,
                    error: 'No valid authentication found'
                };
            }
        }


    }

    // Method to integrate with React Admin
    async loginWithReactAdmin(credentials: DASHAuthenticationServiceLoginCredentials, reactAdminLogin?: any): Promise<void> {
        debugger;
        const effectiveLogin = reactAdminLogin || this.login;
        const authResponse = await effectiveLogin(credentials);
        return authResponse;
        /*if (authResponse.success) {
            // Use React Admin's login with custom auth data
            await reactAdminLogin({
                customAuthData: {
                    token: authResponse.token,
                    user: authResponse.user,
                    auth: authResponse.auth,
                    refreshToken: authResponse.refreshToken,
                    redirectAfterLogin: authResponse.redirectAfterLogin
                }
            });
        } else {
            throw new Error(authResponse.error || 'Login failed');
        }*/
    }

    // Function to get initial auth state with persisted values
    getInitialAuthState = () => {
        try {
            // Get persisted auth data
            const persistedAuth = AuthPersistenceService.getAuth();
            const storedUser = AuthPersistenceService.getUser();
            const storedToken = AuthPersistenceService.getToken();
            const isAuthenticated = JSON.parse(dashStorage.getItem('authenticated') || 'false');

            console.log('🔍 DASHLightApp: Initializing auth state with persisted data:', {
                hasPersistedAuth: !!persistedAuth,
                hasStoredUser: !!storedUser,
                hasStoredToken: !!storedToken,
                isAuthenticated,
                storedUser: storedUser ? `${storedUser.name || storedUser.email} (${storedUser.id})` : null,
                persistedAuthStructure: persistedAuth ? Object.keys(persistedAuth) : null
            });

            // If we have valid persisted auth data, use it
            if (isAuthenticated && storedUser && storedToken && persistedAuth) {
                console.log('✅ DASHLightApp: Using persisted auth state');
                const authState = {
                    authenticated: true,
                    user: storedUser, // This should be the actual user object
                    auth: persistedAuth.auth || null, // This should be the actual auth object
                };

                console.log('🔍 DASHLightApp: Constructed auth state:', {
                    authenticated: authState.authenticated,
                    user: authState.user ? `${authState.user.name || authState.user.email} (${authState.user.id})` : null,
                    auth: authState.auth ? 'present' : null
                });

                return authState;
            }

            // If we have a token but not full auth data, we'll let DASHAuthenticationService handle initialization
            if (storedToken && !isAuthenticated) {
                console.log('🔄 DASHLightApp: Token found but not authenticated, will initialize later');
                return {
                    authenticated: false,
                    user: null,
                    auth: null,
                };
            }

            console.log('ℹ️ DASHLightApp: No valid persisted auth found, using default auth state');
            return {
                authenticated: false,
                user: null,
                auth: null
            };
        } catch (error) {
            console.error('❌ DASHLightApp: Error getting initial auth state:', error);
            return {
                authenticated: false,
                user: null,
                auth: null
            };
        }
    };


}

export default new DASHAuthenticationService();
