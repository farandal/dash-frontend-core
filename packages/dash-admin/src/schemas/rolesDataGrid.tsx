import { IDashAutoAdminAttribute } from 'dash-auto-admin';
import PermissionsSelectorList from '../components/permission/PermissionsSelectorList';

const roleSchemaDataGrid: IDashAutoAdminAttribute[] = [
	{
		label: 'Nombre',
		attribute: 'name',
		type: String,
	},
	{
		label: 'Nivel',
		attribute: 'level',
		type: Number,
		inList: false,
		// @TODO Agregar validador que no se pueda seleccionar un nivel superior
	},
	{
		label: 'Grupo (web)',
		attribute: 'guard_name',
		type: String,
		inList: false,
	},
	{
		label: 'Permisos',
		attribute: 'permission_ids',
		type: String,
		custom: true,
		component: PermissionsSelectorList,
		inList: false,
	},
];

export default roleSchemaDataGrid;
