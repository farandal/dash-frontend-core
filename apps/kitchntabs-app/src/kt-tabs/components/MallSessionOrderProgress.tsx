import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, LinearProgress, Divider, Chip, Paper } from '@mui/material';
import { useTranslate } from 'react-admin';
import { useAxios } from 'dash-axios-hook';
import LaravelEchoContext, { ILaravelEchoContext } from 'dash-admin/src/contexts/com/LaravelEchoContext';

interface MallSessionOrderProgressProps {
    sessionHash: string | null;
    tenantStatuses?: Record<number, string>;
    overallStatus?: string;
    tabId: string | number;
    products?: any[];
    notifications?: any[]; // Add prop for passed notifications
    loading?: boolean; // Add prop for loading state
}

interface TenantInfo {
    id: number;
    name: string;
    status: string;
    timestamp?: string;
    products: any[];
}

// @deprecated
const MallSessionOrderProgress: React.FC<MallSessionOrderProgressProps> = ({ 
    sessionHash, 
    tenantStatuses = {}, 
    overallStatus = 'CREATED',
    tabId,
    products = [],
    notifications: propNotifications, // Renamed to avoid conflict
    loading: propLoading
}) => {
    const [tenants, setTenants] = useState<TenantInfo[]>([]);
    const [masterStatus, setMasterStatus] = useState<string>('CREATED');
    const [loading, setLoading] = useState(true);
    const laravelEchoContext = useContext<ILaravelEchoContext>(LaravelEchoContext);
    const axios = useAxios();
    const translate = useTranslate();

    // Fetch current status and tenant info
    const fetchStatus = async () => {
        // Skip fetching if notifications were provided as props
        if (propNotifications !== undefined) {
            processNotifications(propNotifications);
            return;
        }
        
        if (!sessionHash) return;
        // Check if tabId is defined and not 'undefined'
        if (!tabId || tabId === 'undefined') {
            console.warn('Tab ID is not properly defined, waiting for a valid value');
            setLoading(true);
            return;
        }
        
        setLoading(true);
        try {
            // Always include tab_id in query since it's required
            const url = `/public/mall/session/${sessionHash}/notifications?tab_id=${tabId}`;
            
            const response = await axios.get(url);
            const notifications = response.data.notifications;
            
            processNotifications(notifications);
        } catch (err) {
            console.error('Error fetching status:', err);
        } finally {
            setLoading(false);
        }
    };

    // Process notifications to extract tenant info and status
    const processNotifications = (notifications: any[]) => {
        // Process notifications to extract tenant info and status
        const tenantMap = new Map<number, TenantInfo>();
        let latestMasterStatus = 'CREATED';
        let latestMasterTimestamp = new Date(0);
        
        if (notifications && notifications.length > 0) {
            // Sort notifications by timestamp (newest first)
            const sortedNotifications = [...notifications].sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            
            sortedNotifications.forEach(notification => {
                // Only process status notifications
                if (notification.type === 'mall_order_status_update') {
                    const data = notification.data;
                    const timestamp = new Date(notification.created_at);
                    
                    // Update master status if newer and not tenant-specific
                    if (data.status && !data.tenant_id && timestamp > latestMasterTimestamp) {
                        latestMasterStatus = data.status;
                        latestMasterTimestamp = timestamp;
                    }
                    
                    // Update tenant info if available
                    if (data.tenant_id && data.tenant_name) {
                        const tenantId = data.tenant_id;
                        
                        // Only update if we don't have this tenant yet or if this notification is newer
                        if (!tenantMap.has(tenantId) || 
                            timestamp > new Date(tenantMap.get(tenantId)?.timestamp || 0)) {
                            
                            const tenantInfo: TenantInfo = {
                                id: tenantId,
                                name: data.tenant_name,
                                status: data.status || 'CREATED',
                                timestamp: notification.created_at,
                                products: data.products || []
                            };
                            
                            tenantMap.set(tenantId, tenantInfo);
                        }
                    }
                }
            });
        } 
        
        // If tenantMap is empty, try to create default tenants from the products prop or use tenant props
        if (tenantMap.size === 0) {
            // Use tenantStatuses prop if available
            if (Object.keys(tenantStatuses).length > 0) {
                Object.entries(tenantStatuses).forEach(([tenantIdStr, status]) => {
                    const tenantId = parseInt(tenantIdStr, 10);
                    tenantMap.set(tenantId, {
                        id: tenantId,
                        name: `Tenant ${tenantId}`, // Use a generic name if actual name is not available
                        status: status || 'CREATED',
                        products: []
                    });
                });
            }
            
            // If we still have no tenants, check if there's data in the products prop
            if (tenantMap.size === 0 && products && products.length > 0) {
                // Try to extract tenant info from products
                const tenantIds = new Set(products.map(p => p.tenant_id).filter(Boolean));
                
                tenantIds.forEach(tenantId => {
                    if (tenantId) {
                        const tenantProducts = products.filter(p => p.tenant_id === tenantId);
                        const tenantName = tenantProducts[0]?.tenant_name || `Tenant ${tenantId}`;
                        
                        tenantMap.set(tenantId, {
                            id: tenantId,
                            name: tenantName,
                            status: 'CREATED', // Default status
                            products: tenantProducts
                        });
                    }
                });
            }
        }
        
        // Update state with extracted tenant info
        setTenants(Array.from(tenantMap.values()));
        setMasterStatus(latestMasterStatus);
        
        console.log('Updated tenant statuses:', Array.from(tenantMap.values()));
    };

    // Use prop notifications if provided
    useEffect(() => {
        if (propNotifications !== undefined) {
            processNotifications(propNotifications);
        }
    }, [propNotifications]);

    // Initial fetch on load or when tabId changes
    useEffect(() => {
        // Only fetch if notifications weren't provided as props
        if (propNotifications === undefined) {
            fetchStatus();
        }
    }, [sessionHash, tabId, propNotifications]);

    // Update tenants when tenantStatuses prop changes
    useEffect(() => {
        if (Object.keys(tenantStatuses).length > 0) {
            setTenants(prevTenants => {
                return prevTenants.map(tenant => {
                    if (tenantStatuses[tenant.id]) {
                        return {
                            ...tenant,
                            status: tenantStatuses[tenant.id]
                        };
                    }
                    return tenant;
                });
            });
        }
    }, [tenantStatuses]);

    // Update master status when overallStatus prop changes
    useEffect(() => {
        if (overallStatus) {
            setMasterStatus(overallStatus);
        }
    }, [overallStatus]);

    // Process WebSocket notifications to update tenants and status
    useEffect(() => {
        const lastNotification = laravelEchoContext?.lastEvent;
        
        if (lastNotification?.data?.mall_session_hash === sessionHash) {
            const data = lastNotification.data;
            
            // Update master status if this is a master status update
            if (data.status && !data.tenant_id) {
                setMasterStatus(data.status);
            }
            
            // Update tenant info if this is a tenant-specific update
            if (data.tenant_id && data.tenant_name) {
                setTenants(prevTenants => {
                    const updatedTenants = [...prevTenants];
                    const existingIndex = updatedTenants.findIndex(t => t.id === data.tenant_id);
                    
                    const tenantInfo: TenantInfo = {
                        id: data.tenant_id,
                        name: data.tenant_name,
                        status: data.status || 'CREATED',
                        timestamp: data.timestamp || new Date().toISOString(),
                        products: data.products || []
                    };
                    
                    if (existingIndex >= 0) {
                        // Preserve existing products if the new notification doesn't include them
                        if (!tenantInfo.products.length && updatedTenants[existingIndex].products.length) {
                            tenantInfo.products = updatedTenants[existingIndex].products;
                        }
                        updatedTenants[existingIndex] = tenantInfo;
                    } else {
                        updatedTenants.push(tenantInfo);
                    }
                    
                    console.log('Tenant status updated via WebSocket:', tenantInfo);
                    return updatedTenants;
                });
            }
        }
    }, [laravelEchoContext?.lastEvent, sessionHash]);

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case 'CREATED':
                return 'info.main';
            case 'CONFIRMED':
                return 'primary.main';
            case 'IN_PREPARATION':
                return 'warning.main';
            case 'PREPARED':
                return 'success.light';
            case 'DELIVERED':
                return 'success.main';
            case 'CANCELLED':
                return 'error.main';
            default:
                return 'grey.500';
        }
    };

    const getStatusLabel = (status: string) => {
        return translate(`mall.session.order_status.${status.toLowerCase()}`, { _: status });
    };

    const getProgressValue = (status: string) => {
        switch (status.toUpperCase()) {
            case 'CREATED':
                return 20;
            case 'CONFIRMED':
                return 40;
            case 'IN_PREPARATION':
                return 60;
            case 'PREPARED':
                return 80;
            case 'DELIVERED':
            case 'SHIPPED':
            case 'PICKED_UP':
            case 'CLOSED':
                return 100;
            case 'CANCELLED':
            case 'RETURNED':
            case 'NOT_SHIPPED':
                return 0;
            default:
                return 0;
        }
    };

    // Use propLoading if provided, otherwise use local loading state
    const isLoading = propLoading !== undefined ? propLoading : loading;

    return (
        <Box sx={{ mb: 3 }}>
            {isLoading ? (
                <Box sx={{ width: '100%', mt: 2, mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        {translate('common.loading')}
                    </Typography>
                    <LinearProgress />
                </Box>
            ) : (
                <>
                    {/* Tenant-specific progress bars */}
                    {tenants.length > 0 && (
                        <Box>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                {translate('mall.session.stores_progress')}
                            </Typography>
                            
                            {tenants.map(tenant => (
                                <Paper 
                                    key={tenant.id} 
                                    elevation={1} 
                                    sx={{ p: 2, mb: 2, borderLeft: 4, borderColor: getStatusColor(tenant.status) }}
                                >
                                    <Typography variant="subtitle2" fontWeight="bold">
                                        {tenant.name}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, mt: 1 }}>
                                        <Chip 
                                            label={getStatusLabel(tenant.status)}
                                            size="small"
                                            sx={{ 
                                                backgroundColor: getStatusColor(tenant.status),
                                                color: 'white',
                                                mr: 1
                                            }}
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                            {tenant.products.length} {translate('mall.session.items')}
                                        </Typography>
                                    </Box>
                                    <LinearProgress 
                                        variant="determinate" 
                                        value={getProgressValue(tenant.status)}
                                        sx={{ 
                                            height: 6, 
                                            borderRadius: 3,
                                            mb: 1 
                                        }}
                                    />
                                </Paper>
                            ))}
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
};

export default MallSessionOrderProgress;
