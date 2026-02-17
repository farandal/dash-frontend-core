import { IDashAutoAdminResourceConfig } from "dash-auto-admin";
import stocktypeSchema from "../schemas/stocktype";
import Storage from "@mui/icons-material/Storage";
import TrashTemplate from "dash-admin/src/resources/Trash/TrashTemplate";
import ResourceTemplate from "dash-admin/src/templates/ResourceTemplate";
import {DASHAppConstants} from "dash-constants";
import React from "react";

const Icon = Storage as unknown as React.FC;

const stockTypeResource: IDashAutoAdminResourceConfig = 
{
    roles:[DASHAppConstants.system.SYSTEM_ROLE, DASHAppConstants.system.TENANT_ROLE],
    component: ResourceTemplate,
    trash: true,
    model: "ecommerce/stock_type",
    group: "resource.groups.products",
    label: "resource.ecommerce.stock_types.label",
    schema: stocktypeSchema,
    icon: <Icon />,
    menu: [
        {
            title: "resource.ecommerce.stock_types.menu_list",
            redirect: "/ecommerce/stock_type",
        },
        {
            title: "🗑",
            redirect: "/ecommerce/stock_type/trash",
        },
    ],
   
    search: true,
    listViewButton: { enabled: false },
    //listDeleteButton: { enabled: false },
    

    mainAction: {
        title: "resource.ecommerce.stock_types.main_action",
        mode: "create",
        fn:"virtualhash",
        redirect: "inline/create",
    },
    drawer: true,
    drawerOptions: {
        create: false,
        edit: true,
        view: true
    },


    formGroupMode: "tabs", // groups or tabs
    mutationMode: "pessimistic",
    postFormatter: (params) => {
        /*if (!params.output_pos_stock_type_mappings) {
               params.output_pos_stock_type_mappings = [];
        } else {
            params.output_pos_stock_type_mappings = [params.output_pos_stock_type_mappings.id];
        }*/

        if (!params.output_pos_stock_type_mappings) {
            params.output_pos_stock_type_mappings = [];
        }
        if (params.output_pos_stock_type_mappings) {
            params.output_pos_stock_type_mappings =
                params.output_pos_stock_type_mappings.map(
                    (item) => item.pointOfSaleStockType.id
                );
        }

        return params;
    },
    redirectAfterUpdate: "list",
    refreshAfter: true,
    closeDrawerAfterSave: true,
    showDialogAfterSubmit: true,
    saveButtonAlwaysEnabled: true,
    processErrors: false,
    listProps: {storeKey: false}, // deshabilita persistencia deel estado, cache de los valores seleccionados sort, page, etc.
    resetSelectedIdsOnLoad: true,
}

export default stockTypeResource;