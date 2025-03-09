import { SET_RESOURCES, APPEND_RESOURCES } from './ActionTypes';

export function setResources(resources) {
	return (dispatch:any) => {
		dispatch({
			type: SET_RESOURCES,
			payload: resources,
		});
	};
}

export function appendResources(resources) {
	return (dispatch:any) => {
		dispatch({
			type: APPEND_RESOURCES,
			payload: resources,
		});
	};
}
