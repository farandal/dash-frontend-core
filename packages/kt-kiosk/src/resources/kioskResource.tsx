import React from 'react';
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import ResourceTemplate from 'dash-admin/src/templates/ResourceTemplate';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';

import { DASHAppConstants } from 'dash-constants';
import { KioskPage } from '..';

/**
 * Kiosk Resource Configuration
 * 
 * This resource provides a self-service kiosk interface for creating orders.
 * It uses a custom component that renders the full kiosk UI instead of
 * the standard CRUD list/edit/create views.
 */
const kioskResource: IDashAutoAdminResourceConfig = {
    // Group and resource identification
    group: 'Tab',
    model: 'tab/kiosk',
    label: 'Kiosk',
    
    // Base component template
    component: ResourceTemplate,
    
    // Access control
    roles: [
        DASHAppConstants.system.SYSTEM_ROLE,
        DASHAppConstants.system.TENANT_ROLE,
        'Staff',
        'Kiosk',
    ],
    
    // Icon for menu
    icon: <PointOfSaleIcon />,
    
    // Schema - minimal since we use custom component
    schema: [],
    
    // Custom views - use KioskPage for list view
    listComponent: () => <KioskPage />,
    
    // Disable standard CRUD operations
    create: false,
    edit: false,
    view: false,
    
    // Menu configuration
    menu: [
        {
            title: 'Self-Service Kiosk',
            redirect: '/tab/kiosk',
        },
    ],
    
    // Drawer is not used for kiosk
    drawer: false,
};

export default kioskResource;
