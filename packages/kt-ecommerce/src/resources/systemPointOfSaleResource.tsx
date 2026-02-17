
import { IDashAutoAdminResourceConfig } from "dash-auto-admin";
import systemPointOfSaleSchema from "../schemas/systemPointOfSale";

import Person from "@mui/icons-material/Person";
import TrashTemplate from "dash-admin/src/resources/Trash/TrashTemplate";
import ResourceTemplate from "dash-admin/src/templates/ResourceTemplate";
import {DASHAppConstants} from "dash-constants";
import React from "react";

const Icon = Person as unknown as React.FC;

const systemPointOfSaleResource: IDashAutoAdminResourceConfig = 
{
    roles: [DASHAppConstants.system.SYSTEM_ROLE],
    component: ResourceTemplate,
    trash: true,
    model: "ecommerce/system_point_of_sale",
    label: "Puntos de Venta",
    schema: systemPointOfSaleSchema,
    //references: [{ reference: 'roles', target: 'role', schema: rolesSchema }]
    //references: [{ reference: 'roles', target: 'id', schema: roleSchema }],
    icon: <Icon />,
    group: "System",
    menu: [
        {
            title: "Puntos de venta",
            redirect: "/ecommerce/system_point_of_sale",
        },
        /*{
            title: "🗑",
            redirect: "/ecommerce/system_point_of_sale/trash",
        },*/
    ],
    mainAction: {
        title: "Crear punto de venta",
        // type: "ghost",
        redirect: "ecommerce/system_point_of_sale/create",
    },
    isFormData: true,
    mutationMode: "pessimistic",
    saveButtonAlwaysEnabled: true,
    listProps: {storeKey: false}, // deshabilita persistencia deel estado, cache de los valores seleccionados sort, page, etc.
    resetSelectedIdsOnLoad: true,
}

export default systemPointOfSaleResource;