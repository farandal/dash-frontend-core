/**
 * Development Environment Detection Utility
 *
 * Provides functions to check if the application is running
 * in a development environment.
 */

// Safe check for Node.js process object
const getNodeEnv = (): string | undefined => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (typeof globalThis !== 'undefined' && (globalThis as any).process?.env?.NODE_ENV) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (globalThis as any).process.env.NODE_ENV;
        }
    } catch {
        // Ignore errors in environments where process is not available
    }
    return undefined;
};

/**
 * Check if the application is running in development mode
 * Detects localhost, 127.0.0.1, or development hostnames
 */
export const isDev = (): boolean => {
    if (typeof window === 'undefined') {
        // Node.js environment - check for NODE_ENV
        return getNodeEnv() === 'development';
    }

    const { hostname } = window.location;
    return (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.startsWith('192.168.') ||
        hostname.endsWith('.local') ||
        hostname.includes('dev.')
    );
};

/**
 * Check if running in production mode
 */
export const isProd = (): boolean => {
    return !isDev();
};

/**
 * Check if running in test environment
 */
export const isTest = (): boolean => {
    return getNodeEnv() === 'test';
};

/**
 * Get the current environment name
 */
export const getEnvironment = (): 'development' | 'production' | 'test' => {
    if (isTest()) return 'test';
    if (isDev()) return 'development';
    return 'production';
};

export default isDev;
