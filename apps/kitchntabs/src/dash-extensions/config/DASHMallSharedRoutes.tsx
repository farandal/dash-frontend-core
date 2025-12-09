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
   
   <Route
        key="landing"
        data-layout="no-layout"
        path='/apps/mall/:slug/'
        element={<MallQRGenerator/>}
    />
    ,
    <Route 
         data-layout="no-layout"
         path="/apps/mall/:slug/login" 
         element={
             <DASHSimpleLogin />
         } 
     />
,                    
    <Route 
        path="*" 
        element={<NotFound  disableCountdown={true}  />} 
    />
    
  
];
