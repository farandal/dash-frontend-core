import { PointOfSaleSync } from "../components/PointOfSale/PointOfSaleSync";
import { IDashAutoAdminResourceConfig } from "dash-auto-admin";
import pointOfSaleSchema from "../schemas/pointofsaleSchema";

import TrashTemplate from "dash-admin/src/resources/Trash/TrashTemplate";
import ResourceTemplate from "dash-admin/src/templates/ResourceTemplate";
import React from "react";
import { Route } from "react-router-dom";
import PointOfSale from "@mui/icons-material/PointOfSale";
import {DASHAppConstants} from "dash-constants";

const Icon = PointOfSale as unknown as React.FC;
const pointOfSaleResource: IDashAutoAdminResourceConfig = 
{
   roles: [DASHAppConstants.system.TENANT_ROLE],
    //component: TenantMarketplaceResource,
    component: ResourceTemplate,
    /*customRoutes: (resourceConfig) => {
        return (
            <>
                <Route
                    path={resourceConfig.model + "/sync"}
                    element={
                        <PointOfSaleSync resourceConfig={resourceConfig} />
                    }
                />
                {TrashTemplate(resourceConfig)}
            </>
        );
    },*/

    model: "ecommerce/point_of_sale",
    label: "Puntos de Venta",
    schema: pointOfSaleSchema,
    //references: [{ reference: 'roles', target: 'role', schema: rolesSchema }]
    //references: [{ reference: 'roles', target: 'id', schema: roleSchema }],
    icon: <Icon />,
    group: "Integraciones",
    menu: [
        {
            title: "listado de puntos de venta",
            redirect: "/ecommerce/point_of_sale",
        },
    ],
    mainAction: {
        title: "Agregar Punto de Venta",
        // type: "ghost",
        redirect: "/ecommerce/point_of_sale/inline/create",
        fn: "virtualhash",
        /*onClick: () => {

            history.replaceState(null, null, `#/point_of_sale/inline/create`);
            window.dispatchEvent(new MessageEvent('virtualhash',{data:`#/point_of_sale/inline/create`}) );
        }*/
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
    showNotifyAfterSubmit: true,
    refreshAfter: true,
    formGroupMode: "tabs", // groups or tabs

    showDialogAfterSubmit: true,
    redirectAfterUpdate: true,
    closeDrawerAfterSave: false,

    mutationMode: "pessimistic",
    saveButtonAlwaysEnabled: true,
    processErrors: false,
    listProps: {storeKey: false}, // deshabilita persistencia deel estado, cache de los valores seleccionados sort, page, etc.
    resetSelectedIdsOnLoad: true,
}

export default pointOfSaleResource;