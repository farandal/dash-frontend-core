import { IDashAutoAdminAttribute } from "dash-auto-admin";
import { SelectInput, BooleanInput } from "react-admin";
import { SystemCheckoutGatewayTenancyAssociator } from "../components/Checkout/SystemCheckoutGatewayTenancyAssociator";

/**
 * SystemCheckoutGateway (Checkout Gateway Provider catalog) — SystemAdmin.
 * Register a provider class as a catalog entry and entitle TenancyAccounts to it.
 */
const systemCheckoutGatewaySchema: IDashAutoAdminAttribute[] = [
    {
        attribute: "name",
        label: "Nombre",
        type: String,
    },
    {
        label: "Clase (proveedor)",
        attribute: "class",
        type: "checkout/system_checkout_gateway/availableClasses.id",
        pagination: false,
        multiple: false,
        component: SelectInput,
        inList: true,
    },
    {
        attribute: "region",
        label: "Región",
        type: String,
    },
    {
        attribute: "is_active",
        label: "Activo",
        type: Boolean,
        component: BooleanInput,
        inList: true,
    },
    {
        attribute: "tenancy_ids",
        type: String,
        custom: true,
        component: SystemCheckoutGatewayTenancyAssociator,
        inList: false,
        inCreate: false,
        inEdit: true,
        inShow: false,
    },
];

export default systemCheckoutGatewaySchema;
