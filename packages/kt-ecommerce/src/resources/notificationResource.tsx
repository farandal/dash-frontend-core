import { IDashAutoAdminResourceConfig } from "dash-auto-admin";
import notificationSchema from "../schemas/notification";
import NotificationImportant from "@mui/icons-material/NotificationImportant";
import TrashTemplate from "dash-admin/src/resources/Trash/TrashTemplate";
import ResourceTemplate from "dash-admin/src/templates/ResourceTemplate";
import React from "react";

const Icon = NotificationImportant as unknown as React.FC;

const notificationResource: IDashAutoAdminResourceConfig = 
{
    roles: ["*"],
    component: ResourceTemplate,
    model: "system/notification",
    label: "Notifications",
    schema: notificationSchema,
    //references: [{ reference: 'roles', target: 'role', schema: rolesSchema }]
    //references: [{ reference: 'roles', target: 'id', schema: roleSchema }],
    icon: <Icon />,
    group: "Logs y Notificaciones",
    menu: [
        {
            title: "Notificaciones",
            redirect: "/system/notification",
        },
    ],
    create: false,
    edit: false,

    //listDeleteButton: { enabled: true }

    drawer: true,
    listViewButton: { enabled: true },
    listEditButton: { enabled: false },
    listDeleteButton: { enabled: false },

    formGroupMode: "tabs", // groups or tabs
    mutationMode: "pessimistic",
    search: true,
    saveButtonAlwaysEnabled: true,
    listProps: {storeKey: false}, // deshabilita persistencia deel estado, cache de los valores seleccionados sort, page, etc.
    resetSelectedIdsOnLoad: true,
}

export default notificationResource;