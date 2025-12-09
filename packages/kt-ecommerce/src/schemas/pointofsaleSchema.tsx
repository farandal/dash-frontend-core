//import MarketplaceConnection from "../resources/TenantMarketplaceResource/MarketplaceConnection";

import PointOfSaleConnectionOptions from "../components/PointOfSale/PointOfSaleConnectionOptions"
import SystemPointOfSaleSelector from "../components/PointOfSale/SystemPointOfSaleSelector"
import { IDashAutoAdminAttribute } from "dash-auto-admin"

export interface IPointOfsale {
    id: number,
    name: string,
    tenant_system_point_of_sale_id: number,
    active: boolean,
    notified: boolean,
    connection_params: {[x:string]:any}
    tenantSystemPointOfSale: {
        id: number
        system_point_of_sale_id: number
        tenant_id: number
    }
}

const pointOfSaleSchema: IDashAutoAdminAttribute[] = [

    {
        attribute: 'name',
        label: 'Nombre',
        type: String
    },

    {
        attribute: 'tenant_system_point_of_sale_id',
        label: 'Punto de Venta',
        type: Number,
        component: SystemPointOfSaleSelector,
        custom: true,
        inList: false,
        inEdit: true,
        inCreate: true,
        inShow: false
    },

    {
        attribute: 'active',
        label: 'Activo',
        type: Boolean,
        inList: true,
        inEdit: true,
        inShow: true,
        inCreate:true,
        readOnly: true
    },

       {
        attribute: 'is_default',
        label: 'Principal',
        type: Boolean,
        inList: true,
        inEdit: true,
        inShow: true,
        inCreate:true,
        readOnly: true
    },


    /*{
        attribute: 'notified',
        label: 'Notificación',
        type: Boolean,
        inList: true,
        inEdit: false,
        inShow: true,
        inCreate:false,
        readOnly: true
    },*/

    {
        //tab: "Conexión",
        attribute: 'connection_params',
        label: 'Parámetros de Conexión con Marketplace',
        type: String,
        custom: true,
        component: PointOfSaleConnectionOptions,
        inList: false
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

export default pointOfSaleSchema;
