/**
 * Dash Bootstrap Application Utilities
 *
 * Core bootstrap functions for initializing a Dash application.
 * These utilities handle platform detection and environment setup before React renders.
 *
 * NOTE: For tenant styles injection, use injectTenantStyles from 'dash-admin' package.
 */
import { syncElectronStore } from './electronStoreSync';
import { applyPlatformBodyClasses } from './platformDetection';
import { requestNotificationPermission } from './notificationPermission';

export interface DashInitializeAppConfig {
    /**
     * Default theme to use for tenant styles
     * @deprecated Use injectTenantStyles from 'dash-admin' instead
     */
    defaultTheme?: string;

    /** Whether to request notification permission (default: true) */
    requestNotifications?: boolean;

    /** Whether to sync Electron store (default: true) */
    syncElectron?: boolean;

    /** Whether to apply platform body classes (default: true) */
    applyPlatformClasses?: boolean;
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
        requestNotifications = true,
        syncElectron = true,
        applyPlatformClasses = true
    } = config;

    // Sync Electron store to localStorage first
    if (syncElectron) {
        await syncElectronStore();
    }

    // Apply platform-specific body classes
    if (applyPlatformClasses) {
        applyPlatformBodyClasses();
    }

    // NOTE: Tenant styles injection should be done by caller using injectTenantStyles from 'dash-admin'

    // Request notification permission
    if (requestNotifications) {
        await requestNotificationPermission();
    }
};

/**
 * Synchronous bootstrap sequence for immediate execution
 * Use this when you don't need to await the electron store sync
 *
 * NOTE: For tenant styles injection, use injectTenantStyles from 'dash-admin' separately.
 *
 * @example
 * ```tsx
 * // In main.tsx before React renders
 * import { injectTenantStyles } from 'dash-admin';
 *
 * dashBootstrapApp();
 * injectTenantStyles('dark'); // Call separately
 *
 * // Then render React
 * root.render(<App />);
 * ```
 */
export const dashBootstrapApp = (): void => {
    // Sync Electron store (async but non-blocking)
    syncElectronStore();

    // Apply platform-specific body classes
    applyPlatformBodyClasses();

    // NOTE: Tenant styles injection should be done by caller using injectTenantStyles from 'dash-admin'

    // Request notification permission (non-blocking)
    requestNotificationPermission();
};

export default dashBootstrapApp;
