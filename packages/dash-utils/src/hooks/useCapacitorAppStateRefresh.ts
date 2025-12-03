import { useEffect } from 'react';

/**
 * Hook to handle Capacitor app state changes
 * Triggers a refresh callback when the app resumes from background
 *
 * @param onResume - Callback function to execute when app resumes
 */
export const useCapacitorAppStateRefresh = (onResume?: () => void) => {
    useEffect(() => {
        const CapacitorApp = (window as any)?.Capacitor?.Plugins?.App;
        console.log('[useCapacitorAppStateRefresh] Checking for Capacitor App plugin:', !!CapacitorApp);

        if (!CapacitorApp) return;

        const handler = (state: { isActive: boolean }) => {
            console.log('[useCapacitorAppStateRefresh] App state changed:', state);
            if (state.isActive) {
                console.log('[useCapacitorAppStateRefresh] App is resuming, triggering callback');
                onResume?.();
            }
        };

        CapacitorApp.addListener('appStateChange', handler);
        console.log('[useCapacitorAppStateRefresh] Added appStateChange listener');

        return () => {
            CapacitorApp.removeAllListeners?.();
            console.log('[useCapacitorAppStateRefresh] Removed all Capacitor App listeners');
        };
    }, [onResume]);
};

export default useCapacitorAppStateRefresh;
