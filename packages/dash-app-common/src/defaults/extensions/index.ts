/**
 * Default Extensions Index
 * 
 * This is the main entry point for all default extensions.
 * Applications can import what they need and override with their custom implementations.
 */

// ============================================================================
// BOOTSTRAP EXTENSIONS
// ============================================================================
export {
    dashDefaultInitializeApp,
    dashDefaultBootstrapApp,
    DashDefaultErrorBoundary,
    type DashDefaultInitializeAppConfig,
    type DashDefaultErrorBoundaryProps,
    type DashDefaultErrorBoundaryState
} from './bootstrap';

// ============================================================================
// COMPONENT EXTENSIONS
// ============================================================================
export {
    DashDefaultLoader,
    DashDefaultReactAdminNotification,
    loadDashDefaultAutoAdminComponents,
    dashDefaultAutoAdminComponents,
    dashDefaultStaticComponents,
    getDashDefaultStaticComponents,
    dashDefaultNotificationConfig,
    type DashDefaultLoaderProps
} from './components';

// ============================================================================
// HOOK EXTENSIONS
// ============================================================================
export {
    useDashDefaultMountTracker,
    useDashDefaultRoutePath,
    useDashDefaultLazyI18nProvider,
    useDashDefaultLazyAutoAdminComponents,
    useDashDefaultLazyResources
} from './hooks';

// ============================================================================
// ROUTER EXTENSIONS
// ============================================================================
export {
    dashDefaultPublicRoutes,
    dashDefaultPrivateRoutes,
    dashDefaultSharedRoutes,
    DashDefaultRouterWrapper,
    createDashDefaultRouterWrapper,
    getDashDefaultRouterEnvVars
} from './router';

// ============================================================================
// STATE EXTENSIONS
// ============================================================================
export {
    dashDefaultAppSettings,
    getDashDefaultThemeType,
    getDashDefaultAppCommon,
    getDashDefaultAppPath,
    getDashDefaultPanelImages,
    DASH_DEFAULT_INITIAL_APP_STATE,
    getDashDefaultInitialAppState,
    dashDefaultQueryClient,
    createDashDefaultQueryClient,
    dashDefaultQueryClientConfig,
    dashDefaultDevQueryClientConfig,
    dashDefaultLayoutSettings,
    getDashDefaultTheme,
    getDashDefaultLightTheme,
    getDashDefaultDarkTheme,
    dashDefaultResourceIcons,
    type DashDefaultLayoutSettings,
    type IDashDefaultUser,
    type IDashDefaultAuth
} from './state';

// ============================================================================
// I18N EXTENSIONS
// ============================================================================
export {
    dashDefaultTranslations,
    dashDefaultAvailableLocales,
    dashDefaultLocale,
    createDashDefaultI18nProvider,
    loadDashDefaultTranslationsAsync,
    createDashDefaultI18nProviderAsync,
    useDashDefaultI18nProvider,
    createDashDefaultI18nProviderWithSettings,
    createDashDefaultI18nProviderFromAppState
} from './i18n';

// ============================================================================
// PROVIDER EXTENSIONS
// ============================================================================
export {
    dashDefaultAuthProvider,
    dashDefaultAuthProviderConfig,
    dashDefaultAuthProviderOverrides,
    dashDefaultDataProvider,
    dashDefaultDataProviderConfig,
    dashDefaultDataProviderOverrides,
    dashDefaultDataProviderExtensions,
    dashAuthProvider,
    dashDataProvider
} from './providers';

// ============================================================================
// THEME EXTENSIONS
// ============================================================================
export {
    dashDefaultExtendedThemeOptions,
    dashDefaultPalette,
    dashDefaultTypography
} from './theme';

// ============================================================================
// LAYOUT EXTENSIONS
// ============================================================================
export {
    createDashDefaultDomainAppLayout,
    createDashDefaultDomainAppLayoutWithIPC,
    useDashDefaultDomainAppLayout,
    useDashDefaultDomainAppLayoutWithIPC
} from './layout';

// ============================================================================
// ELECTRON EXTENSIONS
// ============================================================================
export {
    useDashDefaultIPCListeners,
    setupDashDefaultIPCListeners
} from './electron';

// ============================================================================
// MANAGER EXTENSIONS
// ============================================================================
export {
    DashDefaultWSMessagesManager
} from './managers';

// ============================================================================
// UTILITY EXTENSIONS
// ============================================================================
export {
    dashDefaultLogoutFromStorage,
    dashDefaultIsAuthenticated,
    dashDefaultGetCurrentUser,
    dashDefaultGetToken,
    dashDefaultGetResourceConfig,
    dashDefaultSetResourceConfigs,
    dashDefaultProcessPostData,
    dashDefaultProcessFormData,
    dashDefaultBuildQueryString,
    dashDefaultIsFormDataResource,
    DashIPCMessageBrokerContext,
    DashIPCMessageBrokerProvider,
    useDashIPCMessageBroker,
    processDashDefaultNotification,
    playDashDefaultNotificationSound,
    playDashDefaultDigitalWatchAlarm,
    requestDashDefaultNotificationPermission,
    type DashLogMessage,
    type DashSubprocessOutput,
    type DashIPCMessageBrokerContextType,
    type DashIPCMessageBrokerConfig
} from './utils';

// ============================================================================
// STYLES (Side-effect import)
// ============================================================================
// Note: Import this in your app's entry point to load default styles
// import 'dash-app-common/src/defaults/extensions/styles';
