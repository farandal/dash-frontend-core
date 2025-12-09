import React, {  } from 'react';
import { PropsWithChildren } from 'react';

import NotificationsCenter from './Notifications/NotificationsCenter';

const DASHHeaderActions: React.FC<PropsWithChildren> = (props) => {
    // Only keep header actions here, notifications are handled by NotificationsCenter
    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: '100%' }}>
                {/* Other header actions can go here */}
                <NotificationsCenter />
            </div>
        </>
    );
};

export default DASHHeaderActions;