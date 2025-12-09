import React, { useState, useContext, useEffect } from 'react';
import { Box } from '@mui/material';
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import MallSessionOrderProductsNotifications from './MallSessionOrderProductsNotifications';
import MallSessionOrderProgress from './MallSessionOrderProgress';
import { useAxios } from 'dash-axios-hook';
import LaravelEchoContext, { ILaravelEchoContext } from 'dash-admin/src/contexts/com/LaravelEchoContext';
import { useRecordContext, useTranslate } from 'react-admin';
import { ITab } from 'kt-tabs';
import { dashStorage } from 'dash-utils';

// @deprecated
const MallSessionOrderStatus = () => {
    const [tenantStatuses, setTenantStatuses] = useState<Record<number, string>>({});
    const [overallStatus, setOverallStatus] = useState<string>('CREATED');
    const [sessionHash, setSessionHash] = useState<string | null>(null);
    const laravelEchoContext = useContext<ILaravelEchoContext>(LaravelEchoContext);
    const translate = useTranslate();
    const axios = useAxios();
    const { control } = useFormContext();
    const products = useWatch({ control, name: 'products' });
    const { fields } = useFieldArray({ control, name: 'products' });
    const tab: ITab = useRecordContext();
    useEffect(() => {
        // Get session hash from localStorage
        const hash = dashStorage.getItem('mall-session-hash');
        setSessionHash(hash);
    }, []);

    // Convert form products to the format expected by the notifications component
    const formattedProducts = fields?.map((field, index) => {
        const product = products[index];
        return {
            id: product?.id,
            name: product?.name || 'Unknown Product',
            quantity: product?.quantity || 1,
            ...product
        };
    });

    const handleStatusUpdate = (productStatuses: Record<number, string>, tenantStatusMap: Record<number, string>, newOverallStatus: string) => {
        // Update both product statuses and tenant statuses
        console.log('Product statuses updated:', productStatuses);
        console.log('Tenant statuses updated:', tenantStatusMap);
        console.log('Overall status updated:', newOverallStatus);
        
        setTenantStatuses(tenantStatusMap);
        setOverallStatus(newOverallStatus);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Pass tenant statuses to the progress component */}
            <MallSessionOrderProgress 
                sessionHash={sessionHash} 
                tenantStatuses={tenantStatuses}
                overallStatus={overallStatus}
                 tabId={tab.id}
            />
            
            <MallSessionOrderProductsNotifications
                sessionHash={sessionHash}
                products={formattedProducts}
                onStatusUpdate={handleStatusUpdate}
                tabId={tab.id}
            />
        </Box>
    );
};

export default MallSessionOrderStatus;
