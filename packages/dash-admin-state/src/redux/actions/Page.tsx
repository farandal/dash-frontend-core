import IPage from '../interfaces/IPage';
import { ACTION_UPDATE_PAGE } from '../reducers/Page';

export function updatePage(page: IPage) {
	return { type: ACTION_UPDATE_PAGE, payload: page };
}
