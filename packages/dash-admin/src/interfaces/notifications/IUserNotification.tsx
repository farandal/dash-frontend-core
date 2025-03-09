import IUserNotificationData from './IUserNotificationData';

export default interface IUserNotification {
	id: string;
	type: string;
	notifiable_type: string;
	notifiable_id: number;
	data: IUserNotificationData;
	read_at: string | null;
	created_at: string;
	updated_at: string;
}
