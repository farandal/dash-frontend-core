import { IDashAutoAdminResourceConfig } from "dash-auto-admin";
import { JSX } from "react";
import { SidebarPosition } from "../AppSidebarMaterial";

export interface IAppMenu {
	//hasDashboard: boolean;
	children?: React.ReactNode;
	autoHideScroll?: boolean;
	menu?: IDashAutoAdminResourceConfig[];
	debug?: boolean;
	showDrawer?: boolean;
	navSize: "small" | "large";
    navExpanded: boolean;
	sidebarPosition?: SidebarPosition;
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
	/** When true, this menu item is a simple navigation link (not a react-admin resource) */
	menuOnly?: boolean;
}

export interface ICollapsableSidebarMenu {
	item: IMenuItem;
	showIcon?: boolean;
	className?: string;
	navExpanded: boolean;
	navSize: "small" | "large";
	level: number;
	sidebarPosition?: SidebarPosition;
}
