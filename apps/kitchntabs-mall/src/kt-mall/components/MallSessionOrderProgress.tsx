import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import { useTranslate, useRecordContext } from 'react-admin';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import { useMallClientTabsContext, ITenantTabStatus } from './MallClientTabsContext';

/**
 * Props for MallSessionOrderProgress
 * Extends IDashAutoAdminCustomFieldComponent for schema compatibility
 * Also supports direct tabId prop for backward compatibility
 */
interface MallSessionOrderProgressProps extends Partial<IDashAutoAdminCustomFieldComponent> {
    tabId?: string | number;
}

// Status progress mapping
const STATUS_PROGRESS: Record<string, number> = {
    'CREATED': 10,
    'CONFIRMED': 25,
    'IN_PREPARATION': 50,
    'PREPARED': 75,
    'DELIVERED': 90,
    'CLOSED': 100,
    'CANCELLED': 0
};

/**
 * MallSessionOrderProgress - Displays progress bars for each tenant/store in a mall order
 * Uses MallClientTabsContext to get tenant statuses without making direct API calls
 * 
 * Can be used:
 * 1. In a schema (receives IDashAutoAdminCustomFieldComponent props, gets tabId from record context)
 * 2. Directly with tabId prop (backward compatibility)
 */
const MallSessionOrderProgress: React.FC<MallSessionOrderProgressProps> = (props) => {
    const { tabId: propTabId } = props;
    const record = useRecordContext();
    const { getTenantStatusesForTab, loading, lastEvent } = useMallClientTabsContext();
    const translate = useTranslate();

    // Get tabId from prop or record context
    const tabId = propTabId ?? record?.id;

    // Get tenant statuses from context - this updates automatically when WebSocket events arrive
    const tenantTabs = getTenantStatusesForTab(Number(tabId));

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case 'CREATED': return 'info.main';
            case 'CONFIRMED': return 'primary.main';
            case 'IN_PREPARATION': return 'warning.main';
            case 'PREPARED': return 'success.light';
            case 'DELIVERED': return 'success.main';
            case 'CANCELLED': return 'error.main';
            default: return 'grey.500';
        }
    };

    const getStatusLabel = (status: string) => {
        return translate(`tab.status.${status.toLowerCase()}`, { _: status });
    };

    const getProgressValue = (status: string) => {
        return STATUS_PROGRESS[status.toUpperCase()] || 0;
    };

    // Show loading only on initial load when no data
    if (loading && tenantTabs.length === 0) {
        return (
            <Box sx={{ width: '100%', mt: 2, mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    {translate('common.loading', { _: 'Cargando...' })}
                </Typography>
                <LinearProgress />
            </Box>
        );
    }

    // Don't render if no tenant tabs
    if (tenantTabs.length === 0) {
        return null;
    }

    return (
        <Box sx={{ mb: 3 }} className="kt-mall-session-order-progress">
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {translate('mall.session.stores_progress', { _: 'Progreso por tienda' })}
            </Typography>
            
            {tenantTabs.map((tenant: ITenantTabStatus) => (
                <Paper 
                    key={tenant.tenant_tab_id} 
                    elevation={1} 
                    sx={{ p: 2, mb: 2, borderLeft: 4, borderColor: getStatusColor(tenant.status) }}
                >
                    <Typography variant="subtitle2" fontWeight="bold">
                        {tenant.tenant_name}
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
                            {tenant.products?.length || 0} {translate('mall.session.items', { _: 'items' })}
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
    );
};

export default MallSessionOrderProgress;
