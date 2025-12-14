import { IDashAutoAdminAttribute } from "dash-auto-admin";
import { TabStatus, ViewMarketplaceDetail } from "kt-tabs";
import MallOrderProductsFieldV2 from "../components/MallOrderProductsFieldV2";
import MallOrderProducts from "../components/MallOrderProducts";
import MallSessionOrderNotifications from "../components/MallSessionOrderNotifications";
import MallSessionOrderProgress from "../components/MallSessionOrderProgress";
import MallOrderVouchers from "../components/MallOrderVouchers";
import MallOrderToolbarMediator from "../components/MallOrderToolbarMediator";


/**
 * MallTabSchemaV2 - New kiosk-style schema for mall orders
 * 
 * Uses MallOrderProductsFieldV2 which provides:
 * - Horizontal store selector with "All Stores" option
 * - Kiosk-style product grid with horizontal pagination or infinite scroll
 * - Cart summary block with drawer
 * - Search box and assistance button
 * - Featured products highlighting with star icon
 */


// Toolbar mediator: always at the top, only in create mode
const MallTabSchemaV2: IDashAutoAdminAttribute[] = [
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
    // Tab status
    {
        tab: 'Pedido',
        attribute: 'status',
        label: 'Status',
        type: String,
        custom: true,
        inCreate: false,
        inEdit: false,
        inList: false,
        inShow: false,
        component: TabStatus,
    },
    // Marketplace details
    {
        tab: 'Marketplace',
        attribute: 'order',
        label: 'Status',
        type: String,
        custom: true,
        inCreate: false,
        inEdit: false,
        inList: false,
        component: ViewMarketplaceDetail,
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
    // Order progress - displays progress bars for each tenant/store in a mall order
    {
        attribute: 'progress',
        tab: 'Actualizaciones',
        label: 'Progreso',
        type: Object,
        inCreate: false,
        inEdit: true,
        inShow: true,
        inList: false,
        custom: true,
        component: MallSessionOrderProgress,
    },
    // Order notifications - displays notification history for the tab
    {
        attribute: 'notifications',
        tab: 'Actualizaciones',
        label: 'Notificaciones',
        type: Array,
        inCreate: false,
        inEdit: true,
        inShow: true,
        inList: false,
        custom: true,
        component: MallSessionOrderNotifications,
    },
    {
        attribute: 'products',
        tab: 'Vouchers',
        label: 'Vouchers',
        type: Object,
        inCreate: false,
        inEdit: true,
        inShow: true,
        inList: false,
        custom: true,
        component: MallOrderVouchers,
    },
];

export default MallTabSchemaV2;
