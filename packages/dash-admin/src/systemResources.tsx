
import { SelectInput, FunctionField } from 'react-admin';
import ResourceTemplate from './templates/ResourceTemplate';
import IAppResourceConfig from './interfaces/IAppResourceConfig';
import { TenantImpersonateResource } from './resources/Tenant/ImpersonateTenantResource';
import tenantSystemAdminSchema from './schemas/tenant_superadmin';
import subscriptionPlanSchema from './schemas/subscriptionPlan';
import { RutValidator } from './utils/validators';
import { DASHAppConstants } from 'dash-constants';
import Avatar from './components/avatar/Avatar';
import SystemUpdateAlt from '@mui/icons-material/SystemUpdateAlt';
import Person from '@mui/icons-material/Person';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import { lazy } from 'react';
import BusinessIcon from "@mui/icons-material/Business";
import Chip from "@mui/material/Chip";

import SystemRequestsCache from './contexts/SystemRequestsCache';
import { SubscriptionPlanFormatsProvider } from './contexts/SubscriptionPlanFormatsProvider';
import roleSchemaDataGrid from './schemas/rolesDataGrid';
import FormatCurrency from './components/currency/Format';

const TableContainer = lazy(() => import('@mui/material/TableContainer'));


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
        trash: true,
        component: ResourceTemplate,
        model: "system/tenancy",
        //group: "resource.groups.system_resources",
        group: "Accounts",
        //path: "/tenancy/account",
        schema: [
            {
                tab: 'Account',
                label: 'Public Name',
                attribute: 'public_name',
                type: String,
                inList: true,
                inEdit: true,
                inShow: true,
                inCreate: false,
            },
            {
                tab: 'Account',
                label: 'Legal Name',
                attribute: 'legal_name',
                type: String,
                inList: false,
                inEdit: true,
                inShow: true,
                inCreate: false,
            },
            {
                tab: 'Account',
                label: 'Public ID',
                attribute: 'public_id',
                type: String,
                inList: true,
                inEdit: true,
                inShow: true,
                inCreate: false,
            },
            {
                tab: 'Account',
                label: 'Account Status',
                attribute: 'account_status_label',
                type: String,
                custom: true,
                inList: true,
                inEdit: false,
                inShow: true,
                inCreate: false,
                component: () => (
                    <FunctionField
                        label="Account Status"
                        render={(record: any) => {
                            const status = record?.account_status_label || record?.account_status || '-';
                            const colorMap: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
                                'Active': 'success',
                                'Suspended': 'warning',
                                'Canceled': 'error',
                                'Expired': 'default',
                                'Pending Deletion': 'error',
                            };
                            return <Chip label={status} color={colorMap[status] || 'default'} size="small" />;
                        }}
                    />
                ),
            },
            {
                tab: 'Account',
                label: 'Email',
                attribute: 'email',
                type: String,
                inList: true,
                inEdit: true,
                inShow: true,
                inCreate: false,
            },
            {
                tab: 'Account',
                label: 'URL',
                attribute: 'url',
                type: String,
                inList: false,
                inEdit: true,
                inShow: true,
                inCreate: false,
            },
            {
                tab: 'Account',
                label: 'Slug',
                attribute: 'slug',
                type: String,
                inList: true,
                inEdit: false,
                inShow: true,
                inCreate: false,
            },
            {
                tab: 'Account',
                label: 'Currency',
                attribute: 'settings.currency',
                type: String,
                inList: false,
                inEdit: true,
                inShow: true,
                inCreate: true,
                fieldProps: {
                    helperText: "Default currency code (e.g., USD, EUR)"
                }
            },
            {
                tab: 'Account',
                label: 'Timezone',
                attribute: 'settings.timezone',
                type: String,
                inList: false,
                inShow: true,
                inEdit: false,
                inCreate: false,
            },
            {
                tab: 'Account',
                label: 'Timezone',
                attribute: 'settings.timezone',
                type: String,
                custom: true,
                inList: false,
                inShow: false,
                inEdit: true,
                inCreate: true,
                component: SelectInput,
                componentProps: {
                    source: 'settings.timezone',
                    choices: [
                        { id: 'America/Santiago', name: 'America/Santiago' },
                        { id: 'UTC', name: 'UTC' },
                        { id: 'America/New_York', name: 'America/New_York' },
                        { id: 'Europe/London', name: 'Europe/London' },
                    ],
                    defaultValue: 'UTC'
                }
            },
            {
                tab: 'Subscription',
                label: 'Subscription Status',
                attribute: 'subscription_status',
                type: String,
                custom: true,
                inList: true,
                inEdit: false,
                inShow: true,
                inCreate: false,
                component: () => (
                    <FunctionField
                        label="Subscription Status"
                        render={(record: any) => {
                            const status = record?.subscription_status || 'none';
                            const colorMap: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
                                'active': 'success',
                                'canceled': 'error',
                                'past_due': 'warning',
                                'trialing': 'info',
                                'none': 'default',
                            };
                            return <Chip label={status} color={colorMap[status] || 'default'} size="small" />;
                        }}
                    />
                ),
            },
            {
                tab: 'Subscription',
                label: 'Plan',
                attribute: 'subscription_plan_name',
                type: String,
                inList: false,
                inEdit: false,
                inShow: true,
                inCreate: false,
            },
            {
                tab: 'Subscription',
                label: 'Subscription State',
                attribute: 'subscription_state',
                type: String,
                inList: false,
                inEdit: false,
                inShow: true,
                inCreate: false,
            },
            {
                tab: 'Subscription',
                label: 'Gateway',
                attribute: 'gateway_type',
                type: String,
                inList: false,
                inEdit: false,
                inShow: true,
                inCreate: false,
            },
            {
                tab: 'Subscription',
                label: 'Canceled At',
                attribute: 'canceled_at',
                type: Date,
                inList: false,
                inEdit: false,
                inShow: true,
                inCreate: false,
            },
            {
                tab: 'Subscription',
                label: 'Expires At',
                attribute: 'expires_at',
                type: Date,
                inList: false,
                inEdit: false,
                inShow: true,
                inCreate: false,
            },
            {
                tab: 'Usage',
                label: 'Tenants',
                attribute: 'tenants_count',
                type: Number,
                inList: true,
                inEdit: false,
                inShow: true,
                inCreate: false,
            },
            {
                tab: 'Usage',
                label: 'Users',
                attribute: 'users_count',
                type: Number,
                inList: true,
                inEdit: false,
                inShow: true,
                inCreate: false,
            },
            {
                tab: 'Trial',
                label: 'Trial Ends At',
                attribute: 'trial_ends_at',
                type: Date,
                inList: false,
                inEdit: false,
                inShow: true,
                inCreate: false,
            },
            {
                tab: 'Trial',
                label: 'Is On Trial',
                attribute: 'is_on_trial',
                type: Boolean,
                inList: true,
                inEdit: false,
                inShow: true,
                inCreate: false,
            },
            {
                tab: 'Trial',
                label: 'Trial Days Remaining',
                attribute: 'trial_days_remaining',
                type: Number,
                inList: false,
                inEdit: false,
                inShow: true,
                inCreate: false,
            },
        ],
        label: "Accounts",
        icon: <BusinessIcon />,

        create: false,

        menu: [
            {
                title: 'Accounts',
                redirect: '/system/tenancy',
            },
            {
                title: '🗑',
                redirect: '/system/tenancy/trash',
            },
        ],

        referenceFilters: [
            {
                id: "PublicName",
                label: "Name",
                source: "public_name",
                reference: null,
                optionText: null,
                alwaysOn: true,
            },
            {
                id: "AccountStatus",
                label: "Account Status",
                source: "account_status",
                reference: [
                    { id: 'active', name: 'Active' },
                    { id: 'canceled', name: 'Canceled' },
                    { id: 'expired', name: 'Expired' },
                    { id: 'suspended', name: 'Suspended' },
                    { id: 'soft_deleted', name: 'Pending Deletion' },
                ],
                optionText: "name",
                alwaysOn: true,
            },
        ],

        mutationMode: "pessimistic",
        redirectAfterUpdate: false,

        ...drawerSettings,
    },

    {
        roles: [DASHAppConstants.system.SYSTEM_ROLE],
        component: ResourceTemplate,
        customRoutes: (resourceConfig) => TenantImpersonateResource(resourceConfig),
        contextComponent: ({ resourceConfig, mode, children }) => {
            console.log("TenantFormatsProvider", resourceConfig, mode);
            return mode === "list" ? children : (
                <SystemRequestsCache
                    cacheKey="tenant_formats_cache"
                    apiUrl="system/tenant/systemSettingFormats"
                    cacheSeconds={300}
                >
                    {children}
                </SystemRequestsCache>
            )
        },
        model: 'system/tenant',
        label: 'Laboratories',
        trash: true,
        schema: tenantSystemAdminSchema,
        //references: [{ reference: 'roles', target: 'role', schema: rolesSchema }]
        //references: [{ reference: 'roles', target: 'gitid', schema: roleSchema }],
        icon: <Person />,
        //group: 'resource.groups.system_resources',
        group: "Accounts",
        menu: [{
            title: 'resource.system.tenants.menu_list',
            redirect: '/system/tenant',
        },

        {
            title: "🗑",
            redirect: "/system/tenant/trash",
        },
        {
            title: 'Impersonar',
            redirect: '/system/tenant/impersonate',
        },

        ],
        //create: true,
        refreshAfter: true,
        toolbarCreateButton: { enabled: true },

        referenceFilters: [
            {
                id: "Nombre",
                label: "resource.system.tenants.filter_name",
                source: "name", // id field
                reference: null,
                optionText: null,
                alwaysOn: true,
            },
        ],

        mainAction: {
            title: 'resource.system.tenants.main_action',
            fn: "redirect",
            // type: "ghost",
            mode: "create",
            redirect: "create",
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
        editProps: {
            queryOptions: { meta: { forceFetch: true } },
            undoable: false,
            emptyWhileLoading: true
        },
        dataGridProps: { stickyHeader: true, rowClick: false },
        dataGridWrapper: (props: any) => <TableContainer sx={{ maxHeight: 800 }} >{props.children}</TableContainer>,
        //listEditButton: { enabled: true },

        ...drawerSettings,
        redirectAfterCreate: true,

        //toolbarCreateButton: { enabled: true },
        //listEditButton: { enabled: true, component: QuickEditButton, props: { icon: <Bolt />, label: "", resource: "tenant/inline", navigation:"virtualhash", navigate: (id) => id, size: "small", color: "secondary" }},


    },





    {
        roles: [DASHAppConstants.system.SYSTEM_ROLE],
        component: ResourceTemplate,
        model: 'system/role-permissions-bulk',
        label: 'resource.system.roles.label',
        icon: <SystemUpdateAlt />,
        //group: 'resource.groups.system_resources',
        group: "System",
        menu: [
            {
                title: 'resource.system.roles.menu_list',
                redirect: '/system/role-permissions-bulk',
            },
        ],

        contextComponent: ({ resourceConfig, mode, children }) => {
            console.log("TenantSettingsFormatsProvider", resourceConfig, mode);

            return mode === "list" ? children : <SystemRequestsCache
                cacheKey="system_available_permissions_cache"
                apiUrl="system/permission/availablePermissions"
                cacheSeconds={300}
            >{children}</SystemRequestsCache>
        },

        referenceFilters: [
            {
                id: "Nombre",
                label: "resource.system.roles.filter_name",
                source: "name", // id field
                reference: null,
                optionText: null,
                alwaysOn: true,
            },
        ],
        toolbarCreateButton: { enabled: true },

        mainAction: {
            title: 'resource.system.roles.main_action',
            fn: "redirect",
            // type: "ghost",
            mode: "create",
            redirect: "create",
        },

        view: false,
        schema: roleSchemaDataGrid,



        dataGridProps: { stickyHeader: true },
        listEditButton: { enabled: true },
        listViewButton: { enabled: false },

        toolbarDeleteButton: { enabled: false },
        toolbarListButton: { enabled: false },
        toolbarSaveButton: { enabled: true },
        toolbarExportButton: { enabled: false },
        toolbarEditButton: { enabled: false },


        formGroupMode: 'groups',

        mutationMode: 'pessimistic',
        editProps: {
            queryOptions: { meta: { forceFetch: true } },
            undoable: false,
            emptyWhileLoading: true
        },

        saveButtonAlwaysEnabled: true,
        refreshAfter: true,
        //redirect: "list",
        //redirectAfterCreate: true,
        //redirectAfterUpdate: true,

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
        isFormData: true,
        model: 'system/user',
        //group: 'resource.groups.system_resources',
        group: "Accounts",
        label: 'resource.system.users.label',
        refreshAfter: true,
        referenceFilters: [
            // TODO: Cuando se cambia el cliente se debn mostrar sólo los CP de este filtro
            {
                id: 'search',
                label: 'resource.system.users.filter_search',
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
                fieldProps: {
                    allowEmpty: true,  // Allow empty selection
                    emptyText: 'Sin cliente', // Text for empty option
                },
                componentProps: {
                    parse: (value: any) => {
                        console.log('Parsing tenant_id value:', value); // Debug log
                        // Convert empty string or falsy values to null
                        if (value === '' || value === undefined || value === 'null') {
                            console.log('Converting to null');
                            return null;
                        }
                        // Convert string numbers to actual numbers
                        if (typeof value === 'string' && !isNaN(Number(value))) {
                            const numValue = Number(value);
                            console.log('Converting to number:', numValue);
                            return numValue;
                        }
                        console.log('Returning original value:', value);
                        return value;
                    },
                    format: (value: any) => {
                        console.log('Formatting tenant_id value:', value); // Debug log
                        // Format null/undefined as empty string for display
                        if (value === null || value === undefined) {
                            return '';
                        }
                        return value;
                    }
                },
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
                title: 'resource.system.users.menu_list',
                redirect: '/system/user',
            },
            {
                title: "🗑",
                redirect: "/system/user/trash",
            }
        ],
        //{
        //    title: "🗑",
        //    redirect: "/trash/admin/user",
        //}],
        mainAction: {
            title: 'resource.system.users.main_action',
            // type: "ghost",
            redirect: '/system/user/create',
        },
        mutationMode: 'pessimistic',
        // isFormData: true,
        dataGridProps: { stickyHeader: true },
        dataGridWrapper: (props: any) => (
            <TableContainer sx={{ maxHeight: 800 }}>{props.children}</TableContainer>
        ),
        formPostFormatter: (params, form) => {
            return form;
        },
        /*postFormatter: (params, method) => {
          
            if (method === 'update') {
                params._method = 'PUT';
            }
            params.role_id = params.role_ids ? params.role_ids[0] : null;

            // Handle tenant_id properly - ensure it's null when not selected
            if (params.tenant_id === '' || params.tenant_id === undefined || params.tenant_id === 'null') {
                params.tenant_id = null;
            } else if (params.tenant_id && typeof params.tenant_id === 'string') {
                // Convert string to number if it's a valid number
                const numValue = Number(params.tenant_id);
                if (!isNaN(numValue)) {
                    params.tenant_id = numValue;
                }
            }

            console.log('Processed params:', params); // Debug log

            return params;
        },*/
        ...drawerSettings,
    },

    // ============ Subscription Plans Management ============
    {
        roles: [DASHAppConstants.system.SYSTEM_ROLE],
        component: ResourceTemplate,
        model: 'system/subscription-plan',
        label: 'Subscription Plans',
        //group: 'resource.groups.system_resources',
        group: "System",
        icon: <CardMembershipIcon />,
        trash: true,

        // Context wrapper for fetching limit formats and addon formats from backend
        contextComponent: ({ resourceConfig, mode, children }) => {
            console.log("SubscriptionPlanFormatsProvider", resourceConfig, mode);
            return mode === "list" ? children : (
                <SubscriptionPlanFormatsProvider cacheSeconds={300}>
                    {children}
                </SubscriptionPlanFormatsProvider>
            );
        },

        schema: subscriptionPlanSchema,

        menu: [
            {
                title: 'All Plans',
                redirect: '/system/subscription-plan',
            },
        ],

        mainAction: {
            title: 'Create Plan',
            fn: "redirect",
            mode: "create",
            redirect: "create",
        },

        referenceFilters: [
            {
                id: "name",
                label: "Plan Name",
                source: "name",
                reference: null,
                optionText: null,
                alwaysOn: true,
            },
            {
                id: "is_active",
                label: "Active",
                source: "is_active",
                reference: null,
                optionText: null,
                alwaysOn: false,
            },
        ],

        // Enable all CRUD operations
        create: true,
        view: true,
        refreshAfter: true,
        toolbarCreateButton: { enabled: true },

        // Form configuration
        mutationMode: 'pessimistic',
        editProps: {
            queryOptions: { meta: { forceFetch: true } },
            undoable: false,
            emptyWhileLoading: true,
        },

        // Data grid configuration
        dataGridProps: { stickyHeader: true },
        dataGridWrapper: (props: any) => (
            <TableContainer sx={{ maxHeight: 800 }}>{props.children}</TableContainer>
        ),
        listEditButton: { enabled: true },
        listViewButton: { enabled: true },

        // Post-processing for form data
        postFormatter: (params, method) => {
            // Ensure limits is properly formatted as an object
            if (params.limits && typeof params.limits === 'object') {
                // Clean up null/undefined values
                const cleanedLimits: Record<string, any> = {};
                Object.entries(params.limits).forEach(([key, value]) => {
                    // Convert empty strings to null for integer fields
                    if (value === '' || value === undefined) {
                        cleanedLimits[key] = null;
                    } else {
                        cleanedLimits[key] = value;
                    }
                });
                params.limits = cleanedLimits;
            }

            // Ensure prices is properly formatted as an object
            if (params.prices && typeof params.prices === 'object') {
                // Clean up null/undefined/empty values and ensure integer values
                const cleanedPrices: Record<string, number> = {};
                Object.entries(params.prices).forEach(([currencyCode, value]) => {
                    // Only include valid numeric values
                    if (value !== '' && value !== undefined && value !== null) {
                        const numValue = parseInt(String(value), 10);
                        if (!isNaN(numValue)) {
                            cleanedPrices[currencyCode] = numValue;
                        }
                    }
                });
                params.prices = cleanedPrices;
            }

            // Ensure billing_cycle has a default value (required field)
            if (!params.billing_cycle) {
                params.billing_cycle = 'monthly';
            }

            // Ensure trial_days has a default value
            if (params.trial_days === undefined || params.trial_days === null) {
                params.trial_days = 0;
            }

            // Ensure tier has a default value
            if (params.tier === undefined || params.tier === null) {
                params.tier = 1;
            }

            return params;
        },

        redirectAfterUpdate: false,
        redirectAfterCreate: true,
        ...drawerSettings,
    },


    {
        roles: [DASHAppConstants.system.SYSTEM_ROLE],
        component: ResourceTemplate,
        trash: true,
        model: "ecommerce/currency",
        label: "resource.ecommerce.currencies.label",
        schema: [
            {
                label: 'Código',
                attribute: 'code',
                type: String,
                fieldOptions: {
                    helperText: 'E.g: CLP | USD ...'
                }

            },
            {
                label: 'Formato',
                attribute: 'format',
                type: String,
                fieldOptions: {
                    helperText: 'E.g: 0.00 | 0,0.00 | 0'
                }
            },
            {
                label: 'Símbolo',
                attribute: 'symbol',
                type: String
            },
            {
                label: 'Enabled',
                attribute: 'is_enabled',
                type: Boolean
            },
            {
                label: 'Número formateado',
                attribute: 'formateado',
                type: Number,
                custom: true,
                inList: false,
                component: FormatCurrency
            },
        ],
        //references: [{ reference: 'roles', target: 'role', schema: rolesSchema }]
        //references: [{ reference: 'roles', target: 'id', schema: roleSchema }],
        icon: <Person />,
        // group: "resource.groups.system_resources",
        group: "System",
        menu: [
            {
                title: "resource.ecommerce.currencies.menu_list",
                redirect: "/ecommerce/currency",
            },
            {
                title: "🗑",
                redirect: "/ecommerce/currency/trash",
            },
        ],

        mainAction: {
            title: "resource.ecommerce.currencies.main_action",
            mode: "create",
            fn: "virtualhash",
            redirect: "inline/create",
        },
        drawer: true,
        drawerOptions: {
            create: true,
            edit: true,
            view: false
        },

        mutationMode: "pessimistic",
        saveButtonAlwaysEnabled: true,
        listProps: { storeKey: false, filterDefaultValues: { show_disabled: true } }, // deshabilita persistencia deel estado, cache de los valores seleccionados sort, page, etc.
        resetSelectedIdsOnLoad: true,
    },

    // ============ Language Management ============
    {
        roles: [DASHAppConstants.system.SYSTEM_ROLE],
        component: ResourceTemplate,
        trash: true,
        model: "common/language",
        label: "resource.common.languages.label",
        schema: [
            {
                label: 'Code',
                attribute: 'code',
                type: String,
                fieldOptions: {
                    helperText: 'ISO 639-1 code (e.g., en, es, pt)'
                }
            },
            {
                label: 'Name',
                attribute: 'name',
                type: String,
                fieldOptions: {
                    helperText: 'Language name in English'
                }
            },
            {
                label: 'Native Name',
                attribute: 'native_name',
                type: String,
                fieldOptions: {
                    helperText: 'Language name in native language (e.g., Español)'
                }
            },
            {
                label: 'Active',
                attribute: 'is_active',
                type: Boolean
            },
            {
                label: 'Translations',
                attribute: 'translations',
                type: Object,
                inList: false,
                inShow: true,
                inEdit: true,
                inCreate: true,
                fieldOptions: {
                    helperText: 'JSON key-value pairs for translations'
                }
            },
        ],
        icon: <Person />,
        group: "System",
        menu: [
            {
                title: "resource.common.languages.menu_list",
                redirect: "/common/language",
            },
            {
                title: "🗑",
                redirect: "/common/language/trash",
            },
        ],

        mainAction: {
            title: "resource.common.languages.main_action",
            mode: "create",
            fn: "virtualhash",
            redirect: "inline/create",
        },
        drawer: true,
        drawerOptions: {
            create: true,
            edit: true,
            view: false
        },

        mutationMode: "pessimistic",
        saveButtonAlwaysEnabled: true,
        listProps: { storeKey: false },
        resetSelectedIdsOnLoad: true,
    }

];


export default systemResources;
