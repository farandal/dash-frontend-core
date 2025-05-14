
import { ArrayInput, ReferenceArrayField, SelectInput } from 'react-admin';
import { SelectArrayInput } from 'react-admin';
import ResourceTemplate from './templates/ResourceTemplate';
import IAppResourceConfig from './interfaces/IAppResourceConfig';
import permissionSchema from './schemas/permissions';
import roleSchema from './schemas/roles';
import { TenantImpersonateResource } from './resources/Tenant/ImpersonateTenantResource';
import tenantSystemAdminSchema from './schemas/tenant_superadmin';
import { RutValidator } from './utils/validators';
import DASHAppConstants from 'dash-constants';
import Avatar from './components/avatar/Avatar';

// Replace the current imports with these optimized direct imports
import Https from '@mui/icons-material/Https';
import SystemUpdateAlt from '@mui/icons-material/SystemUpdateAlt';
import Person from '@mui/icons-material/Person';
import { lazy } from 'react';

const TableContainer = lazy(() => import('@mui/material/TableContainer'));

// Icons from commented code (include these if you plan to uncomment that code)

/**
 * Configures the system resources for the DASH Admin application.
 * This includes resources such as permissions, roles, users, and tenant impersonation.
 * The configuration is defined as an array of `IAppResourceConfig` objects, which specify
 * the details of each resource, including its component, model, label, schema, icon, and menu.
 * The configuration also includes settings for the data grid, such as sticky headers and maximum height.
 */

const drawerSettings = {
    drawer: true,
    drawerOptions: {
        view: true,
        edit: false,
        create: false,
    },
    listViewButton: { props: { buttonProps: { variant: 'text', size: 'small' }, label: '' } },
    listEditButton: { props: { buttonProps: { variant: 'text', size: 'small' }, label: '' } },
    listDeleteButton: { confirm: true, props: { buttonProps: { variant: 'text', size: 'small' }, label: '' } },
};

