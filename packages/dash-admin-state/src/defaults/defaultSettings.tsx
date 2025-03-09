import ISettingsState from "../redux/interfaces/ISettings";
import DASHAdminSystemConstants from 'dash-admin/src/config/DASHAdminSystemConstants';

const defaultSettings: ISettingsState = {
	loading: false,
	navStyle: DASHAdminSystemConstants.panel.NAV_STYLE_FIXED,
	layoutType: DASHAdminSystemConstants.panel.LAYOUT_TYPE_FULL,
	themeType: DASHAdminSystemConstants.panel.THEME_TYPE_LITE,
	themeColor: '',
	isDirectionRTL: false,
	locale: {
		languageId: 'spanish',
		locale: 'es',
		name: 'Español',
		icon: 'es',
	},
	sidebarExpandedWidth: 240,
	sidebarCollapsedWidth: 80,
};

export default defaultSettings;
