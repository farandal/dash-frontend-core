import { IDashAutoAdminAttribute } from 'dash-auto-admin';
import TenantSettings from '../components/tenant/TenantSettings';
import TenantTheme from '../components/tenant/TenantTheme';
import TenantAttributes from '../components/tenant/TenantAttributes';

const tenantSystemAdminSchema: IDashAutoAdminAttribute[] = [
	/*{
    attribute: 'id',
    type: Number
  },*/
	{
        tab: 'Genéricos',
		label: 'Nombre',
		attribute: 'name',
		type: String,
	},
    {
        tab: 'Genéricos',
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
        tab: 'Genéricos',
		label: 'Email',
		attribute: 'email',
		type: String,
	},
    /* TODO! domain spacific logic issue, can't be on the Base tenant controller */
	/*
    {
        tab: 'Genéricos',
        label: 'Monedas Disponibles',
        inList:false,
        attribute: 'currency_ids',
        //listAttribute: 'name',
        type: 'common/currency.code',
        //type: Object,
        // TODO Agregar un filtro, solo para traer los roles de cliente.
        pagination: false,
        multiple: true,
        componentProps: {multiple:true},
        //custom: true,
        component: SelectArrayInput,
        //searchField: "subdomain"
      },
  
      {
        tab: 'Genéricos',
        label: 'Moneda Primaria',
        attribute: 'currency_primary_id',
        //listAttribute: 'name',
        type: 'common/currency.code',
        //type: Object,
        // TODO Agregar un filtro, solo para traer los roles de cliente.
        pagination: false,
        multiple: false,
  
        //componentProps: {multiple:false},
        //custom: true,
        component: SelectInput,
        //searchField: "subdomain"
      },
      {
        tab: 'Genéricos',
        label: 'Idiomas Disponibles',
        attribute: 'language_ids',
        type: 'common/language.code',
        pagination: false,
        multiple: true,
        component: SelectArrayInput,
        componentProps: {multiple:true},
      },*/
	{
		tab: 'Configuración',
		label: 'Configuración',
		attribute: 'settings', // para un custom component, atributo no es necesario, pero es requerido por la interfaz
		type: Object,
		custom: true,
		inList: false, // No se puede mostrar en el listado, porque el backend no trae el listado de imagnes en la lista
		component: TenantSettings,
        inCreate: false,
        inShow:false
	},

	{
		tab: 'Theme',
		label: 'Tema',
		attribute: 'attributes',
		type: Object,
		custom: true,
		inList: false,
		component: TenantTheme,
        inCreate: false,
        inShow:false
	},

    // I want here a block only to configure the thenan theme and colors HERE.

	{
		tab: 'Datos contacto',
		label: 'Datos de contacto',
		attribute: 'attributes',
		type: Object,
		custom: true,
		inList: false,
		component: TenantAttributes,
        inCreate: false,
        inShow:false
	},
];

export default tenantSystemAdminSchema;
