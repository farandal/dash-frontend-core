import { IDashAutoAdminResourceConfig } from "dash-auto-admin";
import campaignSchema from "../schemas/campaign";
import GifBox from "@mui/icons-material/GifBox";
import React from "react";
import {DASHAppConstants} from "dash-constants";
import CampaignResourceTemplate from "../CampaignResourceTemplate";

const Icon = GifBox as unknown as React.FC;

const campaignResource: IDashAutoAdminResourceConfig = 
{
    roles: [DASHAppConstants.system.TENANT_ROLE],
    component: CampaignResourceTemplate,
    model: "ecommerce/campaign",
    group: "Campañas",
    label: "Campañas",
    schema: campaignSchema,
    icon: <Icon />,
    /*drawer: true,
      drawerOptions: {
        show: true,
        view: true,
        edit: false,
        create: false,
    },*/
    
    menu: [
        {
            title: "Listado de Campañas",
            redirect: "/ecommerce/campaign",
        },
    ],
       mainAction: {
        title: "Crear",
        fn: "redirect",
        // type: "ghost",
        mode: "create",
        redirect: "create",
    },

    referenceFilters: [
        {
            id: "Nombre",
            label: "Nombre",
            source: "name",
            reference: null,
            optionText: null,
            alwaysOn: true,
        },
    ],
    postFormatter(params, method) {
       
        if (!params.schedule) {
          
                    params.scheduled = false;
                }
        
        return params;
    },
   
    showDialogAfterSubmit: true,
    redirectAfterCreate: "list",
    redirectAfterUpdate: 'edit',
    //search: true
    listProps: {storeKey: false}, // deshabilita persistencia deel estado, cache de los valores seleccionados sort, page, etc.
    resetSelectedIdsOnLoad: true,
    saveButtonAlwaysEnabled: true,
    processErrors: false,
}

export default campaignResource;