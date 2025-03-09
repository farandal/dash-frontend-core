import DefaultThemeSettings from '../../DefaultThemeSettings';
import {
	UPDATE_THEME_SETTINGS,
	SWITCH_LANGUAGE,
	SET_RESOURCES,
} from '../actions/ActionTypes';

import ISettingsState from '../interfaces/ISettings';

const SettingsReducer = (
	state: ISettingsState = {
		loading: false,
		navStyle: undefined,
		layoutType: '',
		themeType: undefined,
		themeColor: '',
		isDirectionRTL: false,
		locale: {
			languageId: '',
			locale: '',
			name: '',
			icon: '',
		},
	},
	action,
) => {
	switch (action.type) {
		case SET_RESOURCES:
			return {
				...state,
				resources: action.payload,
			};
		case DefaultThemeSettings.THEME_TYPE:
			return {
				...state,
				themeType: action.themeType,
			};
		case DefaultThemeSettings.THEME_COLOR:
			return {
				...state,
				themeColor: action.themeColor,
			};

		case DefaultThemeSettings.UPDATE_RTL_STATUS:
			return {
				...state,
				isDirectionRTL: action.rtlStatus,
			};

		case UPDATE_THEME_SETTINGS:
			return {
				...state,
				...action,
			};

		case DefaultThemeSettings.NAV_STYLE:
			return {
				...state,
				navStyle: action.navStyle,
			};
		case DefaultThemeSettings.LAYOUT_TYPE:
			return {
				...state,
				layoutType: action.layoutType,
			};

		case SWITCH_LANGUAGE:
			return {
				...state,
				locale: action.payload,
			};
		default:
			return state;
	}
};

export default SettingsReducer;
