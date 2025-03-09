import IPageState from '../interfaces/IPage';

export const ACTION_UPDATE_PAGE = 'UPDATE_PAGE';

const PageReducer = (state: IPageState = {}, action) => {
	switch (action.type) {
		case ACTION_UPDATE_PAGE:
			return {
				...state,
				...action.payload,
			};
		default:
			return state;
	}
};

export default PageReducer;
