import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslate, useRecordContext } from 'react-admin';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import OrderProducts from '../tab/OrderProducts';
import OrderProductsList from '../tab/Tab/OrderProductsList';
import EditOrder from './EditOrder';
import CreateOrder from './CreateOrder';

const OrderProductsField: React.FC<IDashAutoAdminCustomFieldComponent> = (props) => {
    const { method } = props;
    const translate = useTranslate();
    const record = useRecordContext<any>();

    // Once the order is paid its contents are frozen (also enforced server-side): the staff can
    // still advance the status, but products / quantities / modifiers can't be edited.
    const isPaid = !!record?.order?.is_paid;

    console.log('🎯 OrderProductsField render:', { method, isPaid });

    switch (method) {
        case 'edit':
            if (isPaid) {
                return (
                    <Box>
                        <Box sx={{ p: 1, mb: 1, backgroundColor: '#fff3cd', border: '1px solid #ffeeba', borderRadius: 1, textAlign: 'center' }}>
                            <Typography variant="caption" sx={{ color: '#856404', fontWeight: 600 }}>
                                🔒 {translate('tab.order_paid_locked', { _: 'Pedido pagado — los productos no se pueden modificar' })}
                            </Typography>
                        </Box>
                        {/* Non-interactive: backend rejects content edits to a paid order anyway. */}
                        <Box sx={{ pointerEvents: 'none', opacity: 0.7 }} aria-disabled>
                            <EditOrder {...props} />
                        </Box>
                    </Box>
                );
            }
            return <><EditOrder {...props} />{/* <OrderProductsList/>*/}</>
        case 'create':
            return <><CreateOrder {...props} />{/*<OrderProductsList/>*/}</>
        default:
            return (
                <Box sx={{ p: 2 }}>
                    <Typography color="error">
                        {translate('tab.common.unsupported_method', { method })}
                    </Typography>
                </Box>
            );
    }
};

export default OrderProductsField;
