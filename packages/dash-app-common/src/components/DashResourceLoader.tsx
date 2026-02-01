/**
 * DashResourceLoader
 * 
 * A component and utilities for loading resources dynamically from a manifest.
 * This allows apps to code-split their resource configurations and load them on demand.
 * 
 * ============================================================================
 * USAGE
 * ============================================================================
 * 
 * // 1. Create a resourceManifest.ts in your app that exports import functions:
 * // export const resourceManifest = {
 * //   systemResources: () => import('dash-admin/src/systemResources'),
 * //   todoResource: () => import('./resources/demo/todoResource'),
 * // };
 * 
 * // 2. Use DashPrivateAppWithManifest in your DASHApp.tsx:
 * import { DashPrivateAppWithManifest } from 'dash-app-common';
 * import { resourceManifest } from './resourceManifest';
 * 
 * const DASHApp = () => (
 *     <DashPrivateAppWithManifest manifest={resourceManifest} />
 * );
 * 
 * // 3. Or use the hook directly:
 * import { useDashResourceManifest } from 'dash-app-common';
 * 
 * const MyApp = () => {
 *     const { resources, loading, error } = useDashResourceManifest(manifest);
 *     if (loading) return <Loading />;
 *     if (error) return <Error error={error} />;
 *     return <DashDefaultPrivateApp resources={resources} />;
 * };
 */
import React, { useState, useEffect, PropsWithChildren, ReactElement } from 'react';
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import AppLoadingFallback from 'dash-components/src/components/theme/AppLoadingFallback';
import DashDefaultPrivateApp from './DashDefaultPrivateApp';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Import function type for lazy loading a resource module
 */
export type ResourceImportFn = () => Promise<{ default: IDashAutoAdminResourceConfig | IDashAutoAdminResourceConfig[] }>;

/**
 * Resource manifest - object mapping names to import functions
 * This allows Vite/Webpack to properly resolve and bundle the imports
 */
export type ResourceManifest = Record<string, ResourceImportFn>;

/**
 * Result of the useDashResourceManifest hook
 */
export interface UseDashResourceManifestResult {
    /** Loaded resources (null if still loading) */
    resources: IDashAutoAdminResourceConfig[] | null;
    /** Whether resources are currently loading */
    loading: boolean;
    /** Error message if loading failed */
    error: string | null;
    /** Reload resources from manifest */
    reload: () => void;
}

/**
 * Props for DashPrivateAppWithManifest
 * 
 * Includes all DASHAdmin props plus manifest-specific configuration.
 * Props are passed through the hierarchy: DashPrivateAppWithManifest → DashDefaultPrivateApp → DASHAdmin
 */
export interface DashPrivateAppWithManifestProps extends PropsWithChildren {
    // ========================================================================
    // MANIFEST-SPECIFIC PROPS
    // ========================================================================
    /** Resource manifest object with import functions */
    manifest: ResourceManifest;
    /** Custom loading component for manifest loading */
    LoadingComponent?: React.ComponentType<{ message?: string }>;
    /** Custom error component for manifest loading failures */
    ErrorComponent?: React.ComponentType<{ error: string; onRetry: () => void }>;

    // ========================================================================
    // APP CONFIGURATION PROPS
    // ========================================================================
    /** Base path for the admin app (passed to DASHAdmin as basePath) */
    appPath?: string;
    /** Whether to use the internal router */
    useOwnRouter?: boolean;
    /** Global hook component (for global side effects) */
    GlobalHook?: React.ComponentType<any>;

