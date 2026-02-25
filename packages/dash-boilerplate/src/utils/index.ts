/**
 * Utils Module for dash-boilerplate
 * 
 * Bootstrap utilities and helper functions.
 */

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
} from './DashBootstrapUtils';
export type { AppInitializationResult } from './DashBootstrapUtils';

// Electron store utilities
export {
    syncElectronStoreToLocalStorage,
    isElectron,
    getElectronStoreValue,
    setElectronStoreValue,
} from './electronStore';

// CSS Variable utilities
export {
    getCssVariableNumber,
    getCssVariableString,
    getLayoutDimensionsFromCss,
    createDefaultPanelSettings,
    DEFAULT_LAYOUT_DIMENSIONS,
} from './cssVariables';
export type { LayoutDimensions, PanelSettingsOptions } from './cssVariables';
