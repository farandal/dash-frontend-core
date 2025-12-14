import { IDashAutoAdminDataGrid } from "dash-auto-admin";
// Direct imports from kt-tabs (avoid barrel exports for tree-shaking)
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";
import ButtonGroup from "@mui/material/ButtonGroup";
import Alert from "@mui/material/Alert";
import React, { useEffect, useState } from "react";
import { useRefresh, WithListContext } from "react-admin";
import DashResourceButton from "dash-auto-admin/src/toolbar/buttons/DashResourceButton";
import { toast } from 'react-toastify';
import { useMallClientTabsContext } from './MallClientTabsContext';

import OrderProductsView from "./OrderProductsView";


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
                    <Alert severity="info" sx={{ mb: { xs: 0.5, sm: 2 } }}>
                        No tienes órdenes activas. Puedes crear una nueva orden usando el menú.
                    </Alert>
                )}
                <Box sx={{
                    display: 'grid', 
                    gap: { xs: 0.5, sm: 1 }, 
                    gridTemplateColumns: {
                        xs: 'repeat(1, 1fr)',
                        md: 'repeat(2, 1fr)',
                        lg: 'repeat(3, 1fr)'
                    },
                    backgroundColor: 'transparent',
                    p: { xs: 0.5, sm: 1 },
                    m: { xs: 0.5, sm: 1 }
                }}>
                    {data?.map((record: any) => {
                        return (
                        <Card className="dash-kitchen-tab" key={record.id} sx={{ p: { xs: 0.5, sm: 1 }, mb: { xs: 0.5, sm: 2 }, backgroundColor: 'transparent' }}>
                            <Box sx={{ display: 'flex' }}>
                                <Box sx={{ flex: 1 }}>
                                  
                                    <CardHeader
                                        sx={{ p: 0 }}
                                        title={
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                                <Typography variant="h5">{`Orden #${record.id}`}</Typography>
                                                <ButtonGroup style={{ alignItems: "center" }} orientation="horizontal" variant="text" size="small">
                                                    {/*<TabTimerClock createdAt={(record as ITab).date_confirmed} />*/}

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