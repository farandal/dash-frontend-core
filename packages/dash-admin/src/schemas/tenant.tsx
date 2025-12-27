import {IDashAutoAdminAttribute} from 'dash-auto-admin'
import TenantSettings from '../components/tenant/TenantSettings';

const tenantSchema: IDashAutoAdminAttribute[] = [
	{
        tab: "Datos",
		label: 'Nombre',
		attribute: 'name',
		type: String,
	},
	{
         tab: "Datos",
		label: 'Rut',
		attribute: 'public_id',
		type: String,
		 validate: (rut: string) => {
        if(!rut)
          throw new Error('El campo es requerido');
        else if(!rut.match(/^(\d{7,8}-[\dkK])$/g))
          throw new Error('Ingresar rut con guion');
      },
	},

    {
        tab: "Datos",
		label: 'Email',
		attribute: 'email',
		type: String,
	},

      {
         tab: "Datos",
      label: 'Descripción Corta',
      attribute: 'short_description',
      type: String,
      inList: false,
      
      validate: (value: string) => {
        if (value && value.length > 500) {
          throw new Error('La descripción corta no puede exceder 500 caracteres');
        }
      },
    },

    {
         tab: "Datos",
      label: 'Descripción Larga',
      attribute: 'long_description',
      type: String,
      inList: false,
       fieldProps: {
      multiline: true,
    },
    slotProps: {
      multiline: true,
      fullWidth: true
    },
      validate: (value: string) => {
        if (value && value.length > 5000) {
          throw new Error('La descripción larga no puede exceder 5000 caracteres');
        }
      },
    },


	{
		tab: 'Configuraciónes',
		label: 'Configuraciónes',
		attribute: 'settings', // para un custom component, atributo no es necesario, pero es requerido por la interfaz
		type: String,
		custom: true,
		inList: false, // No se puede mostrar en el listado, porque el backend no trae el listado de imagnes en la lista
		component: TenantSettings,
	},

	{
		tab: 'Datos contacto',
		label: 'Razón Social',
		attribute: 'public_name',
		type: String,
		inList: false,
	},
	{
		tab: 'Datos contacto',
		label: 'Dirección',
		attribute: 'address',
		type: String,
		inList: false,
	},

	{
		tab: 'Datos contacto',
		label: 'Teléfono',
		attribute: 'phone',
		type: String,
		inList: false,
	},

	{
		tab: 'Datos contacto',
		label: 'Teléfono Móvil',
		attribute: 'mobile',
		type: String,
		inList: false,
	},
	{
		tab: 'Datos contacto',
		label: 'Nombre del contacto',
		attribute: 'contact_name',
		type: String,
		inList: false,
	},
	{
		tab: 'Datos contacto',
		label: 'Email del contacto',
		attribute: 'contact_email',
		type: String,
		inList: false,
	},
	{
		tab: 'Datos contacto',
		label: 'Teléfono del contacto',
		attribute: 'contact_phone',
		type: String,
		inList: false,
	},
];

export default tenantSchema;
