/**
 * DashBootstrapUtils
 * 
 * Utility hooks and functions for application bootstrap.
 * Handles Redux initialization, auth persistence, event listeners, etc.
 */
import { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { AuthPersistenceService, syncDeviceStoreToLocalStorage, syncLocalStorageToDeviceStore } from 'dash-auth';
import { DASH_REDUX_ACTIONS } from 'dash-admin-state';
import { ACTION_UPDATE_AUTH } from 'dash-admin-state/src/redux/reducers/Auth';
import DASHAuthenticationService from 'dash-admin/src/contexts/auth/DASHAuthenticationService';
import { dashStorage, updateDomCssVariables } from 'dash-utils';

export interface AppInitializationResult {
    isLoading: boolean;
    initializationError: string | null;
}

/**
 * Hook to initialize Redux auth state from persisted localStorage data
 */
export const useInitializeReduxFromPersisted = (currentAuthState: boolean): void => {
    const dispatch = useDispatch();

    useEffect(() => {
        const initializeReduxFromPersisted = () => {
            console.log('🔍 Bootstrap: Checking for persisted auth data...');

            const storedUser = AuthPersistenceService.getUser();
            const storedToken = AuthPersistenceService.getToken();
            const isAuthenticated = JSON.parse(dashStorage.getItem('authenticated') || 'false');
            const persistedAuth = AuthPersistenceService.getAuth();

            console.log('🔍 Bootstrap: Persisted data check:', {
                hasStoredUser: !!storedUser,
                hasStoredToken: !!storedToken,
                isAuthenticated,
                hasPersistedAuth: !!persistedAuth,
                currentReduxAuth: currentAuthState,
            });

            // If we have valid persisted data but Redux isn't updated, restore it
            if (isAuthenticated && storedUser && storedToken && !currentAuthState) {
                console.log('🔄 Bootstrap: Restoring auth session to Redux from localStorage');

                let userObject = storedUser;
                if (typeof storedUser === 'string') {
                    console.error('❌ Bootstrap: Stored user is string, this should not happen');
                    try {
                        userObject = JSON.parse(storedUser);
                    } catch (e) {
                        console.error('❌ Bootstrap: Cannot parse user string, clearing auth data');
                        AuthPersistenceService.clearAuth();
                        return;
                    }
                }

                dispatch(
                    DASH_REDUX_ACTIONS.updateAuth(ACTION_UPDATE_AUTH, {
                        user: userObject,
                        authenticated: true,
                        auth: persistedAuth?.auth || null,
                    })
                );

                console.log('✅ Bootstrap: Redux state restored from persisted data');
            }
        };

        initializeReduxFromPersisted();
    }, [dispatch, currentAuthState]);
};

/**
 * Hook to handle logout events
 */
export const useLogoutEventListener = (): void => {
    const dispatch = useDispatch();

    useEffect(() => {
        const handleLogoutEvent = (event: CustomEvent) => {
            console.log('🔐 Bootstrap: Received logout event', event.detail);

            // Clear Redux auth state
            dispatch(
                DASH_REDUX_ACTIONS.updateAuth(ACTION_UPDATE_AUTH, {
                    user: null,
                    authenticated: false,
                    auth: null,
                })
            );

            // Clear persisted auth
            AuthPersistenceService.clearAuth();
            localStorage.clear();
        };

        window.addEventListener('auth:logout', handleLogoutEvent as EventListener);

        return () => {
            window.removeEventListener('auth:logout', handleLogoutEvent as EventListener);
        };
    }, [dispatch]);
};

/**
 * Hook to initialize the application (auth, device sync, etc.)
 */
export const useAppInitialization = (): AppInitializationResult => {
    const [isLoading, setIsLoading] = useState(true);
    const [initializationError, setInitializationError] = useState<string | null>(null);
    const dispatch = useDispatch();

    useEffect(() => {
        const initializeApp = async () => {
            try {
                console.log('🚀 Bootstrap: Starting app initialization...');

                await syncDeviceStoreToLocalStorage();

                const initResult = await DASHAuthenticationService.initializeApp(true);

                console.log('🔍 Bootstrap: Initialization result:', initResult);

                if (initResult.success) {
                    console.log('✅ Bootstrap: Auto-login successful');

                    dispatch(
                        DASH_REDUX_ACTIONS.updateAuth(ACTION_UPDATE_AUTH, {
                            user: initResult.user,
                            authenticated: true,
                            auth: initResult.auth || null,
                        })
                    );

                    window.DashIPCService?.speak(`${initResult.user?.name}, Bienvenido!`);

                    await syncLocalStorageToDeviceStore();
                    setInitializationError(null);

                    if (initResult.redirectAfterLogin) {
                        console.log('🔄 Bootstrap: Emitting auth:redirect event', initResult.redirectAfterLogin);
                        const event = new CustomEvent('auth:redirect', {
                            detail: { to: initResult.redirectAfterLogin },
                        });
                        window.dispatchEvent(event);
                    }
                } else {
                    console.log('ℹ️ Bootstrap: No valid authentication found');

                    const authData = AuthPersistenceService.getAuth();

                    if (authData && authData.auth) {
                        console.log('🔄 Bootstrap: Found persisted auth data, attempting token initialization...');

                        try {
                            const tokenInitResult = await DASHAuthenticationService.initializeFromToken();

                            if (tokenInitResult.success) {
                                console.log('✅ Bootstrap: Token initialization successful');

                                dispatch(
                                    DASH_REDUX_ACTIONS.updateAuth(ACTION_UPDATE_AUTH, {
                                        user: tokenInitResult.user,
                                        authenticated: true,
                                        auth: tokenInitResult.auth || null,
                                    })
                                );
                                await syncLocalStorageToDeviceStore();
                                setInitializationError(null);

                                if (tokenInitResult.redirectAfterLogin) {
                                    console.log(
                                        '🔄 Bootstrap: Emitting auth:redirect event',
                                        tokenInitResult.redirectAfterLogin
                                    );
                                    const event = new CustomEvent('auth:redirect', {
                                        detail: { to: tokenInitResult.redirectAfterLogin },
                                    });
                                    window.dispatchEvent(event);
                                }
                            } else {
                                console.log('❌ Bootstrap: Token initialization failed:', tokenInitResult.error);
                                setInitializationError(null);
                                AuthPersistenceService.clearAuth();
                            }
                        } catch (error) {
                            console.error('❌ Bootstrap: Token initialization error:', error);
                            setInitializationError(null);
                            AuthPersistenceService.clearAuth();
                        }
                    } else {
                        console.log('ℹ️ Bootstrap: No persisted auth data found');
                        AuthPersistenceService.clearAuth();
                    }
                }
            } catch (error) {
                console.error('❌ Bootstrap: App initialization failed:', error);
                setInitializationError('Failed to initialize application');
            } finally {
                setIsLoading(false);
            }
        };

        if (isLoading) {
            initializeApp();
        }
    }, [dispatch, isLoading]);

    return { isLoading, initializationError };
};

/**
 * Hook to handle redirect parameters from URL
 */
export const usePendingRedirect = (): void => {
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const redirectTo = searchParams.get('redirect');
        if (redirectTo && redirectTo !== '/login') {
            console.log('ℹ️ RedirectTO: Setting redirect to by searchParams to:', redirectTo);
            DASHAuthenticationService.setPendingRedirect(redirectTo);
        }
    }, []);
};

