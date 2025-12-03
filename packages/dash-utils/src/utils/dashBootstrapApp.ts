/**
 * Dash Bootstrap Application Utilities
 *
 * Core bootstrap functions for initializing a Dash application.
 * These utilities handle platform detection, theme injection, and
 * environment setup before React renders.
 */
import { syncElectronStore } from './electronStoreSync';
import { applyPlatformBodyClasses } from './platformDetection';
import { injectTenantStyles } from './injectTenantStyles';
import { requestNotificationPermission } from './notificationPermission';

export interface DashInitializeAppConfig {
    /**
     * Default theme to use for tenant styles
     * If not provided, injectTenantStyles will use stored theme or fallback
     */
    defaultTheme?: string;

    /**
     * Tenant settings containing colors for theme injection
     * Typically obtained from AuthPersistenceService.getTenantSettings()
     */
    tenantSettings?: { colors?: any } | null;

    /** Whether to request notification permission (default: true) */
    requestNotifications?: boolean;

    /** Whether to sync Electron store (default: true) */
    syncElectron?: boolean;

    /** Whether to apply platform body classes (default: true) */
    applyPlatformClasses?: boolean;

    /** Whether to inject tenant styles (default: true) */
    injectStyles?: boolean;
}

/**
 * Initialize the Dash application asynchronously
 * Called before React renders to set up the environment
 *
 * @param config - Optional configuration for initialization steps
 *
 * @example
 * ```tsx
 * // With default settings
 * await dashInitializeApp();
 *
 * // With custom configuration
 * await dashInitializeApp({
 *     defaultTheme: 'dark',
 *     requestNotifications: false
 * });
 * ```
 */
export const dashInitializeApp = async (config: DashInitializeAppConfig = {}): Promise<void> => {
    const {
        defaultTheme,
        tenantSettings,
        requestNotifications = true,
        syncElectron = true,
        applyPlatformClasses = true,
        injectStyles = true
    } = config;

    // Sync Electron store to localStorage first
    if (syncElectron) {
        await syncElectronStore();
    }

    // Apply platform-specific body classes
    if (applyPlatformClasses) {
        applyPlatformBodyClasses();
    }

    // Inject tenant styles
    if (injectStyles) {
        injectTenantStyles(defaultTheme, tenantSettings);
    }

    // Request notification permission
    if (requestNotifications) {
        await requestNotificationPermission();
    }
};

/**
 * Synchronous bootstrap sequence for immediate execution
 * Use this when you don't need to await the electron store sync
 *
 * @param defaultTheme - Optional default theme for tenant styles
 * @param tenantSettings - Optional tenant settings with colors
 *
 * @example
 * ```tsx
 * // In main.tsx before React renders
 * import { AuthPersistenceService } from 'dash-auth';
 * dashBootstrapApp('dark', AuthPersistenceService.getTenantSettings());
 *
 * // Then render React
 * root.render(<App />);
 * ```
 */
export const dashBootstrapApp = (defaultTheme?: string, tenantSettings?: { colors?: any } | null): void => {
    // Sync Electron store (async but non-blocking)
    syncElectronStore();

    // Apply platform-specific body classes
    applyPlatformBodyClasses();

    // Inject tenant styles
    injectTenantStyles(defaultTheme, tenantSettings);

    // Request notification permission (non-blocking)
    requestNotificationPermission();
};

export default dashBootstrapApp;