    // ========================================================================
    // DASHADMIN PROPS (passed through to DASHAdmin)
    // ========================================================================
    /** Custom layout component for the admin */
    customLayout?: React.FC<any>;
    /** Custom login page component */
    customLoginPage?: React.FC<any>;
    /** Custom notification component */
    customNotification?: () => React.JSX.Element;
    /** Custom error/catch-all page component */
    customErrorPage?: any;
    /** Custom data provider */
    customDataProvider?: any;
    /** Custom auth provider */
    customAuthProvider?: any;
    /** Custom i18n provider */
    customI18nProvider?: any;
    /** Whether to use core resources (default: false for manifest apps) */
    useCoreResources?: boolean;
    /** Custom profile page component (false to disable) */
    customProfilePage?: React.JSX.Element | false;
    /** Custom recover password page (false to disable) */
    customRecoverPassword?: React.JSX.Element | false;
    /** Custom change password page (false to disable) */
    customChangePassword?: React.JSX.Element | false;
    /** Custom verify account page (false to disable) */
    customVerifyAccount?: React.JSX.Element | false;
    /** Custom theme configuration */
    customThemeConfig?: any;
    /** Custom authenticated routes */
    customAuthRoutes?: React.ReactElement[];
    /** Custom public routes */
    customRoutes?: React.ReactElement[];
    /** Custom public routes (alias for customRoutes, used by DashDefaultPrivateApp) */
    customPublicRoutes?: () => ReactElement[];
    /** Custom private/auth routes (alias for customAuthRoutes, used by DashDefaultPrivateApp) */
    customPrivateRoutes?: () => ReactElement[];
    /** Custom React Query client */
    customQueryClient?: any;
    /** Custom dictionary for translations */
    customDict?: { [x: string]: string };
    /** Custom string replacements */
    customReplacements?: { [x: string]: string };
    /** Custom history object */
    history?: any;
    /** Initial app constants */
    initialAppConstants?: any;
    /** Admin hook component (wraps admin content) */
    AdminHook?: React.ComponentType<any>;
    /** WebSocket messages manager for real-time notifications */
    wsMessagesManager?: any;
}

/**
 * Props for DashPrivateApp (unified component)
 * 
 * Supports both manifest-based and direct resource loading via a single `resources` prop.
 * The component automatically detects which format is provided:
 * - ResourceManifest: Object with import functions (for code-splitting)
 * - IDashAutoAdminResourceConfig[]: Direct array of resources (immediate use)
 */
export interface DashPrivateAppProps extends PropsWithChildren {
    // ========================================================================
    // RESOURCE PROPS (accepts either format)
    // ========================================================================
    /** 
     * Resources can be either:
     * - ResourceManifest: Object with import functions for code-splitting
     * - IDashAutoAdminResourceConfig[]: Direct array for immediate use
     */
    resources?: ResourceManifest | IDashAutoAdminResourceConfig[];
    
    /** Custom loading component for manifest loading */
    LoadingComponent?: React.ComponentType<{ message?: string }>;
    /** Custom error component for manifest loading failures */
    ErrorComponent?: React.ComponentType<{ error: string; onRetry: () => void }>;

    // ========================================================================
    // APP CONFIGURATION PROPS
    // ========================================================================
    /** Base path for the admin app (passed to DASHAdmin as basePath) */
    appPath?: string;
    /** Whether to use the internal router */
    useOwnRouter?: boolean;
    /** Global hook component (for global side effects) */
    GlobalHook?: React.ComponentType<any>;

