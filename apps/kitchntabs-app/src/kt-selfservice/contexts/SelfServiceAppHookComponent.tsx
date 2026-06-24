import { FC, useEffect, useRef } from 'react';
import { useNotify, useTranslate, useRefresh } from 'react-admin';
import { useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useSelfServiceEcho } from './SelfServiceEchoContext';
import { useDispatch } from 'react-redux';
import { useDialog } from 'dash-dialog';
import { useAxios } from 'dash-axios-hook';
import { AuthPersistenceService } from 'dash-auth';
import { dashStorage } from 'dash-utils';

import { DASH_REDUX_ACTIONS } from 'dash-admin-state';
import SelfServiceHeaderActions from '@app/components/selfservice/SelfServiceHeaderActions';


/**
 * SelfServiceAppHookComponent
 *
 * A headless component that mounts inside the authenticated app context (via the
 * app's AdminHook). Because it lives inside the app providers, both
 * `useDialog()` (dash-dialog) and react-query's `useQueryClient()` are available
 * here — unlike MallAppMediator, which sits outside them.
 *
 * Responsibilities:
 * - Listen to websocket events from SelfServiceEchoContext and surface toasts.
 * - Handle the return from the checkout gateway: the gateway redirects the
 *   customer back to the kiosk SPA with `?transaction={id}`. We look up that
 *   transaction's outcome, refresh the order/tab cache, and show a success toast
 *   or a non-intrusive, closeable failure dialog.
 */
const SelfServiceAppHookComponent: FC = () => {
    const notify = useNotify();
    const translate = useTranslate();
    const refresh = useRefresh();
    const location = useLocation();
    const queryClient = useQueryClient();
    const dialog = useDialog();
    const axios = useAxios();
    const { lastEvent } = useSelfServiceEcho();
    // Track processed events to avoid duplicates
    const lastProcessedEventId = useRef<string | null>(null);
    // Track processed checkout returns to avoid re-prompting on re-render
    const processedTransactionRef = useRef<string | null>(null);


    const dispatch = useDispatch();

    useEffect(() => {

            dispatch(
                DASH_REDUX_ACTIONS.setHeaderComponent(SelfServiceHeaderActions),
            );

    }, []);


    // Sound effect for notifications (optional)
    const playNotificationSound = () => {
        try {
            // Simple beep or use a proper audio file if available in assets
            // const audio = new Audio('/assets/sounds/notification.mp3');
            // audio.play().catch(e => console.warn('Audio play failed', e));
        } catch (e) {
            console.warn('Sound playback failed', e);
        }
    };

    // Resolve the active self-service session hash.
    const getSessionHash = (): string | null =>
        AuthPersistenceService.getSystemValues()?.selfservice?.session_hash
        || (dashStorage.getItem('selfservice-session-hash') as string | null)
        || null;

    // Force the order/tab list + detail to refetch (bypasses stale react-query cache).
    const refreshOrders = () => {
        try {
            queryClient.invalidateQueries({ queryKey: ['tab'] });
        } catch (e) {
            console.warn('[SelfServiceAppHook] cache invalidation failed', e);
        }
        refresh();
    };

    /**
     * Handle the return from the checkout gateway.
     *
     * The gateway sends the customer back to `/selfservice/{hash}/tab/{tabId}`
     * with `?transaction={id}` (DashTest) — or, via the generic web return route,
     * `?returned_from_payment=true`. We strip the param from the URL (so a manual
     * refresh doesn't re-trigger), refresh the order data, and — when we have a
     * transaction id — branch success vs failure off its real status.
     */
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const transactionId = params.get('transaction');
        const returnedFlag = params.get('returned_from_payment');

        if (!transactionId && !returnedFlag) return;
        if (transactionId && processedTransactionRef.current === transactionId) return;
        if (transactionId) processedTransactionRef.current = transactionId;

        // Strip payment params from the URL so a refresh doesn't re-run this.
        const cleanedUrl = `${location.pathname}${location.hash || ''}`;
        window.history.replaceState({}, '', cleanedUrl);

        // No transaction id to inspect (generic return route): just refresh.
        if (!transactionId) {
            refreshOrders();
            return;
        }

        const hash = getSessionHash();
        if (!hash) {
            refreshOrders();
            return;
        }

        (async () => {
            try {
                const res = await axios.get(`/public/selfservice/${hash}/checkout/transaction/${transactionId}`);
                const data = res?.data?.data ?? res?.data ?? res;
                const status = data?.status;
                const isPaid = data?.is_paid;

                // Always refresh so paid/confirmed orders drop their pay/cancel buttons.
                refreshOrders();

                if (status === 'paid' || isPaid) {
                    notify(
                        translate('selfservice.checkout.paid', { _: 'Pago confirmado. Tu pedido fue pagado.' }),
                        { type: 'success', autoHideDuration: 5000 },
                    );
                } else if (status === 'rejected' || status === 'failed') {
                    // Non-intrusive, closeable failure dialog.
                    dialog && dialog({
                        variant: 'danger',
                        title: translate('selfservice.checkout.failed_title', { _: 'Pago no completado' }),
                        content: translate('selfservice.checkout.failed_content', {
                            _: 'El pago fue rechazado o cancelado. Puedes intentar pagar nuevamente desde tu pedido.',
                        }),
                        showConfirmButton: true,
                        showCloseButton: true,
                        confirmText: translate('common.understood', { _: 'Entendido' }),
                    });
                }
                // pending/authorized: stay quiet; data already refreshed.
            } catch (e) {
                // Lookup failed — stay non-intrusive, but still refresh the list.
                refreshOrders();
                console.warn('[SelfServiceAppHook] transaction status lookup failed', e);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search]);

    useEffect(() => {
        if (!lastEvent) return;

        // Generate a unique ID for the event if not present
        const eventId = lastEvent.id || `${lastEvent.event}-${lastEvent.timestamp || Date.now()}`;

        if (lastProcessedEventId.current === eventId) {
            return;
        }

        console.log('🔔 SelfServiceAppHook: Received event', lastEvent);
        lastProcessedEventId.current = eventId;

        const eventType = lastEvent.event;
        const payload = lastEvent.notificationPayload || lastEvent;

        // Handle specific event types
        if (eventType === 'selfservice_session_order_status_update') {
            // is_update = the order's contents (products/notes/amount) were edited by staff,
            // without a status change. Show an "updated" toast instead of a status one.
            const isContentUpdate = !!(payload.is_update ?? payload.data?.is_update);
            const status = payload.status;
            const message = isContentUpdate
                ? translate('selfservice.order_updated', { _: 'El restaurante actualizó tu pedido' })
                : (payload.message || `Order updated: ${status}`);

            // Show toast notification
            notify(message, {
                type: 'info',
                autoHideDuration: 5000
            });

            // Any live change (status OR a staff content edit) must refresh the order list/detail
            // so the kiosk reflects the new items/quantities/notes and drops stale action buttons.
            refreshOrders();

            playNotificationSound();
        }

    }, [lastEvent, notify]);

    return null; // Headless component
};

export default SelfServiceAppHookComponent;
