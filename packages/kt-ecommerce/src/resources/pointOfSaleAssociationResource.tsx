import { IDashAutoAdminResourceConfig } from "dash-auto-admin";
import pointOfSaleAssociationSchema from "../schemas/pointofsaleAssociationSchema";

import TrashTemplate from "dash-admin/src/resources/Trash/TrashTemplate";
import ResourceTemplate from "dash-admin/src/templates/ResourceTemplate";
import React from "react";

import PointOfSale from "@mui/icons-material/PointOfSale";

const Icon = PointOfSale as unknown as React.FC;
const pointOfSaleAssociationResource: IDashAutoAdminResourceConfig = 
{
    roles: ["*"],
    component: ResourceTemplate,
    model: "ecommerce/point_of_sale_association",
    label: "Asociaciones de Puntos de Venta",
    schema: pointOfSaleAssociationSchema,
    icon: <Icon />,
    group: "Integraciones",
    menu: [
        {
            title: "ver asociaciones",
            redirect: "/ecommerce/point_of_sale_association",
        },
    ],
    mainAction: {
        title: "Agregar",
        redirect: "/ecommerce/point_of_sale_association/inline/create",
        fn: "virtualhash",
    },
    postFormatter: (data) => {
        // Hacky beheaviour: data.connection_params is an array with keys.
        if (data.connection_params) {
            let _connParams = {};
            data.connection_params = Object.keys(
                data.connection_params
            ).forEach((key) => {
                _connParams[key] = data.connection_params[key];
            });
            data.connection_params = _connParams;
        }
        return data;
    },
    exporter: false,
    drawer: true,
    listViewButton: { enabled: false },
   
    listDeleteButton: { enabled: false },
    formGroupMode: "tabs", // groups or tabs

    redirectAfterUpdate: true,
    closeDrawerAfterSave: false,
    mutationMode: "pessimistic",
    refreshAfter: true,
    saveButtonAlwaysEnabled: true,
    processErrors: false,
    listProps: {storeKey: false}, // deshabilita persistencia deel estado, cache de los valores seleccionados sort, page, etc.
    resetSelectedIdsOnLoad: true,
}

export default pointOfSaleAssociationResource;