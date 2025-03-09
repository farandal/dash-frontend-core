import getEnv from "./utils/getEnv";

/**
 * Defines the constants and configuration for the application.
 * This includes system roles, default settings, and various dictionary values used throughout the application.
 */
const DASHAppConstants = {
	system: {
    GUEST_ROLE: {
			id: 99,
			level: 99,
			name: 'Guest',
		},
    URL_PREFIX: getEnv('DASH_URL_PREFIX') || '#/', // When using drawer
		SYSTEM_ROLE:  getEnv('DASH_SYSTEM_ROLE') || 'System',
		TENANT_ROLE: getEnv('DASH_TENANT_ROLE') || 'Tenant',
		USER_ROLE: getEnv('DASH_USER_ROLE') || 'User',
    /* APP ROLES */
		CREATOR_ROLE: getEnv('APP_CREATOR_ROLE') || 'Creador',
		CLOSING_ROLE: getEnv('APP_CLOSING_ROLE') || 'Cerrador',
		GUNNER_ROLE: getEnv('APP_GUNNER_ROLE') || 'Pistolero',
		DRIVER_ROLE: getEnv('APP_DRIVER_ROLE') || 'Conductor',
    /* OTHERS */
    //PAGE_TRANSITIONS: JSON.parse(getEnv('PAGE_TRANSITIONS')) || false,
    //PAGE_TRANSITIONS: false,
    LOGIN_SOUNDS: JSON.parse(getEnv('LOGIN_SOUNDS')) || false,
    UI_SOUNDS: JSON.parse(getEnv('UI_SOUNDS')) || false,
    RECAPTCHA_ENABLED: JSON.parse(getEnv('APP_RECAPTCHA_ENABLED')) || false,
		RECAPTCHA_TOKEN: getEnv('APP_RECAPTCHA_TOKEN') || 'UNSET',
    DEFAULT_ROWS_PER_PAGE: getEnv('APP_DEFAULT_ROWS_PER_PAGE') || 50,

	},

	days: [
		{ index: 0, name: 'Domingo' },
		{ index: 1, name: 'Lunes' },
		{ index: 2, name: 'Martes' },
		{ index: 3, name: 'Miércoles' },
		{ index: 4, name: 'Jueves' },
		{ index: 5, name: 'Viernes' },
		{ index: 6, name: 'Sábado' },
	],
	dict: {
		SYSTEM_FORM_DEFAULT_SELECT_OPTION: 'Seleccione una opción',
		NO_AVAILABLE_NOTIFICATIONS: 'No hay notificaciones nuevas',
		ALL_NOTIFICATIONS: 'Todas las notificaciones',
		NOTIFICATIONS_WIDGET_TITLE: 'Notificaciones',
		type: 'Tipo',
		date: 'Fecha',
		name: 'Nombre',
		filepath: 'Archivo',
		json: 'Data',
		clientName: 'Cliente',
		withdrawsToday: 'Retiros Hoy',
		withdrawsYesterday: 'Retiros Ayer',
		withdrawsLastWeek: 'Retiros Última Semana',
		volumeCp: 'Volúmen',
		'validation.recaptcha': 'Recaptcha inválido',
    PACKAGE_NOT_FOUND_TITLE:'Número de paquete no encontrado',
    PACKAGE_NOT_FOUND: 'Tú paquete no se ha encontrado. Si tienes problemas contáctanos a ayuda@dash.cl',
	},
  replacements: {
    'validation.recaptcha': 'Recaptcha inválido',
    'confirm password' : 'Confirmar contraseña',
    'password' : 'Contraseña',
    'client.name': 'Nombre del cliente',
    'public id': 'Rut',
    'name': 'Nombre',
    'lastname': 'Apellido',
    'client id': 'ID Cliente',
    'logistic center id': 'Centro Logístico',
    'delivery commune id': 'Comuna',
    'contact name': 'Nombre del contacto',
    'delivery address': 'Dirección de Envío',
  },
  custom: {}
};

export type IDASHAppConstants = typeof DASHAppConstants;
export default DASHAppConstants;
