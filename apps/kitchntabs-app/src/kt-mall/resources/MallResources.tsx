import { IDashAutoAdminResourceConfig } from "dash-auto-admin";
import MallSchema from "../schemas/MallSchema";
import BusinessIcon from "@mui/icons-material/Business";
import TrashTemplate from "dash-admin/resources/Trash/TrashTemplate";
import ResourceTemplate from "dash-admin/templates/ResourceTemplate";
import {DASHAppConstants} from "dash-constants";
import React from "react";

const Icon = BusinessIcon as unknown as React.FC;

const MallResources: IDashAutoAdminResourceConfig[] = [
    {
    roles: [DASHAppConstants.system.SYSTEM_ROLE],
    component: ResourceTemplate,
    trash: true,
    model: "system/mall",
    label: "resource.mall.label",
    schema: MallSchema,
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

}];

export default MallResources;
