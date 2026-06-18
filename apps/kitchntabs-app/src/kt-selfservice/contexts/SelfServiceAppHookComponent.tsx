import { FC, useEffect, useRef } from 'react';
import { useNotify } from 'react-admin';
import { useSelfServiceEcho } from './SelfServiceEchoContext';
import { useDispatch } from 'react-redux';

import { DASH_REDUX_ACTIONS } from 'dash-admin-state';
import SelfServiceHeaderActions from '@app/components/selfservice/SelfServiceHeaderActions';


  

/**
 * SelfServiceAppHookComponent
 * 
 * A headless component that mounts inside the authenticated app context.
 * It listens to websocket events from SelfServiceEchoContext and triggers
 * global UI feedback (toasts, sounds, vibrations).
 */
const SelfServiceAppHookComponent: FC = () => {
    const notify = useNotify();
    const { lastEvent } = useSelfServiceEcho();
    // Track processed events to avoid duplicates
    const lastProcessedEventId = useRef<string | null>(null);


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
            const status = payload.status;
            const message = `Order updated: ${status}`;
            
            // Show toast notification
            notify(payload.message || message, { 
                type: 'info',
                autoHideDuration: 5000 
            });
            
            playNotificationSound();
        }
        
    }, [lastEvent, notify]);

    return null; // Headless component
};

export default SelfServiceAppHookComponent;
