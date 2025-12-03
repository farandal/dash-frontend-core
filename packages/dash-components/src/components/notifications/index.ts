/**
 * Notifications Components
 * 
 * A comprehensive notification system for React applications
 * Includes toast notifications, notification menus, and draggable dialog notifications
 */

export {
    // Main Component
    NotificationsCenter,
    
    // Sub-components
    NotificationButton,
    NotificationsMenu,
    NotificationMenuItem,
    ToastNotificationsStack,
    DraggableNotificationDialog,
    
    // Hook
    useNotificationsCenter,
    
    // Utilities
    formatTimeAgo,
    generateNotificationId,
    
    // Types
    type NotificationData,
    type ToastNotification,
    type DialogNotification,
    type NotificationsCenterConfig,
    type NotificationsCenterLabels,
    type NotificationsCenterIcons,
    type NotificationButtonProps,
    type NotificationsMenuProps,
    type NotificationMenuItemProps,
    type ToastNotificationsStackProps,
    type DraggableNotificationDialogProps,
    type NotificationsCenterProps,
    type UseNotificationsCenterReturn,
} from './NotificationsCenter';

export { default } from './NotificationsCenter';
