import { JSX } from "react";

export interface IComponentState {
	[x: string]: any;
}

export interface ICommonState {
  appPath: string;
	error: string;
	loading: boolean;
	message: any;
	navExpanded: boolean;
  navSize: string; //"large" | "small";
	width: number | string | any;
	height: number | string | any;
	content_width?: number;
	content_height?: number;
	pathname: string;
	componentsState?: {[x: string]: any}; // Changed from array to object
	headerComponents?: JSX.Element[];
	panelSettings?: {[x: string]: any};
}

export default ICommonState;
