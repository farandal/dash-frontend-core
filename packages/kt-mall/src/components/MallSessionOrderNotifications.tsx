import React, { useEffect, useState, useContext } from 'react';
import { Box, Typography, Alert, LinearProgress } from "@mui/material";
import { useAxios } from "dash-axios-hook";
import { useTranslate } from 'react-admin';
import LaravelEchoContext, { ILaravelEchoContext } from 'dash-admin/src/contexts/com/LaravelEchoContext';

interface MallSessionNotification {
    id: number;
    title: string;
    message: string;
    status: string;
    created_at: string;
    data: any;
}

interface MallSessionOrderNotificationsProps {
    sessionHash: string | null;
    tabId: string | number;
    notifications?: MallSessionNotification[]; // Add prop for passed notifications
    loading?: boolean; // Add prop for loading state
}

const MallSessionOrderNotifications: React.FC<MallSessionOrderNotificationsProps> = ({ 
    sessionHash, 
    tabId,
    notifications: propNotifications, // Renamed to avoid conflict
    loading: propLoading
}) => {
    const [notifications, setNotifications] = useState<MallSessionNotification[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const laravelEchoContext = useContext<ILaravelEchoContext>(LaravelEchoContext);
    const axios = useAxios();
    const translate = useTranslate();

    const fetchNotifications = async () => {
        // Skip fetching if notifications were provided as props
        if (propNotifications !== undefined) return;
        
        if (!sessionHash) return;
        // Check if tabId is defined and not 'undefined'
        if (!tabId || tabId === 'undefined') {
            console.warn('Tab ID is not properly defined, waiting for a valid value');
            setLoading(true);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Always include tab_id in query since it's required
            const url = `/public/mall/session/${sessionHash}/notifications?tab_id=${tabId}`;
                
            const response = await axios.get(url);
            setNotifications(response.data.notifications);
        } catch (err: any) {
            console.error('Error fetching notifications:', err);
            setError(err?.response?.data?.message || 'Unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Use prop notifications if provided
    useEffect(() => {
        if (propNotifications !== undefined) {
            setNotifications(propNotifications);
        }
    }, [propNotifications]);

    // Listen to WebSocket notifications
    useEffect(() => {
        const lastNotification = laravelEchoContext?.lastEvent;
        
        if (lastNotification?.data?.mall_session_hash === sessionHash) {
            const newNotification: MallSessionNotification = {
                id: Date.now(),
                title: lastNotification.notificationPayload?.title || 'Status Update',
                message: lastNotification.notificationPayload?.message || 'Order status updated',
                status: lastNotification.data.status,
                created_at: lastNotification.timestamp,
                data: lastNotification.data
            };
            
            setNotifications(prev => [newNotification, ...prev]);
        }
    }, [laravelEchoContext?.lastEvent, sessionHash]);

    // Initial fetch on load and when tabId changes
    useEffect(() => {
        // Only fetch if notifications weren't provided as props
        if (propNotifications === undefined) {
            fetchNotifications();
        }
    }, [sessionHash, tabId, propNotifications]);

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case 'CANCELLED': 
            case 'NOT_SHIPPED': return 'error.main';
            case 'DELIVERED': 
            case 'SHIPPED': 
            case 'PICKED_UP': 
            case 'CLOSED': 
            case 'RETURNED': return 'success.main';
            case 'IN_PREPARATION': return 'warning.main';
            default: return 'primary.main';
        }
    };

    if (!sessionHash) {
        return (
            <Alert severity="warning">
                {translate('mall.session.no_hash')}
            </Alert>
        );
    }

    // Show loading indicator if tabId is not properly defined
    if (!tabId || tabId === 'undefined') {
        return (
            <Box sx={{ width: '100%', mt: 2, mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    {translate('common.loading')}
                </Typography>
                <LinearProgress />
            </Box>
        );
    }

    // Use propLoading if provided, otherwise use local loading state
    const isLoading = propLoading !== undefined ? propLoading : loading;

    return (
        <Box>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {isLoading && (
                <Box sx={{ mb: 2 }}>
                    <LinearProgress />
                </Box>
            )}

            <Typography variant="h6" gutterBottom>
                {translate('mall.session.notifications')}
            </Typography>

            {notifications.length > 0 ? (
                <Box>
                    {notifications.slice(0, 10).map((notification) => (
                        <Box key={notification.id} sx={{ 
                            p: 2, 
                            mb: 1, 
                            backgroundColor: 'background.paper',
                            borderRadius: 1,
                            borderLeft: 4,
                            borderColor: getStatusColor(notification.status)
                        }}>
                            <Typography variant="subtitle2" fontWeight="medium">
                                {notification.title}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                                {notification.message}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                {new Date(notification.created_at).toLocaleString()}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            ) : (
                <Typography variant="body2" color="text.secondary">
                    {translate('mall.session.no_notifications')}
                </Typography>
            )}
        </Box>
    );
};

export default MallSessionOrderNotifications;
