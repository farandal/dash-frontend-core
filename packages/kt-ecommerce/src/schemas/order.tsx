
import { FunctionField } from "react-admin";
import { Chip } from "@mui/material";
import PDFViewer from "../components/Misc/PDFViewer";
import OrderDetail from "../components/Product/OrderDetail";
import { IDashAutoAdminAttribute } from "dash-auto-admin";
import React from "react";

const orderSchema:IDashAutoAdminAttribute[] = [

    {
        attribute: 'id',
        label: 'Id',
        type: Number
    },
    {
        attribute: 'status',
        label: 'Status',
        type: String,
        custom: true,
        component: (schemeEntry) => {  return <FunctionField
            label={schemeEntry.attribute.label}
            render={record => { 
                const status = record[schemeEntry.attribute.attribute];
                return  <Chip label={status ? status : '-'} />
              }}
        /> },
        //inShow:true,
        //inEdit:false,
        //inCreate:false,
        

    },
    {
        attribute: 'buyer',
        label: 'Comprador',
        type: String,
        custom: true,
        component: (schemeEntry) => {  return <FunctionField
            label={schemeEntry.attribute.label}
            render={record => `${record[schemeEntry.attribute.attribute]?.first_name} ${record[schemeEntry.attribute.attribute]?.last_name}`}
        /> },
    },
    {
        attribute: 'brokerable',
        label: 'Origen',
        type: String,
        custom: true,
        component: (schemeEntry) => {  return <FunctionField
            label={schemeEntry.attribute.label}
            render={record => { 
                const name = record[schemeEntry.attribute.attribute]?.name;
                return  <Chip label={name ? name : '-'} />
              }}
        /> }
    },
    {
        attribute: 'broker_status',
        label: 'Estado venta origen',
        type: String,
        custom: true,
        component: (schemeEntry) => {  return <FunctionField
            label={schemeEntry.attribute.label}
            render={record => { 
                const status = record[schemeEntry.attribute.attribute];
                return  <Chip label={status ? status : '-'} />
              }}
        /> }
    },
    {
        attribute: 'broker_order_url',
        label: 'Detalle de origen',
        type: String,
        custom: true,
        component: (schemeEntry) => {  return <FunctionField
            label={schemeEntry.attribute.label}
            render={record => { 
                const link = record[schemeEntry.attribute.attribute];
                return <Chip label={link ? <a target='_blank' href={link}>{schemeEntry.attribute.label}</a> : 'N/A'} />
              
              }}
        /> }
    },

    {
        attribute: 'total_amount',
        label: 'Monto total',
        type: String
    },
    {
        attribute: 'date_created',
        label: 'Fecha creación',
        type: Date
    },
    {
        attribute: 'date_confirmed',
        label: 'Fecha confirmación',
        type: Date
    },
    {
        tab: "Nota de Venta",
        attribute: 'sale_note_path',
        label: 'Nota de venta',
        type: String,
        custom: true,
        component: PDFViewer,
        inList:false,
        inEdit:false,
        inShow:true
    },
    {
        tab: "Boleta Electrónica",
        attribute: 'billing_ticket_path',
        label: 'Boleta Electrónica',
        type: String,
        custom: true,
        component: PDFViewer,
        inList:false,
        inEdit:false,
        inShow:true
    },
    {
        tab: "Detalle",
        attribute: 'products',
        label: 'Detalles',
        type: String,
        custom: true,
        component: OrderDetail,
        inList:false,
        inEdit:false,
        inShow:true
    },
    
];

export default orderSchema;