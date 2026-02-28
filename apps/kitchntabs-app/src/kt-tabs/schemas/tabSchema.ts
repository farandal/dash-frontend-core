
import { IDashAutoAdminAttribute } from "dash-auto-admin";
import OrderProducts from "../components/OrderProducts";
import TabStatus from "../components/TabStatus";
import ViewMarketplaceDetail from "../components/Tab/ViewMarketplaceDetail";
import OrderProductsField from "../components/tab2/OrderProductsField";
import TabActionButtonsField from "../components/tab2/components/TabActionButtonsField";
import TabOrderProductsSelector from "../components/Tab/TabOrderProductsSelector";
import TabAgentToolbar from "../components/Tab/TabAgentToolbar";
import ViewOrder from "../components/Tab/ViewOrder";
import TabTotalAmountField from "../components/Tab/TabTotalAmountField";
import { DeliveryMethodField, TableNumberField } from "../../dash-extensions/components";
import ProductSearchBox from "../components/Tab/ProductSearchBox";
import CategorySelector from "../components/Tab/CategorySelector";

const tabSchema: IDashAutoAdminAttribute[] = [
   
    // Show view - Tab summary
     {
        attribute: 'ai_toolbar',
        tab: 'tab.tab.productos',
        label: '',
        type: String,
        inCreate: true,
        inEdit: true,
        inList: false,
        inShow: false,
        custom: true,
        component: TabAgentToolbar,
        componentProps: {
            config: {
                enableVoice: true,
                enableImage: true,
                autoApply: true,
                compact: true,
                showStatus: true,
            }
        }
    },
    {
        tab: 'tab.tab.comanda',
        attribute: 'actions',
        label: 'tab.attribute.actions',
        type: String,
        custom: true,
        inCreate: false,
        inEdit: true,
        inList: false,
        inShow: true,
        component: TabActionButtonsField,
        /*componentProps: {
            shoeCloseButton: true,
        }*/
    },
   
      {
        tab: 'tab.tab.comanda',
        attribute: 'status',
        label: 'tab.attribute.status',
        type: String,
        custom: true,
        inCreate: false,
        inEdit: true,
        inList: false,
        inShow: true,
        component: TabStatus,
    },




     {
        tab: 'tab.tab.comanda',
        attribute: 'delivery_method',
        label: 'tab.attribute.delivery_method',
        type: String,
        custom: true,
        inCreate: true,
        inEdit: true,
        inList: true,
        inShow: true,
        component: DeliveryMethodField,
    },
    {
        tab: 'tab.tab.comanda',
        attribute: 'table_number',
        label: 'tab.attribute.table_number',
        type: String,
        custom: true,
        inCreate: true,
        inEdit: true,
        inList: true,
        inShow: true,
        component: TableNumberField,
        //default_value:1,
    },



      {
        tab: 'tab.tab.comanda',
        attribute: 'note',
        label: 'tab.attribute.note',
        type: String,
        inList: false
    },

   
    {
        attribute: 'product_search',
        tab: 'tab.tab.productos',
        label: '',
        type: String,
        inCreate: true,
        inEdit: true,
        inList: false,
        inShow: true,
        custom: true,
        component: ProductSearchBox,
        componentProps: {
            debounceMs: 300,
        }
    },
    {
    attribute: 'category_filter',
    tab: 'tab.tab.productos',
    label: '',
    type: String,
    inCreate: true,
    inEdit: true,
    inList: false,
    inShow: false,
    custom: true,
    component: CategorySelector,
    componentProps: {
        config: {
            categoryResource: 'ecommerce/category',
            showAllCategory: true,
        }
    }
},
{
        attribute: 'products',
        tab: 'tab.tab.productos',
        label: 'tab.attribute.productos',
        type: Array,
       
        inEdit: true,
        inCreate: true,
        inShow: false,
        custom: true,
        component: TabOrderProductsSelector,
        componentProps: {
            config: {
                // ========== HORIZONTAL SCROLL MODE (Mobile optimized) ==========
                // Use horizontal scroll instead of pagination for better mobile performance
                useHorizontalScroll: true,
                // Card dimensions for horizontal scroll mode
                horizontalScrollCardWidth: 140,
                horizontalScrollCardHeight: 180,
                // Responsive rows: 1 row on mobile, 2 on larger screens
                horizontalScrollRowsXs: 1,  // 1 row on mobile (xs)
                horizontalScrollRowsSm: 2,  // 2 rows on tablet (sm)
                horizontalScrollRowsMd: 4,  // 2 rows on desktop (md+)
                
                // ========== PAGINATION MODE (if useHorizontalScroll is false) ==========
                // Items per page for each breakpoint
                itemsPerPageXs: 3,  // 3 items in xs (1 row of 3)
                itemsPerPageSm: 6,  // 6 items in sm (2 rows of 3 or 3 rows of 2)
                itemsPerPageMd: 6,  // 6 items in md
                itemsPerPageLg: 12,  // 9 items in lg (3 rows of 3)
                // Grid columns for each breakpoint
                gridColumnsXs: 3,   // 3 columns in xs
                gridColumnsSm: 3,   // 2 columns in sm
                gridColumnsMd: 3,   // 3 columns in md
                gridColumnsLg: 3,   // 3 columns in lg
                
                // ========== COMMON OPTIONS ==========
                showPrice: true,
                // Cache configuration (in milliseconds)
                categoryCacheDuration: 60 * 60 * 1000,  // 1 hour for categories
                productsCacheDuration: 60 * 60 * 1000,  // 1 hour for products per category
                disableCache: false,  // Set to true to disable caching
                hideCategorySelector: true,  // Use external CategorySelector component
            }
        }
    },
  
  
    {
        attribute: 'products',
        tab: 'tab.tab.comanda',
        label: 'tab.attribute.tab',
        type: Array,
        inCreate: true,
        inList: false,
        inShow: false,
        custom: true,
        // This is the actual tab view - using carousel selector
        component: OrderProductsField,
    },




     {
        attribute: 'order_summary',
        tab: 'tab.tab.productos',
        label: 'tab.attribute.order_summary',
        type: String,
        inCreate: false,
        inEdit: false,
        inList: false,
        inShow: true,
        custom: true,
        component: ViewOrder,
    },

    
    {
        attribute: 'order.total_amount',
        tab: 'tab.tab.productos',
        label: 'tab.attribute.total',
        type: String,
        inCreate: false,
        inEdit: false,
        inShow: true,
        custom: true,
        component: TabTotalAmountField,
    },
    {
        attribute: 'order.is_paid',
        tab: 'tab.tab.productos',
        label: 'tab.attribute.is_paid',
        type: Boolean,
        inCreate: false,
        inEdit: false,
        inShow: false,
    },
  
    {
        tab: 'tab.tab.marketplace',
        attribute: 'order',
        label: 'tab.attribute.marketplace_status',
        type: String,
        custom: true,
        inCreate: false,
        inEdit: false,
        inList: false,
        component: ViewMarketplaceDetail,
    },
   
    {
        tab: 'tab.tab.datos',
        attribute: 'date_created',
        label: 'tab.attribute.created',
        type: Date,
        fieldProps: {showTime:true},
        inCreate: false,
        inList: false,
        inEdit: false,
        inShow: false,
    },
    {
        tab: 'tab.tab.datos',
        attribute: 'date_confirmed',
        label: 'tab.attribute.ingresada',
        type: Date,
        fieldProps: {showTime:true},
        inCreate: false,
        inEdit: false,
        inShow: false,
    },
  


];

export default tabSchema;