import { IDashAutoAdminAttribute } from 'dash-auto-admin';
import TenantSettings from '../components/tenant/TenantSettings';
import { SelectArrayInput, SelectInput } from 'react-admin';

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
        
			if (!rut) return 'El campo es requerido';
         
			else if (!rut.match(/^(\d{1,3}(?:\.\d{1,3}){2}-[\dkK])$/g))
				return 'Ingresar rut con puntos y guin';
			return undefined;
		},
	},
    /* TODO! domain spacific logic issue, can't be on the Base tenant controller */
	/*
    {
        tab: 'Genéricos',
        label: 'Monedas Disponibles',
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
      },*/
	{
		tab: 'Configuración',
		label: 'Configuración',
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

export default tenantSystemAdminSchema;
