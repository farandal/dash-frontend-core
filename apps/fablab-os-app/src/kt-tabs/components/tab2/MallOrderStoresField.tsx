import React from 'react';
import { Box, Typography } from '@mui/material';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import EditOrder from './EditOrder';
import CreateOrder from './CreateOrder';
import { NotFound } from 'dash-components';

interface IMallOrderProductsField extends IDashAutoAdminCustomFieldComponent {
    persistState?: boolean; 
    productsResource?: string;
}

const MallOrderStoresField: React.FC<IMallOrderProductsField> = (props) => {
    const { method, persistState = false, productsResource = null, enableServiceFee = true } = props;

    switch (method) {
        case 'create':
            return <CreateOrder 
                enableVoiceOrders={false} 
                productsResource={"/public/mall/products"} 
                persistState={true}
                enableServiceFee={false}
                {...props} 
            />;
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

export default MallOrderStoresField;
