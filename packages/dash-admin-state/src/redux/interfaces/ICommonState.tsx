import { JSX } from "react";

export interface IComponentState {
	[x: string]: any;
}

export interface ICommonState {
	error: string;
	loading: boolean;
	message: any; // strin o error
	navExpanded: boolean;
	width: number | string | any;
	height: number | string | any;
	content_width?: number;
	content_height?: number;
	pathname: string;
	componentsState?: IComponentState[];
	headerComponents?: JSX.Element[];
	panelSettings?: {[x: string]: any};
}

export default ICommonState;
