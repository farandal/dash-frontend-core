/**
 * DashApp - Simplified Application Shell
 * 
 * A simple, easy-to-understand component that:
 * 1. Sets up the Router context FIRST (solving useNavigate issues)
 * 2. Checks authentication state
 * 3. Renders either Public or Private app based on auth
 * 
 * Usage:
 * ```tsx
 * import { DashApp } from 'dash-app-common';
 * 
 * // Zero-config (uses default public/private apps)
 * <DashApp />
 * 
 * // With custom apps
 * <DashApp
 *     PublicApp={MyPublicApp}
 *     PrivateApp={MyPrivateApp}
 * />
 * ```
 */
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom';
import { getEnv } from 'dash-utils';
import { AuthPersistenceService, syncLocalStorageToDeviceStore } from 'dash-auth';
import { dashStorage } from 'dash-utils';

// Framework imports
import DASHAuthenticationService from 'dash-admin/src/contexts/auth/DASHAuthenticationService';
import { DASH_REDUX_ACTIONS } from 'dash-admin-state';
import { ACTION_UPDATE_AUTH } from 'dash-admin-state/src/redux/reducers/Auth';
import AppLoadingFallback from 'dash-components/src/components/theme/AppLoadingFallback';

// Default apps and routes
import { dashDefaultPublicRoutes } from './defaults/extensions/router/dashDefaultPublicRoutes';
import { dashDefaultPrivateRoutes } from './defaults/extensions/router/dashDefaultPrivateRoutes';

// Lazy load default private app
const DashDefaultPrivateApp = React.lazy(
    () => import('./components/DashDefaultPrivateApp')
);

// ============================================================================
// TYPES
// ============================================================================

interface DashAppProps {
    /**
     * Custom public routes function. If not provided, uses default login/register routes.
     */
    publicRoutes?: () => React.ReactNode[];
    
    /**
     * Custom private routes function. If not provided, uses default admin routes.
     */
    privateRoutes?: () => React.ReactNode[];
    
    /**
     * Custom component to render for authenticated users instead of routes.
     * Use this when you have a full custom admin app (like DashLazyAdminApp).
     */
    PrivateApp?: React.ComponentType<any>;
    
    /**
     * Props to pass to the PrivateApp component.
     */
    privateAppProps?: Record<string, any>;
    
    /**
     * Loading component shown during initialization.
     */
    LoadingComponent?: React.ComponentType<{ message?: string }>;
    
    /**
     * Force hash router (for Electron apps).
     */
    useHashRouter?: boolean;
    
    /**
     * Base path for the router.
     */
    basename?: string;
    
    /**
     * Enable debug logging.
     */
    debug?: boolean;
}

// ============================================================================
// HELPER: Determine router type
// ============================================================================

const shouldUseHashRouter = (): boolean => {
    const platformType = getEnv('PLATFORM_TYPE');
    const platform = getEnv('PLATFORM');
    return platformType === 'desktop' || platform === 'electron';
};

// ============================================================================
// INNER COMPONENT: Routes Content (rendered inside Router)
// This component is responsible for rendering routes AFTER Router is mounted
// ============================================================================

interface RoutesContentProps {
    publicRoutes: () => React.ReactNode[];
    privateRoutes?: () => React.ReactNode[];
    isAuthenticated: boolean;
    LoadingComponent: React.ComponentType<{ message?: string }>;
    privateAppProps?: Record<string, any>;
    PrivateApp?: React.ComponentType<any>;
}

const RoutesContent: React.FC<RoutesContentProps> = ({
    publicRoutes,
    privateRoutes,
    isAuthenticated,
    LoadingComponent,
    privateAppProps = {},
    PrivateApp,
}) => {
    // Render authenticated app
    if (isAuthenticated) {
        // If a custom PrivateApp is provided, render it directly
        if (PrivateApp) {
            return <PrivateApp {...privateAppProps} />;
        }
        
        // If custom private routes provided, render them
        if (privateRoutes) {
            return (
                <Routes>
                    {privateRoutes()}
                </Routes>
            );
        }
        
        // Default: Use DashDefaultPrivateApp (with useOwnRouter=false since we already have Router)
        return (
            <React.Suspense fallback={<LoadingComponent message="Loading admin..." />}>
                <DashDefaultPrivateApp useOwnRouter={false} {...privateAppProps} />
            </React.Suspense>
        );
    }
    
    // Render public routes (login, register, etc.)
    // Routes are called here, INSIDE the Router context
    return (
        <Routes>
            {publicRoutes()}
        </Routes>
    );
};

// ============================================================================
// INNER COMPONENT: App Content (rendered inside Router)
// ============================================================================

interface AppContentProps {
    publicRoutes: () => React.ReactNode[];
    privateRoutes?: () => React.ReactNode[];
    PrivateApp?: React.ComponentType<any>;
    privateAppProps?: Record<string, any>;
    LoadingComponent: React.ComponentType<{ message?: string }>;
    debug?: boolean;
}

const AppContent: React.FC<AppContentProps> = ({
    publicRoutes,
    privateRoutes,
    PrivateApp,
    privateAppProps = {},
    LoadingComponent,
    debug = false,
}) => {
    const [isInitializing, setIsInitializing] = useState(true);
    const dispatch = useDispatch();
    
    // Get auth state from Redux
    const auth = useSelector((state: any) => state.auth);
    const isAuthenticated = auth?.authenticated ?? false;
    
    const log = (...args: any[]) => {
        if (debug) console.log('🔷 DashApp:', ...args);
    };
    
    // Initialize auth on mount
    useEffect(() => {
        const initializeAuth = async () => {
            log('Initializing authentication...');
            
            try {
                // Check for persisted auth data
                const storedToken = AuthPersistenceService.getToken();
                const storedUser = AuthPersistenceService.getUser();
                const isAuthenticatedStored = JSON.parse(dashStorage.getItem('authenticated') || 'false');
                
                log('Persisted data:', { hasToken: !!storedToken, hasUser: !!storedUser, isAuthenticated: isAuthenticatedStored });
                
                if (storedToken && isAuthenticatedStored) {
                    // Try to restore session
                    const result = await DASHAuthenticationService.initializeFromToken();
                    
                    if (result.success) {
                        log('Session restored successfully');
                        dispatch(DASH_REDUX_ACTIONS.updateAuth(ACTION_UPDATE_AUTH, {
                            user: result.user,
                            authenticated: true,
                            auth: result.auth || null,
                        }));
                        await syncLocalStorageToDeviceStore();
                    } else {
                        log('Session restore failed, clearing auth');
                        AuthPersistenceService.clearAuth();
                    }
                } else {
                    log('No valid session found');
                }
            } catch (error) {
                console.error('DashApp: Auth initialization error:', error);
                AuthPersistenceService.clearAuth();
            } finally {
                setIsInitializing(false);
            }
        };
        
        initializeAuth();
    }, [dispatch, debug]);
    
    // Show loading during initialization
    if (isInitializing) {
        return <LoadingComponent message="Initializing..." />;
    }
    
    log('Rendering:', isAuthenticated ? 'Private App' : 'Public Routes');
    
    // Use RoutesContent to defer route evaluation until we're sure we're inside Router
    return (
        <RoutesContent
            publicRoutes={publicRoutes}
            privateRoutes={privateRoutes}
            isAuthenticated={isAuthenticated}
            LoadingComponent={LoadingComponent}
            privateAppProps={privateAppProps}
            PrivateApp={PrivateApp}
        />
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * DashApp - The main application shell
 * 
 * Sets up Router context first, then handles auth and conditional rendering.
 * This ensures useNavigate() and other Router hooks work everywhere.
 */
export const DashApp: React.FC<DashAppProps> = ({
    publicRoutes = dashDefaultPublicRoutes,
    privateRoutes,
    PrivateApp,
    privateAppProps,
    LoadingComponent = AppLoadingFallback,
    useHashRouter: forceHashRouter,
    basename,
    debug = false,
}) => {
    // Determine router type
    const useHash = forceHashRouter ?? shouldUseHashRouter();
    const effectiveBasename = basename ?? getEnv('BASE_PATH') ?? '/';
    
    // Router wrapper
    const Router = useHash ? HashRouter : BrowserRouter;
    const routerProps = useHash ? { basename: '' } : { basename: effectiveBasename };
    
    return (
        <Router {...routerProps}>
            <AppContent
                publicRoutes={publicRoutes}
                privateRoutes={privateRoutes}
                PrivateApp={PrivateApp}
                privateAppProps={privateAppProps}
                LoadingComponent={LoadingComponent}
                debug={debug}
            />
        </Router>
    );
};

export default DashApp;
