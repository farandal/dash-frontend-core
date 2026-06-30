/**
 * MallServiceEchoContext
 * 
 * Context provider for mall service session WebSocket notifications.
 * Used for multi-tenant food court ordering to listen for order status updates on a public channel.
 * 
 * Channel: session.{sessionHash} (public channel, no auth required for guests)
 */
import React, { createContext, useContext, useEffect, useState, FC } from 'react';
import useLaravelEcho from 'dash-admin/contexts/com/useLaravelEcho';

// Context value interface
export interface IMallServiceEchoContext {
    events: any[];
    lastEvent: any | null;
    isConnected: boolean;
    sessionHash: string | null;
    setSessionHash: (hash: string | null) => void;
    clear: () => void;
}

// Create context with default values
export const MallServiceEchoContext = createContext<IMallServiceEchoContext>({
    events: [],
    lastEvent: null,
    isConnected: false,
    sessionHash: null,
    setSessionHash: () => {},
    clear: () => {},
});

// Hook for easy access to context
export const useMallServiceEcho = () => useContext(MallServiceEchoContext);

// Provider component props
interface MallServiceEchoProviderProps {
    children: React.ReactNode;
    initialHash?: string;
}

/**
 * Provider component that manages WebSocket connection to mall service session channel
 */
export const MallServiceEchoProvider: FC<MallServiceEchoProviderProps> = ({ 
    children, 
    initialHash 
}) => {
    const [events, setEvents] = useState<any[]>([]);
    const [lastEvent, setLastEvent] = useState<any | null>(null);
    const [sessionHash, setSessionHash] = useState<string | null>(initialHash || null);
    
    // Subscribe to the session channel
    // We use a public channel 'session.{hash}' to avoid private auth issues
    const { lastEvent: echoEvent, isConnected } = useLaravelEcho({
        type: 'public',
        channel: sessionHash ? `session.${sessionHash}` : null,
        enabled: !!sessionHash,
        debug: true,
    });

    // Process incoming events
    useEffect(() => {
        if (echoEvent) {
            console.log('📡 MallServiceEchoProvider: Received event', echoEvent);
            setLastEvent(echoEvent);
            setEvents(prev => [...prev, echoEvent]);
        }
    }, [echoEvent]);

    // Auto-clear lastEvent shortly after delivery so a component that mounts later
    // (e.g. after navigating) doesn't replay a stale notification. See LaravelEchoMgr
    // for the same pattern applied to the main staff-app notification channel.
    useEffect(() => {
        if (lastEvent === null) return;
        const timeoutId = window.setTimeout(() => setLastEvent(null), 0);
        return () => window.clearTimeout(timeoutId);
    }, [lastEvent]);

    const clear = () => {
        setLastEvent(null);
    };

    const contextValue: IMallServiceEchoContext = {
        events,
        lastEvent,
        isConnected,
        sessionHash,
        setSessionHash,
        clear,
    };

    return (
        <MallServiceEchoContext.Provider value={contextValue}>
            {children}
        </MallServiceEchoContext.Provider>
    );
};

export default MallServiceEchoContext;
