//import { Capacitor } from '@capacitor/core';
import React, { FC, useEffect, useMemo, useRef } from 'react';
import {createAxiosInstance} from 'dash-axios-hook'
import { useSelector } from 'react-redux';
import { IDASHAppState } from 'dash-admin-state';
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import  { getEnv } from 'dash-constants/src/DASHAdminSystemConstants';




export type IFCMContext = {
  notifications: any[];
  lastNotification: any;
  clear: () => void;
  initializePushNotifications: () => Promise<void>;
  permissionStatus: 'unknown' | 'granted' | 'denied' | 'not_supported';
  isSupported: boolean;
  platform: string;
};

export interface IFCMProvider {
  children: React.ReactNode;
  manager?: () => {
    notifications: any[];
    lastNotification: any;
    clear: () => void;
    initializePushNotifications: () => Promise<void>;
    permissionStatus: 'unknown' | 'granted' | 'denied' | 'not_supported';
    isSupported: boolean;
    platform: string;
  };
}

// Helper functions similar to voiceAgent approach
const isPushNotificationsAvailable = (): boolean => {
    return !!(window as any)?.Capacitor?.Plugins?.PushNotifications;
};

const getPushNotifications = () => {
    return (window as any)?.Capacitor?.Plugins?.PushNotifications;
};

const getCapacitor = () => {
    return (window as any)?.Capacitor;
};

export class FCMService {
  private notifications: any[] = [];
  private lastNotification: any = null;
  private axiosInstance = createAxiosInstance();
  private permissionStatus: 'unknown' | 'granted' | 'denied' | 'not_supported' = 'unknown';

  constructor() {
    // Initialize permission status based on platform support
    if (!this.isSupported()) {
      this.permissionStatus = 'not_supported';
    }
  }

  isSupported(): boolean {
    const capacitor = getCapacitor();
    const hasPlugin = isPushNotificationsAvailable();
    const isNativePlatform = capacitor?.isNativePlatform?.() || false;
    
    console.log('🔍 FCM Support check:', {
      hasCapacitor: !!capacitor,
      hasPlugin,
      isNativePlatform,
      platform: capacitor?.getPlatform?.() || 'web'
    });

    return hasPlugin && isNativePlatform;
  }

  getPlatform(): string {
    const capacitor = getCapacitor();
    return capacitor?.getPlatform?.() || 'web';
  }

  async checkPermissions(): Promise<boolean> {
    if (!this.isSupported()) {
      console.log('📱 Push notifications not supported on this platform');
      this.permissionStatus = 'not_supported';
      return false;
    }

    try {
      const PushNotifications = getPushNotifications();
      console.log('🔍 Checking push notification permissions...');

      const permStatus = await PushNotifications.checkPermissions();
      console.log('🔐 Permission status:', permStatus);

      if (permStatus.receive === 'granted') {
        this.permissionStatus = 'granted';
        return true;
      } else if (permStatus.receive === 'denied') {
        this.permissionStatus = 'denied';
        return false;
      } else {
        this.permissionStatus = 'unknown';
        return false;
      }
    } catch (error: any) {
      console.error('❌ Error checking permissions:', error);
      this.permissionStatus = 'denied';
      return false;
    }
  }

  async requestPermissions(): Promise<boolean> {
    if (!this.isSupported()) {
      console.log('📱 Push notifications not supported, skipping permission request');
      return false;
    }

    try {
      const PushNotifications = getPushNotifications();
      console.log('🔐 Requesting push notification permissions...');

      const permStatus = await PushNotifications.requestPermissions();
      console.log('🔐 Permission request result:', permStatus);

      if (permStatus.receive === 'granted') {
        this.permissionStatus = 'granted';
        console.log('✅ Push notification permissions granted');
        return true;
      } else {
        this.permissionStatus = 'denied';
        console.log('❌ Push notification permissions denied');
        return false;
      }
    } catch (error: any) {
      console.error('❌ Error requesting permissions:', error);
      this.permissionStatus = 'denied';
      return false;
    }
  }

