/**
 * Electron Store Utilities
 * 
 * Utilities for syncing Electron's store with localStorage.
 * These are only executed in Electron environment.
 * 
 * Note: Window.electronStore type is declared in dash-utils/dashIPCService.ts
 */

/**
 * Sync Electron store to localStorage
 * Only executes if running in Electron environment
 */
export const syncElectronStoreToLocalStorage = async (): Promise<void> => {
    if (typeof window === 'undefined') return;
    
    if (window.electronStore) {
        try {
            const all: Record<string, any> = await window.electronStore.syncToLocalStorage();
            Object.entries(all).forEach(([key, value]) => {
                window.localStorage.setItem(key, JSON.stringify(value));
            });
            console.log('✅ Electron store synced to localStorage');
        } catch (error) {
            console.error('❌ Failed to sync Electron store:', error);
        }
    }
};

/**
 * Check if running in Electron environment
 */
export const isElectron = (): boolean => {
    return typeof window !== 'undefined' && !!window.electronStore;
};

/**
 * Get value from Electron store (with localStorage fallback)
 */
export const getElectronStoreValue = async (key: string, defaultValue?: any): Promise<any> => {
    if (typeof window === 'undefined') return defaultValue;
    
    if (window.electronStore) {
        try {
            return await window.electronStore.get(key);
        } catch {
            return defaultValue;
        }
    }
    
    // Fallback to localStorage
    const stored = localStorage.getItem(key);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch {
            return stored;
        }
    }
    return defaultValue;
};

/**
 * Set value in Electron store (with localStorage fallback)
 */
export const setElectronStoreValue = async (key: string, value: any): Promise<void> => {
    if (typeof window === 'undefined') return;
    
    if (window.electronStore) {
        try {
            await window.electronStore.set(key, value);
        } catch (error) {
            console.error('Failed to set Electron store value:', error);
        }
    }
    
    // Also set in localStorage for consistency
    localStorage.setItem(key, JSON.stringify(value));
};
