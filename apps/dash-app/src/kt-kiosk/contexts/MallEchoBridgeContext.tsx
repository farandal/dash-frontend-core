/**
 * MallEchoBridgeContext
 * 
 * Bridge context that allows the app (dash-mall) to provide WebSocket events
 * to the package (kt-mall) components without direct imports.
 * 
 * ARCHITECTURE:
 * - MallClientWrapper (app) wraps children with MallEchoBridgeProvider
 * - MallEchoBridgeProvider receives lastEvent from MallSessionEchoContext
 * - Package components use useMallEchoBridge() to access the events
 * 
 * This is the SINGLE SOURCE OF TRUTH for WebSocket events in mall client components.
 */
import React, { createContext, useContext, FC } from 'react';

// Context value interface - matches what MallSessionEchoContext provides
export interface IMallEchoBridgeContext {
    lastEvent: any | null;
    events: any[];
    isConnected: boolean;
    sessionId: string | null;
    tenantStatuses: Record<number, string>;
    productStatuses: Record<number, any>;
}

// Create context with default values
export const MallEchoBridgeContext = createContext<IMallEchoBridgeContext>({
    lastEvent: null,
    events: [],
    isConnected: false,
    sessionId: null,
    tenantStatuses: {},
    productStatuses: {},
});

// Hook for package components to access WebSocket events
export const useMallEchoBridge = () => {
    const context = useContext(MallEchoBridgeContext);
    if (!context) {
        console.warn('[MallEchoBridge] useMallEchoBridge must be used within MallEchoBridgeProvider');
    }
    return context;
};

// Provider props - the app will pass these from MallSessionEchoContext
interface MallEchoBridgeProviderProps {
    children: React.ReactNode;
    lastEvent: any | null;
    events?: any[];
    isConnected?: boolean;
    sessionId?: string | null;
    tenantStatuses?: Record<number, string>;
    productStatuses?: Record<number, any>;
}

/**
 * Provider component - used by the app to bridge WebSocket events to package components
 */
export const MallEchoBridgeProvider: FC<MallEchoBridgeProviderProps> = ({
    children,
    lastEvent,
    events = [],
    isConnected = false,
    sessionId = null,
    tenantStatuses = {},
    productStatuses = {},
}) => {
    const contextValue: IMallEchoBridgeContext = {
        lastEvent,
        events,
        isConnected,
        sessionId,
        tenantStatuses,
        productStatuses,
    };

    return (
        <MallEchoBridgeContext.Provider value={contextValue}>
            {children}
        </MallEchoBridgeContext.Provider>
    );
};

export default MallEchoBridgeContext;
