/**
 * Auth Provider Utilities
 *
 * Helper functions for authentication operations.
 * These utilities are used by auth providers across Dash applications.
 */
import { dashStorage } from './dashDtorage';

/**
 * Configuration for logout function
 */
export interface LogoutConfig {
    /** Function to clear auth persistence service */
    clearAuthPersistence?: () => void;
    /** Function to sync to device store (Electron/Capacitor) */
    syncToDeviceStore?: () => Promise<void>;
    /** Function to remove cookies */
    removeCookies?: (names: string[]) => void;
    /** Additional storage keys to clear */
    additionalKeys?: string[];
}

/**
 * Default storage keys to clear on logout
 */
const DEFAULT_AUTH_STORAGE_KEYS = [
    'token',
    'authenticated',
    'user',
    'roles',
    'tenant_id',
    'user_id'
];

/**
 * Default cookie names to clear on logout
 */
const DEFAULT_AUTH_COOKIE_NAMES = [
    'token',
    'tenant_id',
    'user_id'
];

/**
 * Create a logout function with the given configuration
 * This factory allows apps to customize the logout behavior
 */
export const createLogoutFromStorage = (config: LogoutConfig = {}) => {
    return async (reason?: string): Promise<void> => {
        console.log('🔓 logoutFromStorage called:', reason || 'no reason provided');

        try {
            // Clear auth persistence service if provided
            if (config.clearAuthPersistence) {
                config.clearAuthPersistence();
            }

            // Clear localStorage items
            const keysToRemove = [...DEFAULT_AUTH_STORAGE_KEYS, ...(config.additionalKeys || [])];
            keysToRemove.forEach(key => {
                dashStorage.removeItem(key);
            });

            // Clear cookies if removeCookies function is provided
            if (config.removeCookies) {
                config.removeCookies(DEFAULT_AUTH_COOKIE_NAMES);
            }

            // Sync to device store (Electron/Capacitor) if provided
            if (config.syncToDeviceStore) {
                await config.syncToDeviceStore();
            }

            console.log('✅ Auth data cleared successfully');
        } catch (error) {
            console.error('❌ Error clearing auth data:', error);
        }
    };
};

/**
 * Check if user is currently authenticated
 * Based on localStorage values
 */
export const isUserAuthenticated = (): boolean => {
    try {
        const authenticated = JSON.parse(dashStorage.getItem('authenticated') || 'false');
        const user = JSON.parse(dashStorage.getItem('user') || 'null');
        return authenticated && user?.id;
    } catch {
        return false;
    }
};

/**
 * Get current user from storage
 */
export const getCurrentUser = <T = any>(): T | null => {
    try {
        return JSON.parse(dashStorage.getItem('user') || 'null');
    } catch {
        return null;
    }
};

/**
 * Get current token from storage
 */
export const getAuthToken = (): string | null => {
    return dashStorage.getItem('token');
};

/**
 * Get current tenant ID from storage
 */
export const getTenantId = (): string | null => {
    return dashStorage.getItem('tenant_id');
};

/**
 * Get user roles from storage
 */
export const getUserRoles = <T = any>(): T[] => {
    try {
        return JSON.parse(dashStorage.getItem('roles') || '[]');
    } catch {
        return [];
    }
};

/**
 * Set authentication data in storage
 */
export const setAuthData = (data: {
    token?: string;
    user?: any;
    roles?: any[];
    authenticated?: boolean;
    tenant_id?: string;
    user_id?: string;
}): void => {
    if (data.token !== undefined) {
        dashStorage.setItem('token', data.token);
    }
    if (data.user !== undefined) {
        dashStorage.setItem('user', JSON.stringify(data.user));
    }
    if (data.roles !== undefined) {
        dashStorage.setItem('roles', JSON.stringify(data.roles));
    }
    if (data.authenticated !== undefined) {
        dashStorage.setItem('authenticated', JSON.stringify(data.authenticated));
    }
    if (data.tenant_id !== undefined) {
        dashStorage.setItem('tenant_id', data.tenant_id);
    }
    if (data.user_id !== undefined) {
        dashStorage.setItem('user_id', data.user_id);
    }
};

export default {
    createLogoutFromStorage,
    isUserAuthenticated,
    getCurrentUser,
    getAuthToken,
    getTenantId,
    getUserRoles,
    setAuthData
};
