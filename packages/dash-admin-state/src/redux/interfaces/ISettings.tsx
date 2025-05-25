import { IDASHResourceGroupsIcons } from "./IDashResourceGroupsIcons";

export interface ILocale {
    languageId: string;
		locale: string;
		name: string;
		icon: string;
}
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
	locale: string;
  availableLocales: ILocale[];
	sidebarExpandedWidth?: number;
	sidebarCollapsedWidth?: number;
}

export default ISettingsState;
