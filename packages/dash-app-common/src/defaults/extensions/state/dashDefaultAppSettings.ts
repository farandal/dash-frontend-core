/**
 * Dash Default App Settings Extension
 * 
 * Default application settings configuration for the app.
 */
import { ISettingsState, defaultSettings } from 'dash-admin-state';
import { dashDefaultLayoutSettings } from './dashDefaultLayoutSettings';

/**
 * Create dash default app settings
 */
export const dashDefaultAppSettings = (): ISettingsState => ({
    ...defaultSettings,
    loading: false,
    navStyle: dashDefaultLayoutSettings.NAV_STYLE_FIXED,
    layoutType: dashDefaultLayoutSettings.LAYOUT_TYPE_FRAMED,
    themeType: dashDefaultLayoutSettings.THEME_TYPE_DARK,
    layoutSettings: dashDefaultLayoutSettings,
    groupIcons: {},
});

/**
 * Get the dash default theme type
 */
export const getDashDefaultThemeType = (): string => {
    return dashDefaultLayoutSettings.THEME_TYPE_DARK;
};

export default dashDefaultAppSettings;
