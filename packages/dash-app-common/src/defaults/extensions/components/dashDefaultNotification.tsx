/**
 * Dash Default Notification Extension
 * 
 * Default React-Admin notification component configuration.
 */
import React from 'react';
import { Notification } from 'react-admin';

/**
 * Dash Default React-Admin Notification component
 * Configured for top-right positioning with 8 second auto-hide
 */
export const DashDefaultReactAdminNotification = (): React.JSX.Element => {
    return (
        <Notification
            className="dash-notification"
            autoHideDuration={8000}
            multiLine={true}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        />
    );
};

/**
 * Dash default notification configuration options
 */
export const dashDefaultNotificationConfig = {
    autoHideDuration: 8000,
    multiLine: true,
    anchorOrigin: { 
        vertical: 'top' as const, 
        horizontal: 'right' as const 
    },
    className: 'dash-notification',
};

export default DashDefaultReactAdminNotification;
