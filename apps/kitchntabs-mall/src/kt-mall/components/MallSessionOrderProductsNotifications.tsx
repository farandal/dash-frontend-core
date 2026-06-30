import React, { useEffect, useState, useContext } from 'react';
import { Box, Typography, Chip, Alert, Card, CardContent, LinearProgress } from "@mui/material";
import LaravelEchoContext, { ILaravelEchoContext } from 'dash-admin/contexts/com/LaravelEchoContext';
import {useAxios} from "dash-axios-hook"
import { useTranslate } from 'react-admin';
// Types for mall session notifications
interface MallSessionNotification {
    id: number;
    mall_session_id: number;
    type: string;
    title: string;
    message: string;
    data: {
        event: string;
        tenant_tab_id?: string;
        tenant_id?: number;
        tenant_name?: string;
        status: string;
        timestamp: string;
        customer_info?: {
            name: string;
            table: string;
        };
        products: Array<{
            id: number;
            product_id: number;
            product_name: string;
            quantity: number;
            status: string;
        }>;
        mall_session_hash?: string;
        priority?: string;
        type: string;
    };
    tenant_id?: number;
    tenant_name?: string;
    status: string;
    is_read: boolean;
    reference_type?: string;
    reference_id?: string;
    created_at: string;
    updated_at: string;
}

interface MallSessionNotificationsResponse {
    session_hash: string;
    notifications: MallSessionNotification[];
    unread_count: number;
    total_count: number;
}

interface WebSocketNotification {
    notifiable: any;
    modelInstance: number;
    notificationPayload: {
        class: string;
        title: string;
        message: string;
        notificationPayload: {
            event: string;
            tenant_tab_id?: string;
            tenant_id?: number;
            tenant_name?: string;
            status: string;
            timestamp: string;
            customer_info?: {
                name: string;
                table: string;
            };
            products: Array<{
                id: number;
                product_id: number;
                product_name: string;
                quantity: number;
                status: string;
            }>;
            mall_session_hash?: string;
            priority?: string;
            type: string;
        };
    };
    data: any;
    type: string;
    timestamp: string;
}

