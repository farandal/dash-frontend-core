/**
 * dash-boilerplate
 * 
 * Shared boilerplate code for Dash lightweight applications.
 * Provides i18n, theming, components, and utilities for both
 * public and private app flows.
 */

// i18n module
export {
    createSimpleI18nProvider,
    I18nBridgeProviderLight,
    useI18nBridgeLight,
    useBridgedLocalesLight,
    useBridgedChangeLocaleLight,
    useBridgedLocaleLight,
    useTranslateLight,
    I18nBridgeContext,
} from './i18n';
export type {
    SimpleI18nProvider,
    LocaleDefinition,
    TranslationMessages,
    TranslationsMap,
    I18nBridgeProviderLightProps,
    CreateSimpleI18nProviderOptions,
} from './i18n';

// Components module
export {
    GlobalSmallLoader,
    GlobalLoaderHtmlMarkup,
    injectCriticalStyles,
    CustomErrorBoundary,
    AppWrapperLight,
    // Default fallback components
    DefaultInitializationErrorFallback,
    DefaultAppLoadErrorFallback,
    createLazyAppLoader,
} from './components';
export type {
    GlobalSmallLoaderProps,
    CustomErrorBoundaryProps,
    AppWrapperLightProps,
    DefaultErrorFallbackProps,
    DefaultLoadingFallbackProps,
    CreateLazyAppLoaderOptions,
} from './components';

// Theme module
export {
    DashThemeProviderLight,
    useDashThemeContextLight,
    DashThemeContext,
} from './theme';
export type {
    DashThemeContextType,
    DashThemeProviderLightProps,
} from './theme';

// Utils module
export {
    useInitializeReduxFromPersisted,
    useLogoutEventListener,
    useAppInitialization,
    usePendingRedirect,
    useUrlLocaleDetection,
    usePathnameTracker,
    useEarlyThemeInit,
    initializeThemeEarly,
    syncElectronStore,
    // Electron store utilities
    syncElectronStoreToLocalStorage,
    isElectron,
    getElectronStoreValue,
    setElectronStoreValue,
    // CSS Variable utilities
    getCssVariableNumber,
    getCssVariableString,
    getLayoutDimensionsFromCss,
    createDefaultPanelSettings,
    DEFAULT_LAYOUT_DIMENSIONS,
} from './utils';
export type { AppInitializationResult, LayoutDimensions, PanelSettingsOptions } from './utils';
