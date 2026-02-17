
import { IDashAutoAdminResourceConfig } from "dash-auto-admin";
import systemMarketplaceSchema from "../schemas/systemMarketplace";
import Person from "@mui/icons-material/Person";
import TrashTemplate from "dash-admin/src/resources/Trash/TrashTemplate";
import ResourceTemplate from "dash-admin/src/templates/ResourceTemplate";
import {DASHAppConstants} from "dash-constants";
import React from "react";

const Icon = Person as unknown as React.FC;

const systemMarketplaceResource: IDashAutoAdminResourceConfig = 
{
    roles: [DASHAppConstants.system.SYSTEM_ROLE],
    component: ResourceTemplate,
    trash: true,
    model: "ecommerce/system_marketplace",
    label: "Marketplaces",
    schema: systemMarketplaceSchema,
    icon: <Icon />,
    //references: [{ reference: 'roles', target: 'role', schema: rolesSchema }]
    //references: [{ reference: 'roles', target: 'id', schema: roleSchema }],
    redirectAfterUpdate: "edit",
    group: "System",
    menu: [
        {
            title: "Marketplace",
            redirect: "/ecommerce/system_marketplace",
        },
        /*{
            title: "🗑",
            redirect: "/ecommerce/system_marketplace/trash",
        },*/
    ],
    //mainAction: null,
    mainAction: {
        title: "Crear marketplace",
        // type: "ghost",
        redirect: "ecommerce/system_marketplace/create",
    },
    isFormData: true,
    mutationMode: "pessimistic",
    saveButtonAlwaysEnabled: true,
    refreshAfter: true,
    postFormatter: (params) => {
        params._method = "PUT";
        if (params.meta) {
            params.meta = { ...params.meta, method: "POST" };
        } else {
            params.meta = { method: "POST" };
        }

        return params;
    },
    listProps: {storeKey: false}, // deshabilita persistencia deel estado, cache de los valores seleccionados sort, page, etc.
    resetSelectedIdsOnLoad: true,
}

export default systemMarketplaceResource;