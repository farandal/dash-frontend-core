import React from 'react';
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import { useTranslate, useRecordContext } from 'react-admin';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import { useMallClientTabsContext, IMallNotification } from './MallClientTabsContext';

/**
 * Props for MallSessionOrderNotifications
 * Extends IDashAutoAdminCustomFieldComponent for schema compatibility
 * Also supports direct tabId prop for backward compatibility
 */
interface MallSessionOrderNotificationsProps extends Partial<IDashAutoAdminCustomFieldComponent> {
    tabId?: string | number;
}

/**
 * MallSessionOrderNotifications - Displays notification history for a mall order
 * Uses MallClientTabsContext to get notifications without making direct API calls
 * 
 * Can be used:
 * 1. In a schema (receives IDashAutoAdminCustomFieldComponent props, gets tabId from record context)
 * 2. Directly with tabId prop (backward compatibility)
 */
const MallSessionOrderNotifications: React.FC<MallSessionOrderNotificationsProps> = (props) => {
    const { tabId: propTabId } = props;
    const record = useRecordContext();
    const { notifications, loading, error } = useMallClientTabsContext();
    const translate = useTranslate();

    // Get tabId from prop or record context
    const tabId = propTabId ?? record?.id;

    // Filter notifications for this specific tab
    const tabNotifications = notifications.filter((n: IMallNotification) => {
        const data = n.data;
        // Compare as strings since IDs are now UUIDs
        return String(data?.master_tab_id) === String(tabId) || 
               String(data?.tenant_tab_id) === String(tabId) ||
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
        <Box className="kt-mall-session-order-notifications">
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
