/**
 * Notification Permission Utilities
 *
 * Utilities for managing browser notification permissions.
 */

/**
 * Request browser notification permission
 * Only requests if permission is in 'default' state (not yet decided)
 *
 * @returns Promise that resolves when permission is granted or rejected
 *
 * @example
 * ```tsx
 * // Request permission on app startup
 * await requestNotificationPermission();
 *
 * // Check if granted
 * if (Notification.permission === 'granted') {
 *   new Notification('Hello!');
 * }
 * ```
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission | null> => {
    if ('Notification' in window && Notification.permission === 'default') {
        return await Notification.requestPermission();
    }
    return Notification.permission ?? null;
};

/**
 * Check if notifications are supported in the current environment
 */
export const isNotificationSupported = (): boolean => {
    return 'Notification' in window;
};

/**
 * Check if notification permission has been granted
 */
export const hasNotificationPermission = (): boolean => {
    return 'Notification' in window && Notification.permission === 'granted';
};

/**
 * Check if notification permission has been denied
 */
export const isNotificationDenied = (): boolean => {
    return 'Notification' in window && Notification.permission === 'denied';
};

/**
 * Get current notification permission status
 */
export const getNotificationPermission = (): NotificationPermission | null => {
    return 'Notification' in window ? Notification.permission : null;
};
