import { IAppResourceConfig } from './interfaces/IAppResourceConfig';
import Settings from '@mui/icons-material/Settings';
import Notifications from '@mui/icons-material/Notifications';
import LocationCity from '@mui/icons-material/LocationCity';
import Person from '@mui/icons-material/Person';
import Https from '@mui/icons-material/Https';
import SystemUpdateAlt from '@mui/icons-material/SystemUpdateAlt';
import NotificationImportant from '@mui/icons-material/NotificationImportant';
import LockClock from '@mui/icons-material/LockClock';
import LogResource from './resources/Log/LogResource';

import logSchema from './schemas/log';
import permissionSchema from './schemas/permissions';
import roleSchema from './schemas/roles';
import notificationSchema from './schemas/notification';
import tenantSystemAdminSchema from './schemas/tenant_superadmin';
import { TableContainer } from '@mui/material';
import constants from './config/DASHAdminSystemConstants';
import ResourceTemplate from './templates/ResourceTemplate';

export const GroupIcons = {
  Administración: <Settings />,
  'Logs y Notificaciones': <Notifications />,
  'Recursos de sistema': <LocationCity />,
  Usuarios: <Person />,
  Cliente: <Person />,
};
const resources: IAppResourceConfig[] = [
  {
    roles: [constants.system.DASH_SYSTEM_ROLE],
    component: ResourceTemplate,
    model: 'system/permission',
    label: 'Permisos',
    schema: permissionSchema,
    icon: <Https />,
    group: 'Recursos de sistema',

    menu: [
      {
        title: 'Permisos',
        redirect: '/system/permission',
      },
    ],
    mainAction: {
      title: 'Crear permiso',
      // type: "ghost",
      redirect: '/system/permissions/create',
    },
    search: true,
    mutationMode: 'pessimistic',
    dataGridProps: { stickyHeader: true },
    dataGridWrapper: (props: any) => (
      <TableContainer sx={{ maxHeight: 800 }}>{props.children}</TableContainer>
    ),
  },

  {
    roles: [constants.system.DASH_SYSTEM_ROLE],
    component: ResourceTemplate,
    model: 'system/role',
    label: 'roles',
    icon: <SystemUpdateAlt />,
    group: 'Recursos de sistema',
    menu: [
      {
        title: 'Roles',
        redirect: '/system/role',
      },
    ],
    mainAction: {
      title: 'Agregar Rol',
      // type: "ghost",
      redirect: '/system/role/create',
    },
    schema: roleSchema,
    mutationMode: 'pessimistic',
    redirectAfterUpdate: false,
    dataGridProps: { stickyHeader: true },
    dataGridWrapper: (props: any) => (
      <TableContainer sx={{ maxHeight: 800 }}>{props.children}</TableContainer>
    ),
    /* references: [
             { reference: 'permission', tab: 'Permisos', target: 'role_id', schema: permissionSchema, type: "ReferenceManyField" },
         ],*/
  },

  /*
     {
         roles: [constants.system.DASH_SYSTEM_ROLE],
         component: ResourceTemplate,
         customRoutes: (resourceConfig) => TrashTemplate(resourceConfig) ,
         model: 'admin/user',
         label: 'Usuarios',
         schema: userClientSchema,
         //references: [{ reference: 'roles', target: 'role', schema: rolesSchema }]
         //references: [{ reference: 'roles', target: 'id', schema: roleSchema }],
         icon: <Icons.Person />,
         group: 'Usuarios',
         redirectAfterUpdate: false,
         menu: [{
             title: "Usuarios",
             redirect: "/user",
         },
         //{
         //    title: "Papelera",
         //    redirect: "/trash/admin/user",
         //}],
         mainAction: {
             title: "Crear usuario",
             // type: "ghost",
             redirect: "/admin/user/create"
         },
         mutationMode: "pessimistic",
         isFormData: true,
         dataGridProps: { stickyHeader: true },
         dataGridWrapper: (props:any) => <TableContainer sx={{maxHeight:800}} >{props.children}</TableContainer>
     },*/

  /*{
        roles: [constants.system.DASH_SYSTEM_ROLE,constants.system.TENANT_ROLE],
        component: ResourceTemplate,
        model: 'system/tenant',
        label: 'Datos del cliente',
        schema: tenantSchema,
        //references: [{ reference: 'roles', target: 'role', schema: rolesSchema }]
        //references: [{ reference: 'roles', target: 'gitid', schema: roleSchema }],
        icon: <Icons.Person />,
        group: 'Cliente',
        menu: [{
            title: "Datos del cliente",
            redirect: "/system/tenant",
        },
        ],
        create: false,
        //listEditButton: { enabled: true, component: QuickEditButton, props: { icon: <Icons.Bolt />, label: "", resource: "tenant/inline", navigation:"virtualhash", navigate: (id) => id, size: "small", color: "secondary" }},
        listEditButton: { enabled: true},
        
        drawer: false,
        search: false,
        exporter: false,
        postFormatter: (params) => {
            if (params.systemMarketplaces) {
                params.system_marketplace_ids = params.systemMarketplaces.map((item) => item.id);
            }
            return params;
        },
        redirectAfterUpdate: false,
        showDialogAfterSubmit: false,
        mutationMode: "pessimistic",
        dataGridProps: { stickyHeader: true },
        dataGridWrapper: (props:any) => <TableContainer sx={{maxHeight:800}} >{props.children}</TableContainer>
        //listEditButton: { enabled: true },

    },*/
];


