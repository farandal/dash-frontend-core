import React from 'react';
import { Box, Typography } from '@mui/material';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import OrderProducts from '../tab/OrderProducts';
import OrderProductsList from '../tab/Tab/OrderProductsList';
import EditOrder from './EditOrder';
import CreateOrder from './CreateOrder';

const OrderProductsField: React.FC<IDashAutoAdminCustomFieldComponent> = (props) => {
    const { method } = props;

    console.log('🎯 OrderProductsField render:', { method });

    switch (method) {
        case 'edit':
            return <><EditOrder {...props} />{/* <OrderProductsList/>*/}</>
        case 'create':
            return <><CreateOrder {...props} />{/*<OrderProductsList/>*/}</>
        default:
            return (
                <Box sx={{ p: 2 }}>
                    <Typography color="error">
                        Unsupported method: {method}
                    </Typography>
                </Box>
            );
    }
};

export default OrderProductsField;
