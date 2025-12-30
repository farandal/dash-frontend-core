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

// Import resources from kt-* packages
import { KitchnTabsResources } from './KitchnTabsResources';

// Import GlobalSmallLoader from local dash-extensions
import GlobalSmallLoader from './dash-extensions/components/GlobalSmallLoader';
import { dashPrivateRoutes, dashPublicRoutes } from './KitchnTabsRoutes';
import MainAppHookComponent from './contexts/MainAppHookComponent';

// Lazy load the main apps
const KitchnTabsPublicApp = lazy(() => import('./core/KitchnTabsPublicApp'));
const KitchnTabsPrivateApp = lazy(() => import('./core/KitchnTabsPrivateApp'));

const KitchnTabsBootstrap: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [initializationError, setInitializationError] = useState<string | null>(null);

    // Use Redux directly
    const auth: IAuthState<any, any> = useSelector((state: IDASHAppState<any, any, any>) => state.auth);
    const dispatch = useDispatch();

    const isAuthenticated = auth.authenticated;

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

    // Listen for logout events triggered by token refresh failure
    useEffect(() => {
        const handleLogoutEvent = (event: CustomEvent) => {
            console.log('🔐 KitchnTabsBootstrap: Received logout event', event.detail);
            
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
        };

        window.addEventListener('auth:logout', handleLogoutEvent as EventListener);

        return () => {
            window.removeEventListener('auth:logout', handleLogoutEvent as EventListener);
        };
    }, [dispatch]);

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

    if (isLoading) {
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
                    //backgroundColor: 'var(--bodybg-primary, #121212)',
                    color: 'var(--text-color,@text-color--dark)',
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

    console.log('🔍 KitchnTabsBootstrap: Rendering app - isAuthenticated:', isAuthenticated);

    const privateAppProps = {
        customResources: KitchnTabsResources,
        customPublicRoutes: dashPublicRoutes,
        customPrivateRoutes: dashPrivateRoutes,
        AdminHook: () => { return <>{/*<RADashComponent />*/}<MainAppHookComponent /></> },
    };


    // Private props are handled by independent wrappers within the dash public app.
    //const publicAppProps = app === "mall" ?  { customGlobalRoutes: mallClientGlobalRoutes } : { customGlobalRoutes: DASHResources }
    console.log("isAuthenticated", isAuthenticated)

    return (
        <Suspense fallback={<GlobalSmallLoader message={isAuthenticated ? "Loading admin panel..." : "Loading application..."} />}>
            {isAuthenticated ? (
                <KitchnTabsPrivateApp {...privateAppProps} />
            ) : (
                <KitchnTabsPublicApp />
            )}
        </Suspense>
    );
};

export default KitchnTabsBootstrap;
// End of file

