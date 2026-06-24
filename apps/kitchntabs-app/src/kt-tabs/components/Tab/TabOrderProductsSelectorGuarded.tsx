import React from 'react';
import { Box, Typography } from '@mui/material';
import { useRecordContext, useTranslate } from 'react-admin';
import TabOrderProductsSelector from './TabOrderProductsSelector';

/**
 * Thin guard around TabOrderProductsSelector: once an order is paid its contents are frozen, so the
 * "add products" surface is hidden (staff can still advance the status). The contents lock is also
 * enforced server-side in TabController::_update, so this is purely the staff-facing UX.
 */
const TabOrderProductsSelectorGuarded: React.FC<any> = (props) => {
    const record = useRecordContext<any>();
    const translate = useTranslate();

    if (record?.order?.is_paid) {
        return (
            <Box sx={{ p: 2, backgroundColor: '#fff3cd', border: '1px solid #ffeeba', borderRadius: 1, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#856404', fontWeight: 600 }}>
                    🔒 {translate('tab.order_paid_locked_add', { _: 'Pedido pagado — no se pueden agregar productos' })}
                </Typography>
            </Box>
        );
    }

    return <TabOrderProductsSelector {...props} />;
};

export default TabOrderProductsSelectorGuarded;
