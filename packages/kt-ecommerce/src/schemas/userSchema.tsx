import { IDashAutoAdminAttribute } from 'dash-auto-admin';


import { SelectArrayInput } from 'react-admin';
import { RutValidator } from 'dash-admin/src/utils/validators';
import Avatar from '../components/User/Avatar';
import Password from '../components/User/Password';
const userSchema: IDashAutoAdminAttribute[] = [
  {
    tab: 'Datos del usuario',
    attribute: 'id',
    label: 'Id',
    type: String,
    sortable: true,
    inEdit: false,
    inCreate: false,

  },
  {
    tab: 'Datos del usuario',
    attribute: 'public_id',
    label: 'Rut',
    type: String,
    fieldOptions: { required: true/*, validate: [required()],*/, showDiv: true, fullWidth: true },
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
    tab: 'Datos del usuario',
    attribute: 'name',
    label: 'Nombre',
    type: String,
    sortable: true,
    inEdit: true,
    inCreate: true,
    inShow: false,
    inList: false,
    fieldOptions: { required: true }

  },
  {
    tab: 'Datos del usuario',
    attribute: 'lastname',
    label: 'Apellido',
    type: String,
    sortable: true,
    inEdit: true,
    inCreate: true,
    inShow: true,
    inList: false,
    fieldOptions: { required: true }
  },

  {
    tab: 'Datos del usuario',
    attribute: 'full_name',
    label: 'Nombre',
    type: String,
    sortable: true,
    inEdit: false,
    inShow: true,
    inCreate: false,
    fieldOptions: { required: true }
  },
  {
    tab: 'Datos del usuario',
    attribute: 'email',
    label: 'Email',
    type: String,
    sortable: true,
    inEdit: true,
    inShow: true,
    inCreate: true,
    fieldOptions: { required: true }
  },
  {
    tab: 'Datos del usuario',
    attribute: 'phone',
    label: 'Telefono',
    type: String,
    sortable: true,
    inEdit: true,
    inCreate: true,
    inShow: true,
    inList: false,
  },
  /*{
    tab: 'Configuración',
    attribute: 'active',
    type: Boolean,
    inList: true,
    inCreate: false,
    label: 'Activo',
    showLabel: false,
    processor: 'Boolean',
  },*/

  {
    tab: 'Credenciales',
    attribute: 'password',
    label: 'Contraseña',
    type: String,
    sortable: true,
    inEdit: false,
    inCreate: false,
    inShow: false,
    inList: false,
  },
  {
    tab: 'Credenciales',
    attribute: 'password_confirmation',
    label: 'Confirma Contraseña',
    type: String,
    sortable: true,
    inEdit: false,
    inCreate: false,
    inShow: false,
    inList: false,
  },
  /*{
    tab: 'Credenciales',
    attribute: 'role_id',
    type: 'system/role/forSelect.name',
    label: 'Rol de usuario',
    componentProps: { 
      filter: { substitutable: true } // Shows only substituable roles for current user, backend logic. 
    },
    sortable: true,
    inEdit: true,
    inCreate: true,
    inShow: true,
    inList: false,
    multiple: false,
  },*/
  {
    tab: "Credenciales",
    label: 'Roles',
    attribute: 'role_ids',
    //listAttribute: 'name',
    type: 'tenant/role/forSelect.name',
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
                // @TODO Solo mostrar cuando se está creando:
                label: 'Genear Contraseña Aleatorea Automáticamente',
                attribute: 'generate_password',
                type: Boolean,
                inList: false,
                inEdit:false,
                tab: 'Configuración',
            },
             {
                attribute: 'active',
                type: Boolean,
                inList: true,
                label: 'Activo',
                tab: 'Configuración',
                processor: 'Boolean',
            },
  {
    tab: 'Avatar',
    attribute: 'avatar',
    listAttribute: 'image_url',
    label: 'Foto Usuario',
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
    tab: 'Credenciales',
    attribute: 'password',
    label: 'Contraseña',
    type: String,
    sortable: true,
    inList: false,
    inEdit: true,
    inCreate: true,
    custom: true,
    inShow: false,
    component: Password,
  },
];

export default userSchema;
