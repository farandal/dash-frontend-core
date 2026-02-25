/**
 * CSS Variable Utilities
 * 
 * Utilities for reading CSS custom properties from the DOM.
 */

/**
 * Get a CSS variable value from :root as a number
 * 
 * @param varName The CSS variable name (e.g., '--sidebar-width')
 * @param defaultValue Default value if variable is not set or invalid
 * @returns The parsed number value or defaultValue
 */
export const getCssVariableNumber = (varName: string, defaultValue: number): number => {
    if (typeof document === 'undefined') return defaultValue;
    
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Get a CSS variable value from :root as a string
 * 
 * @param varName The CSS variable name
 * @param defaultValue Default value if variable is not set
 * @returns The string value or defaultValue
 */
export const getCssVariableString = (varName: string, defaultValue: string = ''): string => {
    if (typeof document === 'undefined') return defaultValue;
    
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return value || defaultValue;
};

/**
 * Default sidebar and layout dimensions
 * These can be overridden by CSS variables in styles.less
 */
export interface LayoutDimensions {
    sidebarLargeWidth: number;
    sidebarSmallWidth: number;
    sidebarHorizontalHeight: number;
    logoVerticalMaxWidth: number;
    logoVerticalMaxHeight: number;
    logoHorizontalMaxWidth: number;
    logoHorizontalMaxHeight: number;
}

export const DEFAULT_LAYOUT_DIMENSIONS: LayoutDimensions = {
    sidebarLargeWidth: 255,
    sidebarSmallWidth: 64,
    sidebarHorizontalHeight: 120,
    logoVerticalMaxWidth: 130,
    logoVerticalMaxHeight: 130,
    logoHorizontalMaxWidth: 200,
    logoHorizontalMaxHeight: 60,
};

/**
 * Get layout dimensions from CSS variables with fallback to defaults
 */
export const getLayoutDimensionsFromCss = (): LayoutDimensions => {
    return {
        sidebarLargeWidth: getCssVariableNumber('--sidebar-large-width', DEFAULT_LAYOUT_DIMENSIONS.sidebarLargeWidth),
        sidebarSmallWidth: getCssVariableNumber('--sidebar-small-width', DEFAULT_LAYOUT_DIMENSIONS.sidebarSmallWidth),
        sidebarHorizontalHeight: getCssVariableNumber('--sidebar-horizontal-height', DEFAULT_LAYOUT_DIMENSIONS.sidebarHorizontalHeight),
        logoVerticalMaxWidth: getCssVariableNumber('--logo-vertical-max-width', DEFAULT_LAYOUT_DIMENSIONS.logoVerticalMaxWidth),
        logoVerticalMaxHeight: getCssVariableNumber('--logo-vertical-max-height', DEFAULT_LAYOUT_DIMENSIONS.logoVerticalMaxHeight),
        logoHorizontalMaxWidth: getCssVariableNumber('--logo-horizontal-max-width', DEFAULT_LAYOUT_DIMENSIONS.logoHorizontalMaxWidth),
        logoHorizontalMaxHeight: getCssVariableNumber('--logo-horizontal-max-height', DEFAULT_LAYOUT_DIMENSIONS.logoHorizontalMaxHeight),
    };
};

/**
 * Create panel settings with layout dimensions
 */
export interface PanelSettingsOptions {
    appName?: string;
    horizontalLogo?: React.ReactNode;
    squaredLogo?: React.ReactNode;
    loginBackground?: string;
    sidebarPosition?: 'left' | 'right' | 'top' | 'bottom';
    layoutDimensions?: Partial<LayoutDimensions>;
}

export const createDefaultPanelSettings = (options: PanelSettingsOptions = {}) => {
    const dimensions = {
        ...DEFAULT_LAYOUT_DIMENSIONS,
        ...getLayoutDimensionsFromCss(),
        ...options.layoutDimensions,
    };

    return {
        appName: options.appName || 'Dash App',
        horizontalLogo: options.horizontalLogo,
        squaredLogo: options.squaredLogo,
        loginBackground: options.loginBackground,
        sidebarPosition: options.sidebarPosition || 'left',
        ...dimensions,
        // Padding configuration (derived from sidebar sizes)
        paddingHorizontal: dimensions.sidebarLargeWidth,
        paddingVertical: dimensions.sidebarHorizontalHeight,
    };
};
