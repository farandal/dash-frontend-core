import { 
    Button, 
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
import React, { useContext, useCallback, useEffect, useState } from 'react';
import LaravelEchoContext, { ILaravelEchoContext } from "dash-admin/src/contexts/com/LaravelEchoContext";

interface ProcessedNotification {
    id: string;
    title: string;
    message: string;
    customer: string;
    store: string;
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

const NotificationsCenter: React.FC = () => {
    const { events, lastEvent } = useContext<ILaravelEchoContext>(LaravelEchoContext);

    const [notifications, setNotifications] = useState<ProcessedNotification[]>([]);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [toastNotifications, setToastNotifications] = useState<ToastNotification[]>([]);
    const [dialogNotifications, setDialogNotifications] = useState<DialogNotification[]>([]);
    const [nextZIndex, setNextZIndex] = useState(100000);

    const open = Boolean(anchorEl);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        if (lastEvent && lastEvent.type === 'urgency-alert') {
            const notification = lastEvent?.notificationPayload;
            const processedNotification: ProcessedNotification = {
                id: `${Date.now()}-${Math.random()}`,
                title: notification.title || 'Alerta',
                message: notification.message || '',
                customer: notification.customer_info?.name
                    ? `${notification.customer_info.name} - Mesa ${notification.customer_info.table}`
                    : '',
                store: notification.store_info?.name || '',
                timestamp: new Date().toISOString(),
                isRead: false,
                data: notification
            };
            setNotifications(prev => [processedNotification, ...prev.slice(0, 49)]);
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
                className='dash-icon-button-color dash-icon-button-bg'
                //color="inherit"
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
                    <Typography variant="h6">Notificaciones</Typography>
                    {notifications.length > 0 && (
                        <Box>
                            {unreadCount > 0 && (
                                <Button size="small" onClick={markAllAsRead} sx={{ mr: 1 }}>
                                    Marcar todas
                                </Button>
                            )}
                            <IconButton size="small" onClick={clearAllNotifications}>
                                <ClearIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    )}
                </Box>
                <Divider />
                {notifications.length === 0 ? (
                    <MenuItem disabled>
                        <Typography color="text.secondary">No hay notificaciones</Typography>
                    </MenuItem>
                ) : (
                    notifications.map((notification) => (
                        <MenuItem
                            key={notification.id}
                            onClick={() => markAsRead(notification.id)}
                            sx={{
                                backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                                borderLeft: notification.isRead ? 'none' : '4px solid #ff9800',
                                whiteSpace: 'normal',
                                alignItems: 'flex-start',
                                py: 1.5
                            }}
                        >
                            <Box sx={{ width: '100%' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: notification.isRead ? 'normal' : 'bold' }}>
                                        {notification.title}
                                    </Typography>
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
                        autoHideDuration={8000}
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
