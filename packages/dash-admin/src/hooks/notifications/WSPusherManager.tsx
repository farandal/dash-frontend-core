import { useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import { IAuthContext } from '../../contexts/auth/AuthContextLocalStorage';
import { AuthContextLocalStorage } from '../../contexts/auth/AuthContextLocalStorage';
import type { ILaravelEchoManager } from '../../contexts/com/LaravelEchoMgr';
import type { IDashNotificationPayloadBase } from '../../interfaces/communication/INotification';
import { NotificationComponent } from '../../contexts/com/components/NotificationRenderer';
import { NotificationWrapper } from '../../contexts/com/components/NotificationsWidget';
import useLaravelEcho from '../../contexts/com/useLaravelEcho';

const WSPusherManager = (): ILaravelEchoManager => {
  const [events, setEvents] = useState<IDashNotificationPayloadBase[]>([]);
  const [lastEvent, setLastEvent] = useState<IDashNotificationPayloadBase>(null);
  const authContext: IAuthContext = useContext(AuthContextLocalStorage);
  const initialized = useRef(false);

  // Memoize the user ID
  const userId = useMemo(() =>
    authContext?.user?.id || null,
    [authContext?.user?.id]
  );

  // Create stable event handlers
  const handlePublicEvent = useCallback((notification: IDashNotificationPayloadBase) => {
    console.log('public', notification);
    setEvents(prev => [...prev, notification]);
    setLastEvent(notification);
  }, []);

  const handlePrivateEvent = useCallback((data) => {
    console.log('Received notification event:', data);
    setEvents(prev => [...prev, data]);
    setLastEvent(data);
  }, []);

  // Memoize event objects
  const publicEvents = useMemo(() => ({
    'public': handlePublicEvent
  }), [handlePublicEvent]);

  const privateEvents = useMemo(() => ({
    'notification': handlePrivateEvent
  }), [handlePrivateEvent]);

  // Only initialize hooks once we have the necessary data
  const [shouldInitialize, setShouldInitialize] = useState(false);

  useEffect(() => {
    // Only set to true once we have userId or for public channel
    if (!initialized.current) {
      setShouldInitialize(true);
      initialized.current = true;
    }
  }, [userId]);

  // Public channel connection
  const publicChannel = shouldInitialize ? useLaravelEcho({
    type: 'public',
    channel: 'dashpanel_public',
    events: publicEvents,
    // Don't pass userId for public channel
  }) : { echoChannel: null, isConnected: false, currentEvents: [] };

  // Private channel connection
  const privateChannel = shouldInitialize && userId ? useLaravelEcho({
    type: 'private',
    channel: `user.${userId}`,
    events: privateEvents,
    userId: userId
  }) : { echoChannel: null, isConnected: false, currentEvents: [] };

  // Log connection status
  useEffect(() => {
    if (publicChannel.isConnected) {
      console.log('Public channel connected:', publicChannel.isConnected);
    }
  }, [publicChannel.isConnected]);

  useEffect(() => {
    if (privateChannel.isConnected) {
      console.log('Private channel connected:', privateChannel.isConnected);
    }
  }, [privateChannel.isConnected]);

  const clear = useCallback(() => {
    setLastEvent(null);
  }, []);

  return { events, lastEvent, clear };
};

export default WSPusherManager;