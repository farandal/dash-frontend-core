import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import ResourceTemplate from 'dash-admin/src/templates/ResourceTemplate';
import { RestaurantMenu } from '@mui/icons-material';
import { dashStorage } from 'dash-utils';
import MallTabSchemaV2 from './schemas/MallTabSchemaV2';
import { MallTabsContextV2, MallClientTabsList } from './components';

/**
 * MallClientAppResourcesV2 - New kiosk-style resource configuration
 * 
 * This configuration uses the new kiosk-style UI for order creation with:
 * - Horizontal store selector with "All Stores" option
 * - Product grid with horizontal pagination or infinite scroll toggle
 * - Cart summary header with drawer
 * - Search box and assistance button per store
 * - Featured products highlighting
 * 
 * The list view maintains the existing MallClientTabsList component.
 * 
 * 
 * MallClientAppResourcesV2
 * ├── ResourceTemplate (from dash-admin)
 * │   ├── MallTabsContextV2 (contextComponent)
 * │   │   ├── MallClientTabsProvider (for list/create modes)
 * │   │   │   └── MallEchoBridgeContext (WebSocket events)
 * │   │   └── TabManagerProvider (for edit/show modes)
 * │   │       └── MallClientTabsProvider
 * │   │           └── MallEchoBridgeContext
 * │   │
 * │   ├── MallClientTabsList (dataGridComponent)
 * │   │   ├── MallClientTabsContext (WebSocket events & tenant statuses)
 * │   │   │   └── MallEchoBridgeContext
 * │   │   ├── OrderProductsView (for displaying order items)
 * │   │   └── TabTimerClock (from kt-tabs)
 * │   │
 * │   └── MallTabSchemaV2 (schema)
 * │       ├── MallOrderProductsFieldV2 (for create mode)
 * │       │   ├── MallOrderCreateView (main create UI)
 * │       │   │   ├── MallOrderCreateProvider (context for cart/products)
 * │       │   │   ├── MallStoreSelector (horizontal store selector)
 * │       │   │   ├── MallAssistanceButton (help request button)
 * │       │   │   ├── MallSearchBox (product search)
 * │       │   │   ├── MallPaginationToggle (pagination mode toggle)
 * │       │   │   ├── MallProductGrid (product display grid)
 * │       │   │   │   └── MallProductCard (individual product cards)
 * │       │   │   └── MallCartSummary (cart header with drawer trigger)
 * │       │   │       └── MallOrderSummaryDrawer (cart details drawer)
 * │       │   │           └── MallCartItemsList (cart items display)
 * │       │   │               ├── CartItem (individual cart items)
 * │       │   │               └── InlineModifiers (modifier selection)
 * │       │   │
 * │       │   ├── MallSessionOrderProgress (progress bars for edit mode)
 * │       │   └── OrderProductsView (product display for view mode)
 * │       │
 * │       └── MallOrderProducts (for edit/show modes)
 * │           ├── MallSessionOrderProgress
 * │           ├── MallSessionOrderNotifications (notification history)
 * │           └── MallCartItemsList
 * │               ├── CartItem
 * │               └── InlineModifiers
 * 
 * Context Providers:
 * 
 * MallOrderCreateProvider (from MallOrderCreateView)
 * ├── Manages: cart items, selected store, search, pagination mode
 * ├── Provides: addToCart, updateQuantity, removeFromCart, etc.
 * └── Used by: MallStoreSelector, MallProductGrid, MallCartSummary, etc.
 * 
 * MallClientTabsProvider (from MallTabsContextV2)
 * ├── Manages: WebSocket events, tenant statuses, notifications
 * ├── Provides: lastEvent, tenantStatusesByTab, notifications
 * └── Used by: MallClientTabsList, MallSessionOrderProgress, etc.
 * 
 * MallEchoBridgeContext (from MallClientWrapper)
 * ├── Bridges: MallSessionEchoContext events to components
 * ├── Provides: WebSocket event forwarding
 * └── Used by: MallClientTabsProvider
 * 
 * EventFlow: 
 * 
 * QR Scan → MallClientWrapper → MallSessionEchoProvider
 *     ↓
 * MallEchoBridgeProvider → MallClientTabsProvider
 *     ↓
 * Components receive events via context:
 * - MallClientTabsList (toast notifications)
 * - MallSessionOrderProgress (status updates)
 * - MallSessionOrderNotifications (history updates)
 */
const MallClientAppResourcesV2: IDashAutoAdminResourceConfig[] = [
    {
        group: "Haz tu orden aquí!",
        roles: ["Public"],
        component: ResourceTemplate,
        model: "tab",
        redirect: "create",
        label: "Haz tu orden aquí!",
        schema: MallTabSchemaV2,
        icon: <RestaurantMenu />,
        
        // Context provider - V2 uses MallTabsContextV2 which doesn't wrap
        // create mode with TabManagerProvider (MallOrderCreateView handles its own context)
        contextComponent: MallTabsContextV2,
        
        // Hide create button in toolbar (we have menu actions)
        toolbarCreateButton: { enabled: false },
        
        // Custom list component with progress bars and notifications
        dataGridComponent: MallClientTabsList,
        
        // Menu configuration
        menu: [
            {
                title: "☰ Tus ordenes",
                redirect: "tab",
            },
            {
                title: "★ Nueva Orden",
                redirect: "tab/create",
            },
        ],
        
        // Main action button
        mainAction: {
            title: "⊕ Hacer un pedido",
            fn: "redirect",
            mode: "create",
            redirect: "create",
        },
        
        // Form configuration
        mutationMode: "pessimistic",
        saveButtonAlwaysEnabled: true,
        processErrors: true,
        exporter: false,
        formGroupMode: "tabs",
        
        // List configuration
        listProps: { 
            storeKey: false, 
            empty: false 
        },
        
        // Behavior after operations
        resetSelectedIdsOnLoad: true,
        closeDrawerAfterSave: true,
        showNotifyAfterSubmit: false,
        showDialogAfterSubmit: false,
        redirectAfterCreate: "list",
        redirectAfterUpdate: "edit",
        refreshAfter: true,
        
        /**
         * beforeSubmit - Intercept form submission to inject customer data
         * 
         * The MallAppMediator component handles customer data collection via a modal.
         * This hook retrieves the stored customer data and adds it to the form values.
         */
        beforeSubmit(values) {
            const orderData = dashStorage.getItem('orderData');
            const { name, tableNumber } = orderData 
                ? JSON.parse(orderData) 
                : { name: null, tableNumber: null };
            
            if (!name || !tableNumber) {
                throw new Error("MISSING_SESSION_DATA");
            }

            values["customer_name"] = name;
            values["table_number"] = tableNumber;

            return values;
        },

        /**
         * onError - Handle form submission errors
         * 
         * When MISSING_SESSION_DATA error is thrown, dispatch event to open
         * the customer data modal (handled by MallAppMediator component).
         */
        onError(mode, error) {
            if (mode === "create" && error.message === "MISSING_SESSION_DATA") {
                window.dispatchEvent(new CustomEvent('enter-public-order-data'));
                return;
            }
            throw new Error(error.message);
        },
    },
];

export default MallClientAppResourcesV2;
