import React from 'react';
import { Box, Typography } from '@mui/material';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import EditOrder from './EditOrder';
import CreateOrder from './CreateOrder';
import { NotFound } from 'dash-components';
import OrderProductsList from './components/OrderProductsList';


interface IMallOrderProductsField extends IDashAutoAdminCustomFieldComponent {
    persistState?: boolean; 
    productsResource?: string;
}

const MallOrderProductsField: React.FC<IMallOrderProductsField> = (props) => {
    const { method, persistState = false, productsResource = null, enableServiceFee = true } = props;


    switch (method) {
        /*case 'edit':
            return <EditOrder 
                enableVoiceOrders={false} 
                productsResource={"/public/mall/products"} 
                persistState={false}
                enableServiceFee={false}
                {...props} 
            />;*/
        case 'edit': 
            return <OrderProductsList/>
        case 'create':
            /*return <CreateOrder 
                enableVoiceOrders={false} 
                productsResource={"/public/mall/products"} 
                persistState={true}
                enableServiceFee={false}
                {...props} 
            />;*/
            return <OrderProductsList/>
        default:
            return (
                <Box sx={{ p: 2 }}>
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

export default MallOrderProductsField;
