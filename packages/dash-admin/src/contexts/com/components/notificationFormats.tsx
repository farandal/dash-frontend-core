import { Fragment, ReactNode } from 'react';
import DefaultNotificationComponent from './DefaultNotificationComponent';

import { IDashNotificationBase, IDashNotificationPayloadBase } from '../../../interfaces/communication/INotification';



export interface DefaultDashNotificationPayload extends IDashNotificationPayloadBase {
    [x: string]: any;
}

export interface IDashFormattedNotification {
    class: string;
    title:  React.FC<{ notification: IDashNotificationBase<any> }>;
    content: React.FC<{ notification: IDashNotificationBase<any> }>;
    date?: string;
    icon:  React.FC<{ notification: IDashNotificationBase<any> }>;
    [key: string]: any;
}

export interface INotificationFormat<T> {
    class: string;
    title: React.FC<{ notification: IDashNotificationBase<T> }>,
    content: React.FC<{ notification: IDashNotificationBase<T> }>,
    icon: React.FC<{ notification: IDashNotificationBase<T> }>,
}

export function formatNotification<T>(
    notification: IDashNotificationBase<T>,
    titleComponent?: React.FC<{ notification: IDashNotificationBase<T> }>,
    iconComponent?: React.FC<{ notification: IDashNotificationBase<T> }>,
    contentComponent?: React.FC<{ notification: IDashNotificationBase<T> }>,

): IDashFormattedNotification {
    
    return {
        class: notification.class,
        title: titleComponent
            ? titleComponent
            : (notification) => <>notification.title</>,
        icon: iconComponent 
            ? iconComponent
            : (notification) => <>🔔</>,
        content: contentComponent
            ? contentComponent
            : DefaultNotificationComponent
    };
}

export default formatNotification;
