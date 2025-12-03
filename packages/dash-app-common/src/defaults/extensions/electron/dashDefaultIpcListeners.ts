/**
 * Dash Default IPC Listeners Extension
 * 
 * Electron IPC listener setup and configuration.
 */
import { useEffect } from 'react';
import { getDashIPCService, onIPCStdout } from 'dash-utils';

/**
 * Hook to set up dash default IPC listeners
 * Listens for Electron IPC events when running in Electron
 */
export const useDashDefaultIPCListeners = (options?: {
    onStdout?: (data: any) => void;
    enableLogging?: boolean;
}) => {
    const { onStdout, enableLogging = true } = options || {};

    useEffect(() => {
        const ipcService = getDashIPCService();
        if (ipcService) {
            // Listen for all stdout events
            onIPCStdout((data) => {
                if (enableLogging) {
                    console.log('[DashDefault IPC Stdout]:', data);
                }
                onStdout?.(data);
            });
        }

        return () => {
            // Clean up listeners if needed
        };
    }, [onStdout, enableLogging]);
};

/**
 * Set up dash default IPC listeners imperatively (non-hook version)
 */
export const setupDashDefaultIPCListeners = (options?: {
    onStdout?: (data: any) => void;
    enableLogging?: boolean;
}): (() => void) => {
    const { onStdout, enableLogging = true } = options || {};
    
    const ipcService = getDashIPCService();
    if (ipcService) {
        onIPCStdout((data) => {
            if (enableLogging) {
                console.log('[DashDefault IPC Stdout]:', data);
            }
            onStdout?.(data);
        });
    }

    // Return cleanup function
    return () => {
        // Cleanup if needed
    };
};

export default useDashDefaultIPCListeners;
