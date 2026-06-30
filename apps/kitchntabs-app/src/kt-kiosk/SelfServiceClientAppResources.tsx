import React from 'react';
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import ResourceTemplate from 'dash-admin/templates/ResourceTemplate';
import { RestaurantMenu } from '@mui/icons-material';
import { dashStorage } from 'dash-utils';

// Use the same components as Mall, but with Self-Service configuration
import MallTabsContextV2 from './components/MallTabsContextV2';
import MallClientTabsList from './components/MallClientTabsList';
import SelfServiceMallListWrapper from './components/SelfServiceMallListWrapper';
import SelfServiceTabSchemaV2 from './schemas/SelfServiceTabSchemaV2';

/**
 * SelfServiceClientAppResources - Self-Service kiosk resource configuration
 * 
 * Uses the same UI components as MallClientAppResourcesV2 but configured
 * for self-service (single-tenant) mode with different API endpoints:
 * - Products: /public/selfservice/{tenantSlug}/products
 * - Tabs: /public/selfservice/tab
 * - Session: selfservice-session-hash storage key
 * 
 * The `config` object is passed through to MallTabsContextV2 which
 * configures all child providers (MallClientTabsProvider, MallOrderCreateProvider)
 * with the appropriate paths and settings.
 */
const SelfServiceClientAppResources: IDashAutoAdminResourceConfig[] = [
    {
        group: "selfservice.menu.order_here",
        roles: ["Public"],
        component: ResourceTemplate,
        model: "tab",
        redirect: "create",
        label: "selfservice.menu.order_here",
        schema: SelfServiceTabSchemaV2,
        icon: <RestaurantMenu />,
        
        // Context provider - uses MallTabsContextV2 with self-service config
        contextComponent: MallTabsContextV2,
        
        // Self-Service specific configuration
        // This is passed to MallTabsContextV2 which distributes it to child providers
        config: {
            // Use template for dynamic path - {hash} is replaced at runtime with session hash
            productsPathTemplate: 'public/selfservice/{hash}/products',
            // Categories for filtering (replaces stores in single-tenant mode)
            categoriesPathTemplate: 'public/selfservice/{hash}/categories',
            tenantSlugStorageKey: 'selfservice-tenant-slug',
            // No stores in self-service mode (single tenant)
            storesPath: '', // Empty - not used in single tenant mode
            singleTenantMode: true,
            sessionStorageKey: 'selfservice-session-hash',
            apiPathPrefix: '/public/selfservice',
        },
        
        // Hide create button in toolbar (we have menu actions)
        toolbarCreateButton: { enabled: false },
        toolbarSaveButton: { props: { label: "selfservice.menu.checkout", alwaysEnable: false } },
        
        // Custom list component with progress bars and notifications
        dataGridComponent: SelfServiceMallListWrapper,
        
        // Menu configuration
        menu: [
            {
                title: "selfservice.menu.your_orders",
                redirect: "tab",
            },
            {
                title: "selfservice.menu.new_order",
                redirect: "tab/create",
            },
        ],
        
        // Main action button
        mainAction: {
            title: "selfservice.menu.place_order",
            fn: "redirect",
            mode: "create",
            redirect: "create",
        },
        
        // Form configuration
        mutationMode: "pessimistic",
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
         * Uses selfservice storage keys instead of mall storage
         */
        beforeSubmit(values) {
            const orderData = dashStorage.getItem('orderData');
            const name = orderData?.name ?? null;
            const tableNumber = orderData?.tableNumber ?? null;
            const deliveryMethod = orderData?.deliveryMethod ?? null;
            
            // Also get session hash for self-service
            const sessionHash = dashStorage.getItem('selfservice-session-hash');
            
            // Name is always required
            if (!name) {
                throw new Error("MISSING_SESSION_DATA");
            }

            // Table number is only required for TABLE delivery method
            const effectiveDeliveryMethod = deliveryMethod || 'TABLE';
            if (effectiveDeliveryMethod === 'TABLE' && !tableNumber) {
                throw new Error("MISSING_SESSION_DATA");
            }

            values["customer_name"] = name;
            values["table_number"] = effectiveDeliveryMethod === 'TABLE' ? tableNumber : null;
            values["delivery_method"] = effectiveDeliveryMethod;
            values["selfservice_session"] = sessionHash;

            return values;
        },

        /**
         * onError - Handle form submission errors
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

export default SelfServiceClientAppResources;
