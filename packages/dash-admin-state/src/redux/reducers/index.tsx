import { combineReducers } from 'redux';
import SettingsReducer from './Settings';
import AuthReducer from './Auth';
import CommonReducer from './Common';
import PageReducer from './Page';
import ResourcesReducer from './Resources';
import FormDataReducer from './FormData';

export const createRootReducer = (/*history*/) =>
	combineReducers({
		//router: connectRouter(history),
		page: PageReducer,
		settings: SettingsReducer,
		auth: AuthReducer,
		common: CommonReducer,
		resources: ResourcesReducer,
    formData: FormDataReducer,
	});

export default createRootReducer;
