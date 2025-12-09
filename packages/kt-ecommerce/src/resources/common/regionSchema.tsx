import {ListActive} from "dash-components";
import { IDashAutoAdminAttribute } from "dash-auto-admin";
import { SelectInput } from "react-admin";

const regionSchema: IDashAutoAdminAttribute[] = [

    {
        tab: 'datos',
        label: 'Nombre',
        attribute: 'name',
        type: String
    },

    {
        tab: 'datos',
        label: "País",
        attribute: 'country_id',
        type: 'common/country.name',
        pagination: false,
        multiple: false,
        component: SelectInput,
        inList: true
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
		//processor: 'Boolean'
	},
    
];

export default regionSchema;