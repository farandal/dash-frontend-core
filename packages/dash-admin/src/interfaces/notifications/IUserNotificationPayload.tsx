import { IAny } from '../misc/IAny';

export default interface IUserNotificationPayload extends IAny {
	message: string;
	attributes: { actor: string; model: string; action: string };
	formattedtext: string;
	//nonFormattedText: string
}
