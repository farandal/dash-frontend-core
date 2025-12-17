
//import MarketplaceConfigurationOptions from "../components/TenantMarketplaceResource/MarketplaceConfigurationOptions"
import MarketplaceConnectionOptions from "../components/TenantMarketplaceResource/MarketplaceConnectionOptions"
import MarketplaceTests from "../components/TenantMarketplaceResource/MarketplaceTests"
import TenantMarketplaceSelector from "../components/TenantMarketplaceResource/TenantMarketplaceSelector"

//import SystemMarketplaceSelector from "../components/TenantMarketplaceResource/SystemMarketplaceSelector"
import { IDashAutoAdminAttribute } from "dash-auto-admin"

export interface ITenantMarketplace {
    id: number,
    name: string,
    tenant_system_marketplace_id: number,
    active: boolean,
    notified: boolean,
    connection_params: {[x:string]:any}
    tests:  {[x:string]:any},
    tenantSystemMarketplace: {
        id: number
        system_marketplace_id: number
        tenant_id: string
    }


}

const tenantMarketplaceSchema: IDashAutoAdminAttribute[] = [

    {
        tab: "Conexión",
        attribute: 'name',
        label: 'Nombre',
        type: String
    },

    {
        tab: "Conexión",
        attribute: 'system_marketplace_id',
        label: 'System Marketplace',
        type: Number,
        component: TenantMarketplaceSelector,
        custom: true,
        inList: false,
        inEdit: true,
        inShow: false
    },

    {
        tab: "Conexión",
        attribute: 'active',
        label: 'Activo',
        type: Boolean,
        inList: true,
        inEdit: false,
        inShow: true,
        inCreate:false,
        readOnly: true
    },

    {
        tab: "Conexión",
        attribute: 'notified',
        label: 'Notificación',
        type: Boolean,
        inList: true,
        inEdit: false,
        inShow: true,
        inCreate:false,
        readOnly: true
    },

    {
        tab: "Conexión",
        attribute: 'connection_params',
        label: 'Parámetros de Conexión con Marketplace',
        type: String,
        custom: true,
        component: MarketplaceConnectionOptions,
        inList: false,

    },

    /*{
        tab: "Configuraciones adicionales",
        attribute: 'id',
        label: 'Parámetros de Configuración con Marketplace',
        type: String,
        custom: true,
        component: MarketplaceConfigurationOptions,
        inList: false,
        inShow: false

    },*/

    {
        tab: "Pruebas",
        attribute: 'id',
        label: 'Pruebas',
        type: String,
        custom: true,
        component: MarketplaceTests,
        inList: false,
        inShow: false

    },


   

   /* {
        //tab: "Conexión",
        attribute: 'connection_params',
        label: 'Establecer conexión con el marketplace',
        type: String,
        custom: true,
        inList:false,
        inShow:false,
        inCreate:false,
        component: MarketplaceConnection,

    },*/



];

export default tenantMarketplaceSchema;
