import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import ResourceTemplate from 'dash-admin/src/templates/ResourceTemplate';

import { RestaurantMenu } from '@mui/icons-material';
import { dashStorage } from 'dash-utils';
import { MallTabSchema } from './schemas';
import { MallTabsContext, MallClientTabsList } from './components';

const MallClientAppResources: IDashAutoAdminResourceConfig[] = [

   /* {
         roles: ["Public"],
         component: ResourceTemplate,
         model: '/public/mall/stores',
         label: 'Locales',
         schema: StoreSchema,
         icon: <LeaderboardIcon />,
         group: 'Locales',
        //   menu: [
        //       {
        //           title: "Ordena Aquí!",
        //           redirect: "tab/create",
        //           
        //       },
        //   
        //   ],
        //ainAction:{
        //       title: "Ordena Aquí!",
        //       redirect: "tab/create",
        //,
        //resourceMenuDisabled: true,
         drawer: true,
         drawerOptions: {
             show: true
         },
         edit: false,
         create: false,
         dataGridComponent: StoresList, 
         listProps: {
             perPage: 14,
             sort: { field: 'id', order: 'ASC' },
             storeKey: false,
             
 
         }, 
         
     },/*
     {
         roles: ["Public"],
         component: ResourceTemplate,
         model: '/public/mall/products',
         label: 'Productos',
         schema: [],
          edit: false,
         create: false,
         icon: <LeaderboardIcon />,
         group: 'Productos',
         menu: [],
         resourceMenuDisabled: true,
     },*/

    {
        group: "Haz tu orden aquí!",
        roles: ["Public"],
        component: ResourceTemplate,
        //dataGridComponent: TabsList,
        model: "tab",
        redirect: "create",
        label: "Haz tu orden aquí!",
        schema: MallTabSchema,
        icon: <RestaurantMenu />,
        
        /*listComponent: (resourceConfig) => {
            return <MallListHomeOrder />
        },*/
        contextComponent: MallTabsContext,
        
       
        toolbarCreateButton: { enabled: false },
        //dataGridComponent: MallListHomeOrder,
        //listComponent: (resourceConfig) => <Graphs/>,
        dataGridComponent: MallClientTabsList,
        menu: [
            {
                title: "☰ Tus ordenes",
                redirect: "tab",
            },
              {
                title: "★  Nueva Orden",
                redirect: "tab/create",
            },
        ],
        mainAction: {
            title: "⊕ Hacer un pedido",
            fn: "redirect",
            // type: "ghost",
            mode: "create",
            redirect: "create",
        },
        mutationMode: "pessimistic",
        /*drawer: true,
        drawerOptions: {
            edit: true,
            create: false
        },*/

        saveButtonAlwaysEnabled: true,
        processErrors: true,
        exporter: false,
        listProps: { storeKey: false, empty: false },
        resetSelectedIdsOnLoad: true,
        closeDrawerAfterSave: true,
        showNotifyAfterSubmit: false,
        showDialogAfterSubmit: false,
        redirectAfterCreate: "edit",
        redirectAfterUpdate: "edit",
        refreshAfter: true,
       /*referenceFilters: [
            {
                id: 'status_id',
                label: 'Estado',
                source: 'status',
                alwaysOn: true,
                reference: [
                    { id: 'CREATED', name: 'Creado' },
                    { id: 'CONFIRMED', name: 'Confirmado' },
                    { id: 'IN_PREPARATION', name: 'En preparación' },
                    { id: 'PREPARED', name: 'Preparado' },
                    { id: 'DELIVERED', name: 'Entregado' },
                    { id: 'CANCELLED', name: 'Cancelado' },
                    { id: 'CLOSED', name: 'Cerrado' }
                ],
                optionText: 'name',
                //fieldOptions: { defaultValue: 'Todos' }, 
                referenceComponent: SelectInput,
            },
        ],*/
        /*errorParser: (error) => {
            return parseAxiosError(error);
        }*/
        formGroupMode: "tabs",// || "tabs"
        /*formGroupModes: {
            create: "groups",
        },*/

     
        /* HACK TO INTERCEPT MISSING SESSION DATA : check MallAppMediator component */
        beforeSubmit(values) {

              
               
                
            
                const orderData = dashStorage.getItem('orderData');
            
                const { name, tableNumber } = orderData ? JSON.parse(orderData) : { name: null, tableNumber: null };
                
                if (!name || !tableNumber) {
                    throw new Error("MISSING_SESSION_DATA");
                }

                

                values["customer_name"] = name;
                values["table_number"] = tableNumber;

                return values;
        },

        onError(mode, error) {
            
            if(mode === "create" && error.message === "MISSING_SESSION_DATA") {
                window.dispatchEvent(new CustomEvent('enter-public-order-data'));
                return;
            }

            throw new Error(error.message);
            
        },
        

    },


];

export default MallClientAppResources;
