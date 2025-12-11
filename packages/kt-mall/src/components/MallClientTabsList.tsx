import { IDashAutoAdminCustomFieldComponent, IDashAutoAdminDataGrid } from "dash-auto-admin";
import { ITab, TabTimerClock } from "kt-tabs";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import ButtonGroup from "@mui/material/ButtonGroup";
import Alert from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import { linearProgressClasses, styled } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useGetOne, useRefresh, WithListContext, useListContext } from "react-admin";
import DashResourceButton from "dash-auto-admin/src/toolbar/buttons/DashResourceButton";
import { toast } from 'react-toastify';
import { ImagePlaceHolder as ImagePlaceHolder } from "kt-utils";
import { useMallClientTabsContext, ITenantTabStatus } from './MallClientTabsContext';

const placeholder = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="

// Thin progress bar styled component
const ThinProgressBar = styled(LinearProgress)(({ theme }) => ({
    height: 6,
    borderRadius: 3,
    [`&.${linearProgressClasses.colorPrimary}`]: {
        backgroundColor: theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
    },
}));

// Status order for progress calculation (0-100%)
const STATUS_ORDER = ['CREATED', 'CONFIRMED', 'IN_PREPARATION', 'PREPARED', 'DELIVERED', 'CLOSED'];
const STATUS_PROGRESS: Record<string, number> = {
    'CREATED': 10,
    'CONFIRMED': 25,
    'IN_PREPARATION': 50,
    'PREPARED': 75,
    'DELIVERED': 90,
    'CLOSED': 100,
    'CANCELLED': 0
};

// Get progress bar color based on status
const getProgressColor = (status: string): "primary" | "secondary" | "error" | "info" | "success" | "warning" | "inherit" => {
    switch (status) {
        case 'CREATED': return 'inherit';
        case 'CONFIRMED': return 'primary';
        case 'IN_PREPARATION': return 'warning';
        case 'PREPARED': return 'info';
        case 'DELIVERED': return 'success';
        case 'CLOSED': return 'success';
        case 'CANCELLED': return 'error';
        default: return 'primary';
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'CREATED': return 'default';
        case 'CONFIRMED': return 'primary';
        case 'IN_PREPARATION': return 'warning';
        case 'PREPARED': return 'info';
        case 'DELIVERED': return 'success';
        case 'CLOSED': return 'secondary';
        case 'CANCELLED': return 'error';
        default: return 'default';
    }
};

// Status labels for localization
const STATUS_LABELS: Record<string, string> = {
    'CREATED': 'Creado',
    'CONFIRMED': 'Confirmado',
    'IN_PREPARATION': 'En preparación',
    'PREPARED': 'Preparado',
    'DELIVERED': 'Entregado',
    'CLOSED': 'Cerrado',
    'CANCELLED': 'Cancelado'
};

