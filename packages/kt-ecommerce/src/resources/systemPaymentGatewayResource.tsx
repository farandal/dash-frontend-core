
import { IDashAutoAdminResourceConfig } from "dash-auto-admin";
import systemPaymentGatewaySchema from "../schemas/systemPaymentGateway";
import Payment from "@mui/icons-material/Payment";
import ResourceTemplate from "dash-admin/src/templates/ResourceTemplate";
import {DASHAppConstants} from "dash-constants";
import React from "react";

const Icon = Payment as unknown as React.FC;

const systemPaymentGatewayResource: IDashAutoAdminResourceConfig = 
{
    roles: [DASHAppConstants.system.SYSTEM_ROLE],
    component: ResourceTemplate,
    trash: true,
    model: "system/system_payment_gateway",
    label: "Payment Gateways",
    schema: systemPaymentGatewaySchema,
    icon: <Icon />,
    redirectAfterUpdate: "edit",
    group: "System",
    menu: [
        {
            title: "Payment Gateways",
            redirect: "/system/system_payment_gateway",
        },
    ],
    mainAction: {
        title: "Add Payment Gateway",
        redirect: "system/system_payment_gateway/create",
    },
    isFormData: true,
    mutationMode: "pessimistic",
    saveButtonAlwaysEnabled: true,
    refreshAfter: true,
    postFormatter: (params) => {
        params._method = "PUT";
        if (params.meta) {
            params.meta = { ...params.meta, method: "POST" };
        } else {
            params.meta = { method: "POST" };
        }

        return params;
    },
    listProps: {storeKey: false},
    resetSelectedIdsOnLoad: true,
}

export default systemPaymentGatewayResource;