
import { IDashAutoAdminAttribute } from "dash-auto-admin";

const todoSchema: IDashAutoAdminAttribute[] = [
    {
            tab: 'Todo',
            attribute: 'name',
            label: 'Nombre',
            type: String,
    },
{
            tab: 'Todo',
            attribute: 'description',
            label: 'Description',
            type: 'textarea',
    },
{
            tab: 'Todo',
            attribute: 'completed',
            label: 'Completed',
            type: Boolean,
    }

];


export default todoSchema;