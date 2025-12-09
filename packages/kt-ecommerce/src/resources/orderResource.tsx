
import { IDashAutoAdminResourceConfig } from "dash-auto-admin";
import orderSchema from "../schemas/order";
import TrashTemplate from "dash-admin/src/resources/Trash/TrashTemplate";
import ResourceTemplate from "dash-admin/src/templates/ResourceTemplate";
import React from "react";
import PointOfSale from "@mui/icons-material/PointOfSale";

const Icon = PointOfSale as unknown as React.FC;

const orderResource: IDashAutoAdminResourceConfig = 
{
    group: "Ventas",
    roles: ["*"],
    component: ResourceTemplate,
    model: "ecommerce/order",
    label: "Órdenes",
    schema: orderSchema,
    icon: <Icon />,
    //listComponent: (resourceConfig) => <Graphs/>,
    menu: [
        {
            title: "Listado de ordenes",
            redirect: "/ecommerce/order",
        },
        {
            title: "Reportes",
            redirect: "/ecommerce/stats",
        },
    ],
    listViewButton: { enabled: true },
    listEditButton: { enabled: false },
    listDeleteButton: { enabled: false },
    listProps: {storeKey: false}, // deshabilita persistencia deel estado, cache de los valores seleccionados sort, page, etc.
    resetSelectedIdsOnLoad: true,
    formGroupMode: "tabs", // groups or tabs
    mutationMode: "pessimistic",
    edit: false,
    saveButtonAlwaysEnabled: true,
    processErrors: false,
}

export default orderResource;