    // ========================================================================
    // DASHADMIN PROPS (passed through to DASHAdmin)
    // ========================================================================
    /** Custom layout component for the admin */
    customLayout?: React.FC<any>;
    /** Custom login page component */
    customLoginPage?: React.FC<any>;
    /** Custom notification component */
    customNotification?: () => React.JSX.Element;
    /** Custom error/catch-all page component */
    customErrorPage?: any;
    /** Custom data provider */
    customDataProvider?: any;
    /** Custom auth provider */
    customAuthProvider?: any;
    /** Custom i18n provider */
    customI18nProvider?: any;
    /** Whether to use core resources (default: false for manifest apps) */
    useCoreResources?: boolean;
    /** Custom profile page component (false to disable) */
    customProfilePage?: React.JSX.Element | false;
    /** Custom recover password page (false to disable) */
    customRecoverPassword?: React.JSX.Element | false;
    /** Custom change password page (false to disable) */
    customChangePassword?: React.JSX.Element | false;
    /** Custom verify account page (false to disable) */
    customVerifyAccount?: React.JSX.Element | false;
    /** Custom theme configuration */
    customThemeConfig?: any;
    /** Custom authenticated routes */
    customAuthRoutes?: React.ReactElement[];
    /** Custom public routes */
    customRoutes?: React.ReactElement[];
    /** Custom public routes (alias for customRoutes, used by DashDefaultPrivateApp) */
    customPublicRoutes?: () => ReactElement[];
    /** Custom private/auth routes (alias for customAuthRoutes, used by DashDefaultPrivateApp) */
    customPrivateRoutes?: () => ReactElement[];
    /** Custom React Query client */
    customQueryClient?: any;
    /** Custom dictionary for translations */
    customDict?: { [x: string]: string };
    /** Custom string replacements */
    customReplacements?: { [x: string]: string };
    /** Custom history object */
    history?: any;
    /** Initial app constants */
    initialAppConstants?: any;
    /** Admin hook component (wraps admin content) */
    AdminHook?: React.ComponentType<any>;
    /** WebSocket messages manager for real-time notifications */
    wsMessagesManager?: any;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Check if resources is a ResourceManifest (object with import functions)
 */
export const isResourceManifest = (
    resources: ResourceManifest | IDashAutoAdminResourceConfig[] | undefined
): resources is ResourceManifest => {
    if (!resources) return false;
    if (Array.isArray(resources)) return false;
    // Check if it's an object with function values (import functions)
    return typeof resources === 'object' && 
           Object.values(resources).every(val => typeof val === 'function');
};

/**
 * Check if resources is a direct array of resource configs
 */
export const isResourceArray = (
    resources: ResourceManifest | IDashAutoAdminResourceConfig[] | undefined
): resources is IDashAutoAdminResourceConfig[] => {
    return Array.isArray(resources);
};

// ============================================================================
// RESOURCE LOADING UTILITIES
// ============================================================================

// Cache for loaded resources (keyed by manifest object reference)
const resourceCache = new WeakMap<ResourceManifest, IDashAutoAdminResourceConfig[]>();

/**
 * Load resources from a manifest object
 * @param manifest - Object mapping names to import functions
 * @returns Promise resolving to array of resource configs
 */
export const loadResourcesFromManifest = async (
    manifest: ResourceManifest
): Promise<IDashAutoAdminResourceConfig[]> => {
    // Return cached resources if available
    if (resourceCache.has(manifest)) {
        return resourceCache.get(manifest)!;
    }

    const entries = Object.entries(manifest);
    
    // Load all resource modules in parallel
    const imports = await Promise.all(
        entries.map(async ([name, importFn]) => {
            try {
                const module = await importFn();
                return module.default;
            } catch (error) {
                console.error(`❌ Failed to load resource "${name}":`, error);
                return null;
            }
        })
    );

    // Flatten and filter out failed imports
    const allResources = imports
        .filter((mod): mod is IDashAutoAdminResourceConfig | IDashAutoAdminResourceConfig[] => mod !== null)
        .flatMap(mod => Array.isArray(mod) ? mod : [mod]);

    // Deduplicate by model, keeping the LAST occurrence (so overrides win)
    // Resources loaded later in the manifest override earlier ones with the same model
    const resourceMap = new Map<string, IDashAutoAdminResourceConfig>();
    for (const resource of allResources) {
        if (resource.model) {
            resourceMap.set(resource.model, resource);
        }
    }
    const resources = Array.from(resourceMap.values());

    // Cache the results
    resourceCache.set(manifest, resources);

    return resources;
};

/**
 * Clear a specific manifest from cache
 */
export const clearResourceCache = (manifest: ResourceManifest): void => {
    resourceCache.delete(manifest);
};

// ============================================================================
// HOOK: useDashResourceManifest
// ============================================================================

/**
 * Hook to load resources from a manifest
 * 
 * @param manifest - Object mapping names to import functions
 * @returns Object with resources, loading state, error, and reload function
 * 
 * @example
 * ```tsx
 * const manifest = {
 *   systemResources: () => import('dash-admin/src/systemResources'),
 *   myResource: () => import('./resources/myResource'),
 * };
 * 
 * const { resources, loading, error, reload } = useDashResourceManifest(manifest);
 * ```
 */
export const useDashResourceManifest = (
    manifest: ResourceManifest
): UseDashResourceManifestResult => {
    const [resources, setResources] = useState<IDashAutoAdminResourceConfig[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadTrigger, setReloadTrigger] = useState(0);

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            setLoading(true);
            setError(null);

            try {
                const loadedResources = await loadResourcesFromManifest(manifest);
                
                if (mounted) {
                    console.log('📦 useDashResourceManifest: Loaded', loadedResources.length, 'resources from manifest');
                    setResources(loadedResources);
                    setLoading(false);
                }
            } catch (err) {
                if (mounted) {
                    const errorMessage = err instanceof Error ? err.message : 'Failed to load resources';
                    console.error('❌ useDashResourceManifest:', errorMessage);
                    setError(errorMessage);
                    setLoading(false);
                }
            }
        };

        load();

        return () => {
            mounted = false;
        };
    }, [manifest, reloadTrigger]);

    const reload = () => {
        // Clear cache for fresh load
        clearResourceCache(manifest);
        setReloadTrigger(prev => prev + 1);
    };

    return { resources, loading, error, reload };
};

