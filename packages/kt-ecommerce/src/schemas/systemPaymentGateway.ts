import { SystemPaymentGatewayTenancyAssociator } from "../components/PaymentGateway/SystemPaymentGatewayTenancyAssociator";
import SystemPaymentGatewayImage from "../components/SystemPaymentGatewayImage";
import SystemPaymentGatewayIcon from "../components/SystemPaymentGatewayIcon";
import { IDashAutoAdminAttribute } from "dash-auto-admin";
import { SelectInput, BooleanInput } from "react-admin";


const systemPaymentGatewaySchema: IDashAutoAdminAttribute[] = [

    {
        attribute: 'icon_url',
        label: 'Icon',
        type: "custom",
        component: SystemPaymentGatewayIcon,
        inList: true,
        inEdit: false,
        inCreate: false,
        inShow: false
    },

    {
        attribute: 'name',
        label: 'Name',
        type: String
    },

    {
        label: "Service Class",
        attribute: 'class',
        type: 'system/system_payment_gateway/availableClasses.id',
        pagination: false,
        multiple: false,
        component: SelectInput,
        inList: true,
        inCreate: true,
        inEdit: true,
    },

    {
        attribute: 'is_active',
        label: 'Active',
        type: Boolean,
        inList: true,
        inCreate: true,
        inEdit: true,
    },

    {
        attribute: 'region',
        label: 'Region',
        type: String,
        inList: true,
        inCreate: true,
        inEdit: true,
    },

    {
        attribute: 'icon',
        listAttribute: 'icon_url',
        type: String,
        custom: true,
        component: SystemPaymentGatewayImage,
        inList: false,
        label: "Logo",
        processor: "File"
    },

    {
        attribute: 'tenancy_ids',
        type: String,
        custom: true,
        component: SystemPaymentGatewayTenancyAssociator,
        inList: false,
        inCreate: false,
        inEdit: true,
        inShow: false
    }

];

export default systemPaymentGatewaySchema;
