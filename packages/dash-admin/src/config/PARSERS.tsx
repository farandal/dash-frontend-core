import IUserNotification from '../interfaces/notifications/IUserNotification';

const PARSERS = {
	GET_NOTIFICATIONS: (json: any): IUserNotification[] => {
		return json.notifications;
	},
};

export default PARSERS;
