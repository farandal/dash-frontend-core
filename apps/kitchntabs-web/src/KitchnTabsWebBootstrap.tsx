/**
 * KitchnTabsBootstrap
 * 
 * Main bootstrap component for the KitchnTabs application.
 * Lightweight component that handles URL routing and renders appropriate app.
 * All initialization logic is delegated to DashBootstrapUtils hooks.
 */
import React, { lazy, Suspense } from 'react';
import { useSelector } from 'react-redux';
import { IAuthState, IDASHAppState } from 'dash-admin-state';

// Import bootstrap utilities
import {
    useAppInitialization,
    useInitializeReduxFromPersisted,
    useLogoutEventListener,
    usePendingRedirect,
    usePathnameTracker
} from './dash-extensions/utils/DashBootstrapUtils';

// Import GlobalSmallLoader from local dash-extensions
import GlobalSmallLoader from './dash-extensions/components/GlobalSmallLoader';

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
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    gap: '16px',
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
