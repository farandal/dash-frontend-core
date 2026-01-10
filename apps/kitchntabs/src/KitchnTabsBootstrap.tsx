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
import { dashStorage } from 'dash-utils';

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

// Lazy load the main apps
const KitchnTabsPublicApp = lazy(() => import('./core/KitchnTabsPublicApp'));

// Lazy load app-specific resource loaders (splits bundles)
const PrivateAppLoader = lazy(() => import('./core/PrivateAppLoader'));
const SelfServiceAppLoader = lazy(() => import('./core/SelfServiceAppLoader'));
const MallServiceAppLoader = lazy(() => import('./core/MallServiceAppLoader'));

const KitchnTabsBootstrap: React.FC = () => {
    // Use Redux auth state
    const auth: IAuthState<any, any> = useSelector((state: IDASHAppState<any, any, any>) => state.auth);
    const isAuthenticated = auth.authenticated;

    // Track pathname changes
    const pathname = usePathnameTracker();

    // Check if URL matches a self-service session pattern (/selfservice/:sessionId)
    const selfServiceMatch = pathname.match(/^\/selfservice\/([A-Z0-9]{5,})/i);
    const isSelfServiceUrl = !!selfServiceMatch;

    // Check if URL matches a mall session pattern
    // Pattern 1: /mall/:mallSlug/s/:sessionId (e.g., /mall/foodcourt/s/DFJNL)
    // Pattern 2: /mall/:sessionId (legacy, e.g., /mall/DFJNL)
    const mallFullMatch = pathname.match(/^\/mall\/([^/]+)\/s\/([A-Z0-9]{5,})/i);
    const mallShortMatch = pathname.match(/^\/mall\/([A-Z0-9]{5,})/i);
    const isMallUrl = !!mallFullMatch || !!mallShortMatch;
    const mallSlug = mallFullMatch ? mallFullMatch[1] : null;
    const mallSessionId = mallFullMatch ? mallFullMatch[2] : (mallShortMatch ? mallShortMatch[1] : null);

    const sessionId = selfServiceMatch ? selfServiceMatch[1] : null;

    // For self-service URLs, set authenticated=true in localStorage immediately
    if (isSelfServiceUrl) {
        const currentAuth = dashStorage.getItem('authenticated');
        if (currentAuth !== 'true') {
            console.log('🔐 KitchnTabsBootstrap: Self-service URL detected, setting guest authenticated=true');
            dashStorage.setItem('authenticated', 'true');
        }
    }

    // For mall URLs, set authenticated=true in localStorage immediately
    if (isMallUrl) {
        const currentAuth = dashStorage.getItem('authenticated');
        if (currentAuth !== 'true') {
            console.log('🔐 KitchnTabsBootstrap: Mall URL detected, setting guest authenticated=true');
            dashStorage.setItem('authenticated', 'true');
        }
    }

    console.log('🚀 KitchnTabsBootstrap: INITIAL RENDER', {
        pathname,
        isSelfServiceUrl,
        isMallUrl,
        sessionId,
        mallSessionId,
        mallSlug,
        isAuthenticated,
    });

    // Initialize app (auth, device sync, etc.)
    const { isLoading, initializationError } = useAppInitialization();

    // Initialize Redux from persisted auth data
    useInitializeReduxFromPersisted(auth.authenticated);

    // Handle logout events
    useLogoutEventListener();

    // Handle redirect parameters
    usePendingRedirect();

    console.log('🔍 KitchnTabsBootstrap: Redux auth state:', {
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

    console.log('🔍 KitchnTabsBootstrap: Rendering app', { isAuthenticated, isSelfServiceUrl, isMallUrl, pathname });
    console.log(isMallUrl ? 'MALL' : isSelfServiceUrl ? 'SELFSERIVICE' : isAuthenticated ? 'ADMIN' : 'PUBLIC');
    // Render based on auth state and URL pattern:
    // - Mall URL → MallServiceAppLoader (lazy loads mall service resources)
    // - Self-Service URL → SelfServiceAppLoader (lazy loads self-service resources)
    // - Authenticated users → PrivateAppLoader (lazy loads admin resources)
    // - Unauthenticated + non-session URL → KitchnTabsPublicApp (landing, login, etc.)
    return (
        <Suspense fallback={<GlobalSmallLoader message={isAuthenticated ? "Loading admin panel..." : "Loading application..."} />}>
            {isMallUrl ? (
                <MallServiceAppLoader sessionId={mallSessionId} mallSlug={mallSlug} />
            ) : isSelfServiceUrl ? (
                <SelfServiceAppLoader sessionId={sessionId} />
            ) : isAuthenticated ? (
                <PrivateAppLoader />
            ) : (
                <KitchnTabsPublicApp />
            )}
        </Suspense>
    );
};

export default KitchnTabsBootstrap;