  async initializePushNotifications(): Promise<void> {
    console.log('🚀 Initializing push notifications...');

    if (!this.isSupported()) {
      console.log('📱 Push notifications not supported on this platform, skipping initialization');
      return;
    }

    try {
      // Check current permissions
      const hasPermission = await this.checkPermissions();
      
      if (!hasPermission) {
        // Request permissions if not granted
        const granted = await this.requestPermissions();
        if (!granted) {
          console.log('❌ Cannot initialize push notifications without permissions');
          return;
        }
      }

      // Register for notifications
      await this.registerNotifications();
      
      // Add listeners
      await this.addListeners();
      
      console.log('✅ Push notifications initialized successfully');
    } catch (error: any) {
      console.error('❌ Failed to initialize push notifications:', error);
      throw error;
    }
  }

  private async registerNotifications(): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('Push notifications not supported on this platform');
    }

    try {
      const PushNotifications = getPushNotifications();
      console.log('📝 Registering for push notifications...');
      
      await PushNotifications.register();
      console.log('✅ Successfully registered for push notifications');
    } catch (error: any) {
      console.error('❌ Error registering for push notifications:', error);
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  private async addListeners(): Promise<void> {
    if (!this.isSupported()) {
      return;
    }

    try {
      const PushNotifications = getPushNotifications();
      console.log('👂 Adding push notification listeners...');

      // Registration token listener
      await PushNotifications.addListener('registration', (token: any) => {
        console.log('📝 Registration token received:', token.value);
        this.sendTokenToBackend(token.value);
      });

      // Registration error listener
      await PushNotifications.addListener('registrationError', (err: any) => {
        console.error('❌ Registration error:', err.error);
      });

      // Notification received listener
      await PushNotifications.addListener('pushNotificationReceived', (notification: any) => {
        console.log('📨 Push notification received:', notification);
        this.notifications.push(notification);
        this.lastNotification = notification;
      });

      // Notification action performed listener
      await PushNotifications.addListener('pushNotificationActionPerformed', (notification: any) => {
        console.log('👆 Push notification action performed:', notification.actionId, notification.inputValue);
      });

      console.log('✅ Push notification listeners added successfully');
    } catch (error: any) {
      console.error('❌ Error adding listeners:', error);
      throw new Error(`Failed to add listeners: ${error.message}`);
    }
  }

  private async sendTokenToBackend(token: string): Promise<void> {
    try {
      console.log('📤 Sending FCM token to backend...');
      await this.axiosInstance.post('/system/fcm/token', { fcm_token: token });
      console.log('✅ FCM token sent to backend successfully');
    } catch (error: any) {
      console.error('❌ Error sending token to backend:', error);
    }
  }

  clear(): void {
    console.log('🧹 Clearing notifications...');
    this.notifications = [];
    this.lastNotification = null;
  }

  cleanup(): void {
    console.log('🧹 Cleaning up FCM service...');
    this.clear();
    // Note: Capacitor doesn't provide a way to remove listeners easily
    // They are automatically cleaned up when the app is destroyed
  }

  getState() {
    return {
      notifications: this.notifications,
      lastNotification: this.lastNotification,
      clear: this.clear.bind(this),
      initializePushNotifications: this.initializePushNotifications.bind(this),
      permissionStatus: this.permissionStatus,
      isSupported: this.isSupported(),
      platform: this.getPlatform()
    };
  }

  // Debug utility similar to voiceAgent
  getDebugInfo() {
    const capacitor = getCapacitor();
    const hasPlugin = isPushNotificationsAvailable();

    return {
      windowCapacitor: !!capacitor,
      hasPushNotificationsPlugin: hasPlugin,
      availablePlugins: capacitor?.Plugins ? Object.keys(capacitor.Plugins) : [],
      platform: this.getPlatform(),
      isNativePlatform: capacitor?.isNativePlatform?.() || false,
      isSupported: this.isSupported(),
      permissionStatus: this.permissionStatus,
      notificationsCount: this.notifications.length,
      hasLastNotification: !!this.lastNotification
    };
  }
}

export const FCMContext = React.createContext<IFCMContext>({
  notifications: [],
  lastNotification: null,
  clear: () => {},
  initializePushNotifications: async () => {},
  permissionStatus: 'unknown',
  isSupported: false,
  platform: 'web'
});

