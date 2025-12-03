// Hooks
export { useWindowSize } from './hooks/useWindowSize';
export { useCapacitorAppStateRefresh } from './hooks/useCapacitorAppStateRefresh';
export { useDeviceStorageSync } from './hooks/useDeviceStorageSync';
export {
    useCapacitorKeyboard,
    isCapacitorKeyboardAvailable,
    getCapacitorKeyboard,
    type KeyboardState,
    type UseCapacitorKeyboardOptions
} from './hooks/useCapacitorKeyboard';
export {
    useMobileDetection,
    checkMobileDevice,
    isWebView,
    isAndroid,
    isIOS,
    isWindows,
    isMacOS,
    isLinux,
    type MobileDetectionState,
    type UseMobileDetectionOptions
} from './hooks/useMobileDetection';
export {
    useDraggable,
    type DraggablePosition,
    type UseDraggableOptions,
    type UseDraggableReturn
} from './hooks/useDraggable';
export {
    useNotifications,
    type ProcessedNotification,
    type ToastNotification,
    type DialogNotification,
    type UseNotificationsOptions,
    type UseNotificationsReturn
} from './hooks/useNotifications';
export {
    useQuickSearch,
    type UseQuickSearchReturn
} from './hooks/useQuickSearch';
export {
    useMenuStateInit,
    getInitialMenuState,
    getInitialNavSize,
    type UseMenuStateInitOptions
} from './hooks/useMenuStateInit';

// Utils
export { updateDomCssVariables } from './utils/updateDomCssVariables';
export { getEnv } from './utils/envUtils';
export { dashStorage } from './utils/dashDtorage';
export {
    EMAIL_REGEX,
    PHONE_REGEX,
    URL_REGEX,
    validateEmail,
    validatePhone,
    validateUrl,
    validateRequired,
    validateMinLength,
    validateMaxLength,
    validateRut,
    checkPasswordStrength,
    type PasswordStrength
} from './utils/validation';

// IPC Service for Electron
export {
    isDashIPCServiceAvailable,
    isElectron,
    getDashIPCService,
    windowControl,
    startWindowDrag,
    executeIPCAction,
    onIPCStdout,
    useDashIPCService,
    type IDashIPCService
} from './utils/dashIPCService';

// Stored Theme
export {
    getStoredTheme,
    setStoredTheme,
    initializeStoredTheme,
    clearStoredTheme
} from './utils/storedTheme';

// Development Environment Detection
export {
    isDev,
    isProd,
    isTest,
    getEnvironment
} from './utils/isDev';

// Environment Body Classes
export {
    setupEnvironmentBodyClasses,
    useEnvironmentBodyClasses,
    type EnvironmentVars
} from './utils/environmentBodyClasses';

// Platform Detection
export {
    isWebView as isWebViewPlatform,
    isAndroid as isAndroidPlatform,
    isIOS as isIOSPlatform,
    isWindows as isWindowsPlatform,
    applyPlatformBodyClasses
} from './utils/platformDetection';

// Electron Store Sync
export {
    syncElectronStore,
    hasElectronStore
} from './utils/electronStoreSync';

// Tenant Styles
export { injectTenantStyles } from './utils/injectTenantStyles';

// Notification Permission
export {
    requestNotificationPermission,
    isNotificationSupported,
    hasNotificationPermission,
    isNotificationDenied,
    getNotificationPermission
} from './utils/notificationPermission';

// Dash Bootstrap App
export {
    dashInitializeApp,
    dashBootstrapApp,
    type DashInitializeAppConfig
} from './utils/dashBootstrapApp';

// Resource Loader
export {
    createResourceLoader,
    createSimpleResourceLoader
} from './utils/resourceLoader';

// Auth Provider Utils
export {
    createLogoutFromStorage,
    isUserAuthenticated,
    getCurrentUser,
    getAuthToken,
    getTenantId,
    getUserRoles,
    setAuthData,
    type LogoutConfig
} from './utils/authProviderUtils';

// Data Provider Utils
export {
    getResourceConfigManager,
    setResourceConfigs,
    getResourceConfig,
    processPostData,
    processFormData,
    buildQueryString,
    isFormDataResource,
    type IResourceConfig
} from './utils/dataProviderUtils';

// Components
export {
    MinimalLayout,
    type MinimalLayoutProps
} from './components/MinimalLayout';

export {
    DashRouterComponent,
    RouterComponent, // Backward compatibility alias
    shouldUseHashRouter,
    createRouterComponent,
    type DashRouterComponentProps,
    type RouterComponentProps // Backward compatibility alias
} from './components/RouterComponent';

// IPC Message Broker Context (Electron)
export {
    IPCMessageBrokerContext,
    IPCMessageBrokerProvider,
    useIPCMessageBroker,
    type LogMessage,
    type SubprocessOutput,
    type IPCMessageBrokerContextType,
    type IPCMessageBrokerConfig
} from './contexts/IPCMessageBrokerContext';

// Lazy App Loader
export {
    createLazyAppComponent,
    createSimpleLazyApp,
    DefaultLoadFailedComponent,
    type LazyAppLoaderConfig
} from './components/LazyAppLoader';
