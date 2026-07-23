import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { ITenantTabStatus, useMallClientTabsContext } from './MallClientTabsContext';
import { StoreProgressBarsProps } from '../interfaces';
import { ThinProgressBar, getProgressColor, STATUS_PROGRESS, STATUS_LABELS } from '../utils';

const StoreProgressBars: React.FC<StoreProgressBarsProps> = ({ masterTabId, record }) => {
    const { getTenantStatusesForTab, loading } = useMallClientTabsContext();

    // Get tenant statuses from context (WebSocket updates)
    const tenantTabs = getTenantStatusesForTab(masterTabId);

    // If we have tenant statuses from context, use them (real-time updates)
    if (tenantTabs.length > 0) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1 }}>
                {tenantTabs.map((tenantTab: ITenantTabStatus) => (
                    <Box key={tenantTab.tenant_tab_id} sx={{ position: 'relative' }}>
                        <ThinProgressBar
                            variant="determinate"
                            value={tenantTab.progress || STATUS_PROGRESS[tenantTab.status] || 0}
                            color={getProgressColor(tenantTab.status)}
                            sx={{ height: 18, borderRadius: 1 }}
                        />
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                px: 1
                            }}
                        >
                            <Typography
                                variant="caption"
                                sx={{
                                    fontSize: '0.65rem',
                                    fontWeight: 'medium',
                                    color: 'text.primary',
                                    textShadow: '0 0 2px rgba(255,255,255,0.8)',
                                    lineHeight: 1
                                }}
                                noWrap
                            >
                                {tenantTab.tenant_name}
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{
                                    fontSize: '0.6rem',
                                    fontWeight: 'bold',
                                    color: 'text.secondary',
                                    textShadow: '0 0 2px rgba(255,255,255,0.8)',
                                    lineHeight: 1
                                }}
                            >
                                {STATUS_LABELS[tenantTab.status] || tenantTab.status}
                            </Typography>
                        </Box>
                    </Box>
                ))}
            </Box>
        );
    }

    // Fallback: Show progress from API record's tenant_tabs (initial load before WebSocket updates)
    if (record?.tenant_tabs && Array.isArray(record.tenant_tabs) && record.tenant_tabs.length > 0) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1 }}>
                {record.tenant_tabs.map((tenantTab: any) => {
                    const status = tenantTab.status || 'CREATED';
                    const progress = tenantTab.progress ?? STATUS_PROGRESS[status] ?? 0;
                    const tenantName = tenantTab.tenant_name || 'Tienda';

                    return (
                        <Box key={tenantTab.id} sx={{ position: 'relative' }}>
                            <ThinProgressBar
                                variant="determinate"
                                value={progress}
                                color={getProgressColor(status)}
                                sx={{ height: 18, borderRadius: 1 }}
                            />
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    px: 1
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontSize: '0.65rem',
                                        fontWeight: 'medium',
                                        color: 'text.primary',
                                        textShadow: '0 0 2px rgba(255,255,255,0.8)',
                                        lineHeight: 1
                                    }}
                                    noWrap
                                >
                                    {tenantName}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontSize: '0.6rem',
                                        fontWeight: 'bold',
                                        color: 'text.secondary',
                                        textShadow: '0 0 2px rgba(255,255,255,0.8)',
                                        lineHeight: 1
                                    }}
                                >
                                    {STATUS_LABELS[status] || status}
                                </Typography>
                            </Box>
                        </Box>
                    );
                })}
            </Box>
        );
    }

    // Fallback for single store or legacy records without tenant_tabs
    if (record) {
        const status = record.status || 'CREATED';
        const progress = record.progress ?? STATUS_PROGRESS[status] ?? 0;
        const tenantName = record.tenant?.name || record.tenant?.attributes?.public_name || 'Tienda';

        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1 }}>
                <Box sx={{ position: 'relative' }}>
                    <ThinProgressBar
                        variant="determinate"
                        value={progress}
                        color={getProgressColor(status)}
                        sx={{ height: 18, borderRadius: 1 }}
                    />
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            px: 1
                        }}
                    >
                        <Typography
                            variant="caption"
                            sx={{
                                fontSize: '0.65rem',
                                fontWeight: 'medium',
                                color: 'text.primary',
                                textShadow: '0 0 2px rgba(255,255,255,0.8)',
                                lineHeight: 1
                            }}
                            noWrap
                        >
                            {tenantName}
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{
                                fontSize: '0.6rem',
                                fontWeight: 'bold',
                                color: 'text.secondary',
                                textShadow: '0 0 2px rgba(255,255,255,0.8)',
                                lineHeight: 1
                            }}
                        >
                            {STATUS_LABELS[status] || status}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        );
    }

    // Loading state
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.5 }}>
                <CircularProgress size={16} />
            </Box>
        );
    }

    return null;
};

export default StoreProgressBars;