interface MallSessionOrderProductsNotificationsProps {
    sessionHash: string | null;
    products: any[];
    tabId: string | number; // Remove optional flag
    onStatusUpdate?: (productStatuses: Record<number, string>, tenantStatuses: Record<number, string>, overallStatus: string) => void;
}
// @deprecated
const MallSessionOrderProductsNotifications: React.FC<MallSessionOrderProductsNotificationsProps> = ({
    sessionHash,
    products,
    onStatusUpdate,
    tabId
}) => {
    const laravelEchoContext = useContext<ILaravelEchoContext>(LaravelEchoContext);
    
    const [notifications, setNotifications] = useState<MallSessionNotification[]>([]);
    const [productStatuses, setProductStatuses] = useState<Record<number, string>>({});
    const [tenantStatuses, setTenantStatuses] = useState<Record<number, string>>({});
    const [overallStatus, setOverallStatus] = useState<string>('CREATED');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const axios = useAxios();
    const translate = useTranslate();
    // Fetch notifications from the API
    const fetchNotifications = async () => {
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
                
            const response = await axios.get<MallSessionNotificationsResponse>(url);
            const data = response.data;
            setNotifications(data.notifications);
            updateProductStatusesFromNotifications(data.notifications);
        } catch (err: any) {
            console.error('Error fetching mall session notifications:', err);
            setError(err?.response?.data?.message || err?.message || 'Unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Update product statuses based on notifications
    const updateProductStatusesFromNotifications = (notifications: MallSessionNotification[]) => {
        const statusMap: Record<number, string> = {};
        const tenantMap: Record<number, string> = {};
        let latestOverallStatus = 'CREATED';
        let latestTimestamp = '';

        // Process notifications in chronological order (newest first in API response)
        notifications.forEach(notification => {
            if (notification.data.products) {
                notification.data.products.forEach(product => {
                    if (product.product_id) {
                        statusMap[product.product_id] = product.status || notification.data.status;
                    }
                });
                
                // Track tenant status if available
                if (notification.data.tenant_id) {
                    tenantMap[notification.data.tenant_id] = notification.data.status;
                }
            }

            // Update overall status from the most recent notification
            if (notification.created_at > latestTimestamp) {
                latestTimestamp = notification.created_at;
                latestOverallStatus = notification.data.status || latestOverallStatus;
            }
        });

        setProductStatuses(statusMap);
        setTenantStatuses(tenantMap);
        setOverallStatus(latestOverallStatus);
        
        // Notify parent component of status updates
        if (onStatusUpdate) {
            onStatusUpdate(statusMap, tenantMap, latestOverallStatus);
        }
    };

    // Process WebSocket notifications
    const processWebSocketNotification = (notification: WebSocketNotification) => {
        if (notification.notificationPayload?.class === 'MallSessionOrderStatusNotification' &&
            notification.data?.type === 'mall_order_status_update' &&
            notification.data?.mall_session_hash === sessionHash) {
            
            // Add to notifications list
            const mallNotification: MallSessionNotification = {
                id: Date.now(),
                mall_session_id: 0,
                type: notification.data.type,
                title: notification.notificationPayload.title,
                message: notification.notificationPayload.message,
                data: notification.data,
                tenant_id: notification.data.tenant_id,
                tenant_name: notification.data.tenant_name,
                status: notification.data.status,
                is_read: false,
                created_at: notification.timestamp,
                updated_at: notification.timestamp
            };

            setNotifications(prev => [mallNotification, ...prev]);
            
            // Update product statuses from WebSocket notification
            if (notification.data.products) {
                const statusMap = { ...productStatuses };
                const tenantMap = { ...tenantStatuses };
                
                notification.data.products.forEach(product => {
                    if (product.product_id) {
                        statusMap[product.product_id] = product.status || notification.data.status;
                    }
                });
                
                // Update tenant status if available
                if (notification.data.tenant_id) {
                    tenantMap[notification.data.tenant_id] = notification.data.status;
                }
                
                setProductStatuses(statusMap);
                setTenantStatuses(tenantMap);
                
                // Update overall status if this is a master notification (no tenant_id)
                if (!notification.data.tenant_id) {
                    setOverallStatus(notification.data.status);
                }
                
                // Notify parent component of status updates
                if (onStatusUpdate) {
                    onStatusUpdate(statusMap, tenantMap, overallStatus);
                }
            }
        }
    };

    // Listen to WebSocket notifications
    useEffect(() => {
        const lastNotification = laravelEchoContext?.lastEvent;
        
        if (lastNotification) {
            processWebSocketNotification(lastNotification);
        }
    }, [laravelEchoContext?.lastEvent, sessionHash]);

    // Initial fetch of notifications when sessionHash or tabId changes
    useEffect(() => {
        if (sessionHash) {
            fetchNotifications();
        }
    }, [sessionHash, tabId]); // Add tabId as dependency

    // Get status color
    const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
        switch (status.toUpperCase()) {
            case 'CREATED': return 'default';
            case 'CONFIRMED': return 'info';
            case 'IN_PREPARATION': return 'warning';
            case 'PREPARED': return 'primary';
            case 'DELIVERED': 
            case 'SHIPPED': 
            case 'PICKED_UP': return 'success';
            case 'CLOSED': 
            case 'RETURNED': return 'success';
            case 'CANCELLED': 
            case 'NOT_SHIPPED': return 'error';
            default: return 'default';
        }
    };

    // Get status label
    const getStatusLabel = (status: string): string => {
        switch (status.toUpperCase()) {
            case 'CREATED': return translate('mall.session.order_status.created');
            case 'CONFIRMED': return translate('mall.session.order_status.confirmed');
            case 'IN_PREPARATION': return translate('mall.session.order_status.in_preparation');
            case 'PREPARED': return translate('mall.session.order_status.prepared');
            case 'DELIVERED': return translate('mall.session.order_status.delivered');
            case 'SHIPPED': return translate('mall.session.order_status.shipped');
            case 'PICKED_UP': return translate('mall.session.order_status.picked_up');
            case 'CLOSED': return translate('mall.session.order_status.closed');
            case 'RETURNED': return translate('mall.session.order_status.returned');
            case 'CANCELLED': return translate('mall.session.order_status.cancelled');
            case 'NOT_SHIPPED': return translate('mall.session.order_status.not_shipped');
            default: return status;
        }
    };

    // Get progress value for overall status
    const getProgressValue = (status: string): number => {
        switch (status.toUpperCase()) {
            case 'CREATED': return 10;
            case 'CONFIRMED': return 25;
            case 'IN_PREPARATION': return 50;
            case 'PREPARED': return 75;
            case 'DELIVERED': 
            case 'SHIPPED': 
            case 'PICKED_UP': 
            case 'CLOSED': 
            case 'RETURNED': return 100;
            case 'CANCELLED': 
            case 'NOT_SHIPPED': return 0;
            default: return 0;
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

    return (
        <>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {translate('common.unknown_error')}
                </Alert>
            )}

            <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {['CREATED', 'CONFIRMED', 'IN_PREPARATION', 'PREPARED', 'DELIVERED'].map((status, idx, arr) => (
                        <React.Fragment key={status}>
                            <Chip
                                label={getStatusLabel(status)}
                                color={getStatusColor(status)}
                                size="small"
                                variant={overallStatus === status ? 'filled' : 'outlined'}
                                sx={{
                                    fontWeight: overallStatus === status ? 'bold' : 'normal',
                                    opacity: getProgressValue(overallStatus) >= getProgressValue(status) ? 1 : 0.5,
                                }}
                            />
                            {idx < arr.length - 1 && (
                                <Box sx={{ mx: 1, color: getProgressValue(overallStatus) >= getProgressValue(arr[idx + 1]) ? 'primary.main' : 'text.disabled' }}>
                                    →
                                </Box>
                            )}
                        </React.Fragment>
                    ))}
                </Box>
                <LinearProgress 
                    variant="determinate" 
                    value={getProgressValue(overallStatus)}
                    sx={{ height: 8, borderRadius: 4 }}
                />
                <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                       {overallStatus === 'CREATED' && <>{translate('mall.session.order_status.created_text')}</>}
                    </Typography>
                </Box>
            </Box>

            {loading && (
                <Box sx={{ mb: 2 }}>
                    <LinearProgress />
                </Box>
            )}

            {/*<Typography variant="subtitle2" gutterBottom>
                {translate('mall.session.products_count', { count: products.length })}
            </Typography>*/}
            
            {/*products.map((product, index) => {
                const productId = product?.id;
                const currentStatus = productId ? productStatuses[productId] : undefined;
                
                return (
                    <Box key={product.id || index} sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        py: 1,
                        borderBottom: index < products.length - 1 ? '1px solid #eee' : 'none'
                    }}>
                        <Box>
                            <Typography variant="body2" fontWeight="medium">
                                {product?.name || translate('mall.session.product.unknown')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {translate('mall.session.product.quantity', { quantity: product?.quantity || 1 })}
                            </Typography>
                        </Box>
                        <Chip 
                            label={currentStatus ? getStatusLabel(currentStatus) : translate('mall.session.product.pending')} 
                            color={currentStatus ? getStatusColor(currentStatus) : 'default'}
                            size="small"
                        />
                    </Box>
                );
            })*/}

            {notifications.length > 0 && (
                <Box sx={{ mt: 2 }}>
                    <Box>
                        {notifications.slice(0, 5).map((notification) => (
                            <Box key={notification.id} sx={{ 
                                p: 1, 
                                mb: 1, 
                               
                                borderRadius: 1,
                                borderLeft: 4,
                                borderColor: getStatusColor(notification.status) === 'error' ? 'error.main' : 
                                            getStatusColor(notification.status) === 'success' ? 'success.main' :
                                            getStatusColor(notification.status) === 'warning' ? 'warning.main' : 'primary.main'
                            }}>
                                <Typography variant="caption" fontWeight="medium">
                                    {notification.title}
                                </Typography>
                                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                                    {notification.message}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {new Date(notification.created_at).toLocaleTimeString()}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}

            {/* Group products by tenant if tenant info is available */}
            <Box sx={{ mt: 2 }}>
                {products && products.length > 0 ? (
                    <Box>
                        {/* Products can be grouped by tenant here if needed */}
                        {/* This would use the tenant_id from product data */}
                    </Box>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        {translate('mall.session.no_products')}
                    </Typography>
                )}
            </Box>
        </>
    );
};

export default MallSessionOrderProductsNotifications;
