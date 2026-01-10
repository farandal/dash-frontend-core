/**
 * MallServiceHeaderActions
 * 
 * Header actions component for the Mall Service App, including
 * notifications center for order status updates.
 */
import React, { useState, useEffect, PropsWithChildren } from 'react';
import { QueryClientProvider, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDashQueryClient, useI18nBridge } from 'dash-admin';
import { Box, IconButton, Badge, Drawer, Typography } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import { useMallServiceEcho } from '../contexts/MallServiceEchoContext';
import { useTranslate } from 'react-admin';
import { toast } from 'react-toastify';
import { I18nContext } from 'ra-core';
import { useAxios } from 'dash-axios-hook';

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

interface OrderStatusNotification {
    id: string;
    tenantName: string;
    status: string;
    message: string;
    timestamp: string;
    isRead: boolean;
    orderId?: string;
}

const MallServiceHeaderActionsContent: React.FC<PropsWithChildren> = (props) => {
    const translate = useTranslate();
    const axios = useAxios(); // Use dash-axios-hook
    const queryClient = useQueryClient();
    
    // Notification drawer state
    const [isNotificationsDrawerOpen, setIsNotificationsDrawerOpen] = useState(false);

    // Get websocket events and session hash
    const { lastEvent, sessionHash } = useMallServiceEcho();

    // Fetch notifications using React Query
    const { 
        data: notifications = [], 
        isLoading 
    } = useQuery<OrderStatusNotification[]>({
        queryKey: ['mall', 'notifications', sessionHash],
        queryFn: async () => {
            if (!sessionHash) return [];
            try {
                const { data } = await axios.get(`/public/mall/session/${sessionHash}/notifications`);
                if (data && data.notifications) {
                    return data.notifications.map((apiNotif: any) => {
                        const payload = apiNotif.data || {};
                        const tenantName = apiNotif.tenant_name || payload.tenant_name || 'Restaurante';
                        const status = apiNotif.status || payload.status || 'CREATED';
                        const statusLabel = STATUS_LABELS[status] || status;
                        
                        return {
                            id: `api-${apiNotif.id}`,
                            tenantName,
                            status,
                            message: apiNotif.message || `${tenantName}: ${statusLabel}`,
                            timestamp: apiNotif.created_at,
                            isRead: !!apiNotif.is_read,
                            orderId: payload.child_order_id || payload.order_id
                        };
                    });
                }
                return [];
            } catch (error) {
                console.error('Error fetching notifications:', error);
                return [];
            }
        },
        enabled: !!sessionHash,
        staleTime: 10000, // 10 seconds as requested
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    // Handle drawer open - no need to manual fetch, React Query handles it
    const handleOpenDrawer = () => {
        setIsNotificationsDrawerOpen(true);
        // Clear all toast notifications when opening the drawer
        toast.dismiss();
        
        // We could invalidate here if we wanted to force check, but staleTime handles "background" freshness
        // If user wants force refresh, invalidation is the way.
        // For now, let's trust staleTime, or invalidate if drawer opens > 10s later.
        queryClient.invalidateQueries({ queryKey: ['mall', 'notifications', sessionHash] });
    };

    // Handle incoming events
    useEffect(() => {
        if (lastEvent) {
             // Handle the nested payload structure
             const rawPayload = lastEvent.notificationPayload || lastEvent.data || lastEvent;
             const payload = rawPayload?.notificationPayload || rawPayload?.data || rawPayload;
             
             // Check if it's a relevant event
             const isMallOrderUpdate = 
                lastEvent.event === 'mall_order_status_update' ||
                lastEvent.type === 'mall_order_status_update' ||
                payload?.type === 'mall_order_status_update';

            if (isMallOrderUpdate) {
                console.log('🔔 Mall Service: Notification received, invalidating query cache');
                // Invalidate query to re-fetch notifications list
                queryClient.invalidateQueries({ queryKey: ['mall', 'notifications', sessionHash] });
                
                // Show toast for real-time feedback (if not suppressed)
                // Using same logic as before for consistency
                const status = payload?.new || payload?.status || payload?.child_status || 'UPDATED';
                const tenantName = payload?.tenant_name || 'Restaurante';
                const statusLabel = STATUS_LABELS[status] || status;
                
                let toastMessage = '';
                if (status === 'CONFIRMED') {
                    toastMessage = `¡${tenantName} ha confirmado tu orden!`;
                } else if (status === 'IN_PREPARATION') {
                    toastMessage = `¡${tenantName} está preparando tu orden!`;
                } else if (status === 'PREPARED') {
                    toastMessage = `¡Tu orden de ${tenantName} está lista!`;
                } else if (status === 'DELIVERED') {
                    toastMessage = `¡Tu orden de ${tenantName} ha sido entregada!`;
                } else {
                    toastMessage = `${tenantName}: ${statusLabel}`;
                }
                
                // We typically use MallServiceAppHookComponent for global toasts, 
                // but if we want to ensure it appears here too:
                // toast.info(toastMessage);
            }
        }
    }, [lastEvent, queryClient, sessionHash]);

    const handleCloseDrawer = () => {
        setIsNotificationsDrawerOpen(false);
        
        // Optimistically mark all as read in cache? 
        // Or just fire-and-forget API call and let next fetch resolve it?
        // Let's fire-and-forget and maybe invalidate after a delay or optimistic update.
        if (sessionHash) {
            axios.post(`/public/mall/session/${sessionHash}/notifications/mark-read`)
                .then(() => {
                    // Update cache to set all read
                    queryClient.setQueryData(['mall', 'notifications', sessionHash], (old: OrderStatusNotification[] | undefined) => {
                        return old ? old.map(n => ({ ...n, isRead: true })) : [];
                    });
                })
                .catch(console.error);
        }
    };

    const formatTimeAgo = (timestamp: string) => {
        const now = new Date();
        const notificationTime = new Date(timestamp);
        const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));
        if (diffInMinutes < 1) return 'Ahora';
        if (diffInMinutes < 60) return `hace ${diffInMinutes}m`;
        if (diffInMinutes < 1440) return `hace ${Math.floor(diffInMinutes / 60)}h`;
        return `hace ${Math.floor(diffInMinutes / 1440)}d`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return '#2196f3';
            case 'IN_PREPARATION': return '#ff9800';
            case 'PREPARED': return '#4caf50';
            case 'DELIVERED': return '#4caf50';
            case 'CANCELLED': return '#f44336';
            default: return '#9e9e9e';
        }
    };

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: '100%', gap: 1 }}>
                {/* Notifications Button */}
                <IconButton 
                    onClick={handleOpenDrawer}
                    color="inherit"
                    size="large"
                    title={translate('mallservice.notifications.title', { _: 'Estado de tus órdenes' })}
                >
                    <Badge 
                        badgeContent={unreadCount} 
                        color="error" 
                        invisible={unreadCount === 0}
                    >
                        <NotificationsIcon />
                    </Badge>
                </IconButton>
            </Box>

            {/* Notifications Drawer */}
            <Drawer
                anchor="right"
                open={isNotificationsDrawerOpen}
                onClose={handleCloseDrawer}
            >
                <Box sx={{ width: 320, maxWidth: '90vw', height: '100%', p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Estado de tus órdenes
                    </Typography>
                    
                    {isLoading ? (
                         <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                            Cargando...
                        </Typography>
                    ) : notifications.length === 0 ? (
                        <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                            No hay actualizaciones todavía
                        </Typography>
                    ) : (
                        notifications.map((notification) => (
                            <Box 
                                key={notification.id}
                                sx={{ 
                                    p: 2, 
                                    mb: 1, 
                                    borderRadius: 1,
                                    backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                                    borderLeft: `4px solid ${getStatusColor(notification.status)}`,
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: notification.isRead ? 'normal' : 'bold' }}>
                                        {notification.tenantName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {formatTimeAgo(notification.timestamp)}
                                    </Typography>
                                </Box>
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        color: getStatusColor(notification.status),
                                        fontWeight: 'medium',
                                    }}
                                >
                                    {STATUS_LABELS[notification.status] || notification.status}
                                </Typography>
                                {notification.orderId && (
                                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'text.secondary', fontFamily: 'monospace' }}>
                                        Orden #{notification.orderId.toString().slice(-6).toUpperCase()}
                                    </Typography>
                                )}
                            </Box>
                        ))
                    )}
                </Box>
            </Drawer>
        </>
    );
};

const MallServiceHeaderActions: React.FC<PropsWithChildren> = (props) => {
    const queryClient = useDashQueryClient();
    const { i18nProvider, locale } = useI18nBridge();

    const i18nContext = React.useMemo(() => ({
        translate: (key: string, options?: any) => i18nProvider ? i18nProvider.translate(key, options) : key,
        changeLocale: (locale: string) => i18nProvider ? i18nProvider.changeLocale(locale) : Promise.resolve(),
        getLocale: () => locale,
    }), [i18nProvider, locale]);

    if (!queryClient) {
        if (i18nProvider) {
            return (
                <I18nContext.Provider value={i18nContext}>
                    <MallServiceHeaderActionsContent {...props} />
                </I18nContext.Provider>
            );
        }
        return <MallServiceHeaderActionsContent {...props} />;
    }

    return (
        <QueryClientProvider client={queryClient as any}>
            <I18nContext.Provider value={i18nContext}>
                <MallServiceHeaderActionsContent {...props} />
            </I18nContext.Provider>
        </QueryClientProvider>
    );
};

export default MallServiceHeaderActions;
