import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import { useRecordContext } from "react-admin";
import { Box } from "@mui/material";

import { 
    ITab, 
    OrderProductsView, 
    OrderProductsEditRefactored, 
    OrderProductsMallFilters, 
    PaginationMode
} from "kt-tabs";
import MallSessionOrderProgress from "./MallSessionOrderProgress";
import MallSessionOrderNotifications from "./MallSessionOrderNotifications";
import { useEffect } from "react";

const ListComponent: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute, resourceConfig }) => {
    const tab = useRecordContext<ITab>();


    useEffect(() => {

        debugger;
    }, []);

    return <>{tab.order?.items?.reduce((acc, item) => acc + (item.quantity || 0), 0) || 0}</>
}

const MallOrderProductsEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute, pagination, resourceConfig }) => {
    const tab: ITab = useRecordContext();


    return <Box sx={{ flex: 1 }}>
                    <OrderProductsMallFilters storesPath="public/mall/stores"  >
                        <OrderProductsEditRefactored 
                            paginationMode={pagination || PaginationMode.INFINITE_SCROLL}
                            showPrice={true} 
                            productsResource="public/mall/products" 
                            attribute={attribute} 
                            method={method} 
                            resourceConfig={resourceConfig} 
                            record={tab} 
                        />
                    </OrderProductsMallFilters>
                   
                </Box>
                
};

/**
 * MallOrderProducts - Custom field component for mall orders
 * Uses MallClientTabsContext (via child components) to get data without direct API calls
 */
const MallOrderProducts = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
    const tab: ITab = useRecordContext();
    
 

    switch (method) {
        case "edit":
            return (
                <Box sx={{ mt: 2 }}>
                    {/* Progress and notifications now get data from MallClientTabsContext */}
                    <MallSessionOrderProgress tabId={tab.id} />
                    <MallSessionOrderNotifications tabId={tab.id} />
                </Box>
            );
        case "create":
            return <MallOrderProductsEdit pagination={PaginationMode.INFINITE_SCROLL} method={method} attribute={attribute} resourceConfig={resourceConfig} />
        case "view":
            return <OrderProductsView useInfiniteScroll={true} showPrice={true} tabsResource="public/mall/tab" productsResource="public/mall/products" attribute={attribute} method={method} resourceConfig={resourceConfig} record={tab} />
        case "list":
            return <><ListComponent productsResource="public/mall/products" attribute={attribute} method={method} resourceConfig={resourceConfig} record={tab} /></>
        default:
            return <></>;
    }
}

export default MallOrderProducts;