const OrderProductsView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ record, resourceConfig }) => {
    const tab: ITab = record as ITab;
    
    // Use MallClientTabsContext for WebSocket events
    // This context subscribes to the WebSocket channel and provides lastEvent
    const { lastEvent } = useMallClientTabsContext();

    // Use the resource model from config, which will be mapped by the data provider
    const { data: tabData, refetch } = useGetOne(resourceConfig?.model || 'tab', { id: tab.id });

    // Refetch when notification arrives for this tab
    useEffect(() => {
        if (!lastEvent) return;
        
        const eventData = lastEvent?.data || lastEvent;
        const notificationPayload = (lastEvent as any)?.notificationPayload;
        
        // Check if this notification is for this tab
        const masterTabId = eventData?.master_tab_id || notificationPayload?.notificationPayload?.master_tab_id;
        const tenantTabId = eventData?.tenant_tab_id || notificationPayload?.notificationPayload?.tenant_tab_id;
        
        if (masterTabId === tab.id || tenantTabId === tab.id) {
            refetch();
        }
        
        // Also refetch on any mall order status update
        const isMallOrderUpdate = 
            (lastEvent as any)?.type === "mall_order_status_update" ||
            lastEvent?.event === "mall_order_status_update" ||
            eventData?.type === "mall_order_status_update" ||
            eventData?.event === "mall_order_status_update";
            
        if (isMallOrderUpdate) {
            refetch();
        }
    }, [lastEvent, tab.id, refetch]);

    if (!tabData) {
        return <CircularProgress />;
    }
    
    return (
        <div>
            <StoreProgressBars masterTabId={tabData.id} record={tabData} />
         
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
               
                    {tabData?.order?.items?.map((item) => {
                        return (
                        <tr key={item.id} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={{ width: '100px', verticalAlign: 'top' }}>
                                <ImagePlaceHolder
                                    style={{ width: 80 }}
                                    loading={<CircularProgress />}
                                    placeHolder={placeholder}
                                    src={item.product.image_url}
                                />
                            </td>
                            <td>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                                    x{item.quantity} - {item.product.name}
                                </div>
                                {/*<Chip 
                                    label={tabData.status_localized || tabData.status} 
                                    size="small" 
                                    color={getStatusColor(tabData.status) as any} 
                                    variant="outlined"
                                    sx={{ mt: 0.5, mb: 0.5 }}
                                />*/}
                                {item.note && <div>Nota: {item.note}</div>}
                                {item.modifiers && item.modifiers.length > 0 && (
                                    <div>
                                        {item.modifiers.map((modifier, modIndex) => (
                                            <div key={modIndex}>
                                                {modifier.modifier_option?.name || `Opción ${modIndex + 1}`}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </td>
                        </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

interface IOrderStatusUpdateNotification {
    event: string;
    status: string;
    tenant_id?: number;
    tenant_name?: string;
    mall_session_hash?: string;
    master_tab_id?: number;
    tenant_tab_id?: number;
    products?: any[];
    timestamp?: string;
    type: string;
}

interface StoreProgressBarsProps {
    masterTabId: number;
    record?: any; // API record with progress data
}

// Compact component to display store progress bars with label overlay
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

const MallClientTabsList: React.FC<IDashAutoAdminDataGrid> = ({ resourceConfig }) => {
    // Use MallClientTabsContext for WebSocket events and tenant status tracking
    // This context subscribes to the WebSocket channel and provides lastEvent
    const { lastEvent, tenantStatusesByTab } = useMallClientTabsContext();
    const refresh = useRefresh();

    const [statusLabel] = useState({
        'CREATED': 'Creado',
        'CONFIRMED': 'Confirmado',
        'IN_PREPARATION': 'En preparación',
        'PREPARED': 'Preparado',
        'DELIVERED': 'Entregado',
        'CLOSED': 'Cerrado',
        'CANCELLED': 'Cancelado'
    });

    const showMessage = (info: string) => {
        toast.info(<>{info}</>, {
            position: 'top-center',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: false,
        });
    };

    // Listen for tab status updates via WebSocket
    useEffect(() => {
        if (!lastEvent) return;

        // Handle tab status updates
        if ((lastEvent as any)?.model === "Domain\\App\\Models\\Tab\\Tab" && 
            lastEvent.data?.type === "tab.status") {
            showMessage(`Se ha cambiado el estado de la orden ${lastEvent.data.old} a ${lastEvent.data.new}`);
            refresh();
            return;
        }
        
        // Handle tab updates
        if ((lastEvent as any)?.model === "Domain\\App\\Models\\Tab\\Tab" && 
            lastEvent.data?.type === "tab.update") {
            refresh();
            return;
        }

        // Handle mall order status updates - check all possible event structures
        const notificationPayload = lastEvent?.notificationPayload;
        const eventData = lastEvent?.data || lastEvent;
        const isMallOrderUpdate = 
            lastEvent?.event === "mall_order_status_update" ||
            lastEvent?.type === "mall_order_status_update" ||
            eventData?.type === "mall_order_status_update" ||
            eventData?.event === "mall_order_status_update" ||
            notificationPayload?.class === "MallSessionOrderStatusNotification" ||
            (lastEvent?.model === "Domain\\App\\Models\\Tab\\Tab" && eventData?.type === "mall_order_status_update") ||
            (lastEvent?.model === "Domain\\App\\Models\\Mall\\MallSession" && eventData?.type === "mall_order_status_update") ||
            (lastEvent?.model === "Domain\\App\\Models\\Order\\Order" && eventData?.type === "mall_order_status_update");

        if (isMallOrderUpdate) {
            // Extract data from nested notificationPayload if present
            const payload = notificationPayload?.notificationPayload || eventData?.data || eventData || {};
            const tenantName = payload.tenant_name || 'El restaurante';
            const status = payload.status || payload.new || 'actualizado';
            showMessage(`${tenantName} ha actualizado tu orden a: ${statusLabel[status] || status}`);
            refresh();
        }
    }, [lastEvent, refresh, statusLabel]);

    return (
        <WithListContext render={({ isPending, data }) => (
            <>
                {data?.length === 0 && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        No tienes órdenes activas. Puedes crear una nueva orden usando el menú.
                    </Alert>
                )}
                <Box sx={{
                    display: 'grid', gap: 1, gridTemplateColumns: {
                        xs: 'repeat(1, 1fr)',
                        md: 'repeat(2, 1fr)',
                        lg: 'repeat(3, 1fr)'
                    }
                }}>
                    {data?.map((record: any) => {
                        return (
                        <Card className="dash-kitchen-tab" key={record.id} sx={{ p: 1, mb: 2 }}>
                            <Box sx={{ display: 'flex' }}>
                                <Box sx={{ flex: 1 }}>
                                    <CardHeader
                                        sx={{ p: 0 }}
                                        title={
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                                <Typography variant="h5">{`Orden #${record.id}`}</Typography>
                                                <ButtonGroup style={{ alignItems: "center" }} orientation="horizontal" variant="text" size="small">
                                                    <TabTimerClock createdAt={(record as ITab).date_confirmed} />

                                                    <DashResourceButton icon={<svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="24"
                                                        height="24"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        style={{ marginRight: 8 }}
                                                    >
                                                        <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                                                        <line x1="8" y1="6" x2="16" y2="6" />
                                                        <line x1="8" y1="10" x2="16" y2="10" />
                                                        <line x1="8" y1="14" x2="12" y2="14" />
                                                    </svg>} resource={resourceConfig.model} record={record} resourceConfig={resourceConfig} mode={"edit"} />
                                                </ButtonGroup>
                                            </Box>
                                        }
                                    />
                                    <CardContent sx={{ p: 0 }}>
                                       {/*<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                                            <Chip
                                                label={`${record.status_localized || statusLabel[(record as ITab).status] || record.status} ${record.date_confirmed ? `- ${new Date(
                                                    record.status === 'CREATED' ? record.date_created :
                                                        record.status === 'CONFIRMED' ? record.date_confirmed :
                                                            record.status === 'IN_PREPARATION' ? record.date_in_preparation :
                                                                record.status === 'PREPARED' ? record.date_prepared :
                                                                    record.status === 'DELIVERED' ? record.date_delivered :
                                                                        record.status === 'CLOSED' ? record.date_closed :
                                                                            record.date_created
                                                ).toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}` : ''}`}
                                                size="small"
                                                color={getStatusColor(record.status) as any}
                                            />
                                        </Box>*/}

                                      

                                        <OrderProductsView resourceConfig={resourceConfig} record={record} attribute={undefined} method={"view"} />
                                         
                                    </CardContent>
                                </Box>
                            </Box>
                        </Card>
                        );
                    })}
                </Box>
            </>
        )} />
    );
};

export default MallClientTabsList;