import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import ResourceTemplate from 'dash-admin/src/templates/ResourceTemplate';
import Settings from '@mui/icons-material/Settings';

import userSchema from '@app/schemas/app/userSchema';
import { PaginationComponent } from 'dash-components';
import usersFilters from '@app/filters/usersFilters';
import { Card } from '@mui/material';
import { downloadCSV } from 'react-admin';
import DASHAppConstants from 'dash-constants';
import jsonExport from 'jsonexport/dist';
import DASHAdminSystemConstants from 'dash-admin/src/config/DASHAdminSystemConstants';
import userLayout from './userLayout';
import NoResults from 'dash-components/src/components/theme/NotResults';

const userResource: IDashAutoAdminResourceConfig = {
	filterWithSubmit: true,
	roles: [
		DASHAdminSystemConstants.system.DASH_SYSTEM_ROLE,
		DASHAppConstants.system.TENANT_ROLE,
	],
	component: ResourceTemplate,
	trash: true,
	model: 'tenant/user',
	label: 'Usuarios',
	schema: userSchema,
	icon: <Settings />,
	group: 'Recursos del Cliente',
	menu: [
		{
			title: 'Usuarios',
			redirect: '/tenant/user',
		},
	],
	resourceMenuDisabled: true,
	customListActions: (props) => {
		const { children } = props;
		return <Card sx={{ mb:2 }} className='dash-card-content top-toolbar'>{children}</Card>;
	},
	isFormData: true,
	/** @deprecated TODO: side effects? seems is not implemented anywhere */
	listEditButton: { enabled: true },
	
	postFormatter: (params, _method) => {
		if (params.can_enter_xl === true) { params.can_enter_xl = 1; } else {  params.can_enter_xl = 0;}
		//params.can_enter_xl ? (params.can_enter_xl = 1) : params.can_enter_xl;
		if (params.isRutero === true) { params.isRutero = 1; } else {  params.isRutero = 0;}
		//params.isRutero ? (params.isRutero = 1) : (params.isRutero = 0);
	
		if(!params.avatar) {
			// delete the param if value is falsy, undefined, null, etc..
			delete params.avatar;
		}

		return params;
	},
	dataGridProps: { stickyHeader: true, 	empty: <NoResults /> },
	listProps : { perPage: DASHAdminSystemConstants.system.DEFAULT_PER_PAGE || 50, empty: false},
	dataGridWrapper: (props) => {
		const { children } = props;
		return <div className='sticky-header-wrapper'>{children}</div>;
	},
	redirectAfterUpdate: false,
	createLayout: userLayout,
	editLayout: userLayout,
	formGroupMode: 'layout',
	exporter: (clients) => {
		const clientsForExport = clients.map((client) => {
			return client;
		});
		jsonExport(
			clientsForExport,
			{
				//headers: ['id', 'title', 'author_name', 'body'] // order fields in the export
			},
			(err, csv) => {
				downloadCSV(csv, 'clientes');
			},
		);
	},
	BulkActions: false,
	create: true,
	edit: true,
	view: false,
	listViewButton: { enabled: false },
	toolbarCreateButton:  { enabled: true },
	toolbarEditButton:  { enabled: false },
	toolbarExportButton:  { enabled: false },
	toolbarListButton:  { enabled: true },
	listDeleteButton: { enabled: true, props: { confirm: true }},
	Pagination: PaginationComponent,
	drawer: false,

	mutationMode: 'pessimistic',
	referenceFilters: usersFilters,
	
};

export default userResource;
