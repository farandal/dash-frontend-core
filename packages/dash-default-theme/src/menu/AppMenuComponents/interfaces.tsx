import { IDashAutoAdminResourceConfig } from "dash-auto-admin";
import { JSX } from "react";

export interface IAppMenu {
	//hasDashboard: boolean;
	children?: React.ReactNode;
	autoHideScroll?: boolean;
	menu?: IDashAutoAdminResourceConfig[];
	debug?: boolean;
	showDrawer?: boolean;
	navSize?: "small" | "large";
	[key: string]: any;
}

export interface IMenuItem {
	group: string;
	model: string;
	label: string;
	txtLabel: string;
	key: React.Key;
	to?: string;
	icon?: JSX.Element;
	children?: IMenuItem[];
	type?: 'group';
	selected?: boolean;
}

export interface ICollapsableSidebarMenu {
	item: IMenuItem;
	showIcon?: boolean;
	className?: string;
	navExpanded: boolean;
	navSize: "small" | "large";
	level: number;
}
