
import {IDashAutoAdminAttribute} from 'dash-auto-admin'
import { ImageInput } from 'react-admin';
import { SelectArrayInput } from 'react-admin';

const tenantUserSchema: IDashAutoAdminAttribute[] = [
	{
		label: 'Nombre',
		attribute: 'name',
		type: String,
		tab: 'Datos Usuario',
		//validate: (name: string) => (name && name.length >= 3 ? undefined : <div>Name is too short</div>)
	},
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
			let response = undefined;
			// if(!password)
			//     response = 'El campo es requerido';
			if (password && password.length < 6 && password.length > 1)
				response = 'Min 6 caracteres';
			return response;
		},
	},
	{
		label: 'Confirmar Contraseña',
		attribute: 'password_confirmation',
		type: String,
		isPassword: true,
		fieldProps: {},
		inList: false,
		tab: 'Contraseña',
		validate: (repassword: string, values: any) => {
			let response = undefined;
			if (values?.password !== repassword)
				response = 'Contraseñas no coinciden.';
			return response;
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
		listAttribute: 'admin/userclient.avatar',
		type: ImageInput, // TODO: el componente no muestra la imágen
		inList: false,
		label: 'Imágen',
		tab: 'Datos Usuario',
		processor: 'RawFile',
		//validate: (password: string) => (password && password.length >= 6 ? undefined : <div>Password is too short</div>)
	},
];

export default tenantUserSchema;
