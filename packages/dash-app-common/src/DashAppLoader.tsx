/**
 * DashAppLoader
 * 
 * The core authentication-aware application loader for Dash Framework.
 * Handles auth state management, Redux session restoration, and conditional
 * rendering of public/private apps based on authentication status.
 * 
 * This component consolidates all app bootstrapping logic:
 * - Auth state detection and initialization
 * - Redux state restoration from localStorage
 * - Device storage synchronization
 * - Lazy loading of public/private app components
 * - Loading and error state management
 * 
 * Usage:
 * ```tsx
 * import { DashAppLoader, createDashAppLoader } from 'dash-app-common';
 * 
 * // Option 1: Minimal usage with all defaults (zero-config)
 * <DashAppLoader />
 * 
 * // Option 2: Direct usage with custom apps
 * <DashAppLoader
 *     publicAppImport={() => import('./PublicApp')}
 *     privateAppImport={() => import('./AdminApp')}
 * />
 * 
 * // Option 3: Factory function for reusable loader
 * const AppLoader = createDashAppLoader({
 *     publicAppImport: () => import('./PublicApp'),
 *     privateAppImport: () => import('./AdminApp'),
 *     AdminHookComponent: MainAppHook,
 * });
 * 
 * <AppLoader />
 * ```
 */
import React, { ComponentType, Suspense, useEffect, useState, useCallback, lazy, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useDeviceStorageSync } from 'dash-utils';

// Import framework defaults that can't be imported in dash-utils due to circular deps
import DASHAuthenticationService from 'dash-admin/src/contexts/auth/DASHAuthenticationService';
import { DASH_REDUX_ACTIONS } from 'dash-admin-state';
import { ACTION_UPDATE_AUTH } from 'dash-admin-state/src/redux/reducers/Auth';
import AppLoadingFallback from 'dash-components/src/components/theme/AppLoadingFallback';
import DashDefaultPublicApp from './components/DashDefaultPublicApp';
import DashDefaultPrivateApp from './components/DashDefaultPrivateApp';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Interface for Redux auth state
 * Represents the authentication state in Redux store
 */
export interface IDashAuthState {
    isLogged: boolean;
    isLoading: boolean;
    token: string | null;
    user: Record<string, any> | null;
    [key: string]: any;
}

/**
 * Interface for Redux app state with auth
 * Represents the full Redux state structure
 */
export interface IDashAppState {
    auth: IDashAuthState;
    [key: string]: any;
}

/**
 * Interface for auth service (like DASHAuthenticationService)
 * Defines the contract for authentication services
 */
export interface IDashAuthService {
    /** Initialize app authentication - checks for existing tokens and restores session */
    initializeApp?: (forceGetAuth?: boolean) => Promise<{ success: boolean; user?: any; token?: string; error?: string }>;
    /** Alternative init method for simpler auth services */
    init?: () => Promise<{ success: boolean; user?: any }>;
    login?: (credentials: any) => Promise<any>;
    logout?: () => Promise<void>;
    checkAuth?: () => Promise<boolean>;
    getToken?: () => string | null;
    getUser?: () => any;
    getInitialAuthState?: () => { authenticated: boolean; user: any; auth: any };
    [key: string]: any;
}

/**
 * Interface for Redux actions
 * Defines the contract for Redux action creators
 */
export interface IDashReduxActions {
    loginSuccess?: (user: any, token?: string) => { type: string; payload: any };
    logout?: () => { type: string };
    setLoading?: (loading: boolean) => { type: string; payload: boolean };
    updateAuth?: (type: any, auth: any) => { type: string; payload: any };
    [key: string]: any;
}

/**
 * Configuration for DashAppLoader
 * All props are optional - sensible defaults are provided
 */
export interface DashAppLoaderConfig {
    /**
     * Function to import the public app component (lazy loaded)
     * If not provided, uses DefaultPublicApp with basic login/auth routes
     * @optional
     * @example () => import('./DASHPublicApp')
     */
    publicAppImport?: () => Promise<{ default: ComponentType<any> }>;

    /**
     * Function to import the private/admin app component (lazy loaded)
     * If not provided, uses DefaultPrivateApp with minimal admin shell
     * @optional
     * @example () => import('./DASHLazyAdminApp')
     */
    privateAppImport?: () => Promise<{ default: ComponentType<any> }>;

