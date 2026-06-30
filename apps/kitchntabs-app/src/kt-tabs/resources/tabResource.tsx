
import React from "react";
import { IDashAutoAdminResourceConfig } from "dash-auto-admin";

import ResourceTemplate from "dash-admin/templates/ResourceTemplate";

import { Kitchen, RestaurantMenu } from "@mui/icons-material";
import tabSchema from "../schemas/tabSchema";

// Direct imports for components used in resource configs
// (React.lazy doesn't work for component references in resource configs)
import TabsList from "../components/TabsList";
import KitchenTabsList from "../components/KitchenTabsList";
import { TabsContext } from "../components/Tab/TabContext";

import { SelectInput } from "react-admin";
import { parseAxiosError } from "dash-admin/helpers/parseAxiosError";
import {DASHAppConstants} from "dash-constants";
import { Grid } from "@mui/material";

// Helper function to get status filter options with translation keys
const getStatusFilterOptions = () => [
    { id: 'CREATED', name: 'tab.status.created' },
    { id: 'CONFIRMED', name: 'tab.status.confirmed' },
    { id: 'IN_PREPARATION', name: 'tab.status.in_preparation' },
    { id: 'PREPARED', name: 'tab.status.prepared' },
    { id: 'DELIVERED', name: 'tab.status.delivered' },
    { id: 'CANCELLED', name: 'tab.status.cancelled' },
    { id: 'CLOSED', name: 'tab.status.closed' }
];

