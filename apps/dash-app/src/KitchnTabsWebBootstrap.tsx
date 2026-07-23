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
import { AuthPersistenceService } from 'dash-auth';
import { dashStorage, updateDomCssVariables } from 'dash-utils';

// Import bootstrap utilities from shared boilerplate package
import {
    useAppInitialization,
    useInitializeReduxFromPersisted,
    useLogoutEventListener,
    usePendingRedirect,
    useUrlLocaleDetection,
    usePathnameTracker,
    GlobalSmallLoader,
    DefaultInitializationErrorFallback,
} from 'dash-boilerplate';

// Import ElectronUpdateNotification from local dash-extensions
import { ElectronUpdateNotification } from './dash-extensions/components/ElectronUpdateNotification';

// Lazy load the main apps
const KitchnTabsPublicApp = lazy(() => import('./KitchnTabsWebPublicApp'));

// Lazy load app-specific resource loaders (splits bundles)
const PrivateAppLoader = lazy(() => import('./KitchnTabsWebPrivateAppLoader'));
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

    React.useEffect(() => {
        // Re-inject styles whenever auth state changes or on mount
        // This ensures async loaded tenant settings are applied
        const tenantSettings = AuthPersistenceService.getTenantSettings();
        if (tenantSettings && tenantSettings.colors) {
            const currentMode = document.documentElement.getAttribute('data-theme') || 'light';
            console.log('🎨 Updating tenant styles from bootstrap, mode:', currentMode);
            updateDomCssVariables(currentMode, tenantSettings.colors, tenantSettings.values);
        }
    }, [isAuthenticated, isSelfServiceUrl, isMallUrl]);

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

    // Detect and apply locale from URL query string (e.g., ?lang=es)
    useUrlLocaleDetection(['es', 'en'], 'es');

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
            <DefaultInitializationErrorFallback 
                error={initializationError}
                retryLabel="Retry"
            />
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
        <>
            <ElectronUpdateNotification />
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
        </>
    );
};

export default KitchnTabsBootstrap;
