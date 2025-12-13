/**
 * Platform Detection Utilities
 *
 * Functions to detect the current platform/environment.
 * These are used to add appropriate body classes for platform-specific styling.
 */

/**
 * Check if running in a WebView
 */
export const isWebView = (): boolean => {
    if (typeof navigator === 'undefined') return false;

    const userAgent = navigator.userAgent.toLowerCase();
    console.log('userAgent', userAgent);
    return (
        /(webview|wv)/.test(userAgent) ||
        /android.*(wv|.net)/.test(userAgent) ||
        /iphone|ipod|ipad.*applewebkit(?!.*safari)/i.test(userAgent)
    );
};

/**
 * Check if running on Android
 */
export const isAndroid = (): boolean => {
    if (typeof navigator === 'undefined') return false;
    return /android/i.test(navigator.userAgent.toLowerCase());
};

/**
 * Check if running on iOS
 */
export const isIOS = (): boolean => {
    if (typeof navigator === 'undefined') return false;
    return /iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase());
};

/**
 * Check if running on Windows
 */
export const isWindows = (): boolean => {
    try {
        // Check via globalThis to avoid process not defined errors
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const globalProcess = (globalThis as any).process;
        const platform = globalProcess?.platform;
        return platform === 'win32' ||
            (typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes('windows'));
    } catch (error) {
        console.error('Error checking Windows platform:', error);
        return false;
    }
};

/**
 * Apply platform-specific body classes
 */
export const applyPlatformBodyClasses = (): void => {
    if (typeof document === 'undefined') return;

    if (isWindows()) {
        document.body.classList.add('windows');
    }

    if (isWebView()) {
        console.log('webview');
        document.body.classList.add('webview');

        if (isAndroid()) {
            document.body.classList.add('android');
        }

        if (isIOS()) {
            document.body.classList.add('ios');
        }
    }

    // Add sanitized user agent as body class
    if (typeof navigator !== 'undefined' && navigator.userAgent) {
        const userAgent = navigator.userAgent.toLowerCase();
        // Sanitize user agent for use as CSS class
        const sanitizedUA = userAgent
            .replace(/[^a-z0-9]/g, '-') // Replace non-alphanumeric with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single
            .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
            .substring(0, 100); // Limit length

        if (sanitizedUA) {
            document.body.classList.add(`ua-${sanitizedUA}`);
        }
    }
};

export default {
    isWebView,
    isAndroid,
    isIOS,
    isWindows,
    applyPlatformBodyClasses,
};
