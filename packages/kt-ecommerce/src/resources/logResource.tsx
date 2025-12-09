import { IDashAutoAdminResourceConfig } from "dash-auto-admin";
import logSchema from "../schemas/log";
import LockClock from "@mui/icons-material/LockClock";
import TrashTemplate from "dash-admin/src/resources/Trash/TrashTemplate";
import ResourceTemplate from "dash-admin/src/templates/ResourceTemplate";
import React from "react";

const Icon = LockClock as unknown as React.FC;

const logResource: IDashAutoAdminResourceConfig = 
{
    roles: ["*"],
    component: ResourceTemplate,
    model: "system/log",
    label: "Logs",
    schema: logSchema,
    icon: <Icon />,
    group: "Logs y Notificaciones",

    menu: [
        {
            title: "Logs",
            redirect: "/system/log",
        },
    ],
    create: false,
    edit: false,
    search: true,
    /*referenceFilters: [
        {
            label: 'Tipo', // filter label'
            source: 'loggeable_type', // id field
            reference: 'log',
            optionText: 'loggeable_type' // field from the model
        },
    ],*/
    saveButtonAlwaysEnabled: true,
    processErrors: false,
    listProps: {storeKey: false}, // deshabilita persistencia deel estado, cache de los valores seleccionados sort, page, etc.
    resetSelectedIdsOnLoad: true,
}

export default logResource;