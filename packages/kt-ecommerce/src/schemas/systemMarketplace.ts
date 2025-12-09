import { SystemMarketplaceTenantAssociator } from "../components/Marketplace/SystemMarketplaceTenantAssociator";
import SystemMarketplaceImage from "../components/SystemMarketplaceImage";
import SystemMarketplaceIcon from "../components/SystemMarketplaceIcon";
import { IDashAutoAdminAttribute } from "dash-auto-admin";
import { SelectInput } from "react-admin";


const systemMarketplaceSchema:IDashAutoAdminAttribute[] = [

    {
        attribute: 'icon_url',
        label: 'Icono',
        type: "custom",
        component: SystemMarketplaceIcon,
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
        type: 'ecommerce/system_marketplace/availableClasses.id',
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
        component: SystemMarketplaceImage,
        inList: false,
        label: "Logo",
        processor: "File"
    },

    {
        attribute: 'tenant_ids',
        type: String,
        custom: true,
        component: SystemMarketplaceTenantAssociator,
        inList: false,
        inCreate: false,
        inEdit: true,
        inShow: false
    }

];

export default systemMarketplaceSchema;
