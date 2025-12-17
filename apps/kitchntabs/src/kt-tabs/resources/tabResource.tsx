
import React from "react";
import { IDashAutoAdminResourceConfig } from "dash-auto-admin";

import ResourceTemplate from "dash-admin/src/templates/ResourceTemplate";

import { Kitchen, RestaurantMenu } from "@mui/icons-material";
import tabSchema from "../schemas/tabSchema";

// Direct imports for components used in resource configs
// (React.lazy doesn't work for component references in resource configs)
import TabsList from "../components/TabsList";
import KitchenTabsList from "../components/KitchenTabsList";
import { TabsContext } from "../components/Tab/TabContext";

import { SelectInput } from "react-admin";
import { parseAxiosError } from "dash-admin/src/helpers/parseAxiosError";
import {DASHAppConstants} from "dash-constants";
import { Grid } from "@mui/material";

const resources: IDashAutoAdminResourceConfig[] = [
    {
        
        group: "Tabs",
        roles: [DASHAppConstants.system.SYSTEM_ROLE,DASHAppConstants.system.TENANT_ROLE,"Staff"],
        component: ResourceTemplate,
        model: "tab/tab-admin",
        label: "Tabs Admin",
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
        ],
    },
    {
        group: "Tabs",
        roles: [DASHAppConstants.system.SYSTEM_ROLE,DASHAppConstants.system.TENANT_ROLE,"Staff"],
        component: ResourceTemplate,
        dataGridComponent: TabsList,
        model: "tab/tab",
        
        label: "Tabs",
        schema: tabSchema,
        icon: <RestaurantMenu />,
        
        //listComponent: (resourceConfig) => <Graphs/>,
        menu: [
            {
                title: "☰ Listado",
                redirect: "/tab/tab",
            },
        ],
        mainAction: {
            title: "⊕ Crear tab",
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
                       {render("Productos")}
                   </Grid>
                     <Grid size={{ xs: 12}}>
                       {render("Comanda")}
                   </Grid>
               </Grid>
           )
       },
       editLayout(render) {
           return (
               <Grid container spacing={2} /*direction={{ xs: 'column-reverse', sm: 'row' }}*/>
                
                  <Grid size={{ xs: 12, sm: 6 }}>
                       {render("Productos")}
                   </Grid>
                     <Grid size={{ xs: 12, sm: 6 }}>
                       {render("Comanda")}
                   </Grid>
                 
                 
               </Grid>
           )
       },
       createLayout(render) {
           return (
               <Grid container spacing={2} /*direction={{ xs: 'column-reverse', sm: 'row' }}*/>
                
                 <Grid size={{ xs: 12, sm: 6 }}>
                       {render("Productos")}
                   </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                       {render("Comanda")}
                   </Grid>
                  
                  
               </Grid>
           )
       }
    },

    {
        group: "Kitchen",
        roles: [DASHAppConstants.system.TENANT_ROLE,"Kitchen"],
        component: ResourceTemplate,
        contextComponent: TabsContext,
        dataGridComponent: KitchenTabsList,
        model: "tab/kitchentab",
        label: "Tabs",
        schema: tabSchema,
        icon: <Kitchen />,
        //listComponent: (resourceConfig) => <Graphs/>,
        menu: [
        /*    {
                title: "Comandas activas",
                redirect: "/tab/kitchentab",
            },*/
        ],
        /*mainAction: {
            title: "Crear tab",
            fn: "redirect",
            // type: "ghost",
            mode: "create",
            redirect: "create",
        },*/
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
        redirectAfterCreate: "list",
        redirectAfterUpdate: false,
        
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
    }

];

export default resources;