// ============================================================================
// COMPONENT: DashPrivateAppWithManifest
// ============================================================================

/**
 * Default loading component for manifest loading
 */
const DefaultManifestLoader: React.FC<{ message?: string }> = ({ message }) => (
    <AppLoadingFallback message={message || "Loading resources..."} />
);

/**
 * Default error component for manifest loading failures
 */
const DefaultManifestError: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'var(--dash-background, #121212)',
        color: 'var(--dash-text, #ffffff)',
        padding: '20px'
    }}>
        <h2 style={{ color: '#f44336', marginBottom: '16px' }}>Failed to load resources</h2>
        <p style={{ marginBottom: '24px', opacity: 0.8, textAlign: 'center', maxWidth: '500px' }}>
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
 * DashPrivateAppWithManifest
 * 
 * A wrapper around DashDefaultPrivateApp that loads resources from a manifest.
 * This component handles the async loading of resources and passes them to the app.
 * 
 * @example
 * ```tsx
 * import { DashPrivateAppWithManifest } from 'dash-app-common';
 * 
 * // Define manifest with import functions (allows proper bundling)
 * const resourceManifest = {
 *     systemResources: () => import('dash-admin/src/systemResources'),
 *     todoResource: () => import('./resources/todoResource'),
 * };
 * 
 * const DASHApp = () => (
 *     <DashPrivateAppWithManifest 
 *         manifest={resourceManifest}
 *         appPath="/admin"
 *     />
 * );
 * ```
 */
export const DashPrivateAppWithManifest: React.FC<DashPrivateAppWithManifestProps> = ({
    manifest,
    LoadingComponent = DefaultManifestLoader,
    ErrorComponent = DefaultManifestError,
    children,
    ...privateAppProps
}) => {
    const { resources, loading, error, reload } = useDashResourceManifest(manifest);

    // Show loading state
    if (loading) {
        return <LoadingComponent message="Loading resources..." />;
    }

    // Show error state
    if (error) {
        return <ErrorComponent error={error} onRetry={reload} />;
    }

    // Render the private app with loaded resources
    return (
        <DashDefaultPrivateApp 
            resources={resources || []} 
            {...privateAppProps}
        >
            {children}
        </DashDefaultPrivateApp>
    );
};

// ============================================================================
// COMPONENT: DashPrivateApp (Unified)
// ============================================================================

/**
 * DashPrivateApp
 * 
 * A unified component that supports both manifest-based and direct resource loading.
 * 
 * Use this when you need flexibility:
 * - Pass `resources` as ResourceManifest for code-splitting with dynamic imports (main app)
 * - Pass `resources` as IDashAutoAdminResourceConfig[] directly for immediate use (sub-apps like MallClient)
 * 
 * The component automatically detects the format and handles loading accordingly.
 * 
 * @example
 * ```tsx
 * // With manifest (code-splitting) - loads resources async
 * <DashPrivateApp resources={DASHResourceManifest} />
 * 
 * // With direct resources (no loading needed) - immediate render
 * <DashPrivateApp resources={MallClientAppResources} />
 * ```
 */
export const DashPrivateApp: React.FC<DashPrivateAppProps> = ({
    resources,
    LoadingComponent = DefaultManifestLoader,
    ErrorComponent = DefaultManifestError,
    children,
    ...privateAppProps
}) => {
    // Case 1: Direct resource array - use immediately without loading
    if (isResourceArray(resources)) {
        return (
            <DashDefaultPrivateApp 
                resources={resources} 
                {...privateAppProps}
            >
                {children}
            </DashDefaultPrivateApp>
        );
    }

    // Case 2: Resource manifest - load resources asynchronously
    if (isResourceManifest(resources)) {
        return (
            <DashPrivateAppWithManifest
                manifest={resources}
                LoadingComponent={LoadingComponent}
                ErrorComponent={ErrorComponent}
                {...privateAppProps}
            >
                {children}
            </DashPrivateAppWithManifest>
        );
    }

    // Case 3: No resources provided - render with empty resources (will use defaults from DashDefaultPrivateApp)
    console.warn('DashPrivateApp: No resources provided. Using empty resources array.');
    return (
        <DashDefaultPrivateApp 
            resources={[]} 
            {...privateAppProps}
        >
            {children}
        </DashDefaultPrivateApp>
    );
};

export default DashPrivateAppWithManifest;
