import { IDashAutoAdminAttribute } from 'dash-auto-admin';

const defaultSchema: IDashAutoAdminAttribute[] = [
	{
		attribute: 'id',
		label: 'Id',
		type: String,
		sortable: true,
		inEdit: false,
		inCreate: false,
	},
];

export default defaultSchema;
