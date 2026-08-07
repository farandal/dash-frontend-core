import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import ResourceTemplate from '../../templates/ResourceTemplate';
import Settings from '@mui/icons-material/Settings';


import { PaginationComponent } from 'dash-components';

import { Card } from '@mui/material';
import { downloadCSV } from 'react-admin';
import {DASHAppConstants} from 'dash-constants';
import jsonExport from 'jsonexport/dist';
import {DASHAdminSystemConstants} from 'dash-constants';
import userLayout from './userLayout';
import userSchema from './userSchema';
import { NoResults } from '../../components/misc/NoResults';
import usersFilters from './usersFilters';

/**
 * Shared tenant-user CRUD resource (list/create/edit/trash for `tenant/user`).
 *
 * Moved here from kt-ecommerce (resources/user/userResource.tsx) - nothing in
 * this config is kitchntabs- or vanexa-specific (model, schema, layout and
 * filters were all already generic; the only reason it lived in kt-ecommerce
 * was history), so every app - kitchntabs-* and vanexa-* alike - should
 * consume this single copy instead of each domain package carrying its own.
 */
const userResource: IDashAutoAdminResourceConfig = {
  filterWithSubmit: true,
  roles: [
    DASHAdminSystemConstants.system.DASH_SYSTEM_ROLE,
    DASHAppConstants.system.TENANT_ROLE,
  ],
  component: ResourceTemplate,
  trash: true,
  model: 'tenant/user',

  schema: userSchema,
  icon: <Settings />,

   group: "resource.groups.configuration",
   label: "resource.ecommerce.users.label",

  menu: [
            {
                title: 'Usuarios',
                redirect: '/tenant/user',
            },
            {
                title: "🗑",
                redirect: "/tenant/user/trash",
            }
        ],
  resourceMenuDisabled: false,
  refreshAfter:true,
  /*customListActions: (props) => {
    const { children } = props;
    return <Card sx={{ mb: 2 }} className='dash-card-content dash-module top-toolbar'>{children}</Card>;
  },*/
  isFormData: true,
  /** @deprecated TODO: side effects? seems is not implemented anywhere */
  listEditButton: { enabled: true },

  postFormatter: (params, _method) => {
    if (!params.avatar) {
      // delete the param if value is falsy, undefined, null, etc..
      delete params.avatar;
    }
    return params;
  },
  dataGridProps: { stickyHeader: true, empty: <NoResults />,  bulkActionButtons: false },
  listProps: { perPage: DASHAdminSystemConstants.system.DEFAULT_PER_PAGE || 50, empty: false },
  dataGridWrapper: (props) => {
    const { children } = props;
    return <div className='sticky-header-wrapper'>{children}</div>;
  },
  redirectAfterUpdate: false,
  createLayout: userLayout,
  editLayout: userLayout,
  formGroupMode: 'layout',
  /*exporter: (clients) => {
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
  },*/
  create: true,
  edit: true,
  view: false,
  listViewButton: { enabled: false },
  toolbarCreateButton: { enabled: true },
  toolbarEditButton: { enabled: false },
  toolbarExportButton: { enabled: false },
  toolbarListButton: { enabled: true },
  listDeleteButton: { enabled: true, props: { confirm: true } },
  Pagination: PaginationComponent,
  drawer: false,

  mutationMode: 'pessimistic',
  referenceFilters: usersFilters,

};

export default userResource;
