import { StatsLayout } from "../components/Stats/StatsLayout";
import { IDashAutoAdminResourceConfig } from "dash-auto-admin";
import orderSchema from "../schemas/order";

import TrashTemplate from "dash-admin/src/resources/Trash/TrashTemplate";
import ResourceTemplate from "dash-admin/src/templates/ResourceTemplate";
import React from "react";

import PointOfSale from "@mui/icons-material/PointOfSale";

const Icon = PointOfSale as unknown as React.FC;

const orderStatsResource: IDashAutoAdminResourceConfig = 
{
    group: 'Ventas',
    roles: ["*"],
    component: ResourceTemplate,
    model: 'ecommerce/order/stats',
    label: 'Estadísticas',
    schema: orderSchema,
    icon: <Icon />,
    listComponent: (resourceConfig) => <StatsLayout resourceConfig={resourceConfig} />,
    menu: [{
        title: "Listado de ordenes",
        redirect: "/ecommerce/order",
        },
        {
            title: "Reporte",
            redirect: "/ecommerce/order/stats",
        },
    ],
    listViewButton: { enabled: true },
    listEditButton: { enabled: false },
    listDeleteButton: { enabled: false },
    formGroupMode: "groups", // groups or tabs
    saveButtonAlwaysEnabled: true,
processErrors: false,
    mutationMode: "pessimistic",
    edit:false,
    drawer: true
}

export default orderStatsResource;