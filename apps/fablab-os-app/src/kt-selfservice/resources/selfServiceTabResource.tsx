/**
 * selfServiceTabResource
 * 
 * Resource for managing tabs/orders in self-service kiosk mode.
 * Allows guests to create and track their orders.
 */
import React from 'react';
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import { Receipt as ReceiptIcon } from '@mui/icons-material';
import SelfServiceTabSchema from '../schemas/SelfServiceTabSchema';
import SelfServiceTabsContext from '../components/SelfServiceTabsContext';
import SelfServiceTabList from './SelfServiceTabList';

const Icon = ReceiptIcon as unknown as React.FC;

/**
 * Self-Service Tab Resource Configuration
 * 
 * Minimal configuration for guest order management.
 */
const selfServiceTabResource: IDashAutoAdminResourceConfig = {
    model: 'tab',
    label: 'My Order',
    group: 'Kiosk',
    roles: ['*'],
    icon: <Icon />,
    schema: SelfServiceTabSchema,
    contextComponent: SelfServiceTabsContext,
    
    // Use custom list with notification listener
    list: SelfServiceTabList,
    
    // Enable only create and view for guests
    create: true,
    edit: false,
    view: true,
    delete: false,
    
    // Menu configuration
    menu: [
        {
            title: 'My Order',
            redirect: '/tab',
        },
    ],
    
    // Disable list buttons
    listViewButton: { enabled: true },
    listEditButton: { enabled: false },
    listDeleteButton: { enabled: false },
    
    
    mutationMode: 'pessimistic',
    processErrors: false,
};

export default selfServiceTabResource;
