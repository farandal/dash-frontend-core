import SystemRequestsCache from './contexts/SystemRequestsCache';

/** INTERFACES */
export type { IAuthContext } from './contexts/auth'
export type { ILaravelEchoManager } from './contexts/com/LaravelEchoMgr'

/** Global Loader */
export { default as useGlobalLoaderMgr } from './hooks/useGlobalLoaderMgr';
export { default as GlobalLoader } from './components/loader/GlobalLoader';
/** App Wrapper Uses suspense to load the Domain App, contains Global Loader and Global Error Boundary. */
export { default as AppAsyncWrapper } from './AppAsyncWrapper';
export { default as AppWrapper } from './AppWrapper';
export { default as DASHAdmin } from './DASHAdmin';
export { default as systemResources } from './systemResources';
export { default as tenantResources } from './tenantResources';
export { default as CustomImageInput } from './components/misc/CustomImageInput';

export { default as ResourceTemplate } from './templates/ResourceTemplate';
export { default as ResourceTemplateFull } from './templates/ResourceTemplateFull';
//export { default as ResourceTemplateOld } from './templates/ResourceTemplateOld';
export { useDashResource } from './contexts/DashResourceContext';
export { default as TrashTemplate } from './templates/TrashTemplate';
export { default as MotionWrapper } from './layout/MotionWrapper';
//export { default as TransitionWrapper } from './layout/TransitionWrapper';
export { default as useWindowSize } from './hooks/window/useWindowSize';
export { CacheInvalidatorContext } from './utils/cache/CacheInvalidatorContext';
export { default as CacheInvalidatorListenerComponent } from './utils/cache/CacheInvalidatorListenerComponent';
//export { default as useCacheInvalidatorListener } from './utils/cache/useCacheInvalidatorListener';
//export { default as useAxiosGetWithStore } from './hooks/data/useAxiosGetWithStore';
//export { default as resolveObjectPath } from './utils/resolveObjectPath';
//export * as Utils from "./utils"
export { AuthContext } from './contexts/auth';
export { NotificationComponent } from './contexts/com/components/NotificationRenderer'
export { NotificationWrapper } from './contexts/com/components/NotificationsWidget'

export { default as useLaravelEcho } from './contexts/com/useLaravelEcho';
export { default as WSMessagesManager } from './hooks/notifications/WSMessagesManager';

export { default as FCMContext, FCMProvider } from './contexts/com/FCMContext';

export { default as Redirect } from './components/custom/Redirect';
//export { default as getEnv } from "./config/DASHAdminSystemConstants";

export { default as RoutingWrapper, AnimatedRoutesWrapper } from './RoutingWrapper';
export type { IDASHRoutingWrapper } from './RoutingWrapper';

export { useAuthContext } from "./contexts/auth/AuthContext";

export {default as LaravelEchoContext} from "./contexts/com/LaravelEchoContext"
export {default as DashQueryClientContext, useDashQueryClient} from "./contexts/DashQueryClientContext"
export { default as SystemRequestsCache, useSystemRequestsCache } from './contexts/SystemRequestsCache';
export type {ILaravelEchoContext} from "./contexts/com/LaravelEchoContext"

export {default as DASHGlobalErrorHandler} from "./components/misc/DASHGlobalErrorHandler"
export type {
    //NotificationPayloadBase,
    //INotificationPayload,
    //DefaultSystemNotification,
    //IFormattedNotification,
    INotificationFormat
} from "./contexts/com/components/notificationFormats"

// This is a React-Admin hacked component to overwrite some native features.
export * from './react-admin-dash/Resource';

export {default as LogFileById} from "./components/logs/LogFileById"
export {default as LogFile} from "./components/logs/LogFile"

export { default as DASHAuthenticationService } from "./contexts/auth/DASHAuthenticationService"

export * from "./contexts/auth"

export * from "./utils"

export * from "./default-theme";

export * from "./providers/i18n/languages"

export { default as DarkToggleMode } from "./components/menu/DarkToggleMode"

export { default as useFormPersistence } from "./hooks/useFormPersistance";

export { default as AvatarComponent } from './components/user/AvatarComponent';
export { default as TenantAvatarComponent } from './components/user/TenantAvatarComponent';
export { default as LanguageSwitcher } from './components/misc/LanguageSwitcher';
export { default as DarkModeSwitcher } from './components/misc/DarkModeSwitcher';

// Navigation Components
export { Breadcrumbs, BreadcrumbsComponent, BreadcrumbsManager, BreadcrumbsManagerComponent } from './components/navigation';
export type { BreadcrumbsProps, BreadcrumbsManagerProps } from './components/navigation';

// Navigation Hooks
export { useBreadcrumbs } from './hooks/useBreadcrumbs';
export type { UseBreadcrumbsOptions, UseBreadcrumbsResult } from './hooks/useBreadcrumbs';

// Resource Loader
export {
    createDASHResourceLoader,
    getDASHResources,
    loadResourcesFromManifest,
    loadManifest,
    clearResourceCache,
    getCachedResources,
    type IResourceManifestEntry,
    type IDASHResourceLoaderConfig
} from './resources/DASHResourceLoader';