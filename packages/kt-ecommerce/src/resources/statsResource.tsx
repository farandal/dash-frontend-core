import { IDashAutoAdminResourceConfig } from "dash-auto-admin";
import orderSchema from "../schemas/order";
import PointOfSale from "@mui/icons-material/PointOfSale";
import TrashTemplate from "dash-admin/src/resources/Trash/TrashTemplate";
import ResourceTemplate from "dash-admin/src/templates/ResourceTemplate";
import React from "react";

const Icon = PointOfSale as unknown as React.FC;

const statsResource: IDashAutoAdminResourceConfig = 
{
    model: "ecommerce/stats",
    group: "Ventas",
    roles: ["*"],
    icon: <Icon />,
    //component: TenantMarketplaceResource,
    //customRoute: true,
    customRoutes: (resourceConfig) => {
        return (
            <>
                <Route
                    path={resourceConfig.model + "/:id"}
                    element={resourceConfig.component(resourceConfig)}
                />
                <Route
                    path={resourceConfig.model}
                    element={resourceConfig.component(resourceConfig)}
                />
            </>
        );
    },
    component: (resourceConfig) => (
        <Graphs resourceConfig={resourceConfig} />
    ),
    label: "Estadísticas",
    schema: orderSchema,
    //references: [{ reference: 'roles', target: 'role', schema: rolesSchema }]
    //references: [{ reference: 'roles', target: 'id', schema: roleSchema }],


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
    /*mainAction: {
        title: "Ordenes",
        // type: "ghost",
        redirect: "/marketplace/create"
    },*/
    //drawer: true,
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

export default statsResource;