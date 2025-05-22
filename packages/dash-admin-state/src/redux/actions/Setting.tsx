import DefaultThemeSettings from '../../DefaultThemeSettings';
import {
	CONTENT_HEIGHT,
	CONTENT_WIDTH,
	UPDATE_THEME_SETTINGS,
	SWITCH_LANGUAGE,
	WINDOW_WIDTH,
} from './ActionTypes';

export function toggleThemeType(themeType) {
  document.documentElement.setAttribute('data-theme', themeType)
  return { type: DefaultThemeSettings.THEME_TYPE, themeType };
}

export function updateWindowWidth(width) {
	return (dispatch) => {
		dispatch({ type: WINDOW_WIDTH, width });
	};
}

export function updateContentWidth(width) {
	return (dispatch) => {
		dispatch({ type: CONTENT_WIDTH, width });
	};
}

export function updateContentHeight(height) {
	return (dispatch) => {
		dispatch({ type: CONTENT_HEIGHT, height });
	};
}

export function setThemeType(themeType) {
	return (dispatch) => {
		dispatch({ type: DefaultThemeSettings.THEME_TYPE, themeType });
	};
}

export function setThemeColor(themeColor) {
	return (dispatch) => {
		dispatch({ type: DefaultThemeSettings.THEME_COLOR, themeColor });
	};
}

export function setDirectionRTL(rtlStatus) {
	return (dispatch) => {
		dispatch({ type: DefaultThemeSettings.UPDATE_RTL_STATUS, rtlStatus });
	};
}

export function onNavStyleChange(navStyle) {
	return (dispatch) => {
		dispatch({ type: DefaultThemeSettings.NAV_STYLE, navStyle });
	};
}

export function onLayoutTypeChange(layoutType) {
	return (dispatch) => {
		dispatch({ type: DefaultThemeSettings.LAYOUT_TYPE, layoutType });
	};
}

export function switchLanguage(locale) {
	return (dispatch) => {
		dispatch({
			type: SWITCH_LANGUAGE,
			payload: locale,
		});
	};
}

export function setSidebarProps(width, expandedWidth) {
	return (dispatch) => {
		dispatch({
			type: UPDATE_THEME_SETTINGS,
			payload: { width: width, expandedWidth: expandedWidth },
		});
	};
}