    /**
     * The authentication service for checking auth status
     * If not provided, uses DASHAuthenticationService from dash-admin
     * @optional
     */
    authService?: IDashAuthService;

    /**
     * Redux actions for auth state management
     * If not provided, uses DASH_REDUX_ACTIONS from dash-admin-state
     * @optional
     */
    reduxActions?: IDashReduxActions;

    /**
     * The Redux action type for updating auth state
     * Used to dispatch auth restoration from localStorage
     * @default ACTION_UPDATE_AUTH
     */
    updateAuthActionType?: string;

    /**
     * Optional admin hook component to inject into the private app
     * This is rendered as the AdminHook prop of the private app
     * @optional
     */
    AdminHookComponent?: ComponentType<any>;

    /**
     * Optional custom loading fallback component
     * If not provided, uses AppLoadingFallback from dash-components
     * @optional
     */
    LoadingFallback?: ComponentType<{ message?: string }>;

    /**
     * Optional custom error fallback component
     * If not provided, uses the default error UI
     * @optional
     */
    ErrorFallback?: ComponentType<{ error: string; onRetry: () => void }>;

    /**
     * Additional props to pass to the private app
     * @optional
     */
    privateAppProps?: Record<string, any>;

    /**
     * Additional props to pass to the public app
     * @optional
     */
    publicAppProps?: Record<string, any>;

    /**
     * Enable debug logging
     * @default false
     */
    debug?: boolean;
}

/**
 * Props for DashAppLoader - extends DashAppLoaderConfig
 */
export interface DashAppLoaderProps extends DashAppLoaderConfig {}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Debug logging helper
 * Only logs when debug mode is enabled
 */
const log = (debug: boolean, ...args: any[]) => {
    if (debug) {
        console.log(...args);
    }
};

// ============================================================================
// DEFAULT FALLBACK COMPONENTS
// ============================================================================

/**
 * Default loading fallback component
 * Shows a simple loading message with spinner
 */
const DefaultLoadingFallback: React.FC<{ message?: string }> = ({ message }) => (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100%',
        backgroundColor: 'var(--dash-background, #121212)',
        color: 'var(--dash-text, #ffffff)'
    }}>
        <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(255,255,255,0.3)',
            borderTop: '3px solid var(--dash-primary, #90caf9)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '16px'
        }} />
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
            {message || 'Loading application...'}
        </p>
        <style>{`
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `}</style>
    </div>
);

/**
 * Default error fallback component
 * Shows error message with retry button
 */
const DefaultErrorFallback: React.FC<{ error: string; onRetry: () => void }> = ({
    error,
    onRetry
}) => (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100%',
        backgroundColor: 'var(--dash-background, #121212)',
        color: 'var(--dash-text, #ffffff)',
        padding: '20px'
    }}>
        <h2 style={{ color: '#f44336', marginBottom: '16px' }}>Application Error</h2>
        <p style={{
            maxWidth: '500px',
            textAlign: 'center',
            marginBottom: '24px',
            opacity: 0.8
        }}>
            {error}
        </p>
        <button
            onClick={onRetry}
            style={{
                backgroundColor: 'var(--dash-primary, #90caf9)',
                color: '#000',
                border: 'none',
                padding: '12px 24px',
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

/**
 * Configuration error component
 * Shows detailed error for missing required configuration
 */
const ConfigurationError: React.FC<{ missingProps: string[] }> = ({ missingProps }) => (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100%',
        backgroundColor: '#1a1a1a',
        color: '#ffffff',
        padding: '40px',
        boxSizing: 'border-box'
    }}>
        <h2 style={{ color: '#f44336', marginBottom: '16px' }}>DashAppLoader Configuration Error</h2>
        <p style={{ marginBottom: '16px' }}>The following required props are missing:</p>
        <ul style={{ textAlign: 'left', marginBottom: '24px' }}>
            {missingProps.map(prop => (
                <li key={prop} style={{ color: '#ff9800' }}>{prop}</li>
            ))}
        </ul>
        <div style={{
            backgroundColor: '#2d2d2d',
            padding: '16px',
            borderRadius: '8px',
            maxWidth: '600px',
            width: '100%'
        }}>
            <p style={{ marginBottom: '8px', color: '#90caf9' }}>Example usage:</p>
            <pre style={{
                backgroundColor: '#1e1e1e',
                padding: '12px',
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '12px'
            }}>
{`import { DashAppLoader } from 'dash-app-common';

<DashAppLoader
    publicAppImport={() => import('./DASHPublicApp')}
    privateAppImport={() => import('./DASHLazyAdminApp')}
/>`}
            </pre>
        </div>
    </div>
);

