import { SystemPointOfSaleTenantAssociator } from "../components/Marketplace/SystemPointOfsaleTenantAssociator";
import SystemPointOfSaleImage from "../components/SystemPointOfSaleImage";
import SystemPointOfSaleIcon from "../components/SystemPointOfSaleIcon";
import { IDashAutoAdminAttribute } from "dash-auto-admin";
import { SelectInput } from "react-admin";

const systemPointOfSaleSchema:IDashAutoAdminAttribute[] = [

    {
        attribute: 'icon_url',
        label: 'Icono',
        type: "custom",
        component: SystemPointOfSaleIcon,
        inList: true,
        inEdit: false,
        inCreate: false,
        inShow: false
    },

    {
        attribute: 'name',
        label: 'Nombre',
        type: String
    },

    {
        label:"Clase",
        attribute: 'class',
        type: 'ecommerce/system_point_of_sale/availableClasses.id',
        pagination: false,
        multiple: false,
        component: SelectInput,
        inList: true
    },

    {
        attribute: 'icon',
        listAttribute: 'icon_url',
        type: String,
        custom: true,
        component: SystemPointOfSaleImage,
        inList: false,
        label: "Logo",
        processor: "File"
    },

     {
            attribute: 'tenant_ids',
            type: String,
            custom: true,
            component: SystemPointOfSaleTenantAssociator,
            inList: false,
            inCreate: false,
            inEdit: true,
            inShow: false
        }

];

export default systemPointOfSaleSchema;
