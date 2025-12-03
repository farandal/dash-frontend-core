/**
 * dash-app-common
 * 
 * This package provides a simplified application shell for Dash applications.
 * 
 * Main Components:
 * - DashApp: Simple app shell that handles Router + Auth + Public/Private rendering
 * - DashAppLoader: Legacy/advanced loader (wraps DashBootstrap for complex scenarios)
 * 
 * Recommended Usage (Simple):
 * ```tsx
 * import { DashApp } from 'dash-app-common';
 * 
 * // Zero-config (uses default routes)
 * <DashApp />
 * 
 * // With custom private app
 * <DashApp PrivateApp={MyAdminApp} />
 * 
 * // With custom routes
 * <DashApp
 *     publicRoutes={myPublicRoutes}
 *     privateRoutes={myPrivateRoutes}
 * />
 * ```
 * 
 * Legacy Usage (DashAppLoader):
 * ```tsx
 * import DashAppLoader from 'dash-app-common';
 * 
 * <DashAppLoader
 *     publicAppImport={() => import('./PublicApp')}
 *     privateAppImport={() => import('./PrivateApp')}
 * />
 * ```
 * 
 * @packageDocumentation
 */

// ============================================================================
// NEW SIMPLIFIED API
// ============================================================================

// Main simplified component
export { DashApp, default as DashAppSimple } from './DashApp';

// ============================================================================
// LEGACY/ADVANCED API (DashAppLoader)
// ============================================================================

// Re-export base DashAppLoader for backward compatibility
export {
    DashAppLoader,
    createDashAppLoader,
    type DashAppLoaderProps,
    type DashAppLoaderConfig,
    type IDashAuthState,
    type IDashAppState,
    type IDashAuthService,
    type IDashReduxActions,
    // Default fallback components
    DefaultLoadingFallback,
    DefaultErrorFallback,
} from './DashAppLoader';

// Re-export framework services for advanced customization
export {
    DASHAuthenticationService,
    DASH_REDUX_ACTIONS,
    ACTION_UPDATE_AUTH,
    AppLoadingFallback,
} from './DashAppLoader';

// Re-export default apps and routes for customization
export {
    DashDefaultPublicApp,
    DashDefaultPrivateApp,
} from './DashAppLoader';

// ============================================================================
// RESOURCE MANIFEST LOADING
// ============================================================================

// Resource loader for manifest-based dynamic resource loading
export {
    DashPrivateAppWithManifest,
    DashPrivateApp,
    useDashResourceManifest,
    loadResourcesFromManifest,
    clearResourceCache,
    isResourceManifest,
    isResourceArray,
    type ResourceImportFn,
    type ResourceManifest,
    type UseDashResourceManifestResult,
    type DashPrivateAppWithManifestProps,
    type DashPrivateAppProps,
} from './components/DashResourceLoader';

// ============================================================================
// DEFAULT ROUTES
// ============================================================================

export { dashDefaultPublicRoutes } from './defaults/extensions/router/dashDefaultPublicRoutes';
export { dashDefaultPrivateRoutes } from './defaults/extensions/router/dashDefaultPrivateRoutes';

// ============================================================================
// DEFAULTS (extensions, pages, filters, schemas)
// ============================================================================

// Re-export all defaults
export * from './defaults';

// Re-export default extensions by category
export * from './defaults/extensions';

// Re-export default pages
export * from './defaults/pages';

// Re-export default filters
export * from './defaults/filters';

// Re-export default schemas
export * from './defaults/schemas';

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

// Default export is the legacy DashAppLoader for backward compatibility
export { default } from './DashAppLoader';
