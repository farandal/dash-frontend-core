/**
 * KitchnTabsBootstrap
 *
 * Main bootstrap component for the KitchnTabs application.
 * This handles authentication state and renders either the public or private app.
 */
import React, { lazy, Suspense, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AuthPersistenceService, syncDeviceStoreToLocalStorage, syncLocalStorageToDeviceStore } from 'dash-auth';
import { IAuthState, IDASHAppState, DASH_REDUX_ACTIONS } from 'dash-admin-state';
import { ACTION_UPDATE_AUTH } from 'dash-admin-state/src/redux/reducers/Auth';
import DASHAuthenticationService from 'dash-admin/src/contexts/auth/DASHAuthenticationService';
import { dashStorage } from 'dash-utils';

// Import resources from kt-* packages (keep these as they are needed immediately)
import { KitchnTabsMallResources } from './KitchnTabsMallResources';

// Import GlobalSmallLoader from local dash-extensions (keep for loading states)
import GlobalSmallLoader from './dash-extensions/components/GlobalSmallLoader';

// Lazy load route configurations to reduce initial bundle
const dashPrivateRoutesPromise = import('./KitchnTabsMallRoutes').then(module => module.dashPrivateRoutes);
const dashPublicRoutesPromise = import('./KitchnTabsMallRoutes').then(module => module.dashPublicRoutes);

// Lazy load hook components
const MainAppHookComponent = lazy(() => import('./contexts/MainAppHookComponent'));
const PublicSessionAppHookComponent = lazy(() => import('./contexts/PublicSessionAppHookComponent'));

// Lazy load provider configurations (these are objects, not components)
const providerImportsPromise = import('./dash-extensions').then(module => ({
  DASHMallAuthProvider: module.DASHMallAuthProvider,
  DASHMallClientAuthProvider: module.DASHMallClientAuthProvider,
  DASHMallClientDataProvider: module.DASHMallClientDataProvider,
  DASHMallDataProvider: module.DASHMallDataProvider,
}));

// Import mall components directly from specific files (avoid barrel exports for tree-shaking)
import MallAppMediator from './kt-mall/components/MallAppMediator';
const MallClientWrapper = lazy(() => import('./components/mall').then(module => ({ default: module.MallClientWrapper })));

// Lazy load the main apps
const KitchnTabsPublicApp = lazy(() => import('./core/KitchnTabsPublicApp'));
const KitchnTabsPrivateApp = lazy(() => import('./core/KitchnTabsPrivateApp'));

