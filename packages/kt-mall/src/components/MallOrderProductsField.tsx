import React from 'react';
import { Box, Typography } from '@mui/material';
import { useRecordContext } from 'react-admin';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import { ITab, OrderProductsList, OrderProductsView } from 'kt-tabs';
import { NotFound } from 'dash-components';
import MallSessionOrderProgress from './MallSessionOrderProgress';
import MallSessionOrderNotifications from './MallSessionOrderNotifications';

interface IMallOrderProductsField extends IDashAutoAdminCustomFieldComponent {
    persistState?: boolean;
    productsResource?: string;
}

const MallOrderProductsField: React.FC<IMallOrderProductsField> = (props) => {
    const { method, attribute, resourceConfig, persistState = false, productsResource = null, enableServiceFee = true } = props;
    const tab: ITab = useRecordContext();
    
    switch (method) {
        case 'create':
            return <OrderProductsList />;
        case 'edit':
            return (
                <Box>
                    <MallSessionOrderProgress tabId={tab.id} />
                    <OrderProductsList />
                </Box>
            );
        case 'view':
            return (
                <Box>
                    <MallSessionOrderNotifications tabId={tab.id} />
                    <OrderProductsView attribute={attribute} method={method} resourceConfig={resourceConfig} record={tab} />
                </Box>
            );
        case 'list':
            const itemCount = tab?.order?.items?.length || 0;
            return <span>{itemCount} productos</span>;
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
