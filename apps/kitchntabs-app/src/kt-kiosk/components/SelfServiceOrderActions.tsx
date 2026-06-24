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
    Typography,
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

    // NOTE: return-from-payment handling (cache refresh + success/failure dialog)
    // lives globally in SelfServiceAppHookComponent, which always stays mounted
    // and has access to useDialog/useQueryClient. Keeping it there avoids
    // depending on this card being the page the gateway happens to land on.

    const selfservice = AuthPersistenceService.getSystemValues()?.selfservice;
    const onlineCheckoutAvailable = !!(
        selfservice?.checkout_gateway_enabled &&
        selfservice?.checkout_gateway_available
    );
    const userConfirmEnabled = selfservice?.user_confirm_order_enabled;
    const sessionHash = selfservice?.session_hash;

    // Check order status and payment state
    const isPaid = record?.order?.is_paid;
    const isConfirmed = record?.status === 'CONFIRMED';
    const isCreated = record?.status === 'CREATED';
    // Terminal states: the order is finished — nothing more to do here.
    const isTerminal = record?.status && ['CLOSED', 'CANCELLED'].includes(record.status);

    // The order can be paid online at ANY active step (CREATED → DELIVERED), as long as it is not
    // already paid and not closed/cancelled — it must be paid before closing. (Staff can also
    // settle it at the counter / staff app, which is outside the self-service module.)
    const canPay = onlineCheckoutAvailable && !isPaid && !isTerminal;

    if (!record) {
        return null;
    }

    // Show nothing once the order is closed/cancelled.
    if (isTerminal) {
        return null;
    }

    // If order is paid, show paid badge and disable all actions
    if (isPaid) {
        return (
            <Box sx={{ mt: 3, mb: 2 }}>
                <Box
                    sx={{
                        p: 2,
                        backgroundColor: '#d4edda',
                        border: '1px solid #c3e6cb',
                        borderRadius: 1,
                        textAlign: 'center',
                    }}
                >
                    <Typography variant="body2" sx={{ color: '#155724', fontWeight: 600 }}>
                        ✓ {translate('mall.order_paid', { _: 'Pedido Pagado' })}
                    </Typography>
                </Box>
            </Box>
        );
    }

    const payOnline = useCallback(async () => {
        if (!sessionHash) {
            notify(translate('mall.checkout_error', { _: 'No active session' }), { type: 'error' });
            return;
        }

        // Guard: an order can be paid until it is closed/cancelled or already paid.
        if (record?.order?.is_paid || ['CLOSED', 'CANCELLED'].includes(record?.status)) {
            notify(translate('mall.checkout_not_payable', { _: 'Este pedido ya no puede pagarse en línea' }), { type: 'warning' });
            return;
        }

        // Build return URL to the order detail page after payment completes
        // Redirects directly to the tab/order detail, not a separate checkout page
        const returnUrl = `${window.location.protocol}//${window.location.host}/selfservice/${sessionHash}/tab/${record.id}`;

        setIsPayingOnline(true);

        try {
            const res = await axios.post(`/public/selfservice/${sessionHash}/checkout/session`, {
                order_id: record.id,
                amount: record.order?.total_amount || 0,
                return_url: returnUrl,
            });

            const data = res?.data ?? res;
            if (data?.redirect_url) {
                // Redirect to payment gateway in the same window/tab (no new tab)
                window.location.href = data.redirect_url;
            } else {
                notify(translate('mall.checkout_error', { _: 'No se pudo iniciar el pago' }), { type: 'error' });
            }
        } catch (error: any) {
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
                    {/* Pay Online - only while the order is CREATED and unpaid */}
                    {canPay && (
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

                    {/* Confirm Order - self-confirm only while still CREATED */}
                    {userConfirmEnabled && isCreated && !isPaid && (
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

                    {/* Cancel Order - only while still CREATED and unpaid */}
                    {isCreated && !isPaid && (
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
                    )}

                    {/* Show locked message if confirmed */}
                    {isConfirmed && (
                        <Box
                            sx={{
                                p: 1.5,
                                backgroundColor: '#f8f9fa',
                                border: '1px solid #dee2e6',
                                borderRadius: 1,
                                textAlign: 'center',
                            }}
                        >
                            <Typography variant="body2" sx={{ color: '#6c757d', fontWeight: 500 }}>
                                {translate('mall.order_locked', { _: 'Pedido Confirmado - No se puede modificar' })}
                            </Typography>
                        </Box>
                    )}
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