// ============================================================================
// DEFAULT APP IMPORTS
// ============================================================================

/**
 * Default public app import function
 * Returns the DashDefaultPublicApp component which provides basic login/auth routes
 */
const dashDefaultPublicAppImport = (): Promise<{ default: ComponentType<any> }> => 
    Promise.resolve({ default: DashDefaultPublicApp });

/**
 * Default private app import function
 * Returns the DashDefaultPrivateApp component which provides a minimal admin shell
 */
const dashDefaultPrivateAppImport = (): Promise<{ default: ComponentType<any> }> => 
    Promise.resolve({ default: DashDefaultPrivateApp });

// ============================================================================
// INTERNAL COMPONENT - DashAppLoaderInner
// ============================================================================

/**
 * Internal component that handles the auth initialization and app loading
 * This is wrapped by DashAppLoader which handles validation
 */
interface DashAppLoaderInnerProps {
    publicAppImport: () => Promise<{ default: ComponentType<any> }>;
    privateAppImport: () => Promise<{ default: ComponentType<any> }>;
    authService: IDashAuthService;
    reduxActions: IDashReduxActions;
    updateAuthActionType: string;
    AdminHookComponent?: ComponentType<any>;
    LoadingFallback: ComponentType<{ message?: string }>;
    ErrorFallback: ComponentType<{ error: string; onRetry: () => void }>;
    privateAppProps: Record<string, any>;
    publicAppProps: Record<string, any>;
    debug: boolean;
}

