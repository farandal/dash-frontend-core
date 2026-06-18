import { IDashAutoAdminAttribute } from "dash-auto-admin";


// Direct imports for lightweight components (avoid barrel exports for tree-shaking)
//import MallSessionOrderNotifications from "../components/MallSessionOrderNotifications";
import MallSessionOrderProgress from "../components/MallSessionOrderProgress";
import MallOrderVouchers from "../components/MallOrderVouchers";
import MallOrderToolbarMediator from "../components/MallOrderToolbarMediator";
import { MallOrderProducts, MallOrderProductsFieldV2 } from "../components";



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
   /*
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
    */
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
    /*{
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
    },*/

];


// Lazy load all heavy components for better code splitting
/*
const TabStatus = lazy(() => import("kt-tabs/src/components/TabStatus"));
const ViewMarketplaceDetail = lazy(() => import("kt-tabs/src/components/Tab/ViewMarketplaceDetail"));
const MallOrderProductsFieldV2 = lazy(() => import("../components/MallOrderProductsFieldV2"));
const MallOrderProducts = lazy(() => import("../components/MallOrderProducts"));
const MallSessionOrderNotifications = lazy(() => import("../components/MallSessionOrderNotifications"));
const MallSessionOrderProgress = lazy(() => import("../components/MallSessionOrderProgress"));
const MallOrderVouchers = lazy(() => import("../components/MallOrderVouchers"));
const MallOrderToolbarMediator = lazy(() => import("../components/MallOrderToolbarMediator"));
*/

// Loading fallback for form fields
/*const FieldLoader = () => (
    <Box sx={{ p: 2 }}>
        <Skeleton variant="rectangular" height={100} />
    </Box>
);*/

/*
// Wrapper factory for lazy components with Suspense
const withSuspense = <P extends object>(
    LazyComponent: React.LazyExoticComponent<React.ComponentType<P>>,
    fallback: React.ReactNode = <FieldLoader />
): React.FC<P> => {
    return function SuspenseWrapper(props: P) {
        return (
            <Suspense fallback={fallback}>
                <LazyComponent {...props} />
            </Suspense>
        );
    };
};

// Create suspense-wrapped components
const LazyMallOrderProductsFieldV2 = withSuspense(MallOrderProductsFieldV2);
const LazyMallOrderProducts = withSuspense(MallOrderProducts);
const LazyMallSessionOrderNotifications = withSuspense(MallSessionOrderNotifications);
const LazyMallSessionOrderProgress = withSuspense(MallSessionOrderProgress);
const LazyMallOrderVouchers = withSuspense(MallOrderVouchers);
const LazyMallOrderToolbarMediator = withSuspense(MallOrderToolbarMediator, null);
const LazyTabStatus = withSuspense(TabStatus, <Skeleton width={100} height={32} />);
const LazyViewMarketplaceDetail = withSuspense(ViewMarketplaceDetail);
*/

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

export default MallTabSchemaV2;