const resources: IDashAutoAdminResourceConfig[] = [
    {
        
        group: "Tabs",
        roles: [DASHAppConstants.system.SYSTEM_ROLE,DASHAppConstants.system.TENANT_ROLE,"Staff"],
        component: ResourceTemplate,
        model: "tab/tab-admin",
        label: "tab.resource.tabs_admin",
        schema: tabSchema,
        icon: <RestaurantMenu />,
       
        //listComponent: (resourceConfig) => <Graphs/>,
        menu: [
        
        ],
        mainAction: null,
        mutationMode: "pessimistic",
        drawer: true,
        drawerOptions: {
            edit: false,
            create: false
        },
        formGroupMode: "tabs",
        /*formGroupModes: {
            create: "groups",
        },*/
        listProps: {
            storeKey: false,
            empty:false,
            perPage: 20,
            sort: { field: 'id', order: 'DESC' },    
        }, 
        paginationProps: {
            rowsPerPageOptions: [20, 40, 60, 100],
        },
        saveButtonAlwaysEnabled: true,
        processErrors: true,
        exporter: false,
       
        dataGridProps: {
            bulkActionButtons: false,
            rowClick:false,
        },
        resetSelectedIdsOnLoad: true,
        closeDrawerAfterSave: true,
        showNotifyAfterSubmit: false,
        showDialogAfterSubmit: false,
        redirectAfterCreate: "edit",
        redirectAfterUpdate: "list",
        refreshAfter: true,
        topToolbarButtons: true,
        referenceFilters: [
            {
                id: 'status_id',
                label: 'tab.resource.filter.status',
                source: 'status',
                alwaysOn: true,
                reference: getStatusFilterOptions(),
                optionText: 'name',
                fieldProps: {
                    translateChoice: true, // Enable translation of choice labels
                },
                //fieldOptions: { defaultValue: 'Todos' }, 
                referenceComponent: SelectInput,
            },
        ],
    },
    {
        group: "Tabs",
        roles: [DASHAppConstants.system.SYSTEM_ROLE,DASHAppConstants.system.TENANT_ROLE,"Staff"],
        component: ResourceTemplate,
        dataGridComponent: TabsList,
        model: "tab/tab",
        
        label: "tab.resource.tabs",
        schema: tabSchema,
        icon: <RestaurantMenu />,
        
        //listComponent: (resourceConfig) => <Graphs/>,
        menu: [
            {
                title: "tab.resource.menu.list",
                redirect: "/tab/tab",
            },
        ],
        mainAction: {
            title: "tab.resource.action.create",
            fn: "redirect",
            // type: "ghost",
            mode: "create",
            redirect: "create",
        },
        mutationMode: "pessimistic",
        drawer: true,
        drawerOptions: {
            edit: false,
            create: false
        },
       toolbarCreateButton: { enabled: true },
        saveButtonAlwaysEnabled: true,
        processErrors: true,
        exporter: false,
        listProps: { storeKey: false,empty:false }, 
        resetSelectedIdsOnLoad: true,
        closeDrawerAfterSave: true,
        showNotifyAfterSubmit: false,
        showDialogAfterSubmit: false,
        redirectAfterCreate: "edit",
        redirectAfterUpdate: "edit",
        refreshAfter: true,
        referenceFilters: [
            {
                id: 'status_id',
                label: 'tab.resource.filter.status',
                source: 'status',
                alwaysOn: true,
                reference: getStatusFilterOptions(),
                optionText: 'name',
                fieldProps: {
                    translateChoice: true, // Enable translation of choice labels
                },
                //fieldOptions: { defaultValue: 'Todos' }, 
                referenceComponent: SelectInput,
            },
        ],

     
        
        contextComponent: TabsContext,
        /*errorParser: (error) => {
            
            return parseAxiosError(error);
        }*/
        formGroupMode: "layout",// || "tabs"
        /*formGroupModes: {
            create: "groups",
        },*/
         showLayout(render) {
           return (
               <Grid container spacing={2} >
                      <Grid size={{ xs: 12}}>
                       {render("tab.tab.productos")}
                   </Grid>
                     <Grid size={{ xs: 12}}>
                       {render("tab.tab.comanda")}
                   </Grid>
               </Grid>
           )
       },
       editLayout(render) {
           return (
               <Grid container spacing={2} /*direction={{ xs: 'column-reverse', sm: 'row' }}*/>
                
                  <Grid size={{ xs: 12, sm: 6 }}>
                       {render("tab.tab.productos")}
                   </Grid>
                     <Grid size={{ xs: 12, sm: 6 }}>
                       {render("tab.tab.comanda")}
                   </Grid>
                 
                 
               </Grid>
           )
       },
       createLayout(render) {
           return (
               <Grid container spacing={2} /*direction={{ xs: 'column-reverse', sm: 'row' }}*/>
                
                 <Grid size={{ xs: 12, sm: 6 }}>
                       {render("tab.tab.productos")}
                   </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                       {render("tab.tab.comanda")}
                   </Grid>
                  
                  
               </Grid>
           )
       },
       paramsFormatter(params) {

           // cleanup payload:
            debugger;

           return params;
       },
    },

    {
        group: "Kitchen",
        roles: [DASHAppConstants.system.TENANT_ROLE,"Kitchen"],
        component: ResourceTemplate,
        contextComponent: TabsContext,
        dataGridComponent: KitchenTabsList,
        model: "tab/kitchentab",
        label: "tab.resource.tabs",
        schema: tabSchema,
        icon: <Kitchen />,
        //listComponent: (resourceConfig) => <Graphs/>,
        menu: [
            {
                title: "tab.resource.menu.kitchen_active",
                redirect: "/tab/kitchentab",
            },
        ],
        mainAction: {
            title: "tab.resource.action.create",
            fn: "redirect",
            // type: "ghost",
            mode: "create",
            redirect: "create",
        },
        mutationMode: "pessimistic",
        drawer: true,
        drawerOptions: {
            edit: false,
            create: false
        },
        formGroupMode: "tabs",
        /*formGroupModes: {
            create: "groups",
        },*/
        saveButtonAlwaysEnabled: true,
        processErrors: false,
        exporter: false,
        listProps: { storeKey: false, empty:false }, 
        resetSelectedIdsOnLoad: true,
        closeDrawerAfterSave: true,
        showNotifyAfterSubmit: false,
        showDialogAfterSubmit: true,
        redirectAfterCreate: "edit",
        redirectAfterUpdate: false,
        
        refreshAfter: true,
        /*referenceFilters: [
            {
                id: 'status_id',
                label: 'tab.attribute.status',
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
    }

];

export default resources;