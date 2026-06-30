import { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Notification } from 'react-admin';
import type { ILaravelEchoManager } from 'dash-admin/contexts/com/LaravelEchoMgr';
import { NotificationComponent } from 'dash-admin/contexts/com/components/NotificationRenderer';
import { NotificationWrapper } from 'dash-admin/contexts/com/components/NotificationsWidget';
import useLaravelEcho from 'dash-admin/contexts/com/useLaravelEcho';
import { getCookie } from 'dash-admin/utils/cookies';
import { useAuthContext } from 'dash-admin/contexts/auth/AuthContext';
import type { IAuthContext } from 'dash-admin/contexts/auth';
import { set } from 'react-hook-form';
import { IDashNotificationPayloadBase } from 'dash-admin/interfaces/communication/INotification';

export const CustomReactAdminNotification = () => {
    return <Notification
        className='dash-notification'
        autoHideDuration={8000}
        multiLine={true}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    />
};

const DASHSelfServiceWSMessagesManager = (): ILaravelEchoManager => {
    const [events, setEvents] = useState<IDashNotificationPayloadBase[]>([]);
    const [lastEvent, setLastEvent] = useState<IDashNotificationPayloadBase>(null);
    const authContext: IAuthContext = useAuthContext();

    console.log('🔍 DASHSelfServiceWSMessagesManager: Initializing for Self-Service...', {
        hasAuthContext: !!authContext,
        authUser: authContext?.user,
        authAuthenticated: authContext?.authenticated
    });

    // We intentionally DO NOT subscribe to user.* or tenant.* private channels here.
    // Self-Service Kiosks use a public session channel managed by SelfServiceEchoProvider (or passed externally).
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
export default DASHSelfServiceWSMessagesManager;
