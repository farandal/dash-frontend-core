import { IDashAutoAdminAttribute } from "dash-auto-admin";
import SelfServiceOrderCreateView from "../components/SelfServiceOrderCreateView";

import SelfServiceOrderVoucher from "../components/SelfServiceOrderVoucher";
import SelfServiceOrderTimeline from "../components/SelfServiceOrderTimeline";

// SelfServiceTabSchema - Kiosk-style schema for self-service orders
const SelfServiceTabSchema: IDashAutoAdminAttribute[] = [
    // Products field with kiosk-style UI for create mode ONLY
    {
        attribute: 'products',
        tab: 'Productos',
        label: 'Order',
        type: Array,
        inCreate: true,
        inEdit: false,
        inList: false,
        inShow: false,
        custom: true,
        component: SelfServiceOrderCreateView,
    },
    // View mode fields
    {
        attribute: 'status',
        tab: 'Status',
        label: 'Status',
        type: String,
        inCreate: false,
        inEdit: true, // Show basic status field in edit/show
        inShow: true,
    },
    {
        attribute: 'order.total_amount',
        tab: 'Total',
        label: 'Total',
        type: String,
        inCreate: false,
        inEdit: true,
        inShow: true,
    },
    // Timeline / Updates
    {
        attribute: 'created_at', // Use unique existing field
        tab: 'Actualizaciones',
        label: 'Progreso',
        type: Object,
        inCreate: false,
        inEdit: true,
        inShow: true,
        inList: false,
        custom: true,
        component: SelfServiceOrderTimeline,
    },
    // Voucher
    {
        attribute: 'updated_at', // Use unique existing field
        tab: 'Voucher',
        label: 'Voucher',
        type: Object,
        inCreate: false,
        inEdit: true,
        inShow: true,
        inList: false,
        custom: true,
        component: SelfServiceOrderVoucher,
    }
];

export default SelfServiceTabSchema;
