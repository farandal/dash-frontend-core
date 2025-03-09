import { IRequestAction } from './IRequestAction';

export interface IActions {
	[key: string]: IRequestAction;
}
