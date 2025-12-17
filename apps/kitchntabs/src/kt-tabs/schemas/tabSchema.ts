
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

const tabSchema: IDashAutoAdminAttribute[] = [
    // Show view - Tab summary
   
    {
        tab: 'Comanda',
        attribute: 'actions',
        label: 'Acciones',
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
        tab: 'Comanda',
        attribute: 'status',
        label: 'Status',
        type: String,
        custom: true,
        inCreate: false,
        inEdit: true,
        inList: false,
        inShow: true,
        component: TabStatus,
    },

    {
        attribute: 'ai_toolbar',
        tab: 'Productos',
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
        attribute: 'products',
        tab: 'Productos',
        label: 'Productos',
        type: Array,
       
        inEdit: true,
        inCreate: true,
        inShow: false,
        custom: true,
        component: TabOrderProductsSelector,
        componentProps: {
            config: {
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
                showPrice: true,
                // Cache configuration (in milliseconds)
                categoryCacheDuration: 60 * 60 * 1000,  // 1 hour for categories
                productsCacheDuration: 60 * 60 * 1000,  // 1 hour for products per category
                disableCache: false,  // Set to true to disable caching
            }
        }
    },
  
  
    {
        attribute: 'products',
        tab: 'Comanda',
        label: 'Tab',
        type: Array,
        inCreate: true,
        inList: false,
        inShow: false,
        custom: true,
        // This is the actual tab view - using carousel selector
        component: OrderProductsField,
    },



      {
        tab: 'Comanda',
        attribute: 'note',
        label: 'Notas',
        type: String,
        inList: false
    },

     {
        attribute: 'order_summary',
        tab: 'Productos',
        label: 'Resumen de la Orden',
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
        tab: 'Productos',
        label: 'Total',
        type: String,
        inCreate: false,
        inEdit: false,
        inShow: true,
        custom: true,
        component: TabTotalAmountField,
    },
    {
        attribute: 'order.is_paid',
        tab: 'Productos',
        label: 'Pago',
        type: Boolean,
        inCreate: false,
        inEdit: false,
        inShow: false,
    },
  
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
   
    {
        tab: 'Datos',
        attribute: 'date_created',
        label: 'creación',
        type: Date,
        fieldProps: {showTime:true},
        inCreate: false,
        inList: false,
        inEdit: false,
        inShow: false,
    },
    {
        tab: 'Datos',
        attribute: 'date_confirmed',
        label: 'ingresada',
        type: Date,
        fieldProps: {showTime:true},
        inCreate: false,
        inEdit: false,
        inShow: false,
    },
    


];

export default tabSchema;