const systemResources: IAppResourceConfig[] = [
    {
        roles: [DASHAppConstants.system.SYSTEM_ROLE],
        component: ResourceTemplate,
        model: 'system/permissions',
        label: 'Permisos',
        schema: permissionSchema,
        icon: <Https />,
        group: 'Recursos de sistema',

        menu: [
            {
                title: 'Permisos',
                redirect: '/system/permissions',
            },
        ],
        /*mainAction: {
            title: 'Crear permiso',
            // type: "ghost",
            redirect: '/system/permissions/create',
        },*/
        search: true,
        mutationMode: 'pessimistic',
        dataGridProps: { stickyHeader: true },
        dataGridWrapper: (props: any) => (
            <TableContainer sx={{ maxHeight: 800 }}>{props.children}</TableContainer>
        ),
        postFormatter: (params, _) => {
            return params;
        },
        ...drawerSettings,
        edit: false,
        listEditButton: { enabled: false },
        delete: false,
        listDeleteButton: { enabled: false },
    },
    {
        roles: [DASHAppConstants.system.SYSTEM_ROLE],
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
        listEditButton: { enabled: true },
        listViewButton: { enabled: false },
        toolbarCreateButton: { enabled: false },
        toolbarDeleteButton: { enabled: false },
        toolbarListButton: { enabled: false },
        toolbarSaveButton: { enabled: true },
        toolbarExportButton: { enabled: false },
        toolbarEditButton: { enabled: false },


        formGroupMode: 'groups',

        dataGridWrapper: (props: any) => (
            <TableContainer sx={{ maxHeight: 800 }}>{props.children}</TableContainer>
        ),
        /* references: [
             { reference: 'permission', tab: 'Permisos', target: 'role_id', schema: permissionSchema, type: "ReferenceManyField" },
         ],*/
        postFormatter: (params, _) => {
            /*if(method === "update") {
                params._method = "PUT";
            }*/
            delete params.permissions
            return params
        },
        ...drawerSettings,
    },
    {
        roles: [DASHAppConstants.system.SYSTEM_ROLE],
        component: ResourceTemplate,
        trash: true,
        model: 'system/user',
        group: 'Recursos de sistema',
        label: 'Usuarios',
        referenceFilters: [
            // TODO: Cuando se cambia el cliente se debn mostrar sólo los CP de este filtro
            {
                id: 'search',
                label: 'Buscar',
                source: 'q',
                reference: null,
                optionText: '', // field from the model
                alwaysOn: true,
            },
        ],
        schema: [
            {
                tab: 'Datos Usuario',
                attribute: 'avatar',
                listAttribute: 'image_path',
                label: 'Imágen Usuario',
                type: String,
                sortable: true,
                inEdit: true,
                inCreate: true,
                inShow: true,
                inList: false,
                custom: true,
                component: Avatar,
                processor: 'File',
            },
            {
                label: 'Nombre',
                attribute: 'name',
                type: String,
                tab: 'Datos Usuario',
                //validate: (name: string) => (name && name.length >= 3 ? undefined : <div>Name is too short</div>)
            },
            {
                label: "Apellido",
                attribute: "lastname",
                type: String,
                tab: "Datos Usuario",
                //validate: (name: string) => (name && name.length >= 3 ? undefined : <div>Name is too short</div>)
            },
            {
                tab: 'Datos Usuario',
                attribute: 'public_id',
                label: 'Rut',
                type: String,
                fieldProps: { required: true/*, validate: [required()],*/, showDiv: true },
                slotProps: { input: { fullWidth: true, autoComplete: "off" } },
                sortable: true,
                inEdit: true,
                inCreate: true,
                inShow: true,
                inList: false,
                validate: (value) => {

                    if (!value) throw Error('El campo es requerido');

                    if (!RutValidator(value)) {
                        throw Error('El Rut es inválido');
                    }
                }
            },
            {
                label: 'Email',
                attribute: 'email',
                type: String,
                tab: 'Datos Usuario',
                slotProps: { input: { fullWidth: true, "data-testid": "email-input" } },
                //validate: (email: string) => (email && email.indexOf('@') > 0 ? undefined : 'Invalid email')
            },
            {
                label: 'Contraseña',
                attribute: 'password',
                type: String,
                isPassword: true,
                slotProps: { input: { fullWidth: true, autoComplete: "new-password" } },
                inList: false,
                tab: 'Contraseña',
                validate: (password: string) => {
                    if (password && password.length < 6 && password.length > 1) {
                        throw Error('Min 6 caracteres');
                    }
                },
            },
            {
                label: 'Confirmar Contraseña',
                attribute: 'password_confirmation',
                type: String,
                isPassword: true,
                slotProps: { input: { fullWidth: true, autoComplete: "new-password" } },
                inList: false,
                tab: 'Contraseña',
                validate: (password: string, values: any) => {

                    if (values.password !== "" && (values.password !== password)) {
                        throw Error('Contraseñas no coinciden.');
                    }
                },
            },
            {
                // @TODO Solo mostrar cuando se está creando:
                label: 'Genear Contraseña Aleatorea Automáticamente',
                attribute: 'generate_password',
                type: Boolean,
                inList: false,
                tab: 'Contraseña',
            },
            {
                tab: 'Datos Usuario',
                label: 'Roles',
                attribute: 'roles',
                listAttribute: 'role_ids',
                type: 'system/role.name',
                //type: Object,
                // TODO Agregar un filtro, solo para traer los roles de cliente.
                //pagination: false,
                multiple: true,
                inList: false,
                inShow: false,
                //custom: true,
                //componentProps:{ options: {fullwidth: true} },
                //component: SelectArrayInput,
                //searchField: "subdomain"
            },
            {
                tab: 'Datos Usuario',
                label: 'Roles',
                attribute: 'roles',
                listAttribute: 'role_ids',
                type: 'system/role.name',
                //type: Object,
                // TODO Agregar un filtro, solo para traer los roles de cliente.
                //pagination: false,
                multiple: true,
                inEdit: false,
                inCreate: false,

                //custom: true,
                //componentProps:{ options: {fullwidth: true} },
                //component: ReferenceArrayField,
                //searchField: "subdomain"
            },
            {
                tab: 'Datos Usuario',
                label: 'Cliente',
                attribute: 'tenant_id',
                //listAttribute: 'name',
                type: 'system/tenant.name',
                //type: Object,
                // TODO Agregar un filtro, solo para traer los roles de cliente.
                pagination: false,
                multiple: false,
                //custom: true,
                //componentProps: {multiple:false},
                //componentProps: { options: {fullwidth: true} },
                component: SelectInput,
                //searchField: "subdomain"
                processor: 'Null',
            },
            {
                attribute: 'active',
                type: Boolean,
                inList: true,
                label: 'Activo',
                tab: 'Datos Usuario',
                processor: 'Boolean',
            },
            /*{
              attribute: 'avatar',
              listAttribute: 'system/userclients.avatar',
              type: ImageInput, // TODO: el componente no muestra la imágen
              inList: false,
              label: 'Imágen',
              tab: 'Datos Usuario',
              processor: 'RawFile',
              //validate: (password: string) => (password && password.length >= 6 ? undefined : <div>Password is too short</div>)
          },*/
        ],
        //references: [{ reference: 'roles', target: 'role', schema: rolesSchema }]
        //references: [{ reference: 'roles', target: 'id', schema: roleSchema }],
        icon: <Person />,
        redirectAfterUpdate: false,
        showDialogAfterSubmit: true,
        showNotifyAfterSubmit: true,
        menu: [
            {
                title: 'Usuarios',
                redirect: '/system/user',
            },
        ],
        //{
        //    title: "Papelera",
        //    redirect: "/trash/admin/user",
        //}],
        mainAction: {
            title: 'Crear usuario',
            // type: "ghost",
            redirect: '/system/user/create',
        },
        mutationMode: 'pessimistic',
        isFormData: true,
        dataGridProps: { stickyHeader: true },
        dataGridWrapper: (props: any) => (
            <TableContainer sx={{ maxHeight: 800 }}>{props.children}</TableContainer>
        ),
        formPostFormatter: (params, form) => {
            return form;
        },
        postFormatter: (params, method) => {
            /* if (!params.meta) {
        params.meta = {
          method: "PUT",
        };
      } else {
        params.meta.method = "PUT";
      }*/
            if (method === 'update') {
                params._method = 'PUT';
            }
            params.role_id = params.role_ids ? params.role_ids[0] : null;

            return params;
        },
        ...drawerSettings,
    },
    {
        roles: [DASHAppConstants.system.SYSTEM_ROLE],
        component: ResourceTemplate,
        customRoutes: (resourceConfig) => TenantImpersonateResource(resourceConfig),
        model: 'system/tenant',
        label: 'Clientes',
        schema: tenantSystemAdminSchema,
        //references: [{ reference: 'roles', target: 'role', schema: rolesSchema }]
        //references: [{ reference: 'roles', target: 'gitid', schema: roleSchema }],
        icon: <Person />,
        group: 'Recursos de sistema',
        menu: [{
            title: 'Clientes',
            redirect: '/system/tenant',
        },
        {
            title: 'Impersonar',
            redirect: '/system/tenant/impersonate',
        },

        ],
        create: true,

        mainAction: {
            title: 'Crear cliente',
            redirect: '/system/tenant/create',
            //mode: 'create',
            //fn: 'redirect'
        },

        search: false,
        exporter: false,
        postFormatter: (params) => {
            if (params.systemMarketplaces) {
                params.system_marketplace_ids = params.systemMarketplaces.map((item) => item.id);
            }
            return params;
        },
        redirectAfterUpdate: false,

        mutationMode: 'pessimistic',
        dataGridProps: { stickyHeader: true },
        dataGridWrapper: (props: any) => <TableContainer sx={{ maxHeight: 800 }} >{props.children}</TableContainer>,
        //listEditButton: { enabled: true },

        ...drawerSettings,
        redirectAfterCreate: true,

        //toolbarCreateButton: { enabled: true },
        //listEditButton: { enabled: true, component: QuickEditButton, props: { icon: <Bolt />, label: "", resource: "tenant/inline", navigation:"virtualhash", navigate: (id) => id, size: "small", color: "secondary" }},


    },
];


