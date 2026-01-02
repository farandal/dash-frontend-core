
import { IDashAutoAdminResourceConfig } from "dash-auto-admin";
import brandSchema from "../schemas/brand";
import currencySchema from "../schemas/currency";
import Person from "@mui/icons-material/Person";
import TrashTemplate from "dash-admin/src/resources/Trash/TrashTemplate";
import ResourceTemplate from "dash-admin/src/templates/ResourceTemplate";
import {DASHAppConstants} from "dash-constants";
import React from "react";

const Icon = Person as unknown as React.FC;

const currencyResource: IDashAutoAdminResourceConfig = 
{
    roles: [DASHAppConstants.system.SYSTEM_ROLE],
    component: ResourceTemplate,
    trash: true,
    model: "ecommerce/currency",
    label: "resource.ecommerce.currencies.label",
    schema: currencySchema,
    //references: [{ reference: 'roles', target: 'role', schema: rolesSchema }]
    //references: [{ reference: 'roles', target: 'id', schema: roleSchema }],
    icon: <Icon />,
    group: "resource.groups.system_resources",
    menu: [
        {
            title: "resource.ecommerce.currencies.menu_list",
            redirect: "/ecommerce/currency",
        },
        {
            title: "🗑",
            redirect: "/ecommerce/currency/trash",
        },
    ],
   
    mainAction: {
        title: "resource.ecommerce.currencies.main_action",
        mode: "create",
        fn:"virtualhash",
        redirect: "inline/create",
    },
    drawer: true,
    drawerOptions: {
        create: true,
        edit: true,
        view: false
    },

    mutationMode: "pessimistic",
    saveButtonAlwaysEnabled: true,
    listProps: {storeKey: false}, // deshabilita persistencia deel estado, cache de los valores seleccionados sort, page, etc.
    resetSelectedIdsOnLoad: true,
}

export default currencyResource;