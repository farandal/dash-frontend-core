export interface INotificationBase {
	notifiable?: any;
	modelInstance?: any;
	model?: string;
	notificationPayload?: any;
	[key: string]: any;
}

export default interface INotification<T> extends INotificationBase {
	notificationPayload: T;
}
