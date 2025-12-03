/**
 * Tenant Styles Injection Utility
 *
 * Injects CSS variables from tenant settings into the DOM.
 */
import { AuthPersistenceService } from 'dash-auth';
import { updateDomCssVariables } from './updateDomCssVariables';

/**
 * Inject tenant styles from persisted settings
 * @param defaultTheme - The default theme type to use
 */
export const injectTenantStyles = (defaultTheme: string): void => {
    const tenantSettings = AuthPersistenceService.getTenantSettings();

    if (tenantSettings) {
        try {
            const colors = tenantSettings.colors;
            console.log('Updating colors from local storage');
            updateDomCssVariables(defaultTheme, colors);
        } catch (error) {
            console.error('Error parsing tenant settings:', error);
        }
    }
};

export default injectTenantStyles;