const FCMProvider: FC<IFCMProvider> = ({
  manager,
  children,
  ...props
}) => {
  const debug = false;
  const fcmService = useRef(new FCMService()).current;
  
  const { 
    notifications, 
    lastNotification, 
    clear, 
    initializePushNotifications,
    permissionStatus,
    isSupported,
    platform
  } = manager ? manager() : fcmService.getState();
  
  const auth = useSelector((store: IDASHAppState<any, any, IDashAutoAdminResourceConfig>) => store.auth);
  const prevAuthRef = useRef<boolean>(false);
   
  const envVars = useMemo(() => ({
    APP_VERSION: getEnv('APP_VERSION') || '1.0.0',
    BUILD_TIME: getEnv('BUILD_TIME') || new Date().toISOString(),
    IS_ELECTRON: JSON.parse(getEnv('IS_ELECTRON') || 'false'),
    PLATFORM: getEnv('PLATFORM') || "unknown",
    IS_WINDOWS: JSON.parse(getEnv('IS_WINDOWS') || 'false'),
    IS_MAC: JSON.parse(getEnv('IS_MAC') || 'false'),
    IS_LINUX: JSON.parse(getEnv('IS_LINUX') || 'false'),
    PLATFORM_TYPE: getEnv('PLATFORM_TYPE') || "desktop",

    // Mobile/Capacitor platform detection
    IS_ANDROID: JSON.parse(getEnv('IS_ANDROID') || 'false'),
    IS_IOS: JSON.parse(getEnv('IS_IOS') || 'false'),
    IS_CAPACITOR: JSON.parse(getEnv('IS_CAPACITOR') || 'false'),
    IS_MOBILE: JSON.parse(getEnv('IS_MOBILE') || 'false'),
    CAPACITOR_PLATFORM: getEnv('CAPACITOR_PLATFORM') || 'web',
    ANDROID_AVAILABLE: JSON.parse(getEnv('ANDROID_AVAILABLE') || 'false'),
    IOS_AVAILABLE: JSON.parse(getEnv('IOS_AVAILABLE') || 'false'),
  }), []);

   const Capacitor = getCapacitor();
  useEffect(() => {
    if (auth.authenticated && !prevAuthRef.current) {
      const capacitorPlatform = Capacitor?.getPlatform?.() || 'web';
      const isNativePlatform = Capacitor?.isNativePlatform?.() || false;
      
      console.log('🔐 User authenticated, checking if should initialize FCM...', {
        debug,
        isSupported,
        platform,
        capacitorPlatform,
        isNativePlatform,
        envVars: {
          IS_ANDROID: envVars.IS_ANDROID,
          IS_IOS: envVars.IS_IOS,
          IS_CAPACITOR: envVars.IS_CAPACITOR,
          CAPACITOR_PLATFORM: envVars.CAPACITOR_PLATFORM
        }
      });

      // Only initialize if supported and on appropriate platforms
      if (isSupported) {
        if (debug) {
          console.log('🐛 Debug mode: initializing FCM');
          initializePushNotifications().catch(error => {
            console.error('❌ FCM initialization failed in debug mode:', error);
          });
        } else if (isNativePlatform || capacitorPlatform === 'android' || capacitorPlatform === 'ios') {
          // Use runtime Capacitor detection instead of build-time env vars
          console.log('📱 Native platform detected: initializing FCM', { capacitorPlatform, isNativePlatform });
          initializePushNotifications().catch(error => {
            console.error('❌ FCM initialization failed:', error);
          });
        } else {
          console.log('🌐 Web platform or unsupported: skipping FCM initialization', { capacitorPlatform, isNativePlatform });
        }
      } else {
        console.log('❌ FCM not supported on this platform');
      }
    }
    
    prevAuthRef.current = auth.authenticated;
  }, [auth, debug, isSupported, platform, envVars, initializePushNotifications]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      fcmService.cleanup();
    };
  }, [fcmService]);

  const contextValue = useMemo(() => ({
    notifications,
    lastNotification,
    clear,
    initializePushNotifications,
    permissionStatus,
    isSupported,
    platform
  }), [
    notifications,
    lastNotification,
    clear,
    initializePushNotifications,
    permissionStatus,
    isSupported,
    platform
  ]);

  return (
    <FCMContext.Provider value={contextValue}>
      {children}
    </FCMContext.Provider>
  );
};

export { FCMContext as default, FCMProvider };
