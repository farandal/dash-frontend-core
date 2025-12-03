/**
 * Utils Extensions Index
 * 
 * Utility functions and contexts.
 */

// Auth Provider Utils
export { 
    dashDefaultLogoutFromStorage, 
    dashDefaultIsAuthenticated, 
    dashDefaultGetCurrentUser, 
    dashDefaultGetToken 
} from './dashDefaultAuthProviderUtils';

// Data Provider Utils
export { 
    dashDefaultGetResourceConfig, 
    dashDefaultSetResourceConfigs, 
    dashDefaultProcessPostData, 
    dashDefaultProcessFormData, 
    dashDefaultBuildQueryString, 
    dashDefaultIsFormDataResource 
} from './dashDefaultDataProviderUtils';

// IPC Message Broker
export {
    DashIPCMessageBrokerContext,
    DashIPCMessageBrokerProvider,
    useDashIPCMessageBroker,
    type DashLogMessage,
    type DashSubprocessOutput,
    type DashIPCMessageBrokerContextType,
    type DashIPCMessageBrokerConfig
} from './IPCMessageBrokerContext';

// Notifications Processor
export { 
    processDashDefaultNotification, 
    playDashDefaultNotificationSound, 
    playDashDefaultDigitalWatchAlarm,
    requestDashDefaultNotificationPermission 
} from './dashDefaultNotificationsProcessor';
