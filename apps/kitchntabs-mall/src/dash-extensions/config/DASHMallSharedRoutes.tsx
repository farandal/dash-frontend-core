import React from 'react';
import { Route } from 'react-router-dom';
import MallQRGenerator from 'kt-mall/src/components/MallQRGenerator';
import { NotFound } from 'dash-components';
import DASHSimpleLogin from 'kt-pages/src/dash-pages/DASHSimpleLogin';

export const mallPublicGlobalRoutes = () => [
    <Route 
         data-layout="no-layout"
         path="/" 
         element={
             <DASHSimpleLogin />
         } 
     />
,                    
    <Route 
        path="*" 
        element={<NotFound disableCountdown={true} time={5} redirect="/" />} 
    />
];

export const mallPrivateGlobalRoutes = () => [
    // QR Generator is now accessed via the resource menu (MallAppResources)
    // The QR page shows at /:mallSlug/qr via the resource system
    <Route 
         key="mall-login"
         data-layout="no-layout"
         path="/:slug/login" 
         element={
             <DASHSimpleLogin />
         } 
     />,                    
    <Route 
        key="mall-catch-all"
        path="*" 
        element={<NotFound disableCountdown={true} />} 
    />
];
