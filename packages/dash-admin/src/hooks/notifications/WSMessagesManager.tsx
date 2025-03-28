import { useContext, useEffect, useState } from 'react';
//import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { IAuthContext, ILaravelEchoManager, NotificationComponent, INotificationPayloadBase } from 'dash-admin';
import { AuthContext, NotificationWrapper, useLaravelEcho } from 'dash-admin';

const popPrivateMessage = (notification: INotificationPayloadBase) => {

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

const popStickyMessage = (notification: INotificationPayloadBase) => {
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

const WSMessagesManager = (): ILaravelEchoManager => {
  const [events, setEvents] = useState<INotificationPayloadBase[]>([]);
  const [lastEvent, setLastEvent] = useState<INotificationPayloadBase>(null);
  //const dispatch = useDispatch();

  const clear = () => {
    setLastEvent(null);
  };


  useLaravelEcho({
    type: 'public',
    channel: 'public',
    events: {
      'public': (notification: INotificationPayloadBase) => {

        console.log('public', notification);
        setEvents([...events, notification]);
        setLastEvent(notification);
        //dispatch(apiRequest(ACTIONS.GET_NOTIFICATIONS, {}));
        //popMessage(notification)
        //alert(notification)
        popStickyMessage(notification)
      }
    },
    //userId: authContext?.user?.id
  });

  useLaravelEcho({
    type: 'private',
    channel: `user.{userId}`,
    events: {
      // Try all these variations to see which one works
      'notification': (notification: INotificationPayloadBase) => {

        console.log('Received notification event:', notification);
        setEvents([...events, notification]);
        setLastEvent(notification);
        popPrivateMessage(notification);
      }
    },
    //userId: authContext?.user?.id
  });


  return { events, lastEvent, clear };
};

export default WSMessagesManager;