// Custom event name for locale changes - must match I18nBridgeContext
export const LOCALE_CHANGE_EVENT = 'dash:locale-change';

/**
 * Hook to detect and apply locale from URL query string parameter.
 * If the URL contains `?lang=es` or `?lang=en`, it sets the app locale accordingly.
 * This works for both public and private apps.
 * 
 * Emits a custom event 'dash:locale-change' that I18nBridgeProvider listens for
 * to update the i18n context and trigger component re-renders.
 * 
 * IMPORTANT: This hook ALWAYS dispatches to Redux on mount to ensure Redux state
 * is initialized from localStorage, even if the URL locale matches stored locale.
 * This is necessary because Redux initialState has locale as an empty object,
 * not the actual locale string.
 * 
 * @param availableLocales - Array of valid locale codes (e.g., ['es', 'en'])
 * @param defaultLocale - Default locale if none is specified (defaults to 'es')
 */
export const useUrlLocaleDetection = (
    availableLocales: string[] = ['es', 'en'],
    defaultLocale: string = 'es'
): void => {
    const dispatch = useDispatch();

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const searchParams = new URLSearchParams(window.location.search);
        const langParam = searchParams.get('lang');
        const storedLocale = localStorage.getItem('dash-user-locale');
        
        // Determine the target locale: URL param > stored locale > default
        let targetLocale = defaultLocale;
        
        if (langParam && availableLocales.includes(langParam)) {
            targetLocale = langParam;
        } else if (storedLocale && availableLocales.includes(storedLocale)) {
            targetLocale = storedLocale;
        }

        const isNewLocale = storedLocale !== targetLocale;
        
        if (isNewLocale) {
            console.log(`🌐 Bootstrap: Locale change detected: ${storedLocale} -> ${targetLocale}`);
            // Persist new locale to localStorage
            localStorage.setItem('dash-user-locale', targetLocale);
        } else {
            console.log(`🌐 Bootstrap: Initializing locale from storage: ${targetLocale}`);
        }

        // ALWAYS dispatch to Redux to ensure Redux state is initialized
        // Redux initial state has locale as empty object, we need to set it
        console.log(`🌐 Bootstrap: Dispatching locale to Redux: ${targetLocale}`);
        (dispatch as any)(DASH_REDUX_ACTIONS.switchLanguage(targetLocale));
        
        // ALWAYS emit event for I18nBridgeProvider to pick up
        // This ensures the provider syncs with the correct locale
        console.log(`🌐 Bootstrap: Emitting locale change event: ${targetLocale}`);
        window.dispatchEvent(new CustomEvent(LOCALE_CHANGE_EVENT, {
            detail: { locale: targetLocale }
        }));
        
    }, [dispatch, availableLocales, defaultLocale]);
};

