import { IDashAutoAdminAttribute } from 'dash-auto-admin';
import NotificationRenderer from '../contexts/com/components/NotificationRenderer';

const notificationSchema: IDashAutoAdminAttribute[] = [
	{
		label: 'Fecha',
		attribute: 'created_at',
		fieldOptions: { showTime: true, fullWidth: true},
		type: Date,
	},
	,
	{
		label: 'Tipo',
		attribute: 'type',
		type: String,
		inList: false,
	},

	{
		label: 'Clase',
		attribute: 'class',
		type: String,
		inList: true,
	},

	{
		label: 'Título',
		attribute: 'notificationPayload.title',
		type: String,
	},

	{
		label: 'Contenido',
		attribute: 'notificationPayload',
		type: String,
		custom: true,
		inList: false,
		component: NotificationRenderer,
	},
];

export default notificationSchema;
