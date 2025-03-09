import { IDashAutoAdminResourceConfig } from "dash-auto-admin";

interface IAppMenu {
	//hasDashboard: boolean;
	children?: React.ReactNode;
	autoHideScroll?: boolean;
	menu?: IDashAutoAdminResourceConfig[];
	debug?: boolean;
	showDrawer?: boolean;
	navSize?: "small" | "large";
	[key: string]: any;
}

export default IAppMenu;