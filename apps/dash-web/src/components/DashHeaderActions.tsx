import React, {  } from 'react';
import { PropsWithChildren } from 'react';

import NotificationsCenter from '../components/Notifications/NotificationsCenter';
import TenantSwitcher from './tenancy/TenantSwitcher';

const DASHHeaderActions: React.FC<PropsWithChildren> = (props) => {
    return (
        <>
         
                <TenantSwitcher />
                <NotificationsCenter />
           
        </>
    );
};

export default DASHHeaderActions;