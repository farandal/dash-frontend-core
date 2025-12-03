/**
 * Electron Store Sync Utility
 *
 * Synchronizes Electron store with localStorage on app startup.
 */

/**
 * Sync Electron store to localStorage
 * Should be called early in app initialization
 */
export const syncElectronStore = async (): Promise<void> => {
    if (typeof window === 'undefined' || !window.electronStore) {
        return;
    }

    try {
        const all = await window.electronStore.syncToLocalStorage();
        Object.entries(all).forEach(([key, value]) => {
            window.localStorage.setItem(key, JSON.stringify(value));
        });
        console.log('Electron store synced to localStorage');
    } catch (error) {
        console.error('Failed to sync Electron store:', error);
    }
};

/**
 * Check if Electron store is available
 */
export const hasElectronStore = (): boolean => {
    return typeof window !== 'undefined' && !!window.electronStore;
};

export default syncElectronStore;
