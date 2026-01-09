import React from 'react';
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import { SelfServiceOrderCreateProvider } from '../contexts/SelfServiceOrderCreateContext';
import { useRefresh, useNotify } from 'react-admin';
import { useSelfServiceEcho } from '../contexts/SelfServiceEchoContext';
import { useEffect } from 'react';

/**
 * Component to listen for WebSocket notifications and refresh the list
 */
export const NotificationListener: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const refresh = useRefresh();
    const notify = useNotify();
    const { lastEvent } = useSelfServiceEcho();

    useEffect(() => {
        if (!lastEvent) return;

        console.log('👀 NotificationListener: Processing event', { 
            event: lastEvent.event,
            model: lastEvent.model,
            payloadClass: lastEvent.notificationPayload?.class,
            raw: lastEvent
        });
        
        // Check for Tab model events (legacy/standard)
        if (
            lastEvent.model === "Domain\\App\\Models\\Tab\\Tab" &&
            (lastEvent.notificationPayload?.class === "MallSessionTabCreationNotification" ||
             lastEvent.notificationPayload?.class === "TabCreatedNotification")
        ) {
             console.log("🔔 [NotificationListener] Triggering refresh for new tab (Tab model match)");
             refresh();
        }

        // Check for SelfServiceSession events
        const isSelfServiceSession = lastEvent.model === "Domain\\App\\Models\\SelfService\\SelfServiceSession";
        const isStatusUpdateEvent = lastEvent.event === 'selfservice_session_order_status_update';

        if (isSelfServiceSession || isStatusUpdateEvent) {
            console.log('🔔 NotificationListener: Self-Service Update Detected!', {
                isModelMatch: isSelfServiceSession,
                isEventMatch: isStatusUpdateEvent
            });
            
            refresh();
            
            // Show toast if message is available
            if (lastEvent.notificationPayload?.message) {
                 notify(lastEvent.notificationPayload.message, { type: 'info' });
            } else if (lastEvent.title) {
                 notify(lastEvent.title, { type: 'info' });
            }
        }
    }, [lastEvent]);

    return <>{children}</>;
};

/**
 * SelfServiceTabsContext
 * 
 * Context wrapper for the Self-Service Tab resource.
 * Wraps the Create view with SelfServiceOrderCreateProvider to manage cart/product state.
 */
const SelfServiceTabsContext: IDashAutoAdminResourceConfig["contextComponent"] = (props) => {
    const { children, mode } = props;
    console.log('🏗️ SelfServiceTabsContext: Rendering', { mode, props });

    // For create mode (Guest Ordering), wrap with SelfServiceOrderCreateProvider
    if (mode === 'create') {
        return (
            <SelfServiceOrderCreateProvider>
                {children}
            </SelfServiceOrderCreateProvider>
        );
    }

    // For list/view modes, wrap with NotificationListener to refresh on updates
    return (
        <NotificationListener>
            {children}
        </NotificationListener>
    );
};

export default SelfServiceTabsContext;
