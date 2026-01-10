import { TableContainer } from '@mui/material';
// eslint-disable-next-line import/no-extraneous-dependencies
//import Dashboard from '@mui/icons-material/Dashboard';
import Person from '@mui/icons-material/Person';
import { SelectInput } from 'react-admin';
import { ImageInput } from 'react-admin';
import { SelectArrayInput } from 'react-admin';
import ResourceTemplate from './templates/ResourceTemplate';
import IAppResourceConfig from './interfaces/IAppResourceConfig';
import permissionSchema from './schemas/permissions';

import roleSchema from './schemas/roles';
import TrashTemplate from './resources/Trash/TrashTemplate';
//import ImpersonateTenantResource, { TenantImpersonateResource } from './resources/Tenant/ImpersonateTenantResource';
import tenantSystemAdminSchema from './schemas/tenant_superadmin';
import notificationSchema from './schemas/notification';
import LogResource from './resources/Log/LogResource';
import logSchema from './schemas/log';

import {DASHAppConstants} from 'dash-constants';

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

const tenantResources: IAppResourceConfig[] = [
  {
    roles: [DASHAppConstants.system.SYSTEM_ROLE, DASHAppConstants.system.TENANT_ROLE],
    component: ResourceTemplate,
    trash: true,
  
    model: 'system/user',
    group: 'resource.groups.system_resources',
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
        label: 'Nombre',
        attribute: 'name',
        type: String,
        tab: 'Datos Usuario',
        //validate: (name: string) => (name && name.length >= 3 ? undefined : <div>Name is too short</div>)
      },
      /*{
        label: "Apellido",
        attribute: "lastname",
        type: String,
        tab: "Datos Usuario",
        //validate: (name: string) => (name && name.length >= 3 ? undefined : <div>Name is too short</div>)
      },*/
      {
        label: 'Email',
        attribute: 'email',
        type: String,
        tab: 'Datos Usuario',
        //validate: (email: string) => (email && email.indexOf('@') > 0 ? undefined : 'Invalid email')
      },
      {
        label: 'Contraseña',
        attribute: 'password',
        type: String,
        isPassword: true,
        fieldProps: { fullWidth: true },
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
        fieldProps: { fullWidth: true },
        inList: false,
        tab: 'Contraseña',
        validate: (password: string, values: any) => {
          if (values?.password !== password) {
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
        attribute: 'role_ids',
        //listAttribute: 'name',
        type: 'system/role.name',
        //type: Object,
        // TODO Agregar un filtro, solo para traer los roles de cliente.
        pagination: false,
        multiple: true,
        //custom: true,
        //componentProps:{ options: {fullwidth: true} },
        component: SelectArrayInput,
        //searchField: "subdomain"
      },
      {
        attribute: 'active',
        type: Boolean,
        inList: true,
        label: 'Activo',
        tab: 'Datos Usuario',
        processor: 'Boolean',
      },
      {
        attribute: 'avatar',
        listAttribute: 'system/userclients.avatar',
        type: ImageInput, // TODO: el componente no muestra la imágen
        inList: false,
        label: 'Imágen',
        tab: 'Datos Usuario',
        processor: 'RawFile',
        //validate: (password: string) => (password && password.length >= 6 ? undefined : <div>Password is too short</div>)
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
    ],
    //references: [{ reference: 'roles', target: 'role', schema: rolesSchema }]
    //references: [{ reference: 'roles', target: 'id', schema: roleSchema }],
    icon: <Person />,
    redirectAfterUpdate: false,
    menu: [
      {
        title: 'Usuarios',
        redirect: '/system/user',
      },
    ],
    //{
    //    title: "🗑",
    //    redirect: "/trash/admin/user",
    //}],
    mainAction: {
      title: 'Crear usuario',
      // type: "ghost",
      redirect: '/system/user/create',
    },
    mutationMode: 'pessimistic',
    //isFormData: true,
    isFormData: false,
    dataGridProps: { stickyHeader: true },
    dataGridWrapper: (props: any) => (
      <TableContainer sx={{ maxHeight: 800 }}>{props.children}</TableContainer>
    ),
    /*formPostFormatter: (params, form) => {
        
      return form;
    },*/
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

];

export default tenantResources;