const KitchnTabsMallBootstrap: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [initializationError, setInitializationError] = useState<string | null>(null);
    const [dependencies, setDependencies] = useState<any>(null);
    
    // Track pathname in state to trigger re-render when URL changes
    const [pathname, setPathname] = useState<string>(window.location.pathname);

    // Use Redux directly
    const auth: IAuthState<any, any> = useSelector((state: IDASHAppState<any, any, any>) => state.auth);
    const dispatch = useDispatch();

    const isAuthenticated = auth.authenticated;

    // Check if URL matches a mall session pattern (/:mallSlug/s/:sessionId)
    // Must be computed early before any conditional returns
    const isSessionUrl = /^\/[^/]+\/s\/[A-Z0-9]{5,}/i.test(pathname);
    
    // CRITICAL: For session URLs, set authenticated=true in localStorage IMMEDIATELY
    // This ensures React Admin renders private routes for guest mall users
    // Must happen BEFORE any render that includes AdminContext
    if (isSessionUrl) {
        const currentAuth = dashStorage.getItem('authenticated');
        if (currentAuth !== 'true') {
            console.log('🔐 KitchnTabsMallBootstrap: Session URL detected, setting guest authenticated=true');
            dashStorage.setItem('authenticated', 'true');
        }
    }
    
    console.log('🚀 KitchnTabsMallBootstrap: INITIAL RENDER', {
        pathname,
        isSessionUrl,
        isAuthenticated,
        isLoading
    });

    // Load dependencies on mount
    useEffect(() => {
        const loadDependencies = async () => {
            try {
                const [providerModule, privateRoutes, publicRoutes] = await Promise.all([
                    providerImportsPromise,
                    dashPrivateRoutesPromise,
                    dashPublicRoutesPromise
                ]);
                
                setDependencies({
                    providers: providerModule,
                    routes: {
                        private: privateRoutes,
                        public: publicRoutes
                    }
                });
            } catch (error) {
                console.error('Failed to load dependencies:', error);
                setInitializationError('Failed to load application dependencies');
            }
        };

        loadDependencies();
    }, []);

    // Listen for URL changes (popstate for back/forward)
    useEffect(() => {
        const handleUrlChange = () => {
            const newPathname = window.location.pathname;
            if (newPathname !== pathname) {
                console.log('🔍 KitchnTabsMallBootstrap: URL changed from', pathname, 'to', newPathname);
                setPathname(newPathname);
            }
        };

        // Listen for browser back/forward navigation
        window.addEventListener('popstate', handleUrlChange);

        return () => {
            window.removeEventListener('popstate', handleUrlChange);
        };
    }, [pathname]);

    console.log('🔍 KitchnTabsBootstrap: Redux auth state:', {
        authenticated: auth.authenticated,
        user: auth.user ? `${auth.user.name || auth.user.email} (${auth.user.id})` : null,
        hasAuth: !!auth.auth
    });

    // Initialize Redux state from persisted data on mount
    useEffect(() => {
        const initializeReduxFromPersisted = () => {
            console.log('🔍 KitchnTabsBootstrap: Checking for persisted auth data...');

            const storedUser = AuthPersistenceService.getUser();
            const storedToken = AuthPersistenceService.getToken();
            const isAuthenticated = JSON.parse(dashStorage.getItem('authenticated') || 'false');
            const persistedAuth = AuthPersistenceService.getAuth();

            console.log('🔍 KitchnTabsBootstrap: Persisted data check:', {
                hasStoredUser: !!storedUser,
                hasStoredToken: !!storedToken,
                isAuthenticated,
                hasPersistedAuth: !!persistedAuth,
                currentReduxAuth: auth.authenticated
            });

            // If we have valid persisted data but Redux isn't updated, restore it
            if (isAuthenticated && storedUser && storedToken && !auth.authenticated) {
                console.log('🔄 KitchnTabsBootstrap: Restoring auth session to Redux from localStorage');

                let userObject = storedUser;
                if (typeof storedUser === 'string') {
                    console.error('❌ KitchnTabsBootstrap: Stored user is string, this should not happen');
                    try {
                        userObject = JSON.parse(storedUser);
                    } catch (e) {
                        console.error('❌ KitchnTabsBootstrap: Cannot parse user string, clearing auth data');
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

                console.log('✅ KitchnTabsBootstrap: Redux state restored from persisted data');
            }
        };

        initializeReduxFromPersisted();
    }, [dispatch, auth.authenticated]);

    // App initialization effect
    useEffect(() => {
        const initializeApp = async () => {
            try {
                console.log('🚀 KitchnTabsBootstrap: Starting app initialization...');

                await syncDeviceStoreToLocalStorage();

                const initResult = await DASHAuthenticationService.initializeApp(true);

                console.log('🔍 KitchnTabsBootstrap: Initialization result:', initResult);

                if (initResult.success) {
                    console.log('✅ KitchnTabsBootstrap: Auto-login successful');

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
                } else {
                    console.log('ℹ️ KitchnTabsBootstrap: No valid authentication found');

                    const authData = AuthPersistenceService.getAuth();

                    if (authData && authData.auth) {
                        console.log('🔄 KitchnTabsBootstrap: Found persisted auth data, attempting token initialization...');

                        try {
                            const tokenInitResult = await DASHAuthenticationService.initializeFromToken();

                            if (tokenInitResult.success) {
                                console.log('✅ KitchnTabsBootstrap: Token initialization successful');

                                dispatch(
                                    DASH_REDUX_ACTIONS.updateAuth(ACTION_UPDATE_AUTH, {
                                        user: tokenInitResult.user,
                                        authenticated: true,
                                        auth: tokenInitResult.auth || null,
                                    })
                                );
                                await syncLocalStorageToDeviceStore();
                                setInitializationError(null);
                            } else {
                                console.log('❌ KitchnTabsBootstrap: Token initialization failed:', tokenInitResult.error);
                                setInitializationError(null);
                                AuthPersistenceService.clearAuth();
                            }

                        } catch (error) {
                            console.error('❌ KitchnTabsBootstrap: Token initialization error:', error);
                            setInitializationError(null);
                            AuthPersistenceService.clearAuth();
                        }
                    } else {
                        console.log('ℹ️ KitchnTabsBootstrap: No persisted auth data found');
                        AuthPersistenceService.clearAuth();
                    }
                }

            } catch (error) {
                console.error('❌ KitchnTabsBootstrap: App initialization failed:', error);
                setInitializationError('Failed to initialize application');
            } finally {
                setIsLoading(false);
            }
        };

        if (isLoading) {
            initializeApp();
        }
    }, [dispatch, isLoading]);


    // Set pending redirect on component mount if there's a redirect parameter
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const redirectTo = searchParams.get('redirect');
        if (redirectTo && redirectTo !== '/login') {
            console.log('ℹ️ RedirectTO: Setting redirect to by searchParams to:', redirectTo);
            DASHAuthenticationService.setPendingRedirect(redirectTo);
        }
    }, []);

    if (isLoading || !dependencies) {
        return <GlobalSmallLoader message="" />;
    }

    if (initializationError) {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    gap: '16px',
                    backgroundColor: 'var(--body-bg, #121212)',
                    color: 'var(--text-color, #ffffff)'
                }}
            >
                <h6 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 500, color: '#f44336' }}>
                    {initializationError}
                </h6>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        marginTop: '16px',
                        padding: '8px 16px',
                        backgroundColor: '#1976d2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 500
                    }}
                >
                    Retry
                </button>
            </div>
        );
    }

    console.log('🔍 KitchnTabsMallBootstrap: Rendering app', { isAuthenticated, isSessionUrl, pathname });

    const privateAppProps = {
        customAuthProvider: dependencies.providers.DASHMallAuthProvider,
        customDataProvider: dependencies.providers.DASHMallDataProvider, 
        customResources: KitchnTabsMallResources,
        customPublicRoutes: dependencies.routes.public,
        customPrivateRoutes: dependencies.routes.private,
        AdminHook: () => { return <>{/*<RADashComponent />*/}<MainAppHookComponent /></> },
    };

    const publicAppProps = {
        customAuthProvider: dependencies.providers.DASHMallClientAuthProvider,
        customDataProvider: dependencies.providers.DASHMallClientDataProvider, 
        customResources: KitchnTabsMallResources,
        customPublicRoutes: dependencies.routes.public,
        customPrivateRoutes: dependencies.routes.private,
        
        AdminHook: () => <><PublicSessionAppHookComponent/><MallAppMediator/></>,  
    };

    // Render based on auth state and URL pattern:
    // - Authenticated users → KitchnTabsPrivateApp (admin)
    // - Unauthenticated + session URL → MallClientWrapper + KitchnTabsPrivateApp (mall ordering)
    // - Unauthenticated + non-session URL → KitchnTabsPublicApp (landing, login, etc.)
    return (
        <Suspense fallback={<GlobalSmallLoader message={isAuthenticated ? "Loading admin panel..." : "Loading application..."} />}>
            {isAuthenticated ? (
                <KitchnTabsPrivateApp {...privateAppProps} />
            ) : isSessionUrl ? (
                <MallClientWrapper>
                    <KitchnTabsPrivateApp {...publicAppProps} />
                </MallClientWrapper>
            ) : (
                <KitchnTabsPublicApp />
            )}
        </Suspense>
    );
};

export default KitchnTabsMallBootstrap;