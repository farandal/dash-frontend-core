export interface IResponseAction {
	type: string;
	json?: any;
	message?: string;
	toState?: any;
	[key: string]: any;
}
