
import { IDashAutoAdminResourceConfig } from "dash-auto-admin";
import tenantMarketplaceSchema from "../schemas/tenantMarketplace";
import Business from "@mui/icons-material/Business";
import { Card, Grid } from "@mui/material";
import TrashTemplate from "dash-admin/src/resources/Trash/TrashTemplate";
import ResourceTemplate from "dash-admin/src/templates/ResourceTemplate";
import {DASHAppConstants} from "dash-constants";
import React from "react";

const Icon = Business as unknown as React.FC;

const marketplaceResource: IDashAutoAdminResourceConfig =
{
    roles: [DASHAppConstants.system.TENANT_ROLE],
    //component: TenantMarketplaceResource,
    component: ResourceTemplate,
    model: "ecommerce/marketplace",
    label: "Marketplaces",
    schema: tenantMarketplaceSchema,
    //references: [{ reference: 'roles', target: 'role', schema: rolesSchema }]
    //references: [{ reference: 'roles', target: 'id', schema: roleSchema }],

    icon: <Icon />,
    group: "Integraciones",
    menu: [
        {
            title: "ver marketplaces",
            redirect: "/ecommerce/marketplace",
        },
    ],
    mainAction: {
        title: "Agregar Marketplace",
        // type: "ghost",
        redirect: "/ecommerce/marketplace/create",
    },
    exporter: false,
    drawer: false,
    listViewButton: { enabled: false },
    listEditButton: { enabled: true },
    //listEditButton: { enabled: true, component: QuickEditButton, props: { icon: <Icons.Bolt />, label: "", resource: "marketplace/inline", navigation:"virtualhash", navigate: (id) => id, size: "small", color: "secondary" }},
    listDeleteButton: { enabled: false },
    formGroupMode: "layout", // groups or tabs
    /*
    editLayout: (render) => {
        return (
            <div className="dash-box">
                <Card>
                    <div
                        style={{
                            padding: "26px 29px",
                            textAlign: "left",
                        }}
                    >
                        <span className="card-title">
                            Conexión
                        </span>
                    </div>
                    <div
                     style={{
                        padding: "8px",
                        textAlign: "left",
                    }}
                    >
                        {render("Conexión")}
                    </div>
                </Card>
                <Card className="widget">
                    <div
                        style={{
                            padding: "26px 29px",
                            textAlign: "left",
                        }}
                    >
                        <span className="card-title">
                            Configuraciones adicionales
                        </span>
                        {render("Configuraciones adicionales")}
                    </div>
                </Card>
                <Card className="widget">
                    <div
                        style={{
                            padding: "10px 29px",
                            textAlign: "left",
                        }}
                    >
                        <span className="card-title">
                            Pruebas
                        </span>
                        {render("Pruebas")}
                    </div>
                </Card>
            </div>        );
    },
    */
   

    mutationMode: "pessimistic",
    postFormatter: (params) => {
      
        // Hacky beheaviour: data.connection_params is an array with keys.
        if (params.connection_params) {
            let _connParams = {};
            params.connection_params = Object.keys(
                params.connection_params
            ).forEach((key) => {
                _connParams[key] = params.connection_params[key];
            });
            params.connection_params = _connParams;
        }
        return params;
    },
    saveButtonAlwaysEnabled: true,
    processErrors: false,
    redirectAfterUpdate: false,
    refreshAfter: true,
    listProps: { storeKey: false }, // deshabilita persistencia deel estado, cache de los valores seleccionados sort, page, etc.
    resetSelectedIdsOnLoad: true,
}

export default marketplaceResource;