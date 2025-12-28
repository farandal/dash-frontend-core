import { IDashAutoAdminAttribute } from 'dash-auto-admin';
import PermissionsSelector from '../components/permission/PermissionsSelector';

const roleSchema: IDashAutoAdminAttribute[] = [
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
		label: 'Redirección',
		attribute: 'redirect',
		type: String,
		inList: false,
		//helpText: 'Ruta opcional a la que se redirige el usuario al iniciar sesión (ej: /dashboard). Debe comenzar con /',
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
		component: PermissionsSelector,
		inList: false,
	},
];

export default roleSchema;
