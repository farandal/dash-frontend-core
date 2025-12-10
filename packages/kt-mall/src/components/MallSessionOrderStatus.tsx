import React from 'react';
import { Box } from '@mui/material';
import MallSessionOrderProgress from './MallSessionOrderProgress';
import MallSessionOrderNotifications from './MallSessionOrderNotifications';
import { useRecordContext } from 'react-admin';
import { ITab } from 'kt-tabs';

/**
 * MallSessionOrderStatus - Combines progress and notifications for a mall order
 * Uses MallClientTabsContext (via child components) to get data without direct API calls
 * 
 * @deprecated Consider using MallSessionOrderProgress and MallSessionOrderNotifications directly
 */
const MallSessionOrderStatus = () => {
    const tab: ITab = useRecordContext();

    if (!tab?.id) {
        return null;
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <MallSessionOrderProgress tabId={tab.id} />
            <MallSessionOrderNotifications tabId={tab.id} />
        </Box>
    );
};

export default MallSessionOrderStatus;
