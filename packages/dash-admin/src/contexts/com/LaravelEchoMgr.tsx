import { useContext, useEffect, useState } from 'react';
//import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { IAuthContext, NotificationComponent, IDashNotificationPayloadBase } from 'dash-admin';
import { AuthContext, NotificationWrapper, useLaravelEcho } from 'dash-admin';

export type ILaravelEchoManager = {
  events: IDashNotificationPayloadBase[];
  lastEvent: IDashNotificationPayloadBase;
  clear: () => void;
};

const popPrivateMessage = (notification: IDashNotificationPayloadBase) => {

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

const popStickyMessage = (notification: IDashNotificationPayloadBase) => {
  //if (!appearance) appearance = constants.toastAppearances[0];
  //addToast(<>{message}</>, { appearance, autoDismiss: false });
  toast(
    <NotificationWrapper notification={notification} key={0}>
      {' '}
      <NotificationComponent notification={notification} />{' '}
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

  const clear = () => {
    setLastEvent(null);
  };

  useEffect(() => {
    console.log("Echo manager listener for private and public messages initialized")
  }, []);

  useLaravelEcho({
    type: 'public',
    channel: 'public',
    events: {
      'public': (notification: IDashNotificationPayloadBase) => {

        console.log('public', notification);
        setEvents([...events, notification]);
        setLastEvent(notification);
        //dispatch(apiRequest(ACTIONS.GET_NOTIFICATIONS, {}));
        //popMessage(notification)
        //alert(notification)
        popStickyMessage(notification)
      }
    },
    userId: null,
  });

  useLaravelEcho({
    type: 'private',
    channel: `user.${authContext.user.id}`,
    events: {
      // Try all these variations to see which one works
      'notification': (notification: IDashNotificationPayloadBase) => {

        console.log('Received notification event:', notification);

        popPrivateMessage(notification);
      }
    },
    userId: authContext.user.id
  });



  return { events, lastEvent, clear };
};

export default LaravelEchoMgr;
