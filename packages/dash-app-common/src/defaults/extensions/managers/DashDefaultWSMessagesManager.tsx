import { useContext, useEffect, useState } from 'react';
import { Notification } from 'react-admin';
import type { ILaravelEchoManager } from 'dash-admin/src/contexts/com/LaravelEchoMgr';
import useLaravelEcho from 'dash-admin/src/contexts/com/useLaravelEcho';
import { useAuthContext } from 'dash-admin/src/contexts/auth/AuthContext';
import type { IAuthContext } from 'dash-admin/src/contexts/auth';
import { IDashNotificationPayloadBase } from 'dash-admin/src/interfaces/communication/INotification';


export const DashDefaultReactAdminNotification = () => {
    return <Notification
        className='dash-notification'
        autoHideDuration={8000}
        multiLine={true}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    />
};

const DashDefaultWSMessagesManager = (): ILaravelEchoManager => {
    
    const [events, setEvents] = useState<IDashNotificationPayloadBase[]>([]);
    const [lastEvent, setLastEvent] = useState<IDashNotificationPayloadBase>(null);
    const authContext: IAuthContext = useAuthContext();

    const [userId, setUserId] = useState(null);
    const [tenantId, setTenantId] = useState(null);


    useEffect(() => {

        if (!authContext?.user) {
            return;
        }


        setUserId(authContext.user.id);
        setTenantId(authContext.user.tenant_id);



    }, [authContext])

    const clear = () => {
        setLastEvent(null);
    };


    const { echoChannel: channel2,
        isConnected: isConnected2,
        lastEvent: event2,
        ping: pingConnection2,
        addListener: addListener2,
        removeListener: reoveListener2 } = useLaravelEcho({
            type: 'private',
            channel: userId ? `user.${userId}` : null,
            enabled: !!userId // Only enable if userId exists
        });

    const { echoChannel: channel3,
        isConnected: isConnected3,
        lastEvent: event3,
        ping: pingConnection3,
        addListener: addListener3,
        removeListener: reoveListener3 } = useLaravelEcho({
            type: 'private',
            channel: tenantId ? `tenant.${tenantId}.system` : null,
            enabled: !!tenantId // Only enable if tenantId exists
        });

    useEffect(() => {
        console.log("Private Tenant Message", event2);
        const _lastEvent = event3?.data;
        console.log(_lastEvent);
        setLastEvent(_lastEvent);

    }, [event3]);


    useEffect(() => {
        console.log("Private User Message", event2);
        const _lastEvent = event2?.data;
        console.log(_lastEvent);
        setLastEvent(_lastEvent);

    }, [event2]);


    useEffect(() => {

        setEvents((prev) => [...prev, lastEvent])
    }, [lastEvent])

    return {
        events,
        lastEvent,
        clear
    };
};
export default DashDefaultWSMessagesManager;
