import { IDashAutoAdminAttribute } from "dash-auto-admin";

// Direct imports for lightweight components
import MallOrderToolbarMediator from "../components/MallOrderToolbarMediator";
import { MallOrderProducts, MallOrderProductsFieldV2 } from "../components";

// Import Self-Service specific components
import SelfServiceOrderVoucher from "../../kt-selfservice/components/SelfServiceOrderVoucher";
import SelfServiceOrderTimeline from "../../kt-selfservice/components/SelfServiceOrderTimeline";
import SelfServiceOrderActions from "../components/SelfServiceOrderActions";


// Toolbar mediator: always at the top, only in create mode
const SelfServiceTabSchemaV2: IDashAutoAdminAttribute[] = [
    {
        attribute: 'toolbar',
        tab: 'Productos',
        label: '',
        type: Object,
        inCreate: true,
        inEdit: false,
        inShow: false,
        inList: false,
        custom: true,
        component: MallOrderToolbarMediator
    },
    // Products field with new kiosk-style UI for create mode ONLY
    {
        attribute: 'products',
        tab: 'Productos',
        label: 'Tab',
        type: Array,
        inCreate: true,
        inEdit: false,
        inList: false,
        inShow: false,
        custom: true,
        component: MallOrderProductsFieldV2,
    },
    // Products display for edit/show modes (requires TabManagerProvider)
    {
        attribute: 'products',
        tab: 'Productos',
        label: 'Productos',
        type: Array,
        inCreate: false,  // NOT in create - use MallOrderProductsFieldV2 instead
        inEdit: true,
        inShow: true,
        inList: false,
        custom: true,
        component: MallOrderProducts,
    },
    // Order total
    {
        attribute: 'order.total_amount',
        tab: 'Productos',
        label: 'Total',
        type: String,
        inCreate: false,
        inEdit: false,
        inShow: false,
    },
    // Payment status
    {
        attribute: 'order.is_paid',
        tab: 'Productos',
        label: 'Pago',
        type: Boolean,
        inCreate: false,
        inEdit: false,
        inShow: false,
    },
    // Creation date
    {
        tab: 'Datos',
        attribute: 'date_created',
        label: 'creación',
        type: Date,
        fieldProps: { showTime: true },
        inCreate: false,
        inList: false,
        inEdit: false,
        inShow: false,
    },
    // Confirmation date
    {
        tab: 'Datos',
        attribute: 'date_confirmed',
        label: 'ingresada',
        type: Date,
        fieldProps: { showTime: true },
        inCreate: false,
        inEdit: false,
        inShow: false,
    },
    // Order Actions - Pay Online, Confirm, Cancel
    // Shown on order card after creation in Productos tab
    {
        attribute: 'actions',
        tab: 'Productos',
        label: '',
        type: Object,
        inCreate: false,
        inEdit: true,  // Show in edit (after order created)
        inShow: true,  // Show in show view
        inList: false,
        custom: true,
        component: SelfServiceOrderActions,
    },
    // Order progress - Replaced with SelfServiceOrderTimeline
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
    // Voucher - Replaced with SelfServiceOrderVoucher
    {
        attribute: 'updated_at', // Use unique existing field
        tab: 'Vouchers',
        label: 'Vouchers',
        type: Object,
        inCreate: false,
        inEdit: true,
        inShow: true,
        inList: false,
        custom: true,
        component: SelfServiceOrderVoucher,
    },
];

export default SelfServiceTabSchemaV2;