/**
 * Hook to track URL pathname changes
 */
export const usePathnameTracker = (): string => {
    const [pathname, setPathname] = useState(
        typeof window !== 'undefined' ? window.location.pathname : '/'
    );

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleUrlChange = () => {
            const newPathname = window.location.pathname;
            if (newPathname !== pathname) {
                console.log('🔍 Bootstrap: URL changed from', pathname, 'to', newPathname);
                setPathname(newPathname);
            }
        };

        window.addEventListener('popstate', handleUrlChange);
        return () => window.removeEventListener('popstate', handleUrlChange);
    }, [pathname]);

    return pathname;
};

/**
 * Hook to initialize theme early before React renders
 */
export const useEarlyThemeInit = (defaultTheme: 'light' | 'dark' = 'dark'): void => {
    useEffect(() => {
        if (typeof document === 'undefined') return;

        const stored = localStorage.getItem('theme');
        const theme = stored === 'light' || stored === 'dark' ? stored : defaultTheme;
        document.documentElement.setAttribute('data-theme', theme);
        if (!stored) {
            localStorage.setItem('theme', theme);
        }
    }, [defaultTheme]);
};

/**
 * Initialize theme synchronously (call before React render)
 */
export const initializeThemeEarly = (defaultTheme: string): void => {
    
    if (typeof document === 'undefined' || typeof localStorage === 'undefined') return;

    const stored = localStorage.getItem('theme');
    const theme = stored === 'light' || stored === 'dark' ? stored : defaultTheme;
    document.documentElement.setAttribute('data-theme', theme);
    if (!stored) {
        localStorage.setItem('theme', theme);
    }

    // Initialize CSS variables based on the determined theme
    // This allows the correct colors to be available immediately, preventing flash of unstyled content
    try {
        updateDomCssVariables(theme);
        console.log('🎨 Bootstrap: Initialized theme variables for:', theme);
    } catch (error) {
        console.warn('Failed to initialize theme variables:', error);
    }
};

/**
 * Sync electron store to localStorage (if available)
 */
export const syncElectronStore = async (): Promise<void> => {
    if (typeof window === 'undefined') return;

    const electronStore = (window as any).electronStore;
    if (electronStore) {
        const all: Record<string, any> = await electronStore.syncToLocalStorage();
        Object.entries(all).forEach(([key, value]) => {
            window.localStorage.setItem(key, JSON.stringify(value));
        });
    }
};