const DashAppLoaderInner: React.FC<DashAppLoaderInnerProps> = ({
    publicAppImport,
    privateAppImport,
    authService,
    reduxActions,
    updateAuthActionType,
    AdminHookComponent,
    LoadingFallback,
    ErrorFallback,
    privateAppProps,
    publicAppProps,
    debug
}) => {
    const dispatch = useDispatch();
    const auth = useSelector((state: IDashAppState) => state.auth);
    
    // State for initialization
    const [isInitializing, setIsInitializing] = useState(true);
    const [initError, setInitError] = useState<string | null>(null);
    const [hasRestoredFromStorage, setHasRestoredFromStorage] = useState(false);

    // Use device storage sync hook for Capacitor/Electron environments
    useDeviceStorageSync();

    // Log current auth state in debug mode
    log(debug, '🔍 DashAppLoader: Redux auth state:', {
        isLogged: auth?.isLogged,
        hasUser: !!auth?.user,
        hasToken: !!auth?.token,
    });

    // Effect to restore auth from localStorage to Redux if needed
    useEffect(() => {
        if (!hasRestoredFromStorage && !auth?.isLogged) {
            log(debug, '🔍 DashAppLoader: Checking for persisted auth data...');
            
            // Check localStorage for persisted auth data
            const storedToken = localStorage.getItem('token');
            const storedUserRaw = localStorage.getItem('user');
            const storedTenantRaw = localStorage.getItem('tenant');
            
            log(debug, '🔍 DashAppLoader: Persisted data check:', {
                hasToken: !!storedToken,
                hasUser: !!storedUserRaw,
                hasTenant: !!storedTenantRaw
            });

            // If we have persisted auth data but Redux is empty, restore it
            if (storedToken && storedUserRaw && !auth?.isLogged) {
                log(debug, '🔄 DashAppLoader: Restoring auth session to Redux from localStorage');
                
                let parsedUser: any = null;
                try {
                    // User is stored as JSON string in localStorage
                    parsedUser = JSON.parse(storedUserRaw);
                    
                    // Handle double-stringified case (JSON inside JSON)
                    if (typeof parsedUser === 'string') {
                        log(debug, '🔄 DashAppLoader: User was double-stringified, parsing again...');
                        parsedUser = JSON.parse(parsedUser);
                    }
                } catch (e) {
                    console.error('❌ DashAppLoader: Cannot parse user from localStorage, clearing auth data');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('tenant');
                    localStorage.removeItem('authenticated');
                    setHasRestoredFromStorage(true);
                    return;
                }

                let parsedTenant: any = null;
                if (storedTenantRaw) {
                    try {
                        parsedTenant = JSON.parse(storedTenantRaw);
                        if (typeof parsedTenant === 'string') {
                            parsedTenant = JSON.parse(parsedTenant);
                        }
                    } catch {
                        // Tenant parsing failed, continue without it
                        log(debug, '⚠️ DashAppLoader: Could not parse tenant, continuing without it');
                    }
                }

                // Dispatch auth restoration action directly to Redux
                dispatch({
                    type: updateAuthActionType,
                    payload: {
                        isLogged: true,
                        token: storedToken,
                        user: parsedUser,
                        tenant: parsedTenant
                    }
                });
                log(debug, '✅ DashAppLoader: Redux state restored from persisted data');
            }
            
            setHasRestoredFromStorage(true);
        }
    }, [auth?.isLogged, hasRestoredFromStorage, dispatch, updateAuthActionType, debug]);

    // Effect to initialize auth service
    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            if (!hasRestoredFromStorage) {
                // Wait for storage restoration to complete first
                return;
            }

            try {
                log(debug, '🚀 DashAppLoader: Starting app initialization...');
                
                // Call auth service initialization method
                // DASHAuthenticationService uses initializeApp(), fallback to init() for other implementations
                let initResult: { success: boolean; user?: any; error?: string };
                
                if (authService.initializeApp) {
                    initResult = await authService.initializeApp();
                } else if (authService.init) {
                    initResult = await authService.init();
                } else {
                    // No init method available, just continue
                    log(debug, '⚠️ DashAppLoader: No init method on authService, skipping initialization');
                    setIsInitializing(false);
                    return;
                }
                
                if (!mounted) return;
                
                log(debug, '🔍 DashAppLoader: Initialization result:', initResult);

                if (initResult.success && initResult.user) {
                    log(debug, '✅ DashAppLoader: Auto-login successful');
                    // Auth service should have updated Redux via its own dispatch
                }

                setIsInitializing(false);
            } catch (error) {
                if (!mounted) return;
                console.error('❌ DashAppLoader initialization error:', error);
                setInitError(error instanceof Error ? error.message : 'Unknown error during initialization');
                setIsInitializing(false);
            }
        };

        initializeAuth();

        return () => {
            mounted = false;
        };
    }, [authService, hasRestoredFromStorage, debug]);

    // Create lazy loaded components - memoized to prevent recreating on each render
    const PublicApp = useMemo(() => lazy(publicAppImport), [publicAppImport]);
    const PrivateApp = useMemo(() => lazy(privateAppImport), [privateAppImport]);

    // Retry handler for errors
    const handleRetry = useCallback(() => {
        setInitError(null);
        setIsInitializing(true);
        setHasRestoredFromStorage(false);
    }, []);

    // Show error state
    if (initError) {
        return <ErrorFallback error={initError} onRetry={handleRetry} />;
    }

    // Show loading state during initialization
    if (isInitializing || !hasRestoredFromStorage) {
        return <LoadingFallback message="Initializing application..." />;
    }

    // Determine which app to show based on auth state
    const isAuthenticated = auth?.isLogged === true;
    
    log(debug, '🎯 DashAppLoader: Rendering app:', {
        isAuthenticated,
        appType: isAuthenticated ? 'Private' : 'Public'
    });

    // Render the appropriate app
    return (
        <Suspense fallback={<LoadingFallback message={isAuthenticated ? 'Loading admin...' : 'Loading...'} />}>
            {isAuthenticated ? (
                <PrivateApp 
                    AdminHookComponent={AdminHookComponent}
                    {...privateAppProps}
                />
            ) : (
                <PublicApp {...publicAppProps} />
            )}
        </Suspense>
    );
};

// ============================================================================
// MAIN COMPONENT - DashAppLoader
// ============================================================================

