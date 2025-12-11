
import { IDashAutoAdminAttribute } from "dash-auto-admin";
import { lazy } from "react";
import { TabStatus, ViewMarketplaceDetail } from "kt-tabs";
import MallOrderProductsField from "../components/MallOrderProductsField";
import MallOrderProducts from "../components/MallOrderProducts";

// Lazy load heavy components
/*
const LazyMallOrderProductsField = lazy(() => import("../components/MallOrderProductsField"));
const LazyMallOrderProducts = lazy(() => import("../components/MallOrderProducts"));
const LazyTabStatus = lazy(() => import("kt-tabs").then(module => ({ default: module.TabStatus })));
const LazyViewMarketplaceDetail = lazy(() => import("kt-tabs").then(module => ({ default: module.ViewMarketplaceDetail })));
*/

const MallTabSchema: IDashAutoAdminAttribute[] = [

     {

        attribute: 'products',
        tab: 'Productos',
        label: 'Tab',
        type: Array,
        inCreate: true,
        inList: false,
        inShow: false,
        custom: true,
        component: MallOrderProductsField,
       
    },
    {
        attribute: 'products',
        tab: 'Productos',
        label: 'Productos',
        type: Array,
        inCreate: true,
        custom: true,
        component: MallOrderProducts
    },
    {
        attribute: 'order.total_amount',
        tab: 'Productos',
        label: 'Total',
        type: String,
        inCreate: false,
        inEdit: false,
        inShow: false,
    },
    {
        attribute: 'order.is_paid',
        tab: 'Productos',
        label: 'Pago',
        type: Boolean,
        inCreate: false,
        inEdit: false,
        inShow: false,
    },

     /* {
        tab: 'Comanda',
        attribute: 'actions',
        label: 'Acciones',
        type: String,
        custom: true,
        inCreate: false,
        inEdit: true,
        inList: false,
        inShow: true,
        component: TabActionButtonsField,
        //componentProps: {
         //   shoeCloseButton: true,
        //}
    },*/
      {
        tab: 'Pedido',
        attribute: 'status',
        label: 'Status',
        type: String,
        custom: true,
        inCreate: false,
        inEdit: false,
        inList: false,
        inShow: false,
        component: TabStatus,
    },
   /* {
        tab: 'Comanda',
        attribute: 'note',
        label: 'Notas',
        type: String,
        inList: false
    },*/


   

  
    {
        tab: 'Marketplace',
        attribute: 'order',
        label: 'Status',
        type: String,
        custom: true,
        inCreate: false,
        inEdit: false,
        inList: false,
        component: ViewMarketplaceDetail,
    },
   
    {
        tab: 'Datos',
        attribute: 'date_created',
        label: 'creación',
        type: Date,
        fieldProps: {showTime:true},
        inCreate: false,
        inList: false,
        inEdit: false,
        inShow: false,
    },
    {
        tab: 'Datos',
        attribute: 'date_confirmed',
        label: 'ingresada',
        type: Date,
        fieldProps: {showTime:true},
        inCreate: false,
        inEdit: false,
        inShow: false,
    },

];

export default MallTabSchema;