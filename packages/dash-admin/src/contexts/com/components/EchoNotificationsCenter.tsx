/**
 * EchoNotificationsCenter
 *
 * Wires LaravelEchoContext's real-time "urgency-alert" events into
 * dash-components' generic NotificationsCenter (bell button + menu + toast
 * stack + draggable dialogs). This replaces what used to be an ~500-line
 * NotificationsCenter.tsx hand-copied into every domain app — kitchntabs-app,
 * kitchntabs-system, kitchntabs-web, vanexa-app, vanexa-system, vanexa-web all
 * had byte-identical copies of this exact wiring. Each of those apps now just
 * renders <EchoNotificationsCenter /> instead of maintaining its own copy.
 *
 * kitchntabs-mall intentionally keeps its own NotificationsCenter — it also
 * handles mall-specific "mall_order_status_update" events with event
 * deduplication and translated messages, which is real business logic, not
 * duplicated boilerplate. Folding it into this shared component would need a
 * proper event-transformer API, not a copy/paste consolidation.
 */
import React, { useContext, useEffect } from 'react';
import { NotificationsCenter, useNotificationsCenter, type NotificationsCenterLabels } from 'dash-components';
import LaravelEchoContext, { ILaravelEchoContext } from '../LaravelEchoContext';

// Matches the hardcoded Spanish strings every duplicated app copy used to
// render (dash-components' defaults are English).
const spanishLabels: NotificationsCenterLabels = {
    title: 'Notificaciones',
    markAll: 'Marcar todas',
    noNotifications: 'No hay notificaciones',
    close: 'Cerrar',
    acknowledge: 'Entendido',
    customer: 'Cliente:',
    store: 'Tienda:',
    received: 'Recibido:',
    now: 'Ahora',
    minutesAgo: 'm',
    hoursAgo: 'h',
    daysAgo: 'd',
};

const EchoNotificationsCenter: React.FC = () => {
    const { lastEvent } = useContext<ILaravelEchoContext>(LaravelEchoContext);
    const hook = useNotificationsCenter({ labels: spanishLabels });

    useEffect(() => {
        if (lastEvent && lastEvent.type === 'urgency-alert') {
            const notification: any = lastEvent?.notificationPayload;
            hook.addNotification({
                title: notification?.title || 'Alerta',
                message: notification?.message || '',
                customer: notification?.customer_info?.name
                    ? `${notification.customer_info.name} - Mesa ${notification.customer_info.table}`
                    : '',
                store: notification?.store_info?.name || '',
                data: notification,
            }, { showDialog: true, showToast: true, toastSeverity: 'warning' });
        }
        // Only re-run when a new event arrives, matching the original per-app
        // implementations — addNotification's own setState calls are all
        // functional updates, so a stale hook reference here is harmless.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lastEvent]);

    return <NotificationsCenter notificationsHook={hook} />;
};

export default EchoNotificationsCenter;
