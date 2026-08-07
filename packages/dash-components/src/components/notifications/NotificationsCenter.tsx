import React, { useState, useCallback, useEffect } from 'react';
import {
    Button,
    Badge,
    Menu,
    MenuItem,
    Typography,
    Divider,
    Box,
    IconButton,
    Avatar,
    Chip,
    Snackbar,
    Alert,
    Stack,
    Paper,
    Portal
} from '@mui/material';
import {
    NotificationsNone,
    NotificationsActive,
    Close as CloseIcon,
    Clear as ClearIcon,
    Person as PersonIcon,
    Store as StoreIcon,
    DragIndicator as DragIcon
} from '@mui/icons-material';
import {
    useNotifications as useNotificationsState,
    type ProcessedNotification,
    type ToastNotification as DashUtilsToastNotification,
    type DialogNotification as DashUtilsDialogNotification,
} from 'dash-utils';

// ============================================================================
// TYPES & INTERFACES
//
// The notification/toast/dialog shapes themselves live in dash-utils'
// useNotifications hook (the state management is delegated there below —
// see "HOOKS"). Re-exported here under this module's established names so
// existing imports of NotificationData/ToastNotification/DialogNotification
// from dash-components keep working unchanged.
// ============================================================================

export type NotificationData = ProcessedNotification;
export type ToastNotification = DashUtilsToastNotification;
export type DialogNotification = DashUtilsDialogNotification;

export interface NotificationsCenterConfig {
    /** Maximum number of notifications to keep */
    maxNotifications?: number;
    /** Auto-hide duration for toast notifications (ms) */
    toastAutoHideDuration?: number;
    /** Base z-index for notifications */
    baseZIndex?: number;
    /** Menu max height */
    menuMaxHeight?: number;
    /** Menu width */
    menuWidth?: number;
    /** Custom labels for localization */
    labels?: NotificationsCenterLabels;
    /** Custom icons */
    icons?: NotificationsCenterIcons;
}

export interface NotificationsCenterLabels {
    title?: string;
    markAll?: string;
    noNotifications?: string;
    close?: string;
    acknowledge?: string;
    customer?: string;
    store?: string;
    received?: string;
    now?: string;
    minutesAgo?: string;
    hoursAgo?: string;
    daysAgo?: string;
}

export interface NotificationsCenterIcons {
    empty?: React.ReactNode;
    active?: React.ReactNode;
    customer?: React.ReactNode;
    store?: React.ReactNode;
}

// Default configuration
const defaultConfig: Required<NotificationsCenterConfig> = {
    maxNotifications: 50,
    toastAutoHideDuration: 8000,
    baseZIndex: 100000,
    menuMaxHeight: 480,
    menuWidth: 360,
    labels: {
        title: 'Notifications',
        markAll: 'Mark all',
        noNotifications: 'No notifications',
        close: 'Close',
        acknowledge: 'Got it',
        customer: 'Customer:',
        store: 'Store:',
        received: 'Received:',
        now: 'Now',
        minutesAgo: 'm',
        hoursAgo: 'h',
        daysAgo: 'd',
    },
    icons: {},
};

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Format timestamp to relative time (e.g., "2m", "1h", "3d")
 */
