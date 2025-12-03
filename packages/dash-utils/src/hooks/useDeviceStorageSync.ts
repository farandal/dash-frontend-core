import { useEffect } from 'react';

/**
 * Hook to sync device storage (Electron store) with localStorage
 * Useful for Electron apps to maintain state persistence
 */
export const useDeviceStorageSync = () => {
    useEffect(() => {
        const syncDeviceStoreToLocalStorage = async () => {
            const electronStore = (window as any).electronStore;
            if (electronStore && electronStore.getAll) {
                // Sync logic can be implemented here if needed
                // Currently placeholder for future implementation
                console.log('[useDeviceStorageSync] Electron store detected');
            }
        };
        syncDeviceStoreToLocalStorage();
    }, []);
};

/**
 * Sync all data from Electron store to localStorage
 * Call this on app initialization
 */
export const syncDeviceStoreToLocalStorage = async (): Promise<void> => {
    const electronStore = (window as any).electronStore;
    if (electronStore && electronStore.getAll) {
        try {
            const allData = await electronStore.getAll();
            if (allData && typeof allData === 'object') {
                for (const [key, value] of Object.entries(allData)) {
                    window.localStorage.setItem(key, JSON.stringify(value));
                }
                console.log('[syncDeviceStoreToLocalStorage] Synced electron-store to localStorage');
            }
        } catch (err) {
            console.error('[syncDeviceStoreToLocalStorage] Failed to sync:', err);
        }
    }
};

/**
 * Sync all data from localStorage to Electron store
 * Call this after auth changes or important state updates
 */
export const syncLocalStorageToDeviceStore = async (): Promise<void> => {
    const electronStore = (window as any).electronStore;
    if (electronStore && electronStore.set) {
        try {
            for (let i = 0; i < window.localStorage.length; i++) {
                const key = window.localStorage.key(i);
                if (key) {
                    const value = window.localStorage.getItem(key);
                    if (value !== null) {
                        try {
                            await electronStore.set(key, JSON.parse(value));
                        } catch {
                            await electronStore.set(key, value);
                        }
                    }
                }
            }
            console.log('[syncLocalStorageToDeviceStore] Synced localStorage to electron-store');
        } catch (err) {
            console.error('[syncLocalStorageToDeviceStore] Failed to sync:', err);
        }
    }
};

export default useDeviceStorageSync;
