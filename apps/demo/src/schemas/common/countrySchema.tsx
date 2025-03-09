import {ListActive} from "dash-components";
import { IDashAutoAdminAttribute } from "dash-auto-admin";

const countrySchema: IDashAutoAdminAttribute[] = [
    {
        tab: 'datos',
        attribute: 'name',
        label: 'Nombre',
        type: String,
        sortable: true
    },
    {
        tab: 'datos',
        label: 'Código',
        attribute: 'code',
        type: String,
        sortable: true
    },
    {
		tab: 'datos',
		attribute: 'is_active',
		label: 'Activa',
		type: String,
		sortable: true,
		custom: true,
		component: ListActive,
		showLabel: true,
		/*inEdit: true,
		inList: true,
		inShow: true,
		inCreate: true,*/
		processor: 'Boolean'
	},
];

export default countrySchema;