import React, { useCallback, useState } from 'react';
import { useNotify, useTranslate } from 'react-admin';
import { useAxios } from 'dash-axios-hook';
import { AuthPersistenceService } from 'dash-auth';
import CheckoutGatewayDialog, { ICheckoutGateway } from '../components/CheckoutGatewayDialog';

/**
 * Shared self-service online-payment flow, used by both the order card (SelfServiceOrderActions)
 * and the order list (MallClientTabsList).
 *
 * On startPayment(orderId, amount):
 *   1. Fetch the tenant's enabled checkout gateways.
 *   2. If 0–1 gateways → create the session immediately (skip the selection screen).
 *   3. If 2+ → open the CheckoutGatewayDialog (default first); on pick, create the session.
 * In all cases the returned redirect_url navigates the SAME tab to the gateway.
 *
 * Returns:
 *   - startPayment(orderId, amount)
 *   - payingOrderId  — the order currently being processed (for button spinners)
 *   - dialog         — the selection dialog element to render once in the consumer
 */
export function useSelfServiceCheckout() {
    const axios = useAxios();
    const notify = useNotify();
    const translate = useTranslate();

    const selfservice = AuthPersistenceService.getSystemValues()?.selfservice;
    const sessionHash = selfservice?.session_hash;
    // Tenant setting: when false, always use the default gateway (no selection screen). Default true.
    const allowGatewaySelection = selfservice?.allow_gateway_selection !== false;

    const [payingOrderId, setPayingOrderId] = useState<string | number | null>(null);
    const [gateways, setGateways] = useState<ICheckoutGateway[]>([]);
    const [pending, setPending] = useState<{ orderId: string | number; amount: number } | null>(null);
    const [selectingGatewayId, setSelectingGatewayId] = useState<string | number | null>(null);

    const fail = useCallback((message?: string) => {
        notify(message || translate('mall.checkout_error', { _: 'Error al iniciar pago' }), { type: 'error' });
        setPayingOrderId(null);
    }, [notify, translate]);

    const createSessionAndRedirect = useCallback(async (
        orderId: string | number,
        amount: number,
        gatewayId?: string | number,
    ) => {
        const returnUrl = `${window.location.protocol}//${window.location.host}/selfservice/${sessionHash}/tab/${orderId}`;
        try {
            const res = await axios.post(`/public/selfservice/${sessionHash}/checkout/session`, {
                order_id: orderId,
                amount,
                return_url: returnUrl,
                ...(gatewayId != null ? { checkout_gateway_id: gatewayId } : {}),
            });
            const data = res?.data ?? res;
            if (data?.redirect_url) {
                // Same-tab redirect to the gateway (DashTest bank page / Transbank Webpay).
                window.location.href = data.redirect_url;
            } else {
                fail(translate('mall.checkout_error', { _: 'No se pudo iniciar el pago' }));
            }
        } catch (error: any) {
            fail(error?.response?.data?.message);
        }
    }, [axios, sessionHash, fail, translate]);

    const startPayment = useCallback(async (orderId: string | number, amount: number) => {
        if (!sessionHash) {
            notify(translate('mall.checkout_error', { _: 'No active session' }), { type: 'error' });
            return;
        }

        setPayingOrderId(orderId);

        try {
            const res = await axios.get(`/public/selfservice/${sessionHash}/checkout/gateways`);
            const body = res?.data ?? res;
            const list: ICheckoutGateway[] = Array.isArray(body)
                ? body
                : (Array.isArray(body?.data) ? body.data : []);

            if (list.length <= 1 || !allowGatewaySelection) {
                // Single gateway, none (backend resolves default), or selection disabled by the
                // tenant → pay directly with the default (no gateway id → backend default).
                await createSessionAndRedirect(orderId, amount, list.length === 1 ? list[0]?.id : undefined);
            } else {
                // Multiple → show the selection screen (default first, already ordered by backend).
                setGateways(list);
                setPending({ orderId, amount });
                setPayingOrderId(null); // release the button spinner; the dialog drives from here
            }
        } catch (error: any) {
            fail(error?.response?.data?.message);
        }
    }, [axios, sessionHash, allowGatewaySelection, notify, translate, createSessionAndRedirect, fail]);

    const handleSelect = useCallback(async (gatewayId: string | number) => {
        if (!pending) return;
        const { orderId, amount } = pending;
        setSelectingGatewayId(gatewayId);
        await createSessionAndRedirect(orderId, amount, gatewayId);
        // Success → the page navigates to the gateway; failure → fail() already notified.
        // Either way clear the spinner (the dialog stays open on failure so the user can retry).
        setSelectingGatewayId(null);
    }, [pending, createSessionAndRedirect]);

    const dialog = (
        <CheckoutGatewayDialog
            open={!!pending}
            gateways={gateways}
            busyGatewayId={selectingGatewayId}
            onSelect={handleSelect}
            onClose={() => { setPending(null); setSelectingGatewayId(null); }}
        />
    );

    return { startPayment, payingOrderId, dialog };
}

export default useSelfServiceCheckout;