/**
 * DashAppLoader - Authentication-aware application loader
 * 
 * This component provides all the required framework dependencies:
 * - DASHAuthenticationService from dash-admin
 * - DASH_REDUX_ACTIONS from dash-admin-state
 * - ACTION_UPDATE_AUTH from dash-admin-state
 * - AppLoadingFallback from dash-components
 * - DashDefaultPublicApp for unauthenticated users (if no publicAppImport provided)
 * - DashDefaultPrivateApp for authenticated users (if no privateAppImport provided)
 * 
 * Key features:
 * - Auth state management and initialization
 * - Redux state restoration from localStorage
 * - Device storage synchronization (Capacitor/Electron)
 * - Lazy loading of public/private apps
 * - Loading and error state handling
 * 
 * Can be used with zero configuration for a basic working app:
 * ```tsx
 * <DashAppLoader />
 * ```
 * 
 * Or with custom apps:
 * ```tsx
 * <DashAppLoader
 *     publicAppImport={() => import('./DASHPublicApp')}
 *     privateAppImport={() => import('./DASHLazyAdminApp')}
 *     AdminHookComponent={MainAppHookComponent}
 *     debug={import.meta.env.DEV}
 * />
 * ```
 */
export const DashAppLoader: React.FC<DashAppLoaderProps> = ({
    publicAppImport,
    privateAppImport,
    AdminHookComponent,
    LoadingFallback = AppLoadingFallback,
    ErrorFallback = DefaultErrorFallback,
    privateAppProps = {},
    publicAppProps = {},
    debug = false,
    // Allow overrides but provide defaults
    authService = DASHAuthenticationService,
    reduxActions = DASH_REDUX_ACTIONS,
    updateAuthActionType = ACTION_UPDATE_AUTH,
}) => {
    // Use default app imports if not provided
    const resolvedPublicAppImport = publicAppImport || dashDefaultPublicAppImport;
    const resolvedPrivateAppImport = privateAppImport || dashDefaultPrivateAppImport;

    // Validate that we have the framework dependencies
    // These should always be available since we provide defaults
    const missingProps: string[] = [];
    if (!authService) missingProps.push('authService');
    if (!reduxActions) missingProps.push('reduxActions');
    if (!updateAuthActionType) missingProps.push('updateAuthActionType');

    if (missingProps.length > 0) {
        return <ConfigurationError missingProps={missingProps} />;
    }

    return (
        <DashAppLoaderInner
            publicAppImport={resolvedPublicAppImport}
            privateAppImport={resolvedPrivateAppImport}
            authService={authService}
            reduxActions={reduxActions}
            updateAuthActionType={updateAuthActionType}
            AdminHookComponent={AdminHookComponent}
            LoadingFallback={LoadingFallback}
            ErrorFallback={ErrorFallback}
            privateAppProps={privateAppProps}
            publicAppProps={publicAppProps}
            debug={debug}
        />
    );
};

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create a configured DashAppLoader component with framework defaults
 * 
 * This factory function creates a component with all configuration baked in,
 * perfect for use in your app's entry point.
 * 
 * @param config - Configuration for the app loader (all optional)
 * @returns A configured React component
 * 
 * @example
 * ```tsx
 * import { createDashAppLoader } from 'dash-app-common';
 * import MainAppHook from './components/MainAppHookComponent';
 * 
 * // Minimal - uses all defaults
 * const AppLoader = createDashAppLoader({});
 * 
 * // With custom apps
 * const AppLoader = createDashAppLoader({
 *     publicAppImport: () => import('./DASHPublicApp'),
 *     privateAppImport: () => import('./DASHLazyAdminApp'),
 *     AdminHookComponent: MainAppHook,
 *     debug: import.meta.env.DEV,
 * });
 * 
 * // In your component:
 * export const DASHAppLoader = () => <AppLoader />;
 * ```
 */
export const createDashAppLoader = (
    config: DashAppLoaderProps = {}
): React.FC => {
    return () => <DashAppLoader {...config} />;
};

// ============================================================================
// RE-EXPORTS FOR CONVENIENCE
// ============================================================================

// Re-export framework services for advanced customization
export { DASHAuthenticationService, DASH_REDUX_ACTIONS, ACTION_UPDATE_AUTH, AppLoadingFallback };

// Re-export default apps and routes
export { DashDefaultPublicApp, DashDefaultPrivateApp };
export { dashDefaultPublicRoutes } from './defaults/extensions/router/dashDefaultPublicRoutes';
export { dashDefaultPrivateRoutes } from './defaults/extensions/router/dashDefaultPrivateRoutes';

// Re-export default fallback components
export { DefaultLoadingFallback, DefaultErrorFallback };

export default DashAppLoader;
