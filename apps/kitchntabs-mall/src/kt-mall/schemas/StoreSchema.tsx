import { IDashAutoAdminAttribute } from "dash-auto-admin";

const StoreSchema: IDashAutoAdminAttribute[] = [
    {
        tab: 'General',
        attribute: 'name',
        label: 'Nombre',
        type: String,
        inList: true,
        inShow: true,
        inEdit: false,
        inCreate: false,
    },
    {
        tab: 'General',
        attribute: 'public_name',
        label: 'Nombre Público',
        type: String,
        inList: true,
        inShow: true,
        inEdit: false,
        inCreate: false,
    },
    {
        tab: 'Contacto',
        attribute: 'contact_name',
        label: 'Nombre de Contacto',
        type: String,
        inList: false,
        inShow: true,
        inEdit: false,
        inCreate: false,
    },
    {
        tab: 'Contacto',
        attribute: 'contact_email',
        label: 'Email de Contacto',
        type: String,
        inList: false,
        inShow: true,
        inEdit: false,
        inCreate: false,
    },
    {
        tab: 'Contacto',
        attribute: 'phone',
        label: 'Teléfono',
        type: String,
        inList: false,
        inShow: true,
        inEdit: false,
        inCreate: false,
    },
];

export default StoreSchema;
