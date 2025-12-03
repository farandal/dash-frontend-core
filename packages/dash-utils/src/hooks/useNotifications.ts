import { useState, useCallback, useEffect } from 'react';

/**
 * Represents a processed notification with standardized fields
 */
export interface ProcessedNotification {
    id: string;
    title: string;
    message: string;
    customer?: string;
    store?: string;
    timestamp: string;
    isRead: boolean;
    data?: any;
    severity?: 'info' | 'warning' | 'error' | 'success';
}

/**
 * Toast notification for snackbar display
 */
export interface ToastNotification {
    id: string;
    title: string;
    message: string;
    severity: 'info' | 'warning' | 'error' | 'success';
}

/**
 * Dialog notification with position for draggable dialogs
 */
export interface DialogNotification extends ProcessedNotification {
    position: { x: number; y: number };
    zIndex: number;
}

/**
 * Options for useNotifications hook
 */
export interface UseNotificationsOptions {
    /** Maximum number of notifications to keep in history */
    maxNotifications?: number;
    /** Initial z-index for dialog notifications */
    initialZIndex?: number;
    /** Auto-dismiss toast notifications after ms (0 = no auto dismiss) */
    toastAutoDismiss?: number;
}

/**
 * Hook return type
 */
export interface UseNotificationsReturn {
    notifications: ProcessedNotification[];
    toastNotifications: ToastNotification[];
    dialogNotifications: DialogNotification[];
    unreadCount: number;
    addNotification: (notification: Omit<ProcessedNotification, 'id' | 'timestamp' | 'isRead'>) => ProcessedNotification;
    addToast: (toast: Omit<ToastNotification, 'id'>) => string;
    addDialogNotification: (notification: Omit<ProcessedNotification, 'id' | 'timestamp' | 'isRead'>) => DialogNotification;
    markAsRead: (notificationId: string) => void;
    markAllAsRead: () => void;
    removeNotification: (notificationId: string) => void;
    clearAllNotifications: () => void;
    removeToast: (toastId: string) => void;
    removeDialogNotification: (notificationId: string) => void;
    bringDialogToFront: (notificationId: string) => void;
    updateDialogPosition: (notificationId: string, position: { x: number; y: number }) => void;
}

/**
 * Generate a unique ID for notifications
 */
const generateId = (): string => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Hook for managing notifications state
 * Handles notifications list, toast notifications, and draggable dialog notifications
 */
export const useNotifications = (options: UseNotificationsOptions = {}): UseNotificationsReturn => {
    const {
        maxNotifications = 50,
        initialZIndex = 100000,
        toastAutoDismiss = 8000,
    } = options;

    const [notifications, setNotifications] = useState<ProcessedNotification[]>([]);
    const [toastNotifications, setToastNotifications] = useState<ToastNotification[]>([]);
    const [dialogNotifications, setDialogNotifications] = useState<DialogNotification[]>([]);
    const [nextZIndex, setNextZIndex] = useState(initialZIndex);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    // Add a new notification to the list
    const addNotification = useCallback((
        notification: Omit<ProcessedNotification, 'id' | 'timestamp' | 'isRead'>
    ): ProcessedNotification => {
        const processedNotification: ProcessedNotification = {
            ...notification,
            id: generateId(),
            timestamp: new Date().toISOString(),
            isRead: false,
        };

        setNotifications(prev => [processedNotification, ...prev.slice(0, maxNotifications - 1)]);
        return processedNotification;
    }, [maxNotifications]);

    // Add a toast notification
    const addToast = useCallback((toast: Omit<ToastNotification, 'id'>): string => {
        const id = `toast-${generateId()}`;
        setToastNotifications(prev => [...prev, { ...toast, id }]);
        return id;
    }, []);

    // Add a dialog notification with position
    const addDialogNotification = useCallback((
        notification: Omit<ProcessedNotification, 'id' | 'timestamp' | 'isRead'>
    ): DialogNotification => {
        const processedNotification = addNotification(notification);

        let dialogNotification: DialogNotification;

        setDialogNotifications(prev => {
            const dialogCount = prev.length;
            const baseX = 20;
            const baseY = typeof window !== 'undefined' ? window.innerHeight - 250 : 500;
            const offsetY = dialogCount * -220;

            dialogNotification = {
                ...processedNotification,
                position: { x: baseX, y: baseY + offsetY },
                zIndex: initialZIndex + dialogCount + 1,
            };

            return [...prev, dialogNotification];
        });

        setNextZIndex(prev => prev + 1);

        return dialogNotification!;
    }, [addNotification, initialZIndex]);

    // Mark a notification as read
    const markAsRead = useCallback((notificationId: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        );
    }, []);

    // Mark all notifications as read
    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }, []);

    // Remove a notification
    const removeNotification = useCallback((notificationId: string) => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
    }, []);

    // Clear all notifications
    const clearAllNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    // Remove a toast notification
    const removeToast = useCallback((toastId: string) => {
        setToastNotifications(prev => prev.filter(t => t.id !== toastId));
    }, []);

    // Remove a dialog notification
    const removeDialogNotification = useCallback((notificationId: string) => {
        setDialogNotifications(prev => prev.filter(d => d.id !== notificationId));
        markAsRead(notificationId);
    }, [markAsRead]);

    // Bring a dialog to front
    const bringDialogToFront = useCallback((notificationId: string) => {
        setDialogNotifications(prev => {
            const maxZ = Math.max(...prev.map(p => p.zIndex), initialZIndex);
            return prev.map(d =>
                d.id === notificationId
                    ? { ...d, zIndex: maxZ + 1 }
                    : d
            );
        });
    }, [initialZIndex]);

    // Update dialog position
    const updateDialogPosition = useCallback((
        notificationId: string,
        position: { x: number; y: number }
    ) => {
        setDialogNotifications(prev =>
            prev.map(d =>
                d.id === notificationId
                    ? { ...d, position }
                    : d
            )
        );
    }, []);

    return {
        notifications,
        toastNotifications,
        dialogNotifications,
        unreadCount,
        addNotification,
        addToast,
        addDialogNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAllNotifications,
        removeToast,
        removeDialogNotification,
        bringDialogToFront,
        updateDialogPosition,
    };
};

export default useNotifications;
