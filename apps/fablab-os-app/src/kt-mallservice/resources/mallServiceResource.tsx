/**
 * selfServiceResource
 * 
 * Resource definition for the Self-Service QR code generator page.
 * This allows restaurant staff to generate QR codes for table ordering.
 * 
 * Follows the statsResource pattern for custom component rendering.
 */
import React from 'react';
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import { Route } from 'react-router-dom';
import { QrCode as QrCodeIcon } from '@mui/icons-material';
import { ResourceTemplate } from 'dash-admin';
import { DASHAppConstants } from 'dash-constants';

// Lazy load the QR generator component
const MallServiceQRGenerator = React.lazy(() => 
    import('../components/MallServiceQRGenerator')
);

const Icon = QrCodeIcon as unknown as React.FC;

// Empty schema - this is a utility page, not a CRUD resource


/**
 * Self-Service Resource Configuration
 * 
 * Uses customRoutes and component pattern (like statsResource) to render
 * a custom component instead of the standard CRUD interface.
 */
const mallServiceResource: IDashAutoAdminResourceConfig = {
    model: 'mall/qr',
    label: 'Mall-Service QR',
    group: 'Operaciones',
    roles: ["Mall-Service"],
    icon: <Icon />,
    schema: [],
    
    // Custom routes for the component, overwrite.
    customRoutes: (resourceConfig) => {
        return <Route
                    path={"/"+resourceConfig.model}
                    element={<MallServiceQRGenerator />}
                />
    },

    
    // Menu configuration
    menu: [
        {
            title: 'Generate QR',
            redirect: '/mall/qr',
        },
    ],
    
    // Disable CRUD buttons since this is a utility page
    listViewButton: { enabled: false },
    listEditButton: { enabled: false },
    listDeleteButton: { enabled: false },
    listProps: { storeKey: false },
    resetSelectedIdsOnLoad: true,
    
    // Disable standard CRUD operations
    /*create: false,
    edit: false,
    view: false,*/
    
    mutationMode: 'pessimistic',
    processErrors: false,
};

export default mallServiceResource;
