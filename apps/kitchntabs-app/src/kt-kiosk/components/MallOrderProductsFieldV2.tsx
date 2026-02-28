import React from 'react';
import { Box, Typography } from '@mui/material';
import { useRecordContext } from 'react-admin';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
// Direct imports from local kt-tabs (avoid barrel exports for tree-shaking)
import type { ITab } from '../../kt-tabs/components/interfaces/ITab';
import OrderProductsList from '../../kt-tabs/components/Tab/OrderProductsList';
import OrderProductsView from '../../kt-tabs/components/Tab/OrderProductsView';
import { NotFound } from 'dash-components';
import { MallOrderCreateView } from './MallOrderCreateView';

interface IMallOrderProductsFieldV2 extends IDashAutoAdminCustomFieldComponent {
    persistState?: boolean;
    productsResource?: string;
}

/**
 * MallOrderProductsFieldV2 - New kiosk-style field component for mall orders
 * 
 * Uses the new MallOrderCreateView for create mode with:
 * - Horizontal store selector
 * - Kiosk-style product grid with pagination toggle
 * - Cart summary with drawer
 * - Search and assistance features
 * 
 * Maintains existing functionality for edit/view/list modes.
 */
const MallOrderProductsFieldV2: React.FC<IMallOrderProductsFieldV2> = (props) => {
    const { method, attribute, resourceConfig, persistState = false, productsResource = null } = props;
    const tab: ITab = useRecordContext();
    
    switch (method) {
        case 'create':
            // Use new kiosk-style UI for order creation
            return <MallOrderCreateView {...props} />;
            
        case 'edit':
            // MallSessionOrderProgress is now handled by the schema as a separate attribute
            return (
                <Box className="kt-mall-order-products-field-v2-edit">
                    <OrderProductsList />
                </Box>
            );
            
        case 'view':
            // MallSessionOrderNotifications is now handled by the schema as a separate attribute
            return (
                <Box className="kt-mall-order-products-field-v2-view">
                    <OrderProductsView 
                        attribute={attribute} 
                        method={method} 
                        resourceConfig={resourceConfig} 
                        record={tab} 
                    />
                </Box>
            );
            
        case 'list':
            const itemCount = tab?.order?.items?.length || 0;
            return <span className="kt-mall-order-products-field-v2-list">{itemCount} productos</span>;
            
        default:
            return (
                <Box sx={{ p: 2, backgroundColor: 'transparent' }} className="kt-mall-order-products-field-v2-default">
                    <Typography color="error">
                       <NotFound
                        disableGoBack={true}
                        disableCountdown={true}
                       />
                    </Typography>
                </Box>
            );
    }
};

export default MallOrderProductsFieldV2;
