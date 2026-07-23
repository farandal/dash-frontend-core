/**
 * KitchnTabsBootstrap
 * 
 * Main bootstrap component for the DashAdmin application.
 * Lightweight component that handles URL routing and renders appropriate app.
 * All initialization logic is delegated to DashBootstrapUtils hooks.
 */
import React, { lazy, Suspense } from 'react';
import { useSelector } from 'react-redux';
import { IAuthState, IDASHAppState } from 'dash-admin-state';

// Import bootstrap utilities from shared boilerplate package
import {
    useAppInitialization,
    useInitializeReduxFromPersisted,
    useLogoutEventListener,
    usePendingRedirect,
    useUrlLocaleDetection,
    GlobalSmallLoader,
    DefaultInitializationErrorFallback,
} from 'dash-boilerplate';

// Lazy load app-specific resource loaders (splits bundles)
const KitchnTabsWebPrivateAppLoader = lazy(() => import('./KitchnTabsWebPrivateAppLoader'));
const KitchnTabsWebPublicAppLoader = lazy(() => import('./KitchnTabsWebPublicAppLoader'));

const KitchnTabsWebBootstrap: React.FC = () => {
    // Use Redux auth state
    const auth: IAuthState<any, any> = useSelector((state: IDASHAppState<any, any, any>) => state.auth);
    const isAuthenticated = auth.authenticated;

    // Initialize app (auth, device sync, etc.)
    const { isLoading, initializationError } = useAppInitialization();

    // Initialize Redux from persisted auth data
    useInitializeReduxFromPersisted(auth.authenticated);

    // Handle logout events
    useLogoutEventListener();

    // Handle redirect parameters
    usePendingRedirect();

    // Detect and apply locale from URL query string (e.g., ?lang=es)
    useUrlLocaleDetection(['es', 'en'], 'es');

    console.log('🔍 KitchnTabsWebBootstrap: Redux auth state:', {
        authenticated: auth.authenticated,
        user: auth.user ? `${auth.user.name || auth.user.email} (${auth.user.id})` : null,
        hasAuth: !!auth.auth
    });

    if (isLoading) {
        return <GlobalSmallLoader message="" />;
    }

    if (initializationError) {
        return (
            <DefaultInitializationErrorFallback 
                error={initializationError}
                retryLabel="Retry"
            />
        );
    }

    console.log('🔍 KitchnTabsWebBootstrap: Rendering app', { isAuthenticated });
   
    return (
        <>
          
            <Suspense fallback={<GlobalSmallLoader message={isAuthenticated ? "Loading admin panel..." : "Loading application..."} />}>
                {isAuthenticated ? (
                    <KitchnTabsWebPrivateAppLoader />
                ) : (
                    <KitchnTabsWebPublicAppLoader />
                )}
            </Suspense>
        </>
    );
};

export default KitchnTabsWebBootstrap;
