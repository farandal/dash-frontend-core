import { FC, useEffect, useRef } from 'react';
import { useRefresh } from 'react-admin';
import { toast } from 'react-toastify';
import { useMallServiceEcho } from './MallServiceEchoContext';
import { useDispatch } from 'react-redux';

import { DASH_REDUX_ACTIONS } from 'dash-admin-state';
// Use MallService specific header actions with notifications
import MallServiceHeaderActions from '../components/MallServiceHeaderActions';

// Status labels for display
const STATUS_LABELS: Record<string, string> = {
    'CREATED': 'Creada',
    'CONFIRMED': 'Confirmada',
    'IN_PREPARATION': 'En Preparación',
    'PREPARED': 'Preparada',
    'DELIVERED': 'Entregada',
    'CLOSED': 'Cerrada',
    'CANCELLED': 'Cancelada',
};

/**
 * MallServiceAppHookComponent
 * 
 * A headless component that mounts inside the authenticated app context.
 * It listens to websocket events from MallServiceEchoContext and triggers
 * global UI feedback (toasts, sounds, vibrations) and data refreshes.
 */
const MallServiceAppHookComponent: FC = () => {
   
    const refresh = useRefresh();
    const { lastEvent } = useMallServiceEcho();
    // Track processed events to avoid duplicates
    const lastProcessedEventId = useRef<string | null>(null);

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(
            DASH_REDUX_ACTIONS.setHeaderComponent(MallServiceHeaderActions),
        );
    }, [dispatch]);

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

    useEffect(() => {
        if (!lastEvent) return;

        // Generate a unique ID for the event if not present
        const eventId = lastEvent.id || `${lastEvent.event}-${lastEvent.timestamp || Date.now()}`;
        
        if (lastProcessedEventId.current === eventId) {
            return;
        }

        console.log('🔔 MallServiceAppHook: Received event', lastEvent);
        lastProcessedEventId.current = eventId;

        // Helper to find the relevant payloads
        // Structure based on logs:
        // Level 0: lastEvent { data: ... }
        // Level 1: lastEvent.data { notificationPayload: ... }  <-- this has message
        // Level 2: lastEvent.data.notificationPayload { notificationPayload: ... } <-- this has status/data
        
        let richPayload: any = lastEvent;
        let dataPayload: any = lastEvent;

        // Step 1: Unwrap the outer 'data' wrapper if present (Laravel Echo standard)
        if (lastEvent.data) {
            richPayload = lastEvent.data;
            dataPayload = lastEvent.data;
        }

        // Step 2: Check for 'notificationPayload' wrapper (AppNotification standard)
        if (richPayload.notificationPayload) {
            // This is usually the "Rich" payload containing the message and title
            richPayload = richPayload.notificationPayload;
            
            // The actual data payload is often nested one level deeper
            if (richPayload.notificationPayload) {
                dataPayload = richPayload.notificationPayload;
            } else if (richPayload.data) {
                dataPayload = richPayload.data;
            } else {
                dataPayload = richPayload;
            }
        } else if (richPayload.data) {
             // Sometimes it's just 'data'
             dataPayload = richPayload.data;
             
             // Check if there is a notificationPayload inside that data
             if (dataPayload.notificationPayload) {
                 richPayload = dataPayload.notificationPayload; // Update rich to this level
                 if (richPayload.notificationPayload) {
                     dataPayload = richPayload.notificationPayload;
                 } else {
                     dataPayload = richPayload;
                 }
             }
        }

        console.log('🔔 MallServiceAppHook: Payload extraction', { 
            original: lastEvent,
            rich: richPayload, 
            data: dataPayload, 
            richMessage: richPayload?.message 
        });

        // Check if it's a relevant event with robust matching
        const isMallOrderUpdate = 
            // Standard Mall events
            lastEvent.event === 'mall_order_status_update' ||
            lastEvent.type === 'mall_order_status_update' ||
            richPayload?.type === 'mall_order_status_update' ||
            dataPayload?.type === 'mall_order_status_update' ||
            // Self-Service events
            lastEvent.event === 'selfservice_session_order_status_update' ||
            lastEvent.type === 'selfservice_session_order_status_update' ||
            richPayload?.type === 'selfservice_session_order_status_update' ||
            dataPayload?.type === 'selfservice_session_order_status_update';
        
        // Handle specific event types
        if (isMallOrderUpdate) {
            const status = dataPayload?.new || dataPayload?.status || dataPayload?.child_status || dataPayload?.tenant_tab_status || 'UPDATED';
            const tenantName = dataPayload?.tenant_name || richPayload?.tenant_name || 'El restaurante';
            const statusLabel = STATUS_LABELS[status] || status;
            
            // Prefer the localized message from the backend (richPayload.message)
            let message = richPayload?.message;
            
            console.log('🔄 MallServiceAppHook: Order status update received', {
                status,
                tenantName,
                message,
                richPayloadMessage: richPayload?.message
            });
            
            if (!message) {
                 if (status === 'CONFIRMED') {
                    message = `¡${tenantName} ha confirmado tu orden y comenzará a prepararla pronto!`;
                } else if (status === 'IN_PREPARATION') {
                    message = `¡${tenantName} está preparando tu orden!`;
                } else if (status === 'PREPARED') {
                    message = `¡Tu orden de ${tenantName} está lista!`;
                } else if (status === 'DELIVERED') {
                    message = `¡Tu orden de ${tenantName} ha sido entregada!`;
                } else {
                    message = `${tenantName}: ${statusLabel}`;
                }
            }
            
            // Show toast notification using react-toastify
            // We use toast.info for generic, success for positives, warning for delays/issues if needed
            // Keeping it simple with colored bars or icons if configured, but default toast works.
            // User requested manual close only (autoClose: false)
            const toastOptions = { 
                autoClose: false as const,
                closeOnClick: true, // Keep open if clicked (unless on close button)
                draggable: true
            };

            if (status === 'PREPARED' || status === 'DELIVERED') {
                 toast.success(message, toastOptions);
            } else if (status === 'CANCELLED') {
                 toast.error(message, toastOptions);
            } else {
                 toast.info(message, toastOptions);
            }
            
            // Trigger data refresh to update the orders list
            console.log('🔄 MallServiceAppHook: Triggering data refresh');
            refresh();
            
            playNotificationSound();
        }
        
    }, [lastEvent, refresh]);

    return null; // Headless component
};

export default MallServiceAppHookComponent;

