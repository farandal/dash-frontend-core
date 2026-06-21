import { IDashAutoAdminResourceConfig } from "dash-auto-admin";
import systemCheckoutGatewaySchema from "../schemas/systemCheckoutGateway";
import Payment from "@mui/icons-material/Payment";
import ResourceTemplate from "dash-admin/src/templates/ResourceTemplate";
import { DASHAppConstants } from "dash-constants";
import React from "react";

const Icon = Payment as unknown as React.FC;

/**
 * SystemCheckoutGateway admin resource (SystemAdmin only) — the platform catalog of Checkout
 * Gateway Providers + their entitlement to TenancyAccounts. Mirrors systemMarketplaceResource,
 * minus the icon upload (so it's a plain create/update, no multipart PUT override).
 */
const systemCheckoutGatewayResource: IDashAutoAdminResourceConfig = {
    roles: [DASHAppConstants.system.SYSTEM_ROLE],
    component: ResourceTemplate,
    model: "checkout/system_checkout_gateway",
    label: "Checkout Gateways",
    schema: systemCheckoutGatewaySchema,
    icon: <Icon />,
    redirectAfterUpdate: "edit",
    group: "System",
    menu: [
        {
            title: "Checkout Gateways",
            redirect: "/checkout/system_checkout_gateway",
        },
    ],
    mainAction: {
        title: "Crear checkout gateway",
        redirect: "checkout/system_checkout_gateway/create",
    },
    mutationMode: "pessimistic",
    saveButtonAlwaysEnabled: true,
    refreshAfter: true,
    listProps: { storeKey: false },
    resetSelectedIdsOnLoad: true,
};

export default systemCheckoutGatewayResource;
