import { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Notification } from 'react-admin';
import type { ILaravelEchoManager } from 'dash-admin/src/contexts/com/LaravelEchoMgr';
import { NotificationComponent } from 'dash-admin/src/contexts/com/components/NotificationRenderer';
import { NotificationWrapper } from 'dash-admin/src/contexts/com/components/NotificationsWidget';
import useLaravelEcho from 'dash-admin/src/contexts/com/useLaravelEcho';
import { getCookie } from 'dash-admin/src/utils/cookies';
import { useAuthContext } from 'dash-admin/src/contexts/auth/AuthContext';
import type { IAuthContext } from 'dash-admin/src/contexts/auth';
import { set } from 'react-hook-form';
import { IDashNotificationPayloadBase } from 'dash-admin/src/interfaces/communication/INotification';


export const CustomReactAdminNotification = () => {
    return <Notification
        className='dash-notification'
        autoHideDuration={8000}
        multiLine={true}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    />
};
/*
const popPrivateMessage = (notification: IDashNotificationBase) => {
    toast(
        <NotificationWrapper notification={notification} key={0}>
            {' '}
            <NotificationComponent notification={notification} />{' '}
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

const popStickyMessage = (notification: IDashNotificationBase) => {
    toast(
        <NotificationWrapper notification={notification} key={0}>
            {' '}
            <NotificationComponent notification={notification} />{' '}
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

*/


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




    // Always initialize the public channel
    /* const {echoChannel:channel1,
       isConnected:isConnected1,
       lastEvent:event1,
       ping: pingConnection1,
       addListener: addListener1,
       removeListener: reoveListener1} = useLaravelEcho({
       type: 'public',
       channel: 'public',
       //events: {
       // 'public': handlePublicEvent
       //},
       enabled: true // This is always enabled
     });
   */
    // Initialize private channels only when authenticated
  const {echoChannel:channel2,
      isConnected:isConnected2,
      lastEvent:event2,
      ping: pingConnection2,
      addListener: addListener2,
      removeListener: reoveListener2} = useLaravelEcho({
      type: 'private',
      channel: userId ? `user.${userId}` : null,
      userId: userId, // Pass userId for private channel authentication
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
            userId: userId, // Pass userId for private channel authentication
            /*events: {
              'notification': handleSystemTenantEvent,
              'print': handlePrint,
            },*/
            enabled: !!tenantId && !!userId // Only enable if both tenantId and userId exist
        });

    useEffect(() => {
        console.log("Private Tenant Message",event2);
        const _lastEvent = event3?.data;
        console.log(_lastEvent);
        setLastEvent(_lastEvent);
      
    }, [event3]);


    useEffect(() => {
        console.log("Private User Message",event2);
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
export default DASHWSMessagesManager;
