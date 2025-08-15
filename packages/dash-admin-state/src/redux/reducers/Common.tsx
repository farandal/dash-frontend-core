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
import defaultCommon from '../../defaults/defaultCommon'; // Import the default
import { dashStorage } from 'dash-utils';
// Helper function to save nav state to localStorage
const saveNavState = (navExpanded: boolean, navSize: "large" | "small"): void => {
	try {
		dashStorage.setItem('dashNavExpanded', String(navExpanded));
		dashStorage.setItem('dashNavSize', navSize);

	} catch (e) {
		console.error('Failed to save navigation state to localStorage:', e);
	}
};

const CommonReducer = (
	state: ICommonState = defaultCommon, // Use the imported default instead of inline object
	action,
) => {
	switch (action.type) {
		case '@@router/LOCATION_CHANGE': {
			return {
				...state,
				pathname: action.payload.location.pathname,
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
			let componentStates = { ...state.componentsState }; // Create copy instead of mutating
			delete componentStates[action.componentId];
			return {
				...state,
				componentsState: componentStates, // Fixed typo: was componentStates, should be componentsState
			};

		case SET_HEADER_COMPONENTS:
			return {
				...state,
				headerToolBar: action.headerToolBar,
			};

		case SET_PANEL_SETTINGS:
			return {
				...state,
				panelSettings: {...state.panelSettings,...action.panelSettings},
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
			const newNavExpanded = action.navExpanded;
			// Save to localStorage when toggling
			saveNavState(newNavExpanded, state.navSize);
			return {
				...state,
				navExpanded: newNavExpanded,
			};
		}

		case 'SET_NAV_EXPANDED': {
			const newNavExpanded = action.payload;
			// Save to localStorage when setting nav expanded
			saveNavState(newNavExpanded, state.navSize);
			return {
				...state,
				navExpanded: newNavExpanded,
			};
		}

		case 'SET_NAV_SIZE': {
			const newNavSize = action.payload;
			// Save to localStorage when setting nav size
			saveNavState(state.navExpanded, newNavSize);
			return {
				...state,
				navSize: newNavSize,
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
