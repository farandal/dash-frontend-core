import {IDashAutoAdminAttribute} from 'dash-auto-admin'
import { SelectInput } from 'react-admin';
import tenantUserSchema from './tenantUser';

const userClientSchema: IDashAutoAdminAttribute[] = [
	...tenantUserSchema,
	{
		tab: 'Datos Usuario',
		label: 'Cliente',
		attribute: 'tenant_id',
		//listAttribute: 'name',
		type: 'system/tenants.name',
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
];

export default userClientSchema;
