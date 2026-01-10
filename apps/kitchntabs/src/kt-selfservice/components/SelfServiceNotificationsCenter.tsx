import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
    Box, Typography, Alert, LinearProgress, List, ListItem, ListItemText, 
    Divider, Chip, IconButton, Button, Tooltip 
} from '@mui/material';
import { useTranslate } from 'react-admin';
import { useAxios } from 'dash-axios-hook';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import CheckIcon from '@mui/icons-material/Check';

export interface ISelfServiceNotification {
    id: number;
    title: string;
    message: string;
    type: string;
    created_at: string;
    is_read: boolean;
    data?: any;
}

interface SelfServiceNotificationsCenterProps {
    sessionHash: string;
    onNotificationsRead?: () => void;
}

const SelfServiceNotificationsCenter: React.FC<SelfServiceNotificationsCenterProps> = ({ 
    sessionHash, 
    onNotificationsRead 
}) => {
    const translate = useTranslate();
    const axios = useAxios();
    const queryClient = useQueryClient();

    const { 
        data: notifications = [], 
        isLoading, 
        isRefetching,
        error: queryError 
    } = useQuery<ISelfServiceNotification[]>({
        queryKey: ['selfservice', 'notifications', sessionHash],
        queryFn: async () => {
            if (!sessionHash) return [];
            const response = await axios.get(`/public/selfservice/${sessionHash}/notifications`);
            return response.data?.notifications || [];
        },
        enabled: !!sessionHash,
        staleTime: 1000 * 10, // 10 seconds
    });

    const loading = isLoading && !isRefetching;
    const error = queryError ? 'Failed to load notifications' : null;

    // Mark all notifications as read
    const handleMarkAllAsRead = async () => {
        try {
            await axios.post(`/public/selfservice/${sessionHash}/notifications/read`, {
                mark_all: true
            });
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ['selfservice', 'notifications', sessionHash] });
            onNotificationsRead?.();
        } catch (err) {
            console.error('Failed to mark notifications as read', err);
        }
    };

    // Mark single notification as read
    const handleMarkAsRead = async (notificationId: number) => {
        try {
            await axios.post(`/public/selfservice/${sessionHash}/notifications/read`, {
                notification_ids: [notificationId]
            });
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ['selfservice', 'notifications', sessionHash] });
            onNotificationsRead?.();
        } catch (err) {
            console.error('Failed to mark notification as read', err);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return <CheckCircleIcon fontSize="small" color="success" />;
            case 'IN_PREPARATION': return <RestaurantIcon fontSize="small" color="warning" />;
            case 'PREPARED': return <CheckIcon fontSize="small" color="info" />;
            case 'DELIVERED': return <LocalShippingIcon fontSize="small" color="primary" />;
            default: return null;
        }
    };

    const getStatusColor = (type: string, data?: any) => {
        const status = data?.status;
        switch (status) {
            case 'CREATED': return 'info.main';
            case 'CONFIRMED': return 'success.main';
            case 'IN_PREPARATION': return 'warning.main';
            case 'PREPARED': return 'secondary.main';
            case 'DELIVERED': return 'primary.main';
            case 'CANCELLED': return 'error.main';
            default: return 'grey.500';
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    if (loading && notifications.length === 0) {
        return (
            <Box p={2}>
                <LinearProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', height: '100%', bgcolor: 'background.paper', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{ 
                p: 2, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                borderBottom: 1, 
                borderColor: 'divider',
                flexShrink: 0
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <NotificationsActiveIcon color="action" sx={{ mr: 1 }} />
                    <Typography variant="h6">
                        {translate('selfservice.notifications.title', { _: 'Notificaciones' })}
                    </Typography>
                    {unreadCount > 0 && (
                        <Chip 
                            label={unreadCount} 
                            size="small" 
                            color="error" 
                            sx={{ ml: 1 }} 
                        />
                    )}
                </Box>
                {unreadCount > 0 && (
                    <Tooltip title={translate('selfservice.notifications.mark_all_read', { _: 'Marcar todo como leído' })}>
                        <IconButton onClick={handleMarkAllAsRead} size="small">
                            <DoneAllIcon />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>
            
            {error && (
                <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
            )}

            {/* Notifications List */}
            <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
                {notifications.length > 0 ? (
                    notifications.map((notification, index) => (
                        <React.Fragment key={notification.id}>
                            <ListItem 
                                alignItems="flex-start" 
                                sx={{ 
                                    bgcolor: notification.is_read ? 'transparent' : 'action.hover',
                                    borderLeft: 4,
                                    borderColor: getStatusColor(notification.type, notification.data),
                                    py: 1.5,
                                    cursor: !notification.is_read ? 'pointer' : 'default'
                                }}
                                onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                            >
                                <ListItemText
                                    secondaryTypographyProps={{ component: 'div' }}
                                    primary={
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Box display="flex" alignItems="center" gap={1}>
                                                {getStatusIcon(notification.data?.status)}
                                                <Typography variant="subtitle2" fontWeight={notification.is_read ? 'normal' : 'bold'}>
                                                    {notification.data?.status_localized || notification.title}
                                                </Typography>
                                            </Box>
                                            <Typography variant="caption" color="text.secondary">
                                                {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Typography>
                                        </Box>
                                    }
                                    secondary={
                                        <Box mt={0.5}>
                                            <Typography
                                                component="span"
                                                variant="body2"
                                                color="text.primary"
                                            >
                                                {notification.message}
                                            </Typography>
                                            {notification.data?.products && notification.data.products.length > 0 && (
                                                <Box mt={1}>
                                                    {notification.data.products.slice(0, 2).map((product: any, i: number) => (
                                                        <Chip 
                                                            key={i}
                                                            label={`${product.quantity}x ${product.product_name}`}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{ mr: 0.5, mb: 0.5 }}
                                                        />
                                                    ))}
                                                    {notification.data.products.length > 2 && (
                                                        <Chip 
                                                            label={`+${notification.data.products.length - 2} más`}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{ mb: 0.5 }}
                                                        />
                                                    )}
                                                </Box>
                                            )}
                                        </Box>
                                    }
                                />
                            </ListItem>
                            {index < notifications.length - 1 && <Divider component="li" />}
                        </React.Fragment>
                    ))
                ) : (
                    <Box p={4} textAlign="center">
                        <NotificationsActiveIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="body1" color="text.secondary">
                            {translate('selfservice.notifications.empty', { _: 'No tienes notificaciones recientes.' })}
                        </Typography>
                        <Typography variant="body2" color="text.disabled" mt={1}>
                            {translate('selfservice.notifications.empty_hint', { _: 'Las actualizaciones de tu pedido aparecerán aquí.' })}
                        </Typography>
                    </Box>
                )}
            </List>
        </Box>
    );
};

export default SelfServiceNotificationsCenter;
