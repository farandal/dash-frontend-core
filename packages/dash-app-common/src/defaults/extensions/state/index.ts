/**
 * State Extensions Index
 * 
 * Application state configurations and initial states.
 */

// Default App Settings
export { dashDefaultAppSettings, getDashDefaultThemeType } from './dashDefaultAppSettings';

// Default App Common State
export { getDashDefaultAppCommon, getDashDefaultAppPath, getDashDefaultPanelImages } from './dashDefaultAppCommon';

// Default Initial App State
export { DASH_DEFAULT_INITIAL_APP_STATE, getDashDefaultInitialAppState, type IDashDefaultUser, type IDashDefaultAuth } from './dashDefaultInitialAppState';

// Default Query Client
export { dashDefaultQueryClient, createDashDefaultQueryClient, dashDefaultQueryClientConfig, dashDefaultDevQueryClientConfig } from './dashDefaultQueryClient';

// Default Layout Settings
export {
    dashDefaultLayoutSettings,
    getDashDefaultTheme,
    getDashDefaultLightTheme,
    getDashDefaultDarkTheme,
    type DashDefaultLayoutSettings
} from './dashDefaultLayoutSettings';

// Default Resource Icons
export { default as dashDefaultResourceIcons } from './dashDefaultResourcesIcons';
