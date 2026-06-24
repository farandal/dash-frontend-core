import { IDashAutoAdminAttribute } from "dash-auto-admin";
import { SelectInput } from "react-admin";
import TenantIdsSelector from "../components/TenantIdsSelector";
import CheckoutGatewayConfiguration from "../components/Checkout/CheckoutGatewayConfiguration";

/**
 * CheckoutGateway instance — TenancyAccount creates from an entitled provider; TenancyAdmin /
 * assigned TenantAdmin configure credentials and pick the per-store default.
 */
const checkoutGatewaySchema: IDashAutoAdminAttribute[] = [
    {
        attribute: "name",
        label: "Nombre",
        type: String,
    },
    {
        label: "Proveedor",
        attribute: "system_checkout_gateway_id",
        type: "checkout/system_checkout_gateway.name",
        pagination: false,
        multiple: false,
        component: (props: any) => <SelectInput {...props} options={{ refetchOnWindowFocus: false }} />,
        inList: true,
        inCreate: true,
        inEdit: false,
        inShow: true,
    },
    {
        attribute: "active",
        label: "Activa",
        type: Boolean,
        inList: true,
        inCreate: false,
        inEdit: false,
    },
    {
        // Which stores (tenants) this instance serves; bound to tenant_ids, synced on save.
        attribute: "tenant_ids",
        type: String,
        custom: true,
        component: TenantIdsSelector,
        inList: false,
        inCreate: true,
        inEdit: true,
        inShow: false,
    },
    {
        // Credentials form + verify + set-default (edit only).
        attribute: "configuration",
        type: String,
        custom: true,
        component: CheckoutGatewayConfiguration,
        inList: false,
        inCreate: false,
        inEdit: true,
        inShow: false,
    },
];

export default checkoutGatewaySchema;
