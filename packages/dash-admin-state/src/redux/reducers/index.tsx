import { combineReducers } from 'redux';
import SettingsReducer from './Settings';
import AuthReducer from './Auth';
import CommonReducer from './Common';
import PageReducer from './Page';
import ResourcesReducer from './Resources';
import FormDataReducer from './FormData';
import MenuReducer from './Menu';
import ComponentDataReducer from './ComponentData';


export const createRootReducer = (/*history*/) =>
	combineReducers({
		//router: connectRouter(history),
		page: PageReducer,
		settings: SettingsReducer,
		auth: AuthReducer,
		common: CommonReducer,
		resources: ResourcesReducer,
    formData: FormDataReducer,
    menu: MenuReducer,
    componentData: ComponentDataReducer,
	});

export default createRootReducer;
