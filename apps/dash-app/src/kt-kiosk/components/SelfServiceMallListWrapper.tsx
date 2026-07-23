import React from 'react';
import MallClientTabsList from './MallClientTabsList';
import { NotificationListener } from '../../kt-selfservice/components/SelfServiceTabsContext';

/**
 * SelfServiceMallListWrapper
 * 
 * Wraps the MallClientTabsList with the Self-Service NotificationListener.
 * This ensures that when the list is displayed in Self-Service mode,
 * it reacts to WebSocket events (selfservice_session_order_status_update)
 * and refreshes the list automatically.
 */
const SelfServiceMallListWrapper: React.FC<any> = (props) => {
    console.log('🛡️ SelfServiceMallListWrapper: Rendering', props);
    return (
        <NotificationListener>
            <MallClientTabsList {...props} />
        </NotificationListener>
    );
};

export default SelfServiceMallListWrapper;
