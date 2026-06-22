import React, { useCallback, useState } from 'react';
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Stack,
} from '@mui/material';
import {
    Payment as PaymentIcon,
    CheckCircle as ConfirmIcon,
    Cancel as CancelIcon,
} from '@mui/icons-material';
import { useTranslate, useRecordContext, useNotify } from 'react-admin';
import { useAxios } from 'dash-axios-hook';
import { AuthPersistenceService } from 'dash-auth';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';

/**
 * SelfServiceOrderActions - Display action buttons on self-service order card
 *
 * Shows:
 * - "Pagar en línea" button (if checkout enabled + available + not paid)
 * - "Confirmar Pedido" button (if self-confirm enabled + not confirmed)
 * - "Cancelar Pedido" button (if not paid/confirmed yet)
 *
 * After successful action, refreshes the order record via parent context
 */
export const SelfServiceOrderActions: React.FC<IDashAutoAdminCustomFieldComponent> = () => {
    const record = useRecordContext<any>();
    const translate = useTranslate();
    const notify = useNotify();
    const axios = useAxios();

    const [isPayingOnline, setIsPayingOnline] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [isCanceling, setIsCanceling] = useState(false);

    const selfservice = AuthPersistenceService.getSystemValues()?.selfservice;
    const onlineCheckoutAvailable = !!(
        selfservice?.checkout_gateway_enabled &&
        selfservice?.checkout_gateway_available
    );
    const userConfirmEnabled = selfservice?.user_confirm_order_enabled;
    const sessionHash = selfservice?.session_hash;

    // Don't show actions for orders that are paid or confirmed (already processing)
    const isFinalized = record?.status && ['CONFIRMED', 'IN_PREPARATION', 'PREPARED', 'DELIVERED', 'CLOSED', 'CANCELLED'].includes(record.status);
    const isPaid = record?.order?.is_paid;

    if (!record || isFinalized || isPaid) {
        return null;
    }

    const payOnline = useCallback(async () => {
        if (!sessionHash) {
            notify(translate('mall.checkout_error', { _: 'No active session' }), { type: 'error' });
            return;
        }

        // Build return URL to the order detail page after payment completes
        // Redirects directly to the tab/order detail, not a separate checkout page
        const returnUrl = `${window.location.protocol}//${window.location.host}/selfservice/${sessionHash}/tab/${record.id}`;

        // Open payment tab synchronously - mobile browsers block popups after async calls
        const paymentTab = window.open('', '_blank');
        setIsPayingOnline(true);

        try {
            const res = await axios.post(`/public/selfservice/${sessionHash}/checkout/session`, {
                order_id: record.id,
                amount: record.order?.total_amount || 0,
                return_url: returnUrl,
            });

            const data = res?.data ?? res;
            if (data?.redirect_url) {
                if (paymentTab) {
                    paymentTab.location.href = data.redirect_url;
                } else {
                    window.location.href = data.redirect_url;
                }
                // Kiosk will receive WebSocket notification when payment is confirmed
                notify(translate('mall.checkout_started', { _: 'Iniciando pago en línea...' }), { type: 'info' });
            } else {
                paymentTab?.close();
                notify(translate('mall.checkout_error', { _: 'No se pudo iniciar el pago' }), { type: 'error' });
            }
        } catch (error: any) {
            paymentTab?.close();
            const message = error?.response?.data?.message || translate('mall.checkout_error', { _: 'Error al iniciar pago' });
            notify(message, { type: 'error' });
        } finally {
            setIsPayingOnline(false);
        }
    }, [sessionHash, record.id, record.order?.total_amount, axios, notify, translate]);

    const confirmOrder = useCallback(async () => {
        if (!sessionHash) {
            notify(translate('mall.checkout_error', { _: 'No active session' }), { type: 'error' });
            return;
        }

        setIsConfirming(true);
        try {
            await axios.post(`/public/selfservice/${sessionHash}/tab/${record.id}/confirm`);
            notify(translate('mall.order_confirmed', { _: 'Pedido confirmado' }), { type: 'success' });
            // Refresh record - will show new status
            window.location.reload();
        } catch (error: any) {
            const message = error?.response?.data?.message || translate('mall.confirm_error', { _: 'Error al confirmar' });
            notify(message, { type: 'error' });
        } finally {
            setIsConfirming(false);
        }
    }, [sessionHash, record.id, axios, notify, translate]);

    const cancelOrder = useCallback(async () => {
        if (!sessionHash) {
            notify(translate('mall.checkout_error', { _: 'No active session' }), { type: 'error' });
            return;
        }

        setIsCanceling(true);
        try {
            await axios.delete(`/public/selfservice/${sessionHash}/tab/${record.id}`);
            notify(translate('mall.order_cancelled', { _: 'Pedido cancelado' }), { type: 'success' });
            // Refresh - will show cancelled status
            window.location.reload();
        } catch (error: any) {
            const message = error?.response?.data?.message || translate('mall.cancel_error', { _: 'Error al cancelar' });
            notify(message, { type: 'error' });
        } finally {
            setIsCanceling(false);
            setCancelDialogOpen(false);
        }
    }, [sessionHash, record.id, axios, notify, translate]);

    return (
        <>
            <Box sx={{ mt: 3, mb: 2 }} className="kt-self-service-order-actions">
                <Stack spacing={1.5}>
                    {/* Pay Online - Primary action if enabled */}
                    {onlineCheckoutAvailable && (
                        <Button
                            fullWidth
                            variant="contained"
                            color="success"
                            size="large"
                            onClick={payOnline}
                            disabled={isPayingOnline}
                            startIcon={isPayingOnline ? <CircularProgress size={20} color="inherit" /> : <PaymentIcon />}
                            sx={{
                                py: 1.5,
                                fontWeight: 700,
                                fontSize: '1rem',
                            }}
                        >
                            {isPayingOnline
                                ? translate('mall.checkout_redirecting', { _: 'Redirigiendo...' })
                                : translate('mall.pay_online', { _: 'Pagar en línea' })}
                        </Button>
                    )}

                    {/* Confirm Order - if enabled and not paid */}
                    {userConfirmEnabled && !isPaid && (
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            size="large"
                            onClick={confirmOrder}
                            disabled={isConfirming || isPayingOnline}
                            startIcon={isConfirming ? <CircularProgress size={20} color="inherit" /> : <ConfirmIcon />}
                            sx={{
                                py: 1.5,
                                fontWeight: 700,
                                fontSize: '1rem',
                            }}
                        >
                            {isConfirming
                                ? translate('mall.confirming', { _: 'Confirmando...' })
                                : translate('mall.confirm_order', { _: 'Confirmar Pedido' })}
                        </Button>
                    )}

                    {/* Cancel Order - Secondary action */}
                    <Button
                        fullWidth
                        variant="outlined"
                        color="error"
                        size="medium"
                        onClick={() => setCancelDialogOpen(true)}
                        disabled={isCanceling || isPayingOnline || isConfirming}
                        startIcon={<CancelIcon />}
                        sx={{
                            py: 1.2,
                            fontWeight: 600,
                        }}
                    >
                        {translate('mall.cancel_order', { _: 'Cancelar Pedido' })}
                    </Button>
                </Stack>
            </Box>

            {/* Confirm Cancel Dialog */}
            <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
                <DialogTitle>{translate('mall.cancel_order_confirm_title', { _: '¿Cancelar pedido?' })}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {translate('mall.cancel_order_confirm_message', { _: '¿Estás seguro de que deseas cancelar este pedido?' })}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCancelDialogOpen(false)}>
                        {translate('common.no', { _: 'No' })}
                    </Button>
                    <Button
                        onClick={cancelOrder}
                        color="error"
                        variant="contained"
                        disabled={isCanceling}
                    >
                        {isCanceling ? <CircularProgress size={20} /> : translate('mall.cancel_order', { _: 'Cancelar' })}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default SelfServiceOrderActions;
