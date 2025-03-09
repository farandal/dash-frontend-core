import { APPEND_RESOURCES, SET_RESOURCES } from '../actions/ActionTypes';

// Any must be replaced by IDashAutoAdminResourceConfig[], and the initial state must be initialized with the initial resources.
const ResourcesReducer = (state: { items: any[] } = { items: [] }, action) => {
	switch (action.type) {
		case SET_RESOURCES:
			return {
				items: [...action.payload],
			};
		case APPEND_RESOURCES:
			return {
				items: [...state.items, ...action.payload],
			};
		default:
			return state;
	}
};

export default ResourcesReducer;
