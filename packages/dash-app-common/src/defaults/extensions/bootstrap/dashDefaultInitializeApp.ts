/**
 * Default App Initialization
 * 
 * Default bootstrap utilities that wrap the core dash-utils bootstrap.
 * Add app-specific initialization logic here.
 */
import { 
    dashInitializeApp, 
    dashBootstrapApp,
    type DashInitializeAppConfig 
} from 'dash-utils';

// Re-export the config type for convenience
export type DashDefaultInitializeAppConfig = DashInitializeAppConfig;

/**
 * Dash Default Initialize the application
 * Wraps dashInitializeApp from dash-utils and adds app-specific initialization.
 * 
 * @param config - Optional configuration for initialization steps
 * 
 * @example
 * ```tsx
 * // With default settings
 * await dashDefaultInitializeApp();
 * 
 * // With default configuration
 * await dashDefaultInitializeApp({
 *     defaultTheme: 'dark',
 *     requestNotifications: false
 * });
 * ```
 */
export const dashDefaultInitializeApp = async (config: DashDefaultInitializeAppConfig = {}): Promise<void> => {
    // Run the core dash bootstrap
    await dashInitializeApp(config);
    
    // Add any default app-specific initialization here
    // Example: Initialize analytics, default logging, etc.
};

/**
 * Dash Default synchronous bootstrap sequence for immediate execution
 * Wraps dashBootstrapApp from dash-utils and adds app-specific bootstrap logic.
 * 
 * @param defaultTheme - Optional default theme for tenant styles
 * @param tenantSettings - Optional tenant settings with colors
 * 
 * @example
 * ```tsx
 * // In main.tsx before React renders
 * import { AuthPersistenceService } from 'dash-auth';
 * dashDefaultBootstrapApp('dark', AuthPersistenceService.getTenantSettings());
 * 
 * // Then render React
 * root.render(<App />);
 * ```
 */
export const dashDefaultBootstrapApp = (defaultTheme?: string, tenantSettings?: { colors?: any } | null): void => {
    // Run the core dash bootstrap
    dashBootstrapApp(defaultTheme, tenantSettings);
    
    // Add any default app-specific bootstrap here
    // Example: Initialize default services, set up listeners, etc.
};

export default dashDefaultInitializeApp;
