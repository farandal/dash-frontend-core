import { IDashAutoAdminDataGrid } from "dash-auto-admin";
// Direct imports from kt-tabs (avoid barrel exports for tree-shaking)
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";
import ButtonGroup from "@mui/material/ButtonGroup";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import React, { useEffect, useState } from "react";
import { useRefresh, WithListContext, useTranslate, useNotify } from "react-admin";
import DashResourceButton from "dash-auto-admin/src/toolbar/buttons/DashResourceButton";
import { toast } from 'react-toastify';
import { useAxios } from 'dash-axios-hook';
import { AuthPersistenceService } from 'dash-auth';
import { useMallClientTabsContext } from './MallClientTabsContext';

import OrderProductsView from "./OrderProductsView";


const MallClientTabsList: React.FC<IDashAutoAdminDataGrid> = ({ resourceConfig }) => {
    // Use MallClientTabsContext for WebSocket events and tenant status tracking
    // This context subscribes to the WebSocket channel and provides lastEvent
    const { lastEvent, tenantStatusesByTab, sessionHash } = useMallClientTabsContext();
    const refresh = useRefresh();
    const translate = useTranslate();
    const notify = useNotify();
    const axios = useAxios();
    const [confirmingTabId, setConfirmingTabId] = useState<string | number | null>(null);
    const [payingTabId, setPayingTabId] = useState<string | number | null>(null);

    const userConfirmOrderEnabled = !!AuthPersistenceService.getSystemValues()?.selfservice?.user_confirm_order_enabled;
    const checkoutEnabled = !!AuthPersistenceService.getSystemValues()?.selfservice?.checkout_gateway_enabled;
    const checkoutAvailable = !!AuthPersistenceService.getSystemValues()?.selfservice?.checkout_gateway_available;

    const handleConfirmOrder = async (tabId: string | number) => {
        if (!sessionHash) return;

        setConfirmingTabId(tabId);
        try {
            await axios.post(`/public/selfservice/${sessionHash}/tab/${tabId}/confirm`);
            refresh();
        } catch (error: any) {
            notify(translate('mall.confirm_order_error', { error: error?.response?.data?.message || error.message }), { type: 'error' });
        } finally {
            setConfirmingTabId(null);
        }
    };

    const handlePayOnline = async (tabId: string | number, amount: number) => {
        if (!sessionHash) {
            notify(translate('mall.checkout_error', { _: 'No active session' }), { type: 'error' });
            return;
        }

        // Build return URL from current app domain (where user will return after payment)
        // This ensures return redirects back to app-dev.kitchntabs.com or app.kitchntabs.com
        const returnUrl = `${window.location.protocol}//${window.location.host}/checkout/return/${sessionHash}`;

        // Open payment tab synchronously - mobile browsers block popups after async calls
        const paymentTab = window.open('', '_blank');
        setPayingTabId(tabId);

        try {
            const res = await axios.post(`/public/selfservice/${sessionHash}/checkout/session`, {
                order_id: tabId,
                amount: amount,
                return_url: returnUrl,
            });

            const data = res?.data ?? res;
            if (data?.redirect_url) {
                if (paymentTab) {
                    paymentTab.location.href = data.redirect_url;
                } else {
                    window.location.href = data.redirect_url;
                }
            } else {
                paymentTab?.close();
                notify(translate('mall.checkout_error', { _: 'No se pudo iniciar el pago' }), { type: 'error' });
            }
        } catch (error: any) {
            paymentTab?.close();
            const message = error?.response?.data?.message || translate('mall.checkout_error', { _: 'Error al iniciar pago' });
            notify(message, { type: 'error' });
        } finally {
            setPayingTabId(null);
        }
    };

    const getStatusLabel = (status: string) => {
        return translate(`tab.status.${status.toLowerCase()}`, { _: status });
    };

    const showMessage = (info: string) => {
        toast.info(<>{info}</>, {
            position: 'top-center',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: false,
            style: {
                fontSize: '0.85rem',
                padding: '8px 12px',
                minHeight: 'auto',
            },
        });
    };

    // Listen for tab status updates via WebSocket
    useEffect(() => {
        if (!lastEvent) return;

        // Handle tab status updates
        if ((lastEvent as any)?.model === "Domain\\App\\Models\\Tab\\Tab" && 
            lastEvent.data?.type === "tab.status") {
            const oldStatus = getStatusLabel(lastEvent.data.old);
            const newStatus = getStatusLabel(lastEvent.data.new);
            showMessage(translate('tab.status_change_notification', { old: oldStatus, new: newStatus }));
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
            const status = payload.status || payload.new || 'updated';
            const statusText = getStatusLabel(status);
            
            // Using a generic message for now, or reuse status change if apt
            // "Restaurant updated your order to: Status"
            showMessage(`${tenantName}: ${statusText}`); 
            refresh();
        }
    }, [lastEvent, refresh, translate]);

    return (
        <WithListContext render={({ isPending, data }) => (
            <>
                {data?.length === 0 && (
                    <Alert severity="info" sx={{ mb: { xs: 0.5, sm: 2 } }}>
                        {translate('mall.no_active_orders')}
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
                                                <Typography variant="h5">{`Orden #${String(record.id).slice(-6)}`}</Typography>
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

                                        {/* Action buttons for CREATED orders */}
                                        {record.status === 'CREATED' && (
                                            <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexDirection: { xs: 'column', sm: 'row' } }}>
                                                {/* Pay Online - if enabled and not paid */}
                                                {checkoutEnabled && checkoutAvailable && !record.order?.is_paid && (
                                                    <Button
                                                        fullWidth
                                                        variant="contained"
                                                        color="success"
                                                        size="small"
                                                        sx={{ flex: 1 }}
                                                        disabled={payingTabId === record.id}
                                                        startIcon={payingTabId === record.id ? <CircularProgress size={14} color="inherit" /> : null}
                                                        onClick={() => handlePayOnline(record.id, record.order?.total_amount || 0)}
                                                    >
                                                        {payingTabId === record.id
                                                            ? translate('mall.checkout_redirecting', { _: 'Pagando...' })
                                                            : translate('mall.pay_online', { _: 'Pagar' })
                                                        }
                                                    </Button>
                                                )}

                                                {/* Confirm Order - if enabled */}
                                                {userConfirmOrderEnabled && (
                                                    <Button
                                                        fullWidth
                                                        variant="outlined"
                                                        color="primary"
                                                        size="small"
                                                        sx={{ flex: 1 }}
                                                        disabled={confirmingTabId === record.id}
                                                        startIcon={confirmingTabId === record.id ? <CircularProgress size={14} color="inherit" /> : null}
                                                        onClick={() => handleConfirmOrder(record.id)}
                                                    >
                                                        {confirmingTabId === record.id
                                                            ? translate('mall.confirming', { _: 'Confirmando...' })
                                                            : translate('mall.confirm_own_order', { _: 'Confirmar' })
                                                        }
                                                    </Button>
                                                )}
                                            </Box>
                                        )}
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