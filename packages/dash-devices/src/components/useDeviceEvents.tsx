import React, { useContext, useEffect } from 'react';
import { useRefresh } from 'react-admin';

const REFRESH_ON = ['device.status', 'device.command.failed', 'device.action.failed'];

/**
 * Builds the resource's `contextComponent` from the host's websocket context (dash-admin's
 * LaravelEchoContext — passed in, so this package imports no dash-* module): in list mode the list
 * refreshes when a device comes online/offline or a command to one failed.
 */
export const createDeviceEventsContext = (echoContext: React.Context<any>) => {
    const Listener: React.FC<{ children: React.ReactNode }> = ({ children }) => {
        const { lastEvent } = useContext(echoContext) ?? {};
        const refresh = useRefresh();

        useEffect(() => {
            if (!lastEvent) return;
            const type = lastEvent.type ?? lastEvent?.notificationPayload?.type;
            if (REFRESH_ON.includes(type)) refresh();
        }, [lastEvent]);

        return <>{children}</>;
    };

    return ({ children, mode }: { children: React.ReactNode; mode?: string }) => (mode === 'list' ? <Listener>{children}</Listener> : <>{children}</>);
};