/*
if (JSON.parse(constants.system.ENABLE_TENANT_IMPERSONATION)) {
    systemResources.unshift({
        roles: [DASHAppConstants.system.SYSTEM_ROLE],
        component: ImpersonateTenantResource,
        model: 'system/settings',
        group: 'Administración',
        label: 'Impersonar cliente',
        schema: [],
        icon: <AdminPanelSettings />,
        menu: [],
        mainAction: null,
    });
}

if (JSON.parse(constants.system.ENABLE_TENANT_IMPERSONATION)) {
    systemResources.unshift({
        roles: [DASHAppConstants.system.SYSTEM_ROLE],
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
            {
                title: "Papelera",
                redirect: "/trash/system/tenant",
            }
        ],
        mainAction: {
            title: 'Crear cliente',
            // type: "ghost",
            redirect: '/system/tenant/create',
        },
        postFormatter: (params) => {
            return params;
        },
        mutationMode: 'pessimistic',
        dataGridProps: { stickyHeader: true },
        dataGridWrapper: (props: any) => (
            <TableContainer sx={{ maxHeight: 800 }}>{props.children}</TableContainer>
        ),
    });
}

if (JSON.parse(constants.system.ENABLE_TENANT_IMPERSONATION)) {
    systemResources.unshift({
        roles: [DASHAppConstants.system.SYSTEM_ROLE],
        component: ImpersonateTenantResource,
        model: 'system/settings',
        group: 'Administración',
        label: 'Impersonar cliente',
        schema: [],
        icon: <AdminPanelSettings />,
        menu: [],
        mainAction: null,
    });
}
if (JSON.parse(constants.system.ENABLE_TENANT_IMPERSONATION)) {
    systemResources.unshift({
        roles: [DASHAppConstants.system.SYSTEM_ROLE],
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
            {
                    title: "Papelera",
                    redirect: "/trash/system/tenant",
                }
        ],
        mainAction: {
            title: 'Crear cliente',
            // type: "ghost",
            redirect: '/system/tenant/create',
        },

        postFormatter: (params, _) => {
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
}

if (JSON.parse(constants.system.ENABLE_LOGS_AND_NOTIFICATIONS)) {
    systemResources.unshift({
        roles: [DASHAppConstants.system.SYSTEM_ROLE],
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
}
if (JSON.parse(constants.system.ENABLE_LOGS_AND_NOTIFICATIONS)) {
    systemResources.unshift({
        roles: [
            constants.system
                .DASH_SYSTEM_ROLE,
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
        referenceFilters: [
            {
                label: 'Tipo', // filter label'
                source: 'loggeable_type', // id field
                reference: 'log',
                optionText: 'loggeable_type' // field from the model
            },
        ],
    });
    
}

*/
export default systemResources;
