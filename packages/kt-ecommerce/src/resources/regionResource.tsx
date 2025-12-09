import { IDashAutoAdminResourceConfig } from "dash-auto-admin";
import communesSchema from "../schemas/communes";
import regionSchema from "../schemas/region";
import LocationCity from "@mui/icons-material/LocationCity";
import TrashTemplate from "dash-admin/src/resources/Trash/TrashTemplate";
import ResourceTemplate from "dash-admin/src/templates/ResourceTemplate";
import React from "react";

const Icon = LocationCity as unknown as React.FC;

const regionResource: IDashAutoAdminResourceConfig = 
{
    roles: ["*"],
    component: ResourceTemplate,
    model: 'system/region',
    label: 'Regiones',
    icon: <Icon />,
    group: 'Recursos de sistema',
    menu: [{
        title: "Regiones",
        redirect: "/system/region/list",
    }],
    mainAction: {
        title: "Agregar Comuna",
        // type: "ghost",
        redirect: "/system/region/create"
    },
    references: [
        { reference: 'commune', tab: 'Comunas', target: 'region_id', schema: communesSchema, type: "ReferenceManyField" },
    ],
    schema: regionSchema

}

export default regionResource;