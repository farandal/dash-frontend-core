/**
 * Theme Module for dash-boilerplate
 * 
 * Provides lightweight theme infrastructure that reads from CSS variables
 * and doesn't depend on react-admin.
 */

export {
    DashThemeProviderLight,
    useDashThemeContextLight,
    DashThemeContext,
} from './DashThemeProviderLight';
export type { DashThemeProviderLightProps, DashThemeContextType } from './DashThemeProviderLight';
