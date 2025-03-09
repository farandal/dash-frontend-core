import { IAny } from '../misc/IAny';
import IUser from '../user/IUser';
import IModel from './IModel';
import IUserNotificationPayload from './IUserNotificationPayload';

export default interface ISUserNotificationData extends IAny {
	notifiable?: IUser;
	socket?: any;
	notificationPayload: IUserNotificationPayload;
	modelInstance?: IModel;
	model?: string;
	publicResourceLink?: string;
}
