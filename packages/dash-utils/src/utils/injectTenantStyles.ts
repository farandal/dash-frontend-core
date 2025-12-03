/**
 * Tenant Styles Injection Utility
 *
 * Injects CSS variables from tenant settings into the DOM.
 */
import { updateDomCssVariables } from './updateDomCssVariables';

/**
 * Inject tenant styles from provided settings
 * @param defaultTheme - The default theme type to use
 * @param tenantSettings - The tenant settings object containing colors (optional)
 */
export const injectTenantStyles = (defaultTheme: string, tenantSettings?: { colors?: any } | null): void => {
    if (tenantSettings) {
        try {
            const colors = tenantSettings.colors;
            console.log('Updating colors from tenant settings');
            updateDomCssVariables(defaultTheme, colors);
        } catch (error) {
            console.error('Error parsing tenant settings:', error);
        }
    }
};

export default injectTenantStyles;
