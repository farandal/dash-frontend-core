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

/**
 * DASHMallServiceWSMessagesManager
 * 
 * WebSocket messages manager for Mall Service (multi-tenant food court ordering).
 * 
 * This manager serves as a placeholder to satisfy the DASHAppProviders requirement
 * without causing errors for Guest users. The actual WebSocket subscription is
 * handled by MallServiceEchoProvider using public session channels.
 */
const DASHMallServiceWSMessagesManager = (): ILaravelEchoManager => {
    const [events, setEvents] = useState<IDashNotificationPayloadBase[]>([]);
    const [lastEvent, setLastEvent] = useState<IDashNotificationPayloadBase>(null);
    const authContext: IAuthContext = useAuthContext();

    console.log('🔍 DASHMallServiceWSMessagesManager: Initializing for Mall Service...', {
        hasAuthContext: !!authContext,
        authUser: authContext?.user,
        authAuthenticated: authContext?.authenticated
    });

    // We intentionally DO NOT subscribe to user.* or tenant.* private channels here.
    // Mall Service uses a public session channel managed by MallServiceEchoProvider.
    // This manager serves as a placeholder to satisfy the DASHAppProviders requirement without causing errors for Guest users.

    const clear = () => {
        setLastEvent(null);
    };

    return {
        events,
        lastEvent,
        clear
    };
};

export default DASHMallServiceWSMessagesManager;
