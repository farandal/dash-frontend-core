import React from 'react';
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import { useTranslate } from 'react-admin';
import { useMallClientTabsContext, IMallNotification } from './MallClientTabsContext';

interface MallSessionOrderNotificationsProps {
    tabId: string | number;
}

/**
 * MallSessionOrderNotifications - Displays notification history for a mall order
 * Uses MallClientTabsContext to get notifications without making direct API calls
 */
const MallSessionOrderNotifications: React.FC<MallSessionOrderNotificationsProps> = ({ 
    tabId
}) => {
    const { notifications, loading, error } = useMallClientTabsContext();
    const translate = useTranslate();

    // Filter notifications for this specific tab
    const tabNotifications = notifications.filter((n: IMallNotification) => {
        const data = n.data;
        return data?.master_tab_id === Number(tabId) || 
               data?.tenant_tab_id === Number(tabId) ||
               n.reference_id === String(tabId);
    });

    const getStatusColor = (status: string | null) => {
        if (!status) return 'primary.main';
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

    // Show loading only on initial load
    if (loading && tabNotifications.length === 0) {
        return (
            <Box sx={{ width: '100%', mt: 2, mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    {translate('common.loading', { _: 'Cargando...' })}
                </Typography>
                <LinearProgress />
            </Box>
        );
    }

    return (
        <Box>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Typography variant="h6" gutterBottom>
                {translate('mall.session.notifications', { _: 'Notificaciones' })}
            </Typography>

            {tabNotifications.length > 0 ? (
                <Box>
                    {tabNotifications.slice(0, 10).map((notification: IMallNotification) => (
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
                    {translate('mall.session.no_notifications', { _: 'No hay notificaciones' })}
                </Typography>
            )}
        </Box>
    );
};

export default MallSessionOrderNotifications;
