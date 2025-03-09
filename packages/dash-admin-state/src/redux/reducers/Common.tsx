import {
	FETCH_ERROR,
	FETCH_START,
	FETCH_SUCCESS,
	HIDE_MESSAGE,
	SHOW_MESSAGE,
	LOADING,
	CONTENT_WIDTH,
	CONTENT_HEIGHT,
	SET_HEADER_COMPONENTS,
	SET_PANEL_SETTINGS,
} from '../actions/ActionTypes';
import { TOGGLE_COLLAPSED_NAV, WINDOW_WIDTH } from '../actions/ActionTypes';
import ICommonState from '../interfaces/ICommonState';

const CommonReducer = (
	state: ICommonState = {
		error: '',
		loading: false,
		message: undefined,
		navExpanded: false,
		width: undefined,
		height: undefined,
		pathname: '',
		headerComponents: [],
	},
	action,
) => {
	switch (action.type) {
		case '@@router/LOCATION_CHANGE': {
			return {
				...state,
				pathname: action.payload.location.pathname,
				//navExpanded: false
			};
		}

		case 'SET_COMPONENT_STATE':
			return {
				...state,
				componentsState: {
					...state.componentsState,
					[action.componentId]: action.state,
				},
			};
		case 'UNSET_COMPONENT_STATE':
			let componentStates = state.componentsState;
			delete componentStates[action.componentId];
			return {
				...state,
				componentStates,
			};

		case SET_HEADER_COMPONENTS:
			return {
				...state,
				headerComponents: action.headerComponents,
			};

		case SET_PANEL_SETTINGS:
			return {
				...state,
				panelSettings: action.panelSettings,
			};

		case CONTENT_WIDTH:
			return {
				...state,
				content_width: parseInt(action.width),
			};

		case CONTENT_HEIGHT:
			return {
				...state,
				content_height: parseInt(action.height),
			};

		case WINDOW_WIDTH:
			console.log('updating width', action.width, {
				...state,
				width: action.width,
			});
			return {
				...state,
				width: action.width,
			};
		case TOGGLE_COLLAPSED_NAV: {
			return {
				...state,
				navExpanded: action.navExpanded,
			};
		}
		case FETCH_START: {
			return { ...state, error: '', message: '', loading: true };
		}
		case FETCH_SUCCESS: {
			return { ...state, error: '', message: '', loading: false };
		}
		case SHOW_MESSAGE: {
			return { ...state, error: '', message: action.payload, loading: false };
		}
		case LOADING: {
			return { ...state, loading: action.payload };
		}
		case FETCH_ERROR: {
			return { ...state, loading: false, error: action.payload, message: '' };
		}
		case HIDE_MESSAGE: {
			return { ...state, loading: false, error: '', message: '' };
		}
		default:
			return state;
	}
};

export default CommonReducer;