JSON.parse(constants.system.ENABLE_TENANT_IMPERSONATION) &&
  resources.unshift({
    roles: [constants.system.DASH_SYSTEM_ROLE],
    component: ResourceTemplate,
    trash: true,
    model: 'system/tenant',
    label: 'Cliente',
    schema: tenantSystemAdminSchema,
    drawer: false,
    edit: true,
    //references: [{ reference: 'roles', target: 'role', schema: rolesSchema }]
    //references: [{ reference: 'roles', target: 'gitid', schema: roleSchema }],
    icon: <Person />,
    group: 'Cliente',
    menu: [
      {
        title: 'Cliente',
        redirect: '/system/tenant',
      },
      /*{
                title: "Papelera",
                redirect: "/trash/system/tenant",
            }*/
    ],
    mainAction: {
      title: 'Crear cliente',
      // type: "ghost",
      redirect: '/system/tenant/create',
    },

    postFormatter: (params) => {
      if (params.systemMarketplaces)
        params.system_marketplace_ids = params.systemMarketplaces.map(
          (item) => item.id,
        );
      if (params.systemPointOfSales)
        params.system_point_of_sale_ids = params.systemPointOfSales.map(
          (item) => item.id,
        );
      return params;
    },
    mutationMode: 'pessimistic',
    dataGridProps: { stickyHeader: true },
    dataGridWrapper: (props: any) => (
      <TableContainer sx={{ maxHeight: 800 }}>{props.children}</TableContainer>
    ),
  });

JSON.parse(constants.system.ENABLE_LOGS_AND_NOTIFICATIONS) &&
  resources.unshift({
    roles: [constants.system.DASH_SYSTEM_ROLE],
    component: ResourceTemplate,
    model: 'system/notification',
    label: 'Notifications',
    schema: notificationSchema,
    //references: [{ reference: 'roles', target: 'role', schema: rolesSchema }]
    //references: [{ reference: 'roles', target: 'id', schema: roleSchema }],
    icon: <NotificationImportant />,
    group: 'Logs y Notificaciones',
    menu: [
      {
        title: 'Notificaciones',
        redirect: '/system/notification',
      },
    ],
    create: false,
    edit: false,
    //listDeleteButton: { enabled: true }
    listViewButton: { enabled: true },
    listEditButton: { enabled: false },
    listDeleteButton: { enabled: false },

    formGroupMode: 'groups', // groups or tabs
    mutationMode: 'pessimistic',
    search: true,
    dataGridProps: { stickyHeader: true },
    dataGridWrapper: (props: any) => (
      <TableContainer sx={{ maxHeight: 800 }}>{props.children}</TableContainer>
    ),
  });

JSON.parse(constants.system.ENABLE_LOGS_AND_NOTIFICATIONS) &&
  resources.unshift({
    roles: [
      constants.system
        .DASH_ADMIN_ROLE /*constants.system.TENANT_ROLE, constants.system.HAS_ADMINISTRATOR_ID_ROLE*/,
    ],
    component: LogResource,
    model: 'system/log',
    label: 'Logs',
    schema: logSchema,
    icon: <LockClock />,
    group: 'Logs y Notificaciones',
    menu: [
      {
        title: 'Logs',
        redirect: '/system/log',
      },
    ],
    create: false,
    edit: false,
    search: true,
    /*referenceFilters: [
            {
                label: 'Tipo', // filter label'
                source: 'loggeable_type', // id field
                reference: 'log',
                optionText: 'loggeable_type' // field from the model
            },
        ],*/
  });

export const getResourceConfig = (model: string) =>
  resources.find((resource) => resource.model === model.split('/')[0]);

export default resources;
