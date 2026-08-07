import { useEffect, useState, useCallback } from 'react';

export interface MobileDetectionState {
    isMobile: boolean;
    isAndroid: boolean;
    isIOS: boolean;
    isWebView: boolean;
    screenWidth: number;
}

export interface UseMobileDetectionOptions {
    /** Screen width threshold to consider as mobile (default: 700) */
    mobileBreakpoint?: number;
    /** Enable debug logging */
    debug?: boolean;
}

/**
 * Check if the current environment is a mobile device
 * Based on body classes and screen width
 */
export const checkMobileDevice = (mobileBreakpoint: number = 700): boolean => {
    // Check body classes for mobile devices
    const bodyClasses = document.body.className;
    const hasMobileClass = bodyClasses.includes('webview') ||
                          bodyClasses.includes('android') ||
                          bodyClasses.includes('ios') ||
                          bodyClasses.includes('mobile');

    // Check screen width
    const screenWidth = window.innerWidth;
    const isSmallScreen = screenWidth < mobileBreakpoint;

    // Consider mobile if either condition is true
    return hasMobileClass || isSmallScreen;
};

/**
 * Check if running in a WebView
 */
export const isWebView = (): boolean => {
    const userAgent = navigator.userAgent.toLowerCase();
    return (/(webview|wv)/.test(userAgent) ||
    /android.*(wv|.net)/.test(userAgent) || /iphone|ipod|ipad.*applewebkit(?!.*safari)/i.test(userAgent));
};

/**
 * Check if running on Android
 */
export const isAndroid = (): boolean => {
    return /android/i.test(navigator.userAgent.toLowerCase());
};

/**
 * Check if running on iOS
 */
export const isIOS = (): boolean => {
    return /iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase());
};

/**
 * Check if running on Windows
 */
export const isWindows = (): boolean => {
    try {
        // Check Node.js process (for Electron)
        const nodeProcess = (globalThis as any).process;
        if (nodeProcess?.platform === 'win32') return true;

        return navigator.userAgent.toLowerCase().includes('windows');
    } catch (error) {
        return false;
    }
};

/**
 * Check if running on macOS
 */
export const isMacOS = (): boolean => {
    try {
        // Check Node.js process (for Electron)
        const nodeProcess = (globalThis as any).process;
        if (nodeProcess?.platform === 'darwin') return true;

        return /macintosh|mac os x/i.test(navigator.userAgent.toLowerCase());
    } catch (error) {
        return false;
    }
};

/**
 * Check if running on Linux
 */
export const isLinux = (): boolean => {
    try {
        // Check Node.js process (for Electron)
        const nodeProcess = (globalThis as any).process;
        if (nodeProcess?.platform === 'linux') return true;

        return /linux/i.test(navigator.userAgent.toLowerCase());
    } catch (error) {
        return false;
    }
};

/**
 * Hook for detecting mobile devices and platform information
 *
 * @param options - Configuration options
 * @returns Mobile detection state
 */
export const useMobileDetection = (options: UseMobileDetectionOptions = {}) => {
    const { mobileBreakpoint = 700, debug = false } = options;

    const [state, setState] = useState<MobileDetectionState>(() => ({
        isMobile: checkMobileDevice(mobileBreakpoint),
        isAndroid: isAndroid(),
        isIOS: isIOS(),
        isWebView: isWebView(),
        screenWidth: window.innerWidth,
    }));

    const log = useCallback((message: string, data?: any) => {
        if (debug) {
            console.log(`[useMobileDetection] ${message}`, data || '');
        }
    }, [debug]);

    useEffect(() => {
        const handleResize = () => {
            const newState: MobileDetectionState = {
                isMobile: checkMobileDevice(mobileBreakpoint),
                isAndroid: isAndroid(),
                isIOS: isIOS(),
                isWebView: isWebView(),
                screenWidth: window.innerWidth,
            };

            // Only update if something changed
            if (newState.isMobile !== state.isMobile || newState.screenWidth !== state.screenWidth) {
                log('Mobile detection state changed', newState);
                setState(newState);
            }
        };

        window.addEventListener('resize', handleResize);

        // Also listen to orientation changes
        window.addEventListener('orientationchange', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleResize);
        };
    }, [mobileBreakpoint, state.isMobile, state.screenWidth, log]);

    // Initial detection logging
    useEffect(() => {
        log('Initial mobile detection', state);
    }, []);

    return state;
};

export default useMobileDetection;
