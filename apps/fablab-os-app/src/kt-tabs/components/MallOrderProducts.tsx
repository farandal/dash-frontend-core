import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import { useRecordContext } from "react-admin";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Box, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { useAxios } from "dash-axios-hook";

import { ITab } from './interfaces/ITab';
import OrderProductsView from "./Tab/OrderProductsView";
import OrderProductsEditRefactored from "./Tab/OrderProductsEditRefactored";
import OrderProductsMallFilters from "./Tab/OrderProductsMallFilters";
import OrderProductsList from "./Tab/OrderProductsList";
import { PaginationMode, TabManagerProvider } from './contexts/TabManagerContext';
import MallSessionOrderProgress from "./MallSessionOrderProgress";
import MallSessionOrderNotifications from "./MallSessionOrderNotifications";
import { dashStorage } from 'dash-utils';

const ListComponent: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute, resourceConfig }) => {
    const tab = useRecordContext<ITab>();
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


const MallOrderProducts = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
    const tab: ITab = useRecordContext();
    const axios = useAxios();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Get mall session hash from localStorage
    const getMallSessionHash = (): string | null => {
        return dashStorage.getItem("mall-session-hash");
    };
    
    const sessionHash = getMallSessionHash();
    
    // Centralized function to fetch notifications
    const fetchNotifications = async () => {
        if (!sessionHash) return;
        if (!tab?.id) return;
        
        setLoading(true);
        try {
            const url = `/public/mall/session/${sessionHash}/notifications?tab_id=${tab.id}`;
            const response = await axios.get(url);
            setNotifications(response.data.notifications || []);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        } finally {
            setLoading(false);
        }
    };
    
    // Fetch notifications when component mounts or when tab/sessionHash changes
    useEffect(() => {
        if (method === "edit" && sessionHash && tab?.id) {
            fetchNotifications();
        }
    }, [sessionHash, tab?.id, method]);
    
    switch (method) {
        case "edit":
            return (
                <Box sx={{ mt:2 }}>
                    <MallSessionOrderProgress 
                        tabId={tab.id} 
                        sessionHash={sessionHash} 
                        notifications={notifications}
                        loading={loading}
                    />
                    <MallSessionOrderNotifications 
                        tabId={tab.id} 
                        sessionHash={sessionHash} 
                        notifications={notifications}
                        loading={loading}
                    />
                </Box>

               /* <>
                 <MallSessionOrderProgress sessionHash={sessionHash} />
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                       
                        <MallOrderProductsEdit pagination={PaginationMode.PAGINATION} method={method} attribute={attribute} resourceConfig={resourceConfig} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <MallSessionOrderNotifications sessionHash={sessionHash} />
                    </Box>
                </Box>
                </>*/
            );
        case "create":
            return <><MallOrderProductsEdit pagination={PaginationMode.INFINITE_SCROLL} method={method} attribute={attribute} resourceConfig={resourceConfig} /></>
        case "view":
            return <OrderProductsView useInfiniteScroll={true} showPrice={true} tabsResource="public/mall/tab" productsResource="public/mall/products" attribute={attribute} method={method} resourceConfig={resourceConfig} record={tab} />
        case "list":
            return <ListComponent productsResource="public/mall/products" attribute={attribute} method={method} resourceConfig={resourceConfig} record={tab} />
        default:
            return <></>;
    }
}

export default MallOrderProducts;