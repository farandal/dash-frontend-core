export interface IFlashMessage {
	id?: number;
	duration?: number;
	text?: string;
	onClick?: any;
	type?: string;
	description?: string;
	onDismiss?: any;
	showButton?: boolean;
}
