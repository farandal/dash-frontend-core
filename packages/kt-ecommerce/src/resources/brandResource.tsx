
import { IDashAutoAdminResourceConfig } from "dash-auto-admin";
import brandSchema from "../schemas/brand";
import Dot from "@mui/icons-material/FiberManualRecord";
import TrashTemplate from 'dash-admin/src/templates/TrashTemplate';
import ResourceTemplate from 'dash-admin/src/templates/ResourceTemplate';
import {DASHAppConstants} from "dash-constants";
import React from "react";

const Icon = Dot as unknown as React.FC;

const brandResource: IDashAutoAdminResourceConfig = 
{
    roles:[DASHAppConstants.system.SYSTEM_ROLE, DASHAppConstants.system.TENANT_ROLE],
    component: ResourceTemplate,
    trash: true,
    model: "ecommerce/brand",
    label: "Marcas",
    schema: brandSchema,
    icon: <Icon />,
    group: "Productos",

    menu: [
        {
            title: "Lsitado de Marcas",
            redirect: "/ecommerce/brand",
        },
        {
            title: "🗑",
            redirect: "/ecommerce/brand/trash",
        },
    ],

    mainAction: {
        title: "Crear marca",
        mode: "create",
        fn:"virtualhash",
        redirect: "inline/create",
    },
   
    view: true,
    create: true,
    edit: true,

    drawer: true,
    drawerOptions: {
        create: true,
        edit: true,
        view: true
    },

    isFormData: true,
    formGroupMode: "tabs", 
    postFormatter: (params) => {
        if(!params.input_brand_mappings) {
            debugger;
            params.input_brand_mappings = [];
        }
        return params;
    },
    

    mutationMode: "pessimistic",
    saveButtonAlwaysEnabled: true,
    listProps: {storeKey: false},
    resetSelectedIdsOnLoad: true,

}

export default brandResource;