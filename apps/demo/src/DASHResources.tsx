import { systemResources } from 'dash-admin';
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';

/* Example */
import TodoResource from './resources/example/TodoResource';

/* Common */
import communeResource from './resources/admin/geohierarchy/communeResource';
import countryResource from './resources/admin/geohierarchy/countryResource';
import regionResource from './resources/admin/geohierarchy/regionResource';

/* App */
import userResource from './resources/admin/user/userResource';
import profileResource from './resources/admin/user/profileResource';

const common: IDashAutoAdminResourceConfig[] = [
	communeResource,
    countryResource,
    regionResource,
];

const appResources: IDashAutoAdminResourceConfig[] = [
	userResource,
];

const DASHResources: IDashAutoAdminResourceConfig[] = [
	profileResource,
	...systemResources,
    ...appResources,
    ...common,
    /* Sample resource */
    TodoResource
];

export default DASHResources;
