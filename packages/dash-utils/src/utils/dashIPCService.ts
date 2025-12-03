// Electron IPC Service Types
export interface SpeechPayload {
    message: string;
    lang?: string;
}

export interface SubprocessOutput {
    type: 'stdout' | 'stderr' | 'exit' | 'error' | 'print-stdout' | 'print-stderr';
    message: string;
    timestamp: string;
    pid?: number;
    exitCode?: number;
    error?: string;
    code?: string;
}

export interface ElectronLogData {
    level: 'info' | 'error' | 'warn' | 'debug' | 'verbose';
    message: string;
    timestamp: string;
}

/**
 * DashIPCService
 *
 * Utility for interacting with Electron IPC (Inter-Process Communication).
 * Provides a safe wrapper around the DashIPCService that may be injected
 * by the Electron preload script.
 */

/**
 * Extended Interface for the DashIPCService exposed by Electron
 */
export interface DashIPCServiceType {
    runPythonScript: (filePath: string, scriptPath: string, args: string[]) => void;
    action: (action: string, payload: any) => void;
    speak: (payload: string | SpeechPayload) => void;
    playSound: (soundName: string) => void;
    stopSound: () => void;
    notify: (title: string, message: string) => void;
    onPythonOutput: (callback: (data: any) => void) => void;
    onServiceMessage: (callback: (data: any) => void) => void;
    onStdout: (callback: (data: string) => void) => void;
    onElectronLog: (callback: (logData: ElectronLogData) => void) => void;
    onSubprocessOutput: (callback: (data: SubprocessOutput) => void) => void;
    windowControls: (action: 'minimize' | 'maximize' | 'close') => void;
    startDrag: () => void;
    // Legacy/optional methods
    send?: (channel: string, data?: any) => void;
    invoke?: (channel: string, data?: any) => Promise<any>;
}

/**
 * Electron Store Type
 */
export interface ElectronStoreType {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any) => Promise<void>;
    delete: (key: string) => Promise<void>;
    clear: () => Promise<void>;
    getAll: () => Promise<Record<string, any>>;
    syncToLocalStorage: () => Promise<Record<string, any>>;
}

/**
 * Extend Window interface to include DashIPCService and ElectronStore
 */
declare global {
    interface Window {
        DashIPCService?: DashIPCServiceType;
        electronStore?: ElectronStoreType;
    }
}

/**
 * Check if DashIPCService is available (running in Electron)
 */
export const isDashIPCServiceAvailable = (): boolean => {
    return typeof window !== 'undefined' && !!window.DashIPCService;
};

/**
 * Check if running in Electron environment
 */
export const isElectron = (): boolean => {
    return isDashIPCServiceAvailable();
};

/**
 * Get the DashIPCService instance
 * Returns undefined if not running in Electron
 */
export const getDashIPCService = (): DashIPCServiceType | undefined => {
    if (typeof window !== 'undefined') {
        return window.DashIPCService;
    }
    return undefined;
};

/**
 * Safe wrapper for window control actions
 */
export const windowControl = (action: 'minimize' | 'maximize' | 'close'): boolean => {
    const ipc = getDashIPCService();
    if (ipc) {
        ipc.windowControls(action);
        return true;
    }
    return false;
};

/**
 * Start window dragging (for custom title bars)
 */
export const startWindowDrag = (): boolean => {
    const ipc = getDashIPCService();
    if (ipc) {
        ipc.startDrag();
        return true;
    }
    return false;
};

/**
 * Execute an IPC action
 */
export const executeIPCAction = (action: string, payload: any): boolean => {
    const ipc = getDashIPCService();
    if (ipc) {
        ipc.action(action, payload);
        return true;
    }
    return false;
};

/**
 * Register a callback for stdout events
 */
export const onIPCStdout = (callback: (data: string) => void): boolean => {
    const ipc = getDashIPCService();
    if (ipc && ipc.onStdout) {
        ipc.onStdout(callback);
        return true;
    }
    return false;
};

/**
 * Register a callback for Electron log events
 */
export const onElectronLog = (callback: (logData: ElectronLogData) => void): boolean => {
    const ipc = getDashIPCService();
    if (ipc && ipc.onElectronLog) {
        ipc.onElectronLog(callback);
        return true;
    }
    return false;
};

/**
 * Register a callback for subprocess output events
 */
export const onSubprocessOutput = (callback: (data: SubprocessOutput) => void): boolean => {
    const ipc = getDashIPCService();
    if (ipc && ipc.onSubprocessOutput) {
        ipc.onSubprocessOutput(callback);
        return true;
    }
    return false;
};

/**
 * Hook for using DashIPCService in React components
 */
export const useDashIPCService = () => {
    const ipcService = getDashIPCService();

    return {
        isAvailable: isDashIPCServiceAvailable(),
        isElectron: isElectron(),
        service: ipcService,
        windowControl,
        startWindowDrag,
        executeAction: executeIPCAction,
        onStdout: onIPCStdout,
        onElectronLog,
        onSubprocessOutput,
    };
};

export default {
    isDashIPCServiceAvailable,
    isElectron,
    getDashIPCService,
    windowControl,
    startWindowDrag,
    executeIPCAction,
    onIPCStdout,
    onElectronLog,
    onSubprocessOutput,
    useDashIPCService,
};
