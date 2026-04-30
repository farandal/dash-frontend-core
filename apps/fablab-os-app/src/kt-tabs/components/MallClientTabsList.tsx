import { IDashAutoAdminCustomFieldComponent, IDashAutoAdminDataGrid } from "dash-auto-admin";
import { ITab } from "./interfaces/ITab";
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Typography,
    CircularProgress,
    ButtonGroup,
    Alert
} from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { useGetOne, useRefresh, WithListContext } from "react-admin";
import DashResourceButton from "dash-auto-admin/src/toolbar/buttons/DashResourceButton";
import { toast } from 'react-toastify';
import LaravelEchoContext from 'dash-admin/src/contexts/com/LaravelEchoContext';
import type { ILaravelEchoContext } from 'dash-admin/src/contexts/com/LaravelEchoContext';
import ImagePlaceHolder from 'kt-utils/src/components/ImagePlaceHolder/ImagePlaceHolder';
import TabTimerClock from "./Misc/TabTimerClock";

const placeholder = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="

const OrderProductsView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ record }) => {
    const tab: ITab = record as ITab;

    const { data: tabData } = useGetOne('public/mall/tab', { id: tab.id });

    if (!tabData) return <CircularProgress />;
    return (
        <div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                    {tabData?.order?.items?.map((item) => (
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
                    ))}
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

const MallClientTabsList: React.FC<IDashAutoAdminDataGrid> = ({ resourceConfig }) => {
    const { lastEvent } = useContext<ILaravelEchoContext>(LaravelEchoContext);
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
        // Handle classic tab status updates
        if (lastEvent?.model === "Domain\\App\\Models\\Tab\\Tab" && 
            lastEvent.data?.type === "tab.status") {
            showMessage(`Se ha cambiado el estado de la orden ${lastEvent.data.old} a ${lastEvent.data.new}`);
            refresh();
        }
        
        // Handle tab updates
        if (lastEvent?.model === "Domain\\App\\Models\\Tab\\Tab" && 
            lastEvent.data?.type === "tab.update") {
            refresh();
        }

        // Handle mall order status updates - from Tab model
        if (lastEvent?.model === "Domain\\App\\Models\\Tab\\Tab" && 
            lastEvent.data?.type === "mall_order_status_update") {
            const data = lastEvent.data as IOrderStatusUpdateNotification;
            showMessage(`${data.tenant_name || 'El restaurante'} ha actualizado tu orden a: ${statusLabel[data.status] || data.status}`);
            refresh();
        }

        // Handle mall order status updates - from Order model
        if (lastEvent?.model === "Domain\\App\\Models\\Order\\Order" && 
            lastEvent.data?.type === "mall_order_status_update") {
            const data = lastEvent.data as IOrderStatusUpdateNotification;
            showMessage(`${data.tenant_name || 'El restaurante'} ha actualizado tu orden a: ${statusLabel[data.status] || data.status}`);
            refresh();
        }
    }, [lastEvent]);

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
                    {data?.map((record: any) => (
                        <Card className="dash-kitchen-tab" key={record.id} sx={{ p: 1, mb: 2 }}>
                            <Box sx={{ display: 'flex' }}>
                                <Box sx={{ flex: 1 }}>
                                    <CardHeader
                                        sx={{ p: 0 }}
                                        title={
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                                <Typography variant="h5">{`Orden X #${String(record.id).slice(-6)}`}</Typography>
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
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                                            <Chip
                                                label={`${statusLabel[(record as ITab).status] || record.status} ${record.date_confirmed ? `- ${new Date(
                                                    record.status === 'CREATED' ? record.date_created :
                                                        record.status === 'CONFIRMED' ? record.date_confirmed :
                                                            record.status === 'IN_PREPARATION' ? record.date_in_preparation :
                                                                record.status === 'PREPARED' ? record.date_prepared :
                                                                    record.status === 'DELIVERED' ? record.date_delivered :
                                                                        record.status === 'CLOSED' ? record.date_closed :
                                                                            record.date_created
                                                ).toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}` : ''}`}
                                                size="small"
                                                color={
                                                    record.status === 'CREATED' ? 'default' :
                                                        record.status === 'CONFIRMED' ? 'primary' :
                                                            record.status === 'IN_PREPARATION' ? 'warning' :
                                                                record.status === 'PREPARED' ? 'info' :
                                                                    record.status === 'DELIVERED' ? 'success' :
                                                                        record.status === 'CLOSED' ? 'secondary' : 
                                                                            record.status === 'CANCELLED' ? 'error' : 'default'
                                                }
                                            />
                                        </Box>

                                        <OrderProductsView resourceConfig={resourceConfig} record={record} attribute={undefined} method={"view"} />
                                         
                                    </CardContent>
                                </Box>
                            </Box>
                        </Card>
                    ))}
                </Box>
            </>
        )} />
    );
};

export default MallClientTabsList;