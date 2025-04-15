import { Fragment, ReactNode } from 'react';
import DefaultNotificationComponent from './DefaultNotificationComponent';

import NotificationsNoneTwoTone from '@mui/icons-material/Dashboard';


export interface INotificationPayloadBase {
    notifiable?: any;
    modelInstance?: number;
    model?: string;
    targetType?: string;
    mailSubject?: string;
    timestamp?: string;
    targetRoles?: string[];
    notify: "dialog" | "toast" | "none";
}

export interface INotificationPayload<T> extends INotificationPayloadBase {
    notificationPayload?: { 
        class?: string;
        title?: string;
        message?: string;
        notificationPayload:T
    };
    data?: T;

}

export interface DefaultSystemNotification extends INotificationPayloadBase {
    date: string;
    filepath: string;
    id: string;
    json: any;
    name: string;
    tenant_id: number;
    type: string;
}

export interface IProductImportNotificationPayload
    extends DefaultSystemNotification { }
export interface ICampaingStatusNotificationPayload
    extends DefaultSystemNotification { }

export interface IFormattedNotification {
    class: string;
    title: string;
    content: { component: any; props: any };
    date?: string;
    icon: ReactNode;
    [key: string]: any;
}

export interface INotificationFormat<T> {
    class: string;
    title: (notificationPayload: T) => string;
    content: (notificationPayload: T) => { component: any; props: any };
    icon: ReactNode;
}

const notificationsFormats: INotificationFormat<any>[] = [
    {
        class: 'DefaultNotification',
        icon: <NotificationsNoneTwoTone />,
        title: (notification: INotificationPayload<any>) => {
            switch (notification.notificationPayload.notificationPayload.type) {
                case 'ValidateProductsToImportJob':
                    return notification.notificationPayload.title;
            }
            return notification.notificationPayload.notificationPayload.name;
        },
        content: (
            notification: INotificationPayload<IProductImportNotificationPayload>,
        ) => {
            switch (notification.notificationPayload.notificationPayload.type) {
                default:
                    return {
                        component: DefaultNotificationComponent,
                        props: { notificationPayload: notification },
                    };
            }
        },
    },
];

export function formatNotification<T extends INotificationPayloadBase>(
    notification: INotificationPayload<T>,
): IFormattedNotification {
    const _notificationFormat: INotificationFormat<T> = notificationsFormats.find(
        (notificationFormat) =>
            notificationFormat.class === notification.notificationPayload.class,
    );
    return {
        class: notification.notificationPayload.class,
        title: _notificationFormat?.title
            ? _notificationFormat.title(notification.notificationPayload.notificationPayload)
            : notification.notificationPayload.title,
        icon: _notificationFormat?.icon ? _notificationFormat.icon : <></>,
        content: _notificationFormat?.content
            ? _notificationFormat?.content(notification.notificationPayload.notificationPayload)
            : {
                component: Fragment,
                props: { children: <>{notification.notificationPayload.message}</> },
            },
    };
}

export default notificationsFormats;

