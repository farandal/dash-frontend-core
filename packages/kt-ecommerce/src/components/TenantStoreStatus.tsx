import React, { useState, useEffect } from 'react';
import { useRecordContext, useTranslate, useNotify, useRefresh } from 'react-admin';
import { useAxios } from 'dash-axios-hook';
import { 
    Card, 
    CardHeader, 
    CardContent, 
    Typography, 
    Button, 
    Box, 
    Alert, 
    Chip, 
    CircularProgress 
} from '@mui/material';
import StoreIcon from '@mui/icons-material/Store';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import ScheduleIcon from '@mui/icons-material/Schedule';
import WarningIcon from '@mui/icons-material/Warning';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';

const TenantStoreStatus: React.FC<IDashAutoAdminCustomFieldComponent> = ({
    attribute,
    method,
    resourceConfig
}) => {
    const record = useRecordContext();
    const translate = useTranslate();
    const notify = useNotify();
    const refresh = useRefresh();
    const axios = useAxios();
    const [loading, setLoading] = useState(false);

    // If record is not loaded yet
    if (!record) return null;

    const { is_open, schedule_enabled, manually_closed, manually_opened, timezone } = record;

    const handleToggle = async () => {
        setLoading(true);
        try {
            const action = is_open ? 'close' : 'open';
            const url = `${resourceConfig.model}/${record.id}/toggle-open`;
            
            const response = await axios.post(url, { action });
            const data = response.data;

            if (data.success) {
                notify(data.data.message || 'Status updated', { type: 'success' });
                refresh(); // Refresh record to update UI state
            } else {
                throw new Error(data.message || 'Failed to update status');
            }
        } catch (error) {
            console.error(error);
            notify('Error updating status', { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const isManualOverride = (schedule_enabled && (manually_closed || manually_opened));
    
    // Determine status color/text
    const statusColor = is_open ? 'success' : 'error';
    const statusText = is_open ? translate('tenant.store_status.open') : translate('tenant.store_status.closed');
    const statusIcon = is_open ? <StoreIcon /> : <LockIcon />;

    return (
        <Card sx={{ maxWidth: '100%', margin: 'auto' ,


                backgroundColor: 'transparent', // Fully transparent
                boxShadow: 'none',             // Removes default MUI elevation shadow
                border: 'none' // Optional: add a subtle border
      

        }}>
            <CardHeader 
                title={translate('tenant.store_status.title')} 
                subheader={translate('tenant.store_status.subtitle')}
            />
            <CardContent>
                <Box display="flex" flexDirection="column" gap={3}>
                    
                    {/* Status Indicator */}
                    <Box display="flex" alignItems="center" justifyContent="space-between" p={2} borderRadius={1}>
                        <Box display="flex" alignItems="center" gap={2}>
                           
                            <Chip 
                                icon={statusIcon} 
                                label={statusText} 
                                color={statusColor} 
                                sx={{ fontSize: '1.2rem', padding: 2, fontWeight: 'bold' }} 
                            />
                        </Box>
                        
                        {/* Toggle Button (only in edit mode) */}
                        {method === 'edit' && (
                            <Button
                                variant="contained"
                                color={is_open ? 'error' : 'success'}
                                startIcon={is_open ? <LockIcon /> : <LockOpenIcon />}
                                onClick={handleToggle}
                                disabled={loading}
                                size="large"
                            >
                                {loading ? <CircularProgress size={24} /> : (is_open ? translate('tenant.store_status.close_store') : translate('tenant.store_status.open_store'))}
                            </Button>
                        )}
                    </Box>

                    {/* Schedule Info / Warnings */}
                    {schedule_enabled ? (
                        <Box>
                             <Chip 
                                icon={<ScheduleIcon />} 
                                label={translate('tenant.store_status.schedule_active')} 
                                variant="outlined" 
                                color="primary" 
                                size="small"
                                sx={{ mb: 2 }}
                            />
                            
                            {isManualOverride && (
                                <Alert severity="warning" icon={<WarningIcon />}>
                                    {manually_closed 
                                        ? translate('tenant.store_status.manual_close_warning')
                                        : translate('tenant.store_status.manual_open_warning')
                                    }
                                </Alert>
                            )}
                            
                             {!isManualOverride && (
                                <Alert severity="info">
                                    {translate('tenant.store_status.following_schedule', { timezone: timezone || 'Default' })}
                                </Alert>
                            )}
                        </Box>
                    ) : (
                        <Alert severity="info" icon={<Box component="span" fontSize={20}>✋</Box>}>
                            {translate('tenant.store_status.manual_mode_info')}
                        </Alert>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

export default TenantStoreStatus;
