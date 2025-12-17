import PointOfSaleAssociationConnectionOptions from "../components/PointOfSale/PointOfSaleAssociationConnectionOptions";
import { FormControl } from "@mui/material";
import { IDashAutoAdminAttribute } from "dash-auto-admin";
import React from "react";
import { SelectInput } from "react-admin";
//import MarketplaceConnection from "../resources/TenantMarketplaceResource/MarketplaceConnection";

export interface IPointOfsaleAssociation {
    id: number,
    name: string,
    point_of_sale_id: number,
    stock_type_id: number,
    active: boolean,
    connection_params: {[x:string]:any},
    pointOfSale: {
        tenantSystemPointOfSale: {
            id: number
            system_point_of_sale_id: number
            tenant_id: string
        }
    }
}

const pointOfSaleAssociationSchema: IDashAutoAdminAttribute[] = [

    {
        attribute: 'name',
        label: 'Nombre',
        type: String
    },

    {
        attribute: 'point_of_sale_id',
        label: 'Punto de Venta',
        type: 'ecommerce/point_of_sale.name',
        pagination: false,
        multiple: false,
        component: ({ method, attribute }) => { 
         
            return <FormControl fullWidth><SelectInput source={attribute.attribute} optionText={"name"} optionValue={"id"} /></FormControl>
        },
     
        //component: PointOfSaleSelector,
        //custom: true,
        inList: false,
        inEdit: true,
        inShow: false,
        inCreate: true,

      
    },

    {
        attribute: 'stock_type_id',
        label: 'Lista de stock',
        type: 'ecommerce/stock_type.name',
        pagination: false,
        multiple: false,
        //component: SelectInput,
        component: ({ method, attribute }) => { 
            return <FormControl fullWidth><SelectInput source={attribute.attribute} optionText={"name"} optionValue={"id"} /></FormControl>
        },
       
        //component: PointOfSaleSelector,
        //custom: true,
        inList: false,
        inEdit: true,
        inShow: false,
        inCreate: true,
    },

    {
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
        //tab: "Conexión",
        attribute: 'connection_params',
        label: 'Parámetros de Conexión',
        type: String,
        custom: true,
        component: PointOfSaleAssociationConnectionOptions,
        inList: false
        
    },

];

export default pointOfSaleAssociationSchema;
