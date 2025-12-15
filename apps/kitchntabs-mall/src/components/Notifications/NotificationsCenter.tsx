import Button from '@mui/material/Button';
import Badge from '@mui/material/Badge';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Portal from '@mui/material/Portal';
import CircularProgress from '@mui/material/CircularProgress';
import NotificationsNone from '@mui/icons-material/NotificationsNone';
import NotificationsActive from '@mui/icons-material/NotificationsActive';
import CloseIcon from '@mui/icons-material/Close';
import DragIcon from '@mui/icons-material/DragIndicator';
import ClearIcon from '@mui/icons-material/Clear';
import PersonIcon from '@mui/icons-material/Person';
import StoreIcon from '@mui/icons-material/Store';
import RefreshIcon from '@mui/icons-material/Refresh';
import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { useTranslate } from 'react-admin';
import { useMallClientTabsContext, type IMallNotification } from '../../kt-mall';
import { useMallSessionEcho } from '../../contexts/MallSessionEchoContext';

interface ProcessedNotification {
    id: string;
    apiId?: number;
    title: string;
    message: string;
    customer: string;
    store: string;
    status: string;
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

interface DialogNotification extends ProcessedNotification {
    position: { x: number; y: number };
    zIndex: number;
}

// Status translation keys mapping
const STATUS_TRANSLATION_KEYS: Record<string, string> = {
    'CREATED': 'tab.status.created',
    'CONFIRMED': 'tab.status.confirmed',
    'IN_PREPARATION': 'tab.status.in_preparation',
    'PREPARED': 'tab.status.prepared',
    'DELIVERED': 'tab.status.delivered',
    'CLOSED': 'tab.status.closed',
    'CANCELLED': 'tab.status.cancelled'
};

// Fallback status labels (used if translation not available)
const STATUS_LABELS_FALLBACK: Record<string, string> = {
    'CREATED': 'Creado',
    'CONFIRMED': 'Confirmado',
    'IN_PREPARATION': 'En preparación',
    'PREPARED': 'Preparado',
    'DELIVERED': 'Entregado',
    'CLOSED': 'Cerrado',
    'CANCELLED': 'Cancelado'
};

// Get severity based on status
const getStatusSeverity = (status: string): 'info' | 'warning' | 'error' | 'success' => {
    switch (status?.toUpperCase()) {
        case 'CONFIRMED': return 'info';
        case 'IN_PREPARATION': return 'warning';
        case 'PREPARED': 
        case 'DELIVERED': 
        case 'CLOSED': return 'success';
        case 'CANCELLED': return 'error';
        default: return 'info';
    }
};

// Convert API notification to ProcessedNotification
const apiToProcessedNotification = (apiNotif: IMallNotification): ProcessedNotification => {
    const customerInfo = apiNotif.data?.customer_info;
    const customerDisplay = customerInfo?.name 
        ? `${customerInfo.name}${customerInfo.table ? ` - Mesa ${customerInfo.table}` : ''}`
        : apiNotif.data?.formatted_customer_info || '';
    
    return {
        id: `api-${apiNotif.id}`,
        apiId: apiNotif.id,
        title: apiNotif.title || 'Actualización',
        message: apiNotif.message || '',
        customer: customerDisplay,
        store: apiNotif.tenant_name || apiNotif.data?.tenant_name || '',
        status: apiNotif.status || apiNotif.data?.status || '',
        timestamp: apiNotif.created_at,
        isRead: apiNotif.is_read,
        data: apiNotif.data
    };
};

const NotificationsCenter: React.FC = () => {
    // Translation hook
    const translate = useTranslate();
    
    // Helper function to get translated status label
    const getStatusLabel = useCallback((status: string): string => {
        const upperStatus = status?.toUpperCase();
        const translationKey = STATUS_TRANSLATION_KEYS[upperStatus];
        if (translationKey) {
            const translated = translate(translationKey, { _: '' });
            // If translation returns empty or the key itself, use fallback
            if (translated && translated !== translationKey) {
                return translated;
            }
        }
        return STATUS_LABELS_FALLBACK[upperStatus] || status;
    }, [translate]);
    
    // Use MallSessionEchoContext for WebSocket events (specific to mall session channel)
    const { lastEvent, events } = useMallSessionEcho();
    
    // Use the shared context for notifications - no duplicate API calls
    const { 
        notifications: contextNotifications, 
        unreadCount: contextUnreadCount, 
        loading: contextLoading,
        refreshNotifications,
        markAsRead: contextMarkAsRead,
        markAllAsRead: contextMarkAllAsRead,
    } = useMallClientTabsContext();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [toastNotifications, setToastNotifications] = useState<ToastNotification[]>([]);
    const [dialogNotifications, setDialogNotifications] = useState<DialogNotification[]>([]);
    const [nextZIndex, setNextZIndex] = useState(100000);
    const [realTimeNotifications, setRealTimeNotifications] = useState<ProcessedNotification[]>([]);
    const [realTimeUnreadCount, setRealTimeUnreadCount] = useState(0);
    
    // Track processed event IDs to avoid duplicates
    const processedEventIds = useRef<Set<string>>(new Set());

    const open = Boolean(anchorEl);
    
    // Combine context notifications with real-time notifications
    const processedContextNotifications = useMemo(() => {
        return contextNotifications.map(apiToProcessedNotification);
    }, [contextNotifications]);

    // Merge real-time notifications with context notifications, avoiding duplicates
    const allNotifications = useMemo(() => {
        const merged = [...realTimeNotifications];
        
        // Add context notifications that don't have a real-time duplicate
        processedContextNotifications.forEach(ctxNotif => {
            const hasDuplicate = realTimeNotifications.some(rt => 
                rt.data?.tenant_tab_id === ctxNotif.data?.tenant_tab_id && 
                rt.data?.status === ctxNotif.data?.status
            );
            if (!hasDuplicate) {
                merged.push(ctxNotif);
            }
        });
        
        // Sort by timestamp descending
        return merged.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
    }, [realTimeNotifications, processedContextNotifications]);

    // Total unread = context unread + real-time unread
    const unreadCount = contextUnreadCount + realTimeUnreadCount;
    const loading = contextLoading;

    // Handle real-time WebSocket events - only for toast notifications
    useEffect(() => {
        if (!lastEvent) return;

        // The event structure from console log shows:
        // lastEvent.data = { status, tenant_name, tenant_id, products, etc. }
        // lastEvent.notificationPayload = { class, title, message, notificationPayload: {...} }
        // lastEvent.type = 'mall_order_status_update'
        
        const eventData = lastEvent.data || {};
        const notificationPayload = lastEvent.notificationPayload;
        
        // Check for mall order status update events - check multiple possible locations
        const isMallOrderUpdate = 
            lastEvent.type === 'mall_order_status_update' ||
            eventData?.type === 'mall_order_status_update' ||
            eventData?.event === 'mall_order_status_update' ||
            notificationPayload?.class === 'MallSessionOrderStatusNotification';

        // Check for urgency alerts (assistance requests)
        const isUrgencyAlert = lastEvent.type === 'urgency-alert';

        if (isMallOrderUpdate) {
            // Extract payload following the same pattern as MallSessionEchoContext
            // The data can be in different locations depending on the event source:
            // 1. lastEvent.data (direct from WebSocket)
            // 2. lastEvent.notificationPayload.notificationPayload (nested Laravel notification)
            // 3. eventData.data (another nesting level)
            const nestedPayload = notificationPayload?.notificationPayload || eventData?.data || eventData;
            const payload = nestedPayload?.tenant_tab_id ? nestedPayload : eventData;
            
            // Get status - check for 'new' field (status change event) or 'status' field
            const status = payload?.new || payload?.status || eventData?.new || eventData?.status || 'UPDATED';
            
            // Create unique event ID to prevent duplicates
            const eventId = `${payload?.tenant_tab_id}-${status}-${payload?.timestamp || Date.now()}`;
            
            if (processedEventIds.current.has(eventId)) {
                return;
            }
            processedEventIds.current.add(eventId);
            
            // Clean up old event IDs (keep last 100)
            if (processedEventIds.current.size > 100) {
                const idsArray = Array.from(processedEventIds.current);
                processedEventIds.current = new Set(idsArray.slice(-50));
            }

            const tenantName = payload?.tenant_name || eventData?.tenant_name || translate('notifications.default_store', { _: 'Restaurante' });
            const statusLabel = getStatusLabel(status);
            const customerInfo = payload?.customer_info || eventData?.customer_info;
            
            // Use title/message from notificationPayload if available, otherwise build translated version
            const title = notificationPayload?.title || translate('notifications.order_status_title', { 
                status: statusLabel, 
                _: `Orden ${statusLabel}` 
            });
            const message = notificationPayload?.message || translate('notifications.order_status_message', { 
                store: tenantName, 
                status: statusLabel,
                _: `${tenantName} ha actualizado tu orden a: ${statusLabel}` 
            });
            
            const processedNotification: ProcessedNotification = {
                id: `rt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                title: title,
                message: message,
                customer: customerInfo?.name 
                    ? `${customerInfo.name}${customerInfo.table ? ` - ${translate('notifications.table', { _: 'Mesa' })} ${customerInfo.table}` : ''}`
                    : payload?.formatted_customer_info || '',
                store: tenantName,
                status: status,
                timestamp: payload?.timestamp || new Date().toISOString(),
                isRead: false,
                data: payload
            };

            // Add to real-time notifications list
            setRealTimeNotifications(prev => [processedNotification, ...prev.slice(0, 49)]);
            
            // Increment real-time unread count
            setRealTimeUnreadCount(prev => prev + 1);

            // Show toast notification
            const toastId = `toast-${processedNotification.id}`;
            setToastNotifications(prev => [...prev, {
                id: toastId,
                title: title,
                message: `${tenantName}: ${statusLabel}`,
                severity: getStatusSeverity(status)
            }]);
        }

        if (isUrgencyAlert) {
            const notification = lastEvent?.notificationPayload;
            const processedNotification: ProcessedNotification = {
                id: `${Date.now()}-${Math.random()}`,
                title: notification?.title || 'Alerta',
                message: notification?.message || '',
                customer: notification?.customer_info?.name
                    ? `${notification.customer_info.name} - Mesa ${notification.customer_info.table}`
                    : '',
                store: notification?.store_info?.name || '',
                status: 'URGENT',
                timestamp: new Date().toISOString(),
                isRead: false,
                data: notification
            };
            setRealTimeNotifications(prev => [processedNotification, ...prev.slice(0, 49)]);
            setRealTimeUnreadCount(prev => prev + 1);
            setDialogNotifications(prev => {
                const dialogCount = prev.length;
                const baseX = 20;
                const baseY = window.innerHeight - 250;
                const offsetY = dialogCount * -220;
                const dialogNotification: DialogNotification = {
                    ...processedNotification,
                    position: { x: baseX, y: baseY + offsetY },
                    zIndex: 100000 + dialogCount + 1
                };
                return [...prev, dialogNotification];
            });
            setNextZIndex(prev => prev + 1);
            const toastId = `toast-${processedNotification.id}`;
            setToastNotifications(prev => [...prev, {
                id: toastId,
                title: processedNotification.title,
                message: `${processedNotification.customer} - ${processedNotification.store}`,
                severity: 'warning'
            }]);
        }
    }, [lastEvent]);

    const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
        // Don't auto-fetch on open - only fetch if user clicks refresh
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const markAsRead = async (notificationId: string) => {
        // Update local real-time notifications state
        if (notificationId.startsWith('rt-')) {
            setRealTimeNotifications(prev => 
                prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
            );
            setRealTimeUnreadCount(prev => Math.max(0, prev - 1));
        }

        // If it's an API notification, use context function
        if (notificationId.startsWith('api-')) {
            const apiId = parseInt(notificationId.replace('api-', ''));
            if (!isNaN(apiId)) {
                await contextMarkAsRead(apiId);
            }
        }
    };

    const markAllAsRead = async () => {
        // Update local real-time notifications state
        setRealTimeNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setRealTimeUnreadCount(0);
        
        // Mark all as read via context
        await contextMarkAllAsRead();
    };

    const removeNotification = (notificationId: string) => {
        if (notificationId.startsWith('rt-')) {
            const notification = realTimeNotifications.find(n => n.id === notificationId);
            if (notification && !notification.isRead) {
                setRealTimeUnreadCount(prev => Math.max(0, prev - 1));
            }
            setRealTimeNotifications(prev => prev.filter(n => n.id !== notificationId));
        }
        // API notifications are managed by context
    };

    const clearAllNotifications = () => {
        setRealTimeNotifications([]);
        setRealTimeUnreadCount(0);
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

    const handleDialogClose = (notificationId: string) => {
        setDialogNotifications(prev => prev.filter(d => d.id !== notificationId));
        markAsRead(notificationId);
    };

    const handleDialogAcknowledge = (notificationId: string) => {
        markAsRead(notificationId);
        setDialogNotifications(prev => prev.filter(d => d.id !== notificationId));
    };

    const bringToFront = useCallback((notificationId: string) => {
        setDialogNotifications(prev => {
            const maxZ = Math.max(...prev.map(p => p.zIndex), 100000);
            return prev.map(d => 
                d.id === notificationId 
                    ? { ...d, zIndex: maxZ + 1 }
                    : d
            );
        });
    }, []);

    const updateDialogPosition = useCallback((notificationId: string, newPosition: { x: number; y: number }) => {
        setDialogNotifications(prev =>
            prev.map(d =>
                d.id === notificationId
                    ? { ...d, position: newPosition }
                    : d
            )
        );
    }, []);

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
                        width: 380,
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Notificaciones {unreadCount > 0 && `(${unreadCount})`}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton size="small" onClick={() => refreshNotifications()} disabled={loading} title="Actualizar">
                            {loading ? <CircularProgress size={16} /> : <RefreshIcon fontSize="small" />}
                        </IconButton>
                        {allNotifications.length > 0 && (
                            <>
                                {unreadCount > 0 && (
                                    <Button size="small" onClick={markAllAsRead} sx={{ mx: 0.5 }}>
                                        Marcar todas
                                    </Button>
                                )}
                                <IconButton size="small" onClick={clearAllNotifications} title="Limpiar">
                                    <ClearIcon fontSize="small" />
                                </IconButton>
                            </>
                        )}
                    </Box>
                </Box>
                <Divider />
                {loading && allNotifications.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress size={24} />
                    </Box>
                ) : allNotifications.length === 0 ? (
                    <MenuItem disabled>
                        <Typography color="text.secondary">No hay notificaciones</Typography>
                    </MenuItem>
                ) : (
                    allNotifications.map((notification) => (
                        <MenuItem
                            key={notification.id}
                            onClick={() => markAsRead(notification.id)}
                            sx={{
                                backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                                borderLeft: notification.isRead 
                                    ? 'none' 
                                    : `4px solid ${
                                        notification.status === 'CANCELLED' ? '#f44336' :
                                        notification.status === 'PREPARED' || notification.status === 'DELIVERED' ? '#4caf50' :
                                        notification.status === 'IN_PREPARATION' ? '#ff9800' :
                                        '#2196f3'
                                    }`,
                                whiteSpace: 'normal',
                                alignItems: 'flex-start',
                                py: 1.5
                            }}
                        >
                            <Box sx={{ width: '100%' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: notification.isRead ? 'normal' : 'bold', flex: 1 }}>
                                        {notification.title}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
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
                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
                                    {notification.status && (
                                        <Chip 
                                            label={getStatusLabel(notification.status)} 
                                            size="small" 
                                            color={
                                                notification.status === 'CANCELLED' ? 'error' :
                                                notification.status === 'PREPARED' || notification.status === 'DELIVERED' || notification.status === 'CLOSED' ? 'success' :
                                                notification.status === 'IN_PREPARATION' ? 'warning' :
                                                notification.status === 'CONFIRMED' ? 'info' :
                                                'default'
                                            }
                                        />
                                    )}
                                    {notification.store && (
                                        <Chip 
                                            icon={<StoreIcon sx={{ fontSize: '14px !important' }} />}
                                            label={notification.store} 
                                            size="small" 
                                            variant="outlined"
                                            color="secondary"
                                        />
                                    )}
                                    {notification.customer && (
                                        <Chip 
                                            icon={<PersonIcon sx={{ fontSize: '14px !important' }} />}
                                            label={notification.customer} 
                                            size="small" 
                                            variant="outlined"
                                            color="primary"
                                        />
                                    )}
                                </Box>
                            </Box>
                        </MenuItem>
                    ))
                )}
            </Menu>

            {/* Stackable Draggable Notification Dialogs */}
            {dialogNotifications.map((dialogNotification) => (
                <DraggableNotificationDialog
                    key={dialogNotification.id}
                    notification={dialogNotification}
                    onClose={() => handleDialogClose(dialogNotification.id)}
                    onAcknowledge={() => handleDialogAcknowledge(dialogNotification.id)}
                    onFocus={() => bringToFront(dialogNotification.id)}
                    onPositionChange={(newPosition) => updateDialogPosition(dialogNotification.id, newPosition)}
                    formatTimeAgo={formatTimeAgo}
                />
            ))}

            {/* Toast Notifications Stack */}
            <Stack 
                spacing={1} 
                sx={{ 
                    position: 'fixed', 
                    top: 16, 
                    right: 16, 
                    zIndex: 100000,
                    maxWidth: 400
                }}
            >
                {toastNotifications.map((toast) => (
                    <Snackbar
                        key={toast.id}
                        open={true}
                        //autoHideDuration={8000}
                        onClose={() => handleToastClose(toast.id)}
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        sx={{ position: 'relative', zIndex: 100000 }}
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

// Draggable Dialog Component
interface DraggableNotificationDialogProps {
    notification: DialogNotification;
    onClose: () => void;
    onAcknowledge: () => void;
    onFocus: () => void;
    onPositionChange: (position: { x: number; y: number }) => void;
    formatTimeAgo: (timestamp: string) => string;
}

const DraggableNotificationDialog: React.FC<DraggableNotificationDialogProps> = ({
    notification,
    onClose,
    onAcknowledge,
    onFocus,
    onPositionChange,
    formatTimeAgo
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.drag-handle')) {
            e.preventDefault();
            onFocus();
            setIsDragging(true);
            setDragOffset({
                x: e.clientX - notification.position.x,
                y: e.clientY - notification.position.y
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
                            boxShadow: '0 12px 40px rgba(0,0,0,0.3)'
                        }
                    }}
                >
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
                            userSelect: 'none'
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
                    <Box sx={{ p: 2 }}>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            {notification.message}
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            {notification.customer && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PersonIcon color="primary" />
                                    <Typography variant="body2" color="text.secondary">
                                        Cliente:
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
                                    <StoreIcon color="secondary" />
                                    <Typography variant="body2" color="text.secondary">
                                        Tienda:
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
                                <Typography variant="caption" color="text.secondary">
                                    Recibido: {formatTimeAgo(notification.timestamp)}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
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
                            Cerrar
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
                            Entendido
                        </Button>
                    </Box>
                </Paper>
            </div>
        </Portal>
    );
};

export default NotificationsCenter;
