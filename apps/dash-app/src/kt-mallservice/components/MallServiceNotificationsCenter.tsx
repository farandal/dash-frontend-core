/**
 * MallServiceNotificationsCenter
 * 
 * A notifications center component for Mall Service that displays order status updates
 * with visual cards similar to the self-service NotificationsCenter.
 * Uses MallServiceEchoContext to listen for WebSocket events.
 */
import { 
    Badge, 
    Menu, 
    MenuItem, 
    Typography, 
    Divider, 
    Box, 
    IconButton,
    Chip,
    Snackbar,
    Alert,
    Stack,
    LinearProgress,
} from '@mui/material';
import { 
    NotificationsNone, 
    NotificationsActive, 
    Close as CloseIcon,
    Clear as ClearIcon,
    Restaurant as RestaurantIcon,
    CheckCircle as CheckCircleIcon,
    LocalDining as LocalDiningIcon,
    DeliveryDining as DeliveryIcon,
} from '@mui/icons-material';
import React, { useEffect, useState, useRef } from 'react';
import { useMallServiceEcho } from '../contexts/MallServiceEchoContext';

// Status labels for display
const STATUS_LABELS: Record<string, string> = {
    'CREATED': 'Creada',
    'CONFIRMED': 'Confirmada',
    'IN_PREPARATION': 'En Preparación',
    'PREPARED': 'Lista',
    'DELIVERED': 'Entregada',
    'CLOSED': 'Cerrada',
    'CANCELLED': 'Cancelada',
};

// Chip colors (uses 'default')
const CHIP_COLORS: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
    'CREATED': 'default',
    'CONFIRMED': 'info',
    'IN_PREPARATION': 'warning',
    'PREPARED': 'success',
    'DELIVERED': 'success',
    'CLOSED': 'default',
    'CANCELLED': 'error',
};

// LinearProgress colors (uses 'inherit')
const PROGRESS_COLORS: Record<string, 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit'> = {
    'CREATED': 'inherit',
    'CONFIRMED': 'info',
    'IN_PREPARATION': 'warning',
    'PREPARED': 'success',
    'DELIVERED': 'success',
    'CLOSED': 'inherit',
    'CANCELLED': 'error',
};

// Progress values for each status
const STATUS_PROGRESS: Record<string, number> = {
    'CREATED': 10,
    'CONFIRMED': 25,
    'IN_PREPARATION': 50,
    'PREPARED': 80,
    'DELIVERED': 100,
    'CLOSED': 100,
    'CANCELLED': 0,
};

interface ProcessedNotification {
    id: string;
    title: string;
    message: string;
    tenantName: string;
    status: string;
    progress: number;
    timestamp: string;
    isRead: boolean;
    data: any;
}

interface ToastNotification {
    id: string;
    title: string;
    message: string;
    severity: 'info' | 'warning' | 'error' | 'success';
}

const MallServiceNotificationsCenter: React.FC = () => {
    const { lastEvent } = useMallServiceEcho();
    const lastProcessedEventId = useRef<string | null>(null);

    const [notifications, setNotifications] = useState<ProcessedNotification[]>([]);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [toastNotifications, setToastNotifications] = useState<ToastNotification[]>([]);

    const open = Boolean(anchorEl);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        if (!lastEvent) return;
        
        // Generate a unique ID for the event
        const eventId = lastEvent.id || `${lastEvent.event}-${lastEvent.timestamp || Date.now()}`;
        
        if (lastProcessedEventId.current === eventId) {
            return;
        }
        
        lastProcessedEventId.current = eventId;

        if (lastEvent.event === 'mall_order_status_update') {
            // Handle the nested payload structure
            const rawPayload = lastEvent.notificationPayload || lastEvent.data || lastEvent;
            const payload = rawPayload?.notificationPayload || rawPayload;
            
            const status = payload?.status || 'CREATED';
            const tenantName = payload?.tenant_name || 'Restaurante';
            const progress = payload?.progress || STATUS_PROGRESS[status] || 0;
            const statusLabel = STATUS_LABELS[status] || status;
            
            // Build notification title and message
            let title = `${tenantName} - ${statusLabel}`;
            let message = '';
            
            if (status === 'CONFIRMED') {
                message = 'Tu orden ha sido confirmada y comenzará a prepararse pronto.';
            } else if (status === 'IN_PREPARATION') {
                message = 'Tu orden está siendo preparada ahora.';
            } else if (status === 'PREPARED') {
                message = '¡Tu orden está lista para recoger!';
            } else if (status === 'DELIVERED') {
                message = 'Tu orden ha sido entregada.';
            } else if (status === 'CANCELLED') {
                message = 'Tu orden ha sido cancelada.';
            } else {
                message = `Estado: ${statusLabel}`;
            }

            const processedNotification: ProcessedNotification = {
                id: `${Date.now()}-${Math.random()}`,
                title,
                message,
                tenantName,
                status,
                progress,
                timestamp: new Date().toISOString(),
                isRead: false,
                data: payload,
            };

            // Add to notifications list
            setNotifications(prev => [processedNotification, ...prev.slice(0, 19)]);

            // Show toast notification
            const toastId = `toast-${processedNotification.id}`;
            const severity = status === 'PREPARED' ? 'success' :
                           status === 'CANCELLED' ? 'error' :
                           status === 'IN_PREPARATION' ? 'warning' : 'info';
            
            setToastNotifications(prev => [...prev, {
                id: toastId,
                title,
                message,
                severity,
            }]);
        }
    }, [lastEvent]);

    const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const markAsRead = (notificationId: string) => {
        setNotifications(prev => 
            prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const removeNotification = (notificationId: string) => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
    };

    const clearAllNotifications = () => {
        setNotifications([]);
        handleClose();
    };

    const handleToastClose = (toastId: string) => {
        setToastNotifications(prev => prev.filter(t => t.id !== toastId));
    };

    const formatTimeAgo = (timestamp: string) => {
        const now = new Date();
        const notificationTime = new Date(timestamp);
        const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));
        if (diffInMinutes < 1) return 'Ahora';
        if (diffInMinutes < 60) return `${diffInMinutes}m`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
        return `${Math.floor(diffInMinutes / 1440)}d`;
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return <CheckCircleIcon fontSize="small" />;
            case 'IN_PREPARATION':
                return <LocalDiningIcon fontSize="small" />;
            case 'PREPARED':
                return <RestaurantIcon fontSize="small" />;
            case 'DELIVERED':
                return <DeliveryIcon fontSize="small" />;
            default:
                return <RestaurantIcon fontSize="small" />;
        }
    };

    return (
        <>
            <IconButton
                onClick={handleNotificationClick}
                aria-label="notifications"
                color="inherit"
            >
                <Badge badgeContent={unreadCount} color="error" max={99}>
                    {unreadCount > 0 ? <NotificationsActive /> : <NotificationsNone />}
                </Badge>
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    style: {
                        maxHeight: 480,
                        width: 360,
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Estado de Órdenes</Typography>
                    {notifications.length > 0 && (
                        <Box>
                            {unreadCount > 0 && (
                                <IconButton size="small" onClick={markAllAsRead} title="Marcar todas como leídas">
                                    <CheckCircleIcon fontSize="small" />
                                </IconButton>
                            )}
                            <IconButton size="small" onClick={clearAllNotifications} title="Limpiar todo">
                                <ClearIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    )}
                </Box>
                <Divider />
                {notifications.length === 0 ? (
                    <MenuItem disabled>
                        <Typography color="text.secondary">No hay actualizaciones</Typography>
                    </MenuItem>
                ) : (
                    notifications.map((notification) => (
                        <MenuItem
                            key={notification.id}
                            onClick={() => markAsRead(notification.id)}
                            sx={{
                                backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                                borderLeft: notification.isRead ? 'none' : `4px solid`,
                                borderLeftColor: CHIP_COLORS[notification.status] + '.main',
                                whiteSpace: 'normal',
                                alignItems: 'flex-start',
                                py: 1.5,
                                flexDirection: 'column',
                            }}
                        >
                            <Box sx={{ width: '100%' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {getStatusIcon(notification.status)}
                                        <Typography variant="subtitle2" sx={{ fontWeight: notification.isRead ? 'normal' : 'bold' }}>
                                            {notification.title}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            {formatTimeAgo(notification.timestamp)}
                                        </Typography>
                                        <IconButton 
                                            size="small" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeNotification(notification.id);
                                            }}
                                        >
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    {notification.message}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <Chip 
                                        label={STATUS_LABELS[notification.status] || notification.status}
                                        size="small" 
                                        color={CHIP_COLORS[notification.status]}
                                    />
                                </Box>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={notification.progress} 
                                    sx={{ 
                                        mt: 1, 
                                        height: 6, 
                                        borderRadius: 3,
                                        backgroundColor: 'grey.200',
                                    }} 
                                    color={PROGRESS_COLORS[notification.status]}
                                />
                            </Box>
                        </MenuItem>
                    ))
                )}
            </Menu>

            {/* Toast Notifications Stack */}
            <Stack 
                spacing={1} 
                sx={{ 
                    position: 'fixed', 
                    top: 80, 
                    right: 16, 
                    zIndex: 100000,
                    maxWidth: 400
                }}
            >
                {toastNotifications.map((toast) => (
                    <Snackbar
                        key={toast.id}
                        open={true}
                        autoHideDuration={6000}
                        onClose={() => handleToastClose(toast.id)}
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        sx={{ position: 'relative' }}
                    >
                        <Alert 
                            onClose={() => handleToastClose(toast.id)} 
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
        </>
    );
};

export default MallServiceNotificationsCenter;
