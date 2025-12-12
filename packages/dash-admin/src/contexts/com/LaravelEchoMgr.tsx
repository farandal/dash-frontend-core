import { useContext, useEffect, useState } from 'react';
//import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
// Direct imports to avoid circular barrel imports
import type { IAuthContext } from '../auth/AuthContext';
import type { IDashNotificationPayloadBase } from '../../interfaces/communication/INotification';
import { NotificationComponent } from './components/NotificationRenderer';
import { AuthContext } from '../auth/AuthContext';
import { NotificationWrapper } from './components/NotificationsWidget';
import useLaravelEcho from './useLaravelEcho';

export type ILaravelEchoManager = {
  events: IDashNotificationPayloadBase[];
  lastEvent: IDashNotificationPayloadBase;
  clear: () => void;
};

const popPrivateMessage = (notification: IDashNotificationPayloadBase) => {

  toast(
    <NotificationWrapper notification={notification as any} key={0}>
      {' '}
      <NotificationComponent notification={notification as any} />{' '}
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

const popStickyMessage = (notification: IDashNotificationPayloadBase) => {
  //if (!appearance) appearance = constants.toastAppearances[0];
  //addToast(<>{message}</>, { appearance, autoDismiss: false });
  toast(
    <NotificationWrapper notification={notification as any} key={0}>
      {' '}
      <NotificationComponent notification={notification as any} />{' '}
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

const LaravelEchoMgr = (): ILaravelEchoManager => {
  const [events, setEvents] = useState<IDashNotificationPayloadBase[]>([]);
  const [lastEvent, setLastEvent] = useState<IDashNotificationPayloadBase>(null);
  //const dispatch = useDispatch();
  const authContext: IAuthContext = useContext(AuthContext);

  console.log('🔍 LaravelEchoMgr: Initializing with authContext:', {
    hasUser: !!authContext?.user,
    userId: authContext?.user?.id,
    authenticated: authContext?.authenticated
  });

  const clear = () => {
    setLastEvent(null);
  };

  useEffect(() => {
    console.log("Echo manager listener for private and public messages initialized")
  }, []);

  console.log('🔍 LaravelEchoMgr: Setting up public channel listener...');
  useLaravelEcho({
    type: 'public',
    channel: 'public',
    events: {
      'public': (notification: IDashNotificationPayloadBase) => {

        console.log('📡 LaravelEchoMgr: Received public notification:', notification);
        setEvents([...events, notification]);
        setLastEvent(notification);
        //dispatch(apiRequest(ACTIONS.GET_NOTIFICATIONS, {}));
        //popMessage(notification)
        //alert(notification)
        popStickyMessage(notification)
      }
    },
    userId: null,
    enabled: true, // Enable public channel
  });

  console.log('🔍 LaravelEchoMgr: Setting up private channel listener...');
  useLaravelEcho({
    type: 'private',
    channel: `user.${authContext.user.id}`,
    events: {
      // Try all these variations to see which one works
      'notification': (notification: IDashNotificationPayloadBase) => {

        console.log('📡 LaravelEchoMgr: Received private notification:', notification);

        popPrivateMessage(notification);
      }
    },
    userId: authContext.user.id,
    enabled: !!authContext?.user?.id, // Enable only when user is authenticated
  });



  return { events, lastEvent, clear };
};

export default LaravelEchoMgr;
