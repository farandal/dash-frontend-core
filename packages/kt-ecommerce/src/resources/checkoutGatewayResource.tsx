import { IDashAutoAdminResourceConfig } from "dash-auto-admin";
import checkoutGatewaySchema from "../schemas/checkoutGateway";
import CreditCard from "@mui/icons-material/CreditCard";
import ResourceTemplate from "dash-admin/src/templates/ResourceTemplate";
import { DASHAppConstants } from "dash-constants";
import React from "react";

const Icon = CreditCard as unknown as React.FC;

/**
 * CheckoutGateway instance resource (kitchntabs-web) — used by TenancyAdmin and assigned
 * TenantAdmin. Create from an entitled provider, assign stores, then configure credentials and
 * set the per-store default from the edit view.
 */
const checkoutGatewayResource: IDashAutoAdminResourceConfig = {
    roles: [DASHAppConstants.system.TENANT_ROLE],
    component: ResourceTemplate,
    model: "checkout/checkout_gateway",
    label: "Checkout Gateways",
    schema: checkoutGatewaySchema,
    icon: <Icon />,
    group: "resource.groups.integrations",
    menu: [
        {
            title: "Checkout Gateways",
            redirect: "/checkout/checkout_gateway",
        },
    ],
    mainAction: {
        title: "Crear checkout gateway",
        redirect: "/checkout/checkout_gateway/create",
    },
    redirectAfterUpdate: "edit",
    redirectAfterCreate: "edit",
    mutationMode: "pessimistic",
    saveButtonAlwaysEnabled: true,
    refreshAfter: true,
    listProps: { storeKey: false },
    resetSelectedIdsOnLoad: true,
};

export default checkoutGatewayResource;
