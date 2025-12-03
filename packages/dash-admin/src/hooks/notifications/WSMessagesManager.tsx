
import { Notification } from 'react-admin';
import { useEffect, useState } from 'react';
import { useAuthContext, type IAuthContext } from '../../contexts/auth/AuthContext';
import type { ILaravelEchoManager } from '../../contexts/com/LaravelEchoMgr';
import type { IDashNotificationBase, IDashNotificationPayloadBase } from '../../interfaces/communication/INotification';
import { NotificationComponent } from '../../contexts/com/components/NotificationRenderer';
import { NotificationWrapper } from '../../contexts/com/components/NotificationsWidget';
import useLaravelEcho from '../../contexts/com/useLaravelEcho';
import { toast } from 'react-toastify';

/* This is the default WSMessagesManager implementation for Dash. It listens to private channels for user-specific and tenant-specific notifications,
    and displays them using toast notifications. */

const popPrivateMessage = (notification: IDashNotificationBase<any>) => {

    if (!notification) return;
    toast(
        <NotificationWrapper notification={notification} key={0}>
            <NotificationComponent notification={notification} />
        </NotificationWrapper>,
        {
            position: 'top-right',
            autoClose: 8000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        },
    );

};

const popStickyMessage = (notification: IDashNotificationBase<any>) => {
    //if (!appearance) appearance = constants.toastAppearances[0];
    //addToast(<>{message}</>, { appearance, autoDismiss: false });
    if (!notification) return;
    toast(
        <NotificationWrapper notification={notification} key={0}>
            <NotificationComponent notification={notification} />
        </NotificationWrapper>,
        {
            position: 'top-right',
            autoClose: false,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        },
    );
};

export const CustomReactAdminNotification = () => {
    return <Notification
        className='dash-notification'
        autoHideDuration={8000}
        multiLine={true}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    />
};

const DASHWSMessagesManager = (): ILaravelEchoManager => {

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
            //events: {
            //  'notification': handlePrivateUserEvent
            //},
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
            /*events: {
              'notification': handleSystemTenantEvent,
              'print': handlePrint,
            },*/
            enabled: !!tenantId // Only enable if tenantId exists
        });

    useEffect(() => {
        if (!event3?.data) return;
        console.log("Private Tenant Message", event3);
        const _lastEvent = event3.data;
        console.log(_lastEvent);
        setLastEvent(_lastEvent);
        popStickyMessage(_lastEvent);
    }, [event3]);

    useEffect(() => {
        if (!event2?.data) return;
        console.log("Private User Message", event2);
        const _lastEvent = event2.data;
        console.log(_lastEvent);
        setLastEvent(_lastEvent);
        popPrivateMessage(_lastEvent);
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
export default DASHWSMessagesManager;