export const formatTimeAgo = (timestamp: string, labels?: NotificationsCenterLabels): string => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));
    
    const l = { ...defaultConfig.labels, ...labels };
    
    if (diffInMinutes < 1) return l.now || 'Now';
    if (diffInMinutes < 60) return `${diffInMinutes}${l.minutesAgo}`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}${l.hoursAgo}`;
    return `${Math.floor(diffInMinutes / 1440)}${l.daysAgo}`;
};

/**
 * Generate unique notification ID
 */
export const generateNotificationId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// ============================================================================
// HOOKS
// ============================================================================

export interface UseNotificationsCenterReturn {
    notifications: NotificationData[];
    toastNotifications: ToastNotification[];
    dialogNotifications: DialogNotification[];
    unreadCount: number;
    addNotification: (notification: Omit<NotificationData, 'id' | 'timestamp' | 'isRead'>, options?: { showDialog?: boolean; showToast?: boolean; toastSeverity?: ToastNotification['severity'] }) => void;
    markAsRead: (notificationId: string) => void;
    markAllAsRead: () => void;
    removeNotification: (notificationId: string) => void;
    clearAllNotifications: () => void;
    closeToast: (toastId: string) => void;
    closeDialog: (notificationId: string) => void;
    acknowledgeDialog: (notificationId: string) => void;
    bringDialogToFront: (notificationId: string) => void;
    updateDialogPosition: (notificationId: string, position: { x: number; y: number }) => void;
}

/**
 * Hook for managing notifications state.
 *
 * State itself is delegated to dash-utils' useNotifications (the canonical
 * implementation — this used to duplicate that logic locally). This hook is
 * kept as a thin wrapper because its addNotification(notification, options)
 * call — one call that optionally fans out to the base list, a dialog, and a
 * toast — is more ergonomic for consumers than the three separate calls
 * (addNotification/addDialogNotification/addToast) dash-utils exposes.
 */
export const useNotificationsCenter = (
    config: NotificationsCenterConfig = {}
): UseNotificationsCenterReturn => {
    const mergedConfig = { ...defaultConfig, ...config };

    const base = useNotificationsState({
        maxNotifications: mergedConfig.maxNotifications,
        initialZIndex: mergedConfig.baseZIndex,
    });

    const addNotification = useCallback((
        notification: Omit<NotificationData, 'id' | 'timestamp' | 'isRead'>,
        options: { showDialog?: boolean; showToast?: boolean; toastSeverity?: ToastNotification['severity'] } = {}
    ) => {
        const { showDialog = true, showToast = true, toastSeverity = 'warning' } = options;

        const processedNotification = showDialog
            ? base.addDialogNotification(notification)
            : base.addNotification(notification);

        if (showToast) {
            base.addToast({
                title: processedNotification.title,
                message: `${notification.customer || ''} ${notification.store ? `- ${notification.store}` : ''}`.trim(),
                severity: toastSeverity,
            });
        }
    }, [base]);

    return {
        notifications: base.notifications,
        toastNotifications: base.toastNotifications,
        dialogNotifications: base.dialogNotifications,
        unreadCount: base.unreadCount,
        addNotification,
        markAsRead: base.markAsRead,
        markAllAsRead: base.markAllAsRead,
        removeNotification: base.removeNotification,
        clearAllNotifications: base.clearAllNotifications,
        closeToast: base.removeToast,
        // closeDialog/acknowledgeDialog were already functionally identical
        // (both marked read + removed the dialog) — dash-utils'
        // removeDialogNotification does the same in one call.
        closeDialog: base.removeDialogNotification,
        acknowledgeDialog: base.removeDialogNotification,
        bringDialogToFront: base.bringDialogToFront,
        updateDialogPosition: base.updateDialogPosition,
    };
};

// ============================================================================
// COMPONENTS
// ============================================================================

// Notification Button Component
export interface NotificationButtonProps {
    unreadCount: number;
    onClick: (event: React.MouseEvent<HTMLElement>) => void;
    icons?: NotificationsCenterIcons;
}

export const NotificationButton: React.FC<NotificationButtonProps> = ({
    unreadCount,
    onClick,
    icons,
}) => {
    return (
        <IconButton
            onClick={onClick}
            aria-label="notifications"
            sx={{ padding: 0 }}
        >
            {/* Icon lives directly on the classed Avatar (not the IconButton/Badge) so it
                picks up the design system's icon-tile colors (var(--text-color) on
                var(--secondary-color), via the dash-icon-button-* classes) the same way
                every other sidebar action icon does (avatar, locale switcher, dark mode
                toggle). Classes/color on the IconButton itself (or color="inherit", the
                original state here) don't reliably reach the icon through the extra
                Badge wrapper layer, and left it uncolored/invisible in dark mode across
                every app that had copy-pasted this component (fixed 2026-08-03). */}
            <Badge badgeContent={unreadCount} color="error" max={99}>
                <Avatar
                    sx={{ fontSize: '1rem' }}
                    style={{ width: '30px', height: '30px', minHeight: '30px' }}
                    className="dash-icon-button-color dash-icon-button-bg"
                >
                    {unreadCount > 0
                        ? (icons?.active || <NotificationsActive />)
                        : (icons?.empty || <NotificationsNone />)
                    }
                </Avatar>
            </Badge>
        </IconButton>
    );
};

// Notification Menu Item Component
export interface NotificationMenuItemProps {
    notification: NotificationData;
    onMarkAsRead: (id: string) => void;
    onRemove: (id: string) => void;
    formatTimeAgo: (timestamp: string) => string;
}

export const NotificationMenuItem: React.FC<NotificationMenuItemProps> = ({
    notification,
    onMarkAsRead,
    onRemove,
    formatTimeAgo,
}) => {
    return (
        <MenuItem
            onClick={() => onMarkAsRead(notification.id)}
            sx={{
                backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                borderLeft: notification.isRead ? 'none' : '4px solid #ff9800',
                whiteSpace: 'normal',
                alignItems: 'flex-start',
                py: 1.5,
            }}
        >
            <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: notification.isRead ? 'normal' : 'bold' }}>
                        {notification.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="caption" sx={{
                            color: "text.secondary"
                        }}>
                            {formatTimeAgo(notification.timestamp)}
                        </Typography>
                        <IconButton 
                            size="small" 
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove(notification.id);
                            }}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>
                <Typography
                    variant="body2"
                    sx={{
                        color: "text.secondary",
                        mb: 1
                    }}>
                    {notification.message}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {notification.customer && (
                        <Chip 
                            label={notification.customer} 
                            size="small" 
                            variant="outlined"
                            color="primary"
                        />
                    )}
                    {notification.store && (
                        <Chip 
                            label={notification.store} 
                            size="small" 
                            variant="outlined"
                            color="secondary"
                        />
                    )}
                </Box>
            </Box>
        </MenuItem>
    );
};

// Notifications Menu Component
export interface NotificationsMenuProps {
    anchorEl: HTMLElement | null;
    notifications: NotificationData[];
    onClose: () => void;
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: () => void;
    onRemove: (id: string) => void;
    onClearAll: () => void;
    config?: NotificationsCenterConfig;
}

export const NotificationsMenu: React.FC<NotificationsMenuProps> = ({
    anchorEl,
    notifications,
    onClose,
    onMarkAsRead,
    onMarkAllAsRead,
    onRemove,
    onClearAll,
    config = {},
}) => {
    const mergedConfig = { ...defaultConfig, ...config };
    const labels = { ...defaultConfig.labels, ...config.labels };
    const open = Boolean(anchorEl);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={onClose}
            PaperProps={{
                style: {
                    maxHeight: mergedConfig.menuMaxHeight,
                    width: mergedConfig.menuWidth,
                },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{labels.title}</Typography>
                {notifications.length > 0 && (
                    <Box>
                        {unreadCount > 0 && (
                            <Button size="small" onClick={onMarkAllAsRead} sx={{ mr: 1 }}>
                                {labels.markAll}
                            </Button>
                        )}
                        <IconButton size="small" onClick={onClearAll}>
                            <ClearIcon fontSize="small" />
                        </IconButton>
                    </Box>
                )}
            </Box>
            <Divider />
            {notifications.length === 0 ? (
                <MenuItem disabled>
                    <Typography sx={{
                        color: "text.secondary"
                    }}>{labels.noNotifications}</Typography>
                </MenuItem>
            ) : (
                notifications.map((notification) => (
                    <NotificationMenuItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={onMarkAsRead}
                        onRemove={onRemove}
                        formatTimeAgo={(ts) => formatTimeAgo(ts, labels)}
                    />
                ))
            )}
        </Menu>
    );
};

// Toast Notifications Stack Component
export interface ToastNotificationsStackProps {
    toasts: ToastNotification[];
    onClose: (toastId: string) => void;
    autoHideDuration?: number;
    baseZIndex?: number;
}

export const ToastNotificationsStack: React.FC<ToastNotificationsStackProps> = ({
    toasts,
    onClose,
    autoHideDuration = 8000,
    baseZIndex = 100000,
}) => {
    return (
        <Stack 
            spacing={1} 
            sx={{ 
                position: 'fixed', 
                top: 16, 
                right: 16, 
                zIndex: baseZIndex,
                maxWidth: 400,
            }}
        >
            {toasts.map((toast) => (
                <Snackbar
                    key={toast.id}
                    open={true}
                    autoHideDuration={autoHideDuration}
                    onClose={() => onClose(toast.id)}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    sx={{ position: 'relative', zIndex: baseZIndex }}
                >
                    <Alert 
                        onClose={() => onClose(toast.id)} 
                        severity={toast.severity}
                        variant="filled"
                        sx={{ width: '100%' }}
                    >
                        <Typography variant="subtitle2">{toast.title}</Typography>
                        <Typography variant="body2">{toast.message}</Typography>
                    </Alert>
                </Snackbar>
            ))}
        </Stack>
    );
};

// Draggable Notification Dialog Component
export interface DraggableNotificationDialogProps {
    notification: DialogNotification;
    onClose: () => void;
    onAcknowledge: () => void;
    onFocus: () => void;
    onPositionChange: (position: { x: number; y: number }) => void;
    config?: NotificationsCenterConfig;
}

export const DraggableNotificationDialog: React.FC<DraggableNotificationDialogProps> = ({
    notification,
    onClose,
    onAcknowledge,
    onFocus,
    onPositionChange,
    config = {},
}) => {
    const labels = { ...defaultConfig.labels, ...config.labels };
    const icons = { ...defaultConfig.icons, ...config.icons };
    
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.drag-handle')) {
            e.preventDefault();
            onFocus();
            setIsDragging(true);
            setDragOffset({
                x: e.clientX - notification.position.x,
                y: e.clientY - notification.position.y,
            });
        }
    }, [onFocus, notification.position]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging) {
            e.preventDefault();
            const newX = Math.max(0, Math.min(window.innerWidth - 400, e.clientX - dragOffset.x));
            const newY = Math.max(0, Math.min(window.innerHeight - 200, e.clientY - dragOffset.y));
            onPositionChange({ x: newX, y: newY });
        }
    }, [isDragging, dragOffset, onPositionChange]);

    const handleMouseUp = useCallback(() => {
        if (isDragging) {
            setIsDragging(false);
        }
    }, [isDragging]);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.userSelect = 'none';
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                document.body.style.userSelect = '';
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return (
        <Portal>
            <div
                style={{
                    position: 'fixed',
                    left: notification.position.x,
                    top: notification.position.y,
                    zIndex: notification.zIndex,
                    pointerEvents: 'auto',
                }}
                onMouseDown={handleMouseDown}
            >
                <Paper
                    elevation={8}
                    sx={{
                        width: 400,
                        borderRadius: 2,
                        overflow: 'hidden',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.24)',
                        cursor: isDragging ? 'grabbing' : 'default',
                        '&:hover': {
                            boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
                        },
                    }}
                >
                    {/* Header */}
                    <Box
                        className="drag-handle"
                        sx={{
                            backgroundColor: 'warning.main',
                            color: 'warning.contrastText',
                            p: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            cursor: isDragging ? 'grabbing' : 'grab',
                            userSelect: 'none',
                        }}
                    >
                        <DragIcon sx={{ mr: 1 }} />
                        <NotificationsActive />
                        <Typography variant="h6" sx={{ flexGrow: 1, fontSize: '1rem' }}>
                            {notification.title}
                        </Typography>
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                onClose();
                            }}
                            sx={{ color: 'warning.contrastText' }}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>
                    
                    {/* Content */}
                    <Box sx={{ p: 2 }}>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            {notification.message}
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            {notification.customer && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {icons.customer || <PersonIcon color="primary" />}
                                    <Typography variant="body2" sx={{
                                        color: "text.secondary"
                                    }}>
                                        {labels.customer}
                                    </Typography>
                                    <Chip
                                        label={notification.customer}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                    />
                                </Box>
                            )}
                            {notification.store && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {icons.store || <StoreIcon color="secondary" />}
                                    <Typography variant="body2" sx={{
                                        color: "text.secondary"
                                    }}>
                                        {labels.store}
                                    </Typography>
                                    <Chip
                                        label={notification.store}
                                        size="small"
                                        color="secondary"
                                        variant="outlined"
                                    />
                                </Box>
                            )}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                <Typography variant="caption" sx={{
                                    color: "text.secondary"
                                }}>
                                    {labels.received} {formatTimeAgo(notification.timestamp, labels)}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                    
                    {/* Footer */}
                    <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button
                            onClick={(e) => {
                                e.stopPropagation();
                                onClose();
                            }}
                            color="inherit"
                            variant="outlined"
                            size="small"
                        >
                            {labels.close}
                        </Button>
                        <Button
                            onClick={(e) => {
                                e.stopPropagation();
                                onAcknowledge();
                            }}
                            color="primary"
                            variant="contained"
                            size="small"
                        >
                            {labels.acknowledge}
                        </Button>
                    </Box>
                </Paper>
            </div>
        </Portal>
    );
};

// Main NotificationsCenter Component
export interface NotificationsCenterProps {
    /** Configuration options */
    config?: NotificationsCenterConfig;
    /** External notifications hook (if managed externally) */
    notificationsHook?: UseNotificationsCenterReturn;
}

export const NotificationsCenter: React.FC<NotificationsCenterProps> = ({
    config = {},
    notificationsHook,
}) => {
    const internalHook = useNotificationsCenter(config);
    const hook = notificationsHook || internalHook;
    
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleClearAll = () => {
        hook.clearAllNotifications();
        handleClose();
    };

    return (
        <>
            <NotificationButton
                unreadCount={hook.unreadCount}
                onClick={handleNotificationClick}
                icons={config.icons}
            />

            <NotificationsMenu
                anchorEl={anchorEl}
                notifications={hook.notifications}
                onClose={handleClose}
                onMarkAsRead={hook.markAsRead}
                onMarkAllAsRead={hook.markAllAsRead}
                onRemove={hook.removeNotification}
                onClearAll={handleClearAll}
                config={config}
            />

            {/* Stackable Draggable Notification Dialogs */}
            {hook.dialogNotifications.map((dialogNotification) => (
                <DraggableNotificationDialog
                    key={dialogNotification.id}
                    notification={dialogNotification}
                    onClose={() => hook.closeDialog(dialogNotification.id)}
                    onAcknowledge={() => hook.acknowledgeDialog(dialogNotification.id)}
                    onFocus={() => hook.bringDialogToFront(dialogNotification.id)}
                    onPositionChange={(newPosition) => hook.updateDialogPosition(dialogNotification.id, newPosition)}
                    config={config}
                />
            ))}

            {/* Toast Notifications Stack */}
            <ToastNotificationsStack
                toasts={hook.toastNotifications}
                onClose={hook.closeToast}
                autoHideDuration={config.toastAutoHideDuration}
                baseZIndex={config.baseZIndex}
            />
        </>
    );
};

export default NotificationsCenter;
