
import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import { useRecordContext } from "react-admin";

import { ITab } from './interfaces/ITab';
import OrderProductsView from "./Tab/OrderProductsView";
import OrderProductsEditRefactored from "./Tab/OrderProductsEditRefactored";
import { PaginationMode } from "./contexts/TabManagerContext";

const ListComponent: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute, resourceConfig }) => {
    const tab = useRecordContext<ITab>();
    return <>{tab.order?.items?.reduce((acc, item) => acc + (item.quantity || 0), 0) || 0}</>
}

const OrderProductsEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute, resourceConfig }) => {
    const tab: ITab = useRecordContext();

    return  <OrderProductsEditRefactored 
                        attribute={attribute} 
                        method={method} 
                        resourceConfig={resourceConfig} 
                        record={tab} 
                        paginationMode={PaginationMode.PAGINATION}
                    />
           
                    /*<Box sx={{ display: 'flex', gap: 2 }}>
              
                <Box sx={{ flex: 1 }}>
                    <OrderProductsEditRefactored 
                        attribute={attribute} 
                        method={method} 
                        resourceConfig={resourceConfig} 
                        record={tab} 
                    />
                </Box>
                
               
                <Box sx={{ minWidth: 400, maxWidth: 500 }}>
                 
                </Box>
            </Box>*/
     
    
};

const OrderProducts = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
    const tab: ITab = useRecordContext();

    switch (method) {
        case "edit":
        case "create":
            return <OrderProductsEdit method={method} attribute={attribute} resourceConfig={resourceConfig} />
        case "view":
            return <OrderProductsView attribute={attribute} method={method} resourceConfig={resourceConfig} record={tab} />
        case "list":
            return <ListComponent attribute={attribute} method={method} resourceConfig={resourceConfig} record={tab} />
        default:
            return <></>;
    }
}


export default OrderProducts;