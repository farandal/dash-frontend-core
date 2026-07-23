import { IDashAutoAdminResourceConfig } from "dash-auto-admin";
import BusinessIcon from "@mui/icons-material/Business";
import ResourceTemplate from "dash-admin/src/templates/ResourceTemplate";
import {DASHAppConstants} from "dash-constants";
import React from "react";
import storeSchema from "../schemas/storeSchema";
import scheduleSchema from "../schemas/scheduleSchema";

const Icon = BusinessIcon as unknown as React.FC;

const MallResources: IDashAutoAdminResourceConfig[] = [
    {
    roles: [DASHAppConstants.system.SYSTEM_ROLE],
    component: ResourceTemplate,
    trash: true,
    model: "tenant/store",
    label: "resource.mall.label",
    schema: storeSchema,
    icon: <Icon />,
    redirectAfterUpdate: "edit",
    group: "resource.groups.system_resources",
    menu: [
        {
            title: "resource.mall.menu_list",
            redirect: "/system/mall",
        },
    /*    {
            title: "Trash",
            redirect: "/system/trash/mall",
        },
    */
        ],
    mainAction: {
        title: "resource.mall.main_action",
        redirect: "inline/create",
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
    listProps: {storeKey: false},
    resetSelectedIdsOnLoad: true,
    /*drawer: true,
    drawerOptions: {
        create: true,
        edit: true,
        view: true
    }*/

},

 {
    roles: [DASHAppConstants.system.SYSTEM_ROLE],
    component: ResourceTemplate,
    trash: true,
    model: "tenant/store/schedule",
    label: "resource.mall.label",
    schema: scheduleSchema,
    icon: <Icon />,
    redirectAfterUpdate: "edit",
    group: "resource.groups.system_resources",
    menu: [
        {
            title: "resource.mall.menu_list",
            redirect: "/system/mall",
        },
    /*    {
            title: "Trash",
            redirect: "/system/trash/mall",
        },
    */
        ],
    mainAction: {
        title: "resource.mall.main_action",
        redirect: "inline/create",
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
    listProps: {storeKey: false},
    resetSelectedIdsOnLoad: true,
    /*drawer: true,
    drawerOptions: {
        create: true,
        edit: true,
        view: true
    }*/

}

];

export default MallResources;
