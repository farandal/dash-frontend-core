import { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { difference } from 'lodash';
import usePrevious from '@rooks/use-previous';
import { Channel } from 'laravel-echo/src/channel';
import Echo, { EchoOptions } from 'laravel-echo';
import Pusher from 'pusher-js';
import moment from 'moment';
import { ConstantsContext } from '../../config/ConstantsService';
import { getEnv } from '../../config/DASHAdminSystemConstants';

// Make Pusher available globally
(window as any).Pusher = Pusher;

// Singleton manager for Echo clients
class EchoClientManager {
  private static instance: EchoClientManager;
  public clients: Map<string, Echo<"pusher">>;

  private constructor() {
    this.clients = new Map();
  }

  public static getInstance(): EchoClientManager {
    if (!EchoClientManager.instance) {
      EchoClientManager.instance = new EchoClientManager();
    }
    return EchoClientManager.instance;
  }

  public setClient(hash: string, client: Echo<"pusher">): void {
    this.clients.set(hash, client);
  }

  public getClient(hash: string): Echo<"pusher"> | undefined {
    return this.clients.get(hash);
  }

  public removeClient(hash: string): boolean {
    return this.clients.delete(hash);
  }

  public hasClient(hash: string): boolean {
    return this.clients.has(hash);
  }
}

export const echoManager = EchoClientManager.getInstance();

const useLaravelEcho = ({
  type,
  channel,
  events,
  userId,
  socketId,
  pingInterval = 30000, // Default ping interval: 30 seconds
  debug = true
}: {
  type: 'public' | 'private';
  channel: string;
  events: { [key: string]: (e: any) => any };
  userId?: number;
  socketId?: string;
  pingInterval?: number;
  debug?: boolean
}) => {
  const [echoChannel, setEchoChannel] = useState<Channel | null>(null);
  const [laravelEchoClient, setLaravelEchoClient] = useState<Echo<"pusher"> | null>(null);
  const [currentEvents, setCurrentEvents] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const prevChannel = usePrevious(channel);
  const constants = useContext(ConstantsContext);
  const pingTimerRef = useRef<number | null>(null);
  const clientIdRef = useRef<string | null>(null);



  const isProd = getEnv('APP_ENV') === 'production';

  const log = (message: string, data?: any) => {
    if (debug) {
      console.log(`%c📡 ${message}`, 'color: #2196F3; font-weight: bold; font-size: 12px;', data || '');
    }
  };

  const logError = (message: string, error?: any) => {
    if (debug) {
      console.error(`%c📡 ${message}`, 'color: #f44336; font-weight: bold; font-size: 12px;', error || '');
    }
  };

  const pingConnection = useCallback(() => {
    if (laravelEchoClient && laravelEchoClient.connector && laravelEchoClient.connector.pusher) {
      try {
        log('Sending custom ping event...');
        laravelEchoClient.connector.pusher.send_event('client-ping', {
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        logError('Error pinging WebSocket connection:', error);
      }
    }
  }, [laravelEchoClient, debug]);

  const getClientId = useCallback(() => {
    return `${type}-${userId || 'public'}-${socketId || 'default'}`;
  }, [type, userId, socketId]);

  useEffect(() => {


    if (!(JSON.parse(getEnv('APP_SOCKETS_ENABLED')))) {
      return;
    }

    if (!userId) {
      return
    }

    const cleanup = () => {
      if (pingTimerRef.current) {
        window.clearInterval(pingTimerRef.current);
        pingTimerRef.current = null;
      }

      if (laravelEchoClient) {
        laravelEchoClient.disconnect();
        setLaravelEchoClient(null);
        setEchoChannel(null);
        setCurrentEvents([]);
        setIsConnected(false);
      }
    };

    if (type === 'public' || (type === 'private' && userId)) {
      const clientId = getClientId();
      clientIdRef.current = clientId;

      if (echoManager.clients.has(clientId)) {
        const existingClient = echoManager.getClient(clientId);
        setLaravelEchoClient(existingClient);
        return;
      }

      const token = userId ? localStorage.getItem('token') : null;

      const authConfig = token ? {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        }
      } : undefined;

      try {
        const completeConfig = {
          broadcaster: 'pusher',
          key: getEnv('APP_SOCKETS_KEY') || 'dash',
          wsHost: getEnv('APP_SOCKETS_HOST') || window.location.hostname,
          wsPort: getEnv('APP_SOCKETS_PORT') || '6001',
          forceTLS: isProd,
          disableStats: !isProd,
          enabledTransports: ['ws', 'wss'],
          disableCluster: true,
          cluster: 'mt1',
          logToConsole: debug,
          activityTimeout: 120000,
          pongTimeout: 30000,
        };

        if (authConfig) {
          const baseUrl = getEnv('APP_BACKEND_URL') || window.location.origin;
          const authPath = getEnv('APP_SOCKETS_AUTH_ENDPOINT') || '/api/ws/auth';
          const formattedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
          const formattedAuthPath = authPath.startsWith('/') ? authPath.substring(1) : authPath;
          const authEndpoint = `${formattedBaseUrl}${formattedAuthPath}`;

          log('Using auth endpoint:', authEndpoint);
          completeConfig['authEndpoint'] = authEndpoint;
          completeConfig['auth'] = authConfig;
        }

        log('Initializing Echo client with config:', completeConfig);
        const echo = new Echo(completeConfig as EchoOptions<"pusher">);

        if (echo.connector && echo.connector.pusher) {
          echo.connector.pusher.bind_global((eventName, data) => {
            log(`Global event received: ${eventName}`, data);
            if (typeof events[eventName] === 'function') {
              events[eventName](data);
            }
          });

          echo.connector.pusher.connection.bind('connected', () => {
            log('Connected to Pusher!');
            setIsConnected(true);
            localStorage.setItem('socketConnectionState', 'true');

            if (pingTimerRef.current) {
              window.clearInterval(pingTimerRef.current);
            }
            pingTimerRef.current = window.setInterval(pingConnection, pingInterval);
          });

          echo.connector.pusher.connection.bind('disconnected', () => {
            log('Disconnected from Pusher');
            setIsConnected(false);

            if (pingTimerRef.current) {
              window.clearInterval(pingTimerRef.current);
              pingTimerRef.current = null;
            }
          });

          echo.connector.pusher.connection.bind('error', (err: any) => {
            logError('Pusher connection error:', err);
            setIsConnected(false);
          });
        }

        echoManager.setClient(clientId, echo);
        setLaravelEchoClient(echo);
      } catch (error) {
        logError('Error initializing Echo client:', error);
        cleanup();
      }
    }
    return () => {
      if (debug) {
        console.log("%c📡 Socket listener unmounted!", "color: #ff6b6b; font-weight: bold;");
      }
    };
  }, [userId]);

  useEffect(() => {
    if (!laravelEchoClient || !channel) return;
    if (type === 'private' && !userId) return;

    log(`Attempting to subscribe to ${type} channel: ${channel}`);

    const isSubscribed = laravelEchoClient.connector.channels[channel.includes('.') ? `private-${channel}` : channel] !== undefined;
    if (isSubscribed) {
      log(`Skipping, already suscribed`);
      return;
    }

    if (echoChannel && prevChannel && channel !== prevChannel) {
      log(`Leaving previous channel: ${prevChannel}`);
      laravelEchoClient.leaveChannel(prevChannel);
      setEchoChannel(null);
      setCurrentEvents([]);
    }

    if (!echoChannel || channel !== prevChannel) {
      try {
        let newChannel;

        if (type === 'private') {
          log(`Subscribing to private channel: ${channel}`);
          newChannel = laravelEchoClient.private(channel);
        } else {
          log(`Subscribing to public channel: ${channel}`);
          newChannel = laravelEchoClient.channel(channel);
        }

        setEchoChannel(newChannel);
        log('Channel subscription successful:', newChannel);
      } catch (error) {
        logError(`Error subscribing to ${type} channel ${channel}:`, error);
      }
    }

    return () => {
      if (laravelEchoClient && channel) {
        laravelEchoClient.leaveChannel(channel);
      }
    };
  }, [laravelEchoClient, channel, type, userId, prevChannel, debug]);

  useEffect(() => {
    if (!laravelEchoClient || !isConnected) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (laravelEchoClient.connector &&
          laravelEchoClient.connector.pusher &&
          laravelEchoClient.connector.pusher.connection.state !== 'connected') {
          log('Tab is visible again, reconnecting...');
          laravelEchoClient.connector.pusher.connect();
        }
      }
    };

    const handleOnline = () => {
      log('Browser is online, reconnecting...');
      if (laravelEchoClient.connector && laravelEchoClient.connector.pusher) {
        laravelEchoClient.connector.pusher.connect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  }, [laravelEchoClient, isConnected, debug]);

  const addListener = useCallback((eventName: string, callback: (data: any) => void) => {
    if (!echoChannel) return;

    const formattedEventName = eventName.startsWith('.') ? eventName : `.${eventName}`;
    echoChannel.listen(formattedEventName, callback);
    setCurrentEvents(prev => [...prev, eventName]);
  }, [echoChannel]);

  const removeListener = useCallback((eventName: string) => {
    if (!echoChannel) return;

    const formattedEventName = eventName.startsWith('.') ? eventName : `.${eventName}`;
    echoChannel.stopListening(formattedEventName);
    setCurrentEvents(prev => prev.filter(e => e !== eventName));
  }, [echoChannel]);

  return {
    echoChannel,
    isConnected,
    currentEvents,
    ping: pingConnection,
    addListener,
    removeListener
  };
};

export default useLaravelEcho;