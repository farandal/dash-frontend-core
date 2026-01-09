import React from 'react';
import { DashAutoList } from 'dash-auto-admin';
import { NotificationListener } from '../components/SelfServiceTabsContext';

/**
 * SelfServiceTabList
 * 
 * Custom list component for Self Service tabs.
 * Wraps DashAutoList with NotificationListener to ensure real-time updates.
 */
const SelfServiceTabList: React.FC<any> = (props) => {
    console.log('📋 SelfServiceTabList: Rendering custom list component', { props });
    return (
        <NotificationListener>
            <DashAutoList {...props} />
        </NotificationListener>
    );
};

export default SelfServiceTabList;
