import { IDASHResourceGroupsIcons } from "./IDashResourceGroupsIcons";

// import IDashAutoAdminResourceConfig from "@dash-auto-admin/interfaces/IDashAutoAdminResourceConfig";
export interface ISettingsState {
	loading: boolean;
	navStyle: any;
	layoutType: string;
	themeType: string | any;
	themeColor: string;
  layoutSettings?: {[x: string]: any};
  groupIcons?: IDASHResourceGroupsIcons;
	isDirectionRTL: boolean;
	// resources: IDashAutoAdminResourceConfig[]
	locale: {
		languageId: string;
		locale: string;
		name: string;
		icon: string;
	};
	sidebarExpandedWidth?: number;
	sidebarCollapsedWidth?: number;
}

export default ISettingsState;
