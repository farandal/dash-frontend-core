import React from 'react';
import { Box, Chip } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { useRecordContext } from 'react-admin';
import TabOrderProductsSelector from './TabOrderProductsSelector';

/**
 * Thin guard around TabOrderProductsSelector: once an order is paid its contents are frozen, so the
 * "add products" surface is hidden (staff can still advance the status). The contents lock is also
 * enforced server-side in TabController::_update, so this is purely the staff-facing UX.
 *
 * When paid we don't block with an alert — we just show a lock icon alongside the products already
 * added (read-only chips derived from the record, so it stays lightweight in list cells too).
 */
const TabOrderProductsSelectorGuarded: React.FC<any> = (props) => {
    const record = useRecordContext<any>();

    if (record?.order?.is_paid) {
        const items = record?.order?.items ?? [];
        return (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.5 }}>
                <LockIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                {items.map((item: any, index: number) => (
                    <Chip
                        key={item.id ?? item.line_id ?? index}
                        size="small"
                        label={`${item.product?.name ?? ''} (${item.quantity ?? 0})`}
                    />
                ))}
            </Box>
        );
    }

    return <TabOrderProductsSelector {...props} />;
};

export default TabOrderProductsSelectorGuarded;
