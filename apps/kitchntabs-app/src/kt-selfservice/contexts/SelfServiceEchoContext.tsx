/**
 * SelfServiceEchoContext
 * 
 * Context provider for self-service session WebSocket notifications.
 * Used for the QR Generator to listen for session activation events on a public channel.
 */
import React, { createContext, useContext, useEffect, useState, FC } from 'react';
import useLaravelEcho from 'dash-admin/contexts/com/useLaravelEcho';

// Context value interface
export interface ISelfServiceEchoContext {
    events: any[];
    lastEvent: any | null;
    isConnected: boolean;
    sessionHash: string | null;
    setSessionHash: (hash: string | null) => void;
    clear: () => void;
}

// Create context with default values
export const SelfServiceEchoContext = createContext<ISelfServiceEchoContext>({
    events: [],
    lastEvent: null,
    isConnected: false,
    sessionHash: null,
    setSessionHash: () => {},
    clear: () => {},
});

// Hook for easy access to context
export const useSelfServiceEcho = () => useContext(SelfServiceEchoContext);

// Provider component props
interface SelfServiceEchoProviderProps {
    children: React.ReactNode;
    initialHash?: string;
}

/**
 * Provider component that manages WebSocket connection to self-service session channel
 */
export const SelfServiceEchoProvider: FC<SelfServiceEchoProviderProps> = ({ 
    children, 
    initialHash 
}) => {
    const [events, setEvents] = useState<any[]>([]);
    const [lastEvent, setLastEvent] = useState<any | null>(null);
    const [sessionHash, setSessionHash] = useState<string | null>(initialHash || null);
    
    // Subscribe to the session channel
    // We use a public channel 'selfservice_session.{hash}' to avoid private auth issues
    const { lastEvent: echoEvent, isConnected } = useLaravelEcho({
        type: 'public',
        channel: sessionHash ? `selfservice_session.${sessionHash}` : null,
        enabled: !!sessionHash,
        debug: true,
    });

    // Process incoming events
    useEffect(() => {
        if (echoEvent) {
            console.log('📡 SelfServiceEchoProvider: Received event', echoEvent);
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

    const contextValue: ISelfServiceEchoContext = {
        events,
        lastEvent,
        isConnected,
        sessionHash,
        setSessionHash,
        clear,
    };

    return (
        <SelfServiceEchoContext.Provider value={contextValue}>
            {children}
        </SelfServiceEchoContext.Provider>
    );
};

export default SelfServiceEchoContext;
