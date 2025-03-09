import { Fragment, ReactNode } from 'react';
import DefaultNotificationComponent from './DefaultNotificationComponent';

import NotificationsNoneTwoTone from '@mui/icons-material/Dashboard';
import INotification from '../interfaces/INotification';

export interface INotificationPayloadBase {
	class: string;
	title: string;
	message: string;
	date: string;
	notificationPayload: any;
}

export interface INotificationPayload<T> extends INotificationPayloadBase {
	notificationPayload: T;
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
	extends DefaultSystemNotification {}
export interface ICampaingStatusNotificationPayload
	extends DefaultSystemNotification {}

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
			switch (notification.notificationPayload.type) {
				case 'ValidateProductsToImportJob':
					return notification.title;
			}
			return notification.notificationPayload.name;
		},
		content: (
			notification: INotificationPayload<IProductImportNotificationPayload>,
		) => {
			switch (notification.notificationPayload.type) {
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
	notification: INotification<T>,
): IFormattedNotification {
	const _notificationFormat: INotificationFormat<T> = notificationsFormats.find(
		(notificationFormat) =>
			notificationFormat.class === notification.notificationPayload.class,
	);
	return {
		class: notification.notificationPayload.class,
		title: _notificationFormat?.title
			? _notificationFormat.title(notification.notificationPayload)
			: notification.notificationPayload.title,
		icon: _notificationFormat?.icon ? _notificationFormat.icon : <></>,
		content: _notificationFormat?.content
			? _notificationFormat?.content(notification.notificationPayload)
			: {
					component: Fragment,
					props: { children: <>{notification.notificationPayload.message}</> },
			  },
	};
}

export default notificationsFormats;
