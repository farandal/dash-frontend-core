/**
 * Dash Default Layout Settings
 * 
 * Layout configuration constants for the application.
 * These define responsive breakpoints, theme types, and layout options.
 */

export const dashDefaultLayoutSettings = {
    // Responsive breakpoints
    TAB_SIZE: 992,
    MOBILE_SIZE: 575,
    
    // Theme type constants
    THEME_TYPE: 'THEME_TYPE',
    THEME_TYPE_LIGHT: 'light',
    THEME_TYPE_LITE: 'lite',
    THEME_TYPE_DARK: 'dark',
    THEME_TYPE_DASH_DEFAULT: 'light',
    THEME_TYPE_SEMI_DARK: 'THEME_TYPE_SEMI_DARK',
    
    // Theme color constants
    THEME_COLOR: 'THEME_COLOR',
    UPDATE_RTL_STATUS: 'UPDATE_RTL_STATUS',
    
    // Layout type constants
    LAYOUT_TYPE: 'LAYOUT_TYPE',
    LAYOUT_TYPE_FRAMED: 'framed-layout',
    LAYOUT_TYPE_BOXED: 'boxed-layout',
    LAYOUT_TYPE_FULL: 'full-layout',
    
    // Navigation style constants
    NAV_STYLE: 'NAV_STYLE',
    NAV_STYLE_FIXED: 'NAV_STYLE_FIXED',
    NAV_STYLE_MINI_SIDEBAR: 'NAV_STYLE_MINI_SIDEBAR',
    NAV_STYLE_DRAWER: 'NAV_STYLE_DRAWER',
    NAV_STYLE_NO_HEADER_MINI_SIDEBAR: 'NAV_STYLE_NO_HEADER_MINI_SIDEBAR',
    NAV_STYLE_NO_HEADER_EXPANDED_SIDEBAR: 'NAV_STYLE_NO_HEADER_EXPANDED_SIDEBAR',
    NAV_STYLE_DEFAULT_HORIZONTAL: 'NAV_STYLE_DEFAULT_HORIZONTAL',
    NAV_STYLE_DARK_HORIZONTAL: 'NAV_STYLE_DARK_HORIZONTAL',
    NAV_STYLE_INSIDE_HEADER_HORIZONTAL: 'NAV_STYLE_INSIDE_HEADER_HORIZONTAL',
    NAV_STYLE_BELOW_HEADER: 'NAV_STYLE_BELOW_HEADER',
    NAV_STYLE_ABOVE_HEADER: 'NAV_STYLE_ABOVE_HEADER',
    NAV_STYLE_COLLAPSABLE: 'NAV_STYLE_COLLAPSABLE',
    
    // Color constants
    LIGHT_PURPLE: 'light_purple',
    LIGHT_PURPLE_SEC: '#00B378',
    LIGHT_PURPLE_DARK_TEXT_COLOR: '#9799AC',
} as const;

// Type for the layout settings
export type DashDefaultLayoutSettings = typeof dashDefaultLayoutSettings;

// Helper functions
export const getDashDefaultTheme = (): string => dashDefaultLayoutSettings.THEME_TYPE_DARK;
export const getDashDefaultLightTheme = (): string => dashDefaultLayoutSettings.THEME_TYPE_LIGHT;
export const getDashDefaultDarkTheme = (): string => dashDefaultLayoutSettings.THEME_TYPE_DARK;

export default dashDefaultLayoutSettings;
