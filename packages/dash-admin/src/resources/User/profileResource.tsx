import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import ResourceTemplate from '../../templates/ResourceTemplate';
import Dashboard from '@mui/icons-material/Dashboard';
import {DASHAdminSystemConstants} from 'dash-constants';

import getProfileMenu from './getProfileMenu';

/**
 * Shared "/profile" resource shell.
 *
 * Moved here from kt-ecommerce (resources/user/profileResource.tsx) - the
 * config itself is generic. `listComponent` is intentionally left unset: the
 * kt-ecommerce original hardcoded kt-pages' CustomProfile page, which would
 * have made this package depend on a kitchntabs-flavored consumer package
 * (backwards - dash-admin is core, kt-pages/kt-ecommerce are domain layers
 * built on top of it). Each app supplies its own profile page component by
 * overriding `listComponent` after importing this base config, e.g.:
 *
 *   import profileResource from 'dash-admin/src/resources/User/profileResource';
 *   import CustomProfile from 'kt-pages/src/pages/Account/CustomProfile';
 *
 *   export default {
 *     ...profileResource,
 *     listComponent: (_resourceConfig) => <CustomProfile />,
 *   };
 */
const profileResource: IDashAutoAdminResourceConfig = {
	filterWithSubmit: true,
	roles: ["*"
		/*
        DASHAdminSystemConstants.system.DASH_SYSTEM_ROLE,
		DASHAppConstants.system.TENANT_ROLE,
		DASHAppConstants.system.USER_ROLE,
		DASHAppConstants.system.CREATOR_ROLE,
		DASHAppConstants.system.CLOSING_ROLE,
		DASHAppConstants.system.GUNNER_ROLE,
		DASHAppConstants.system.DRIVER_ROLE
        */
	],
	component: ResourceTemplate,
	hidden: true,
	model: 'profile',
	group: 'Perfil',
	label: 'Perfil',
	icon: <Dashboard />,
	schema: null,
	menu: getProfileMenu,
	listProps : { perPage: DASHAdminSystemConstants.system.DEFAULT_PER_PAGE || 50}
};

export default profileResource;
