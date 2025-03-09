import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import ResourceTemplate from 'dash-admin/src/templates/ResourceTemplate';
import Dashboard from '@mui/icons-material/Dashboard';
import DASHAdminSystemConstants from 'dash-admin/src/config/DASHAdminSystemConstants';

import getProfileMenu from '@app/utils/getProfileMenu';
import CustomProfile from '@app/pages/Account/CustomProfile';

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
	listComponent: (_resourceConfig) => <CustomProfile />,
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
