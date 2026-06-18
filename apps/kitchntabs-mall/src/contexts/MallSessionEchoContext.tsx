/**
 * MallSessionEchoContext
 * 
 * Context provider for mall session WebSocket notifications.
 * This is used for the public mall client (customer-facing) to receive
 * real-time updates about their order status.
 */
import React, { createContext, useContext, useEffect, useState, FC, useMemo } from 'react';
import useLaravelEcho from 'dash-admin/src/contexts/com/useLaravelEcho';
import { dashStorage } from 'dash-utils';

// Product status interface for tracking individual product states
interface IProductStatus {
    product_id: number;
    product_name: string;
    status: string;
    quantity: number;
    image_url?: string;
    tenant_id?: number;
    tenant_name?: string;
}

// Context value interface
export interface IMallSessionEchoContext {
    events: any[];
    lastEvent: any | null;
    productStatuses: Record<number, IProductStatus>;
    tenantStatuses: Record<number, string>;
    isConnected: boolean;
    sessionId: string | null;
    clear: () => void;
}

// Create context with default values
export const MallSessionEchoContext = createContext<IMallSessionEchoContext>({
    events: [],
    lastEvent: null,
    productStatuses: {},
    tenantStatuses: {},
    isConnected: false,
    sessionId: null,
    clear: () => {},
});

// Hook for easy access to context
export const useMallSessionEcho = () => useContext(MallSessionEchoContext);

// Provider component props
interface MallSessionEchoProviderProps {
    children: React.ReactNode;
    sessionId?: string;
}

/**
 * Provider component that manages WebSocket connection to mall session channel
 */
export const MallSessionEchoProvider: FC<MallSessionEchoProviderProps> = ({ 
    children, 
    sessionId: propSessionId 
}) => {
    const [events, setEvents] = useState<any[]>([]);
    const [lastEvent, setLastEvent] = useState<any | null>(null);
    const [productStatuses, setProductStatuses] = useState<Record<number, IProductStatus>>({});
    const [tenantStatuses, setTenantStatuses] = useState<Record<number, string>>({});
    
    // Get session ID from props or localStorage
    const sessionId = useMemo(() => {
        return propSessionId || dashStorage.getItem('mall-session-hash');
    }, [propSessionId]);
    
    // Subscribe to the session channel
    const { lastEvent: echoEvent, isConnected } = useLaravelEcho({
        type: 'public',
        channel: sessionId ? `session.${sessionId}` : null,
        enabled: !!sessionId,
        debug: true,
    });

    // Process incoming events
    useEffect(() => {
        if (echoEvent) {
            // Store the FULL event (with notificationPayload) not just echoEvent.data
            const eventData = echoEvent.data || echoEvent;
            const notificationPayload = echoEvent.notificationPayload || eventData?.notificationPayload;
            
            // Set lastEvent to the FULL echoEvent so consumers get notificationPayload too
            setLastEvent(echoEvent);
            setEvents(prev => [...prev, echoEvent]);
            
            // Handle different event types - check notificationPayload.class for notification type
            const isMallOrderUpdate = 
                eventData.type === 'mall_order_status_update' || 
                eventData.type === 'mall_order_confirmation' ||
                notificationPayload?.class === 'MallSessionOrderStatusNotification';
            
            if (isMallOrderUpdate) {
                // Extract data from nested notificationPayload if present, otherwise from top level
                const payload = notificationPayload?.notificationPayload || eventData.data || eventData;
                const { tenant_name, status, tenant_id, products, new: newStatus } = payload;
                const finalStatus = newStatus || status;
                
                // Update tenant status
                if (tenant_id) {
                    setTenantStatuses(prev => ({
                        ...prev,
                        [tenant_id]: finalStatus
                    }));
                }
                
                // Update product statuses
                if (products && Array.isArray(products)) {
                    setProductStatuses(prev => {
                        const updated = { ...prev };
                        products.forEach(product => {
                            if (product.product_id) {
                                updated[product.product_id] = {
                                    product_id: product.product_id,
                                    product_name: product.product_name || 'Unknown Product',
                                    status: product.status || finalStatus,
                                    quantity: product.quantity || 1,
                                    image_url: product.image_url,
                                    tenant_id: tenant_id,
                                    tenant_name: tenant_name
                                };
                            }
                        });
                        return updated;
                    });
                }
            }
        }
    }, [echoEvent]);

    // Log connection status changes
    useEffect(() => {
        // WebSocket connection status effect
    }, [isConnected, sessionId]);

    const clear = () => {
        setLastEvent(null);
    };

    const contextValue: IMallSessionEchoContext = {
        events,
        lastEvent,
        productStatuses,
        tenantStatuses,
        isConnected,
        sessionId,
        clear,
    };

    return (
        <MallSessionEchoContext.Provider value={contextValue}>
            {children}
        </MallSessionEchoContext.Provider>
    );
};

export default MallSessionEchoContext;
