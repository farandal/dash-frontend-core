// Shared routes factory function


import React, { Suspense } from 'react';
import { Route } from 'react-router-dom';
import { Box } from '@mui/material';
import RecoverPassword from 'dash-admin/src/pages/RecoverPassword';
import ChangePassword from 'dash-admin/src/pages/ChangePassword';
import VerifyAccount from 'dash-admin/src/pages/VerifyAccount';
//import MallAppWrapper from 'kt-mall/src/components/MallAppWrapper';
//import MallClientWrapper from 'kt-mall/src/components/MallClientWrapper';
//import { NotFound } from 'dash-components';

import GlobalSmallLoader from './dash-extensions/components/GlobalSmallLoader';
import NotFound from './components/theme/components/others/NotFound';
import DASHLightWeightLogin from './components/pages/DASHLightWeightLogin';
import Register from './components/pages/Register';
import SignUp from './components/pages/SignUp';

// Lazy load shared components
const MarketplaceCallback = React.lazy(() => import('kt-ecommerce/src/components/Marketplace/MarketplaceCallback'));
const SignUpSuccess = React.lazy(() => import('kt-pages/src/pages/Account/SignUpSuccess'));
const Legal = React.lazy(() => import('kt-pages/src/pages/Static/Legal'));


const KitchnTabsSharedRoutes = () => [
    
      <Route
        path="/login"
        element={
            <DASHLightWeightLogin/>
        }
    />,
    <Route
        key="oauth-callback"
        data-layout="no-layout"
        path="oauth/marketplace/callback"
        element={
            <Suspense fallback={<GlobalSmallLoader />}>
                <MarketplaceCallback />
            </Suspense>
        }
    />,
   
    <Route
        key="register"
        path='/registrarse'
        element={
            <Suspense fallback={<GlobalSmallLoader />}>
                <Register />
            </Suspense>
        }
    />,
   
    <Route
        key="signup-success"
        path='/signup-success'
        element={
            <Suspense fallback={<GlobalSmallLoader />}>
                <SignUpSuccess />
            </Suspense>
        }
    />,
    <Route
        key="legal"
        data-layout="no-layout"
        path='/legal'
        element={
            <Suspense fallback={<GlobalSmallLoader />}>
                <Legal />
            </Suspense>
        }
    />,
    <Route
        key={'reset-password'}
        path='reset-password'
        element={
            <Suspense fallback={<GlobalSmallLoader />}>
                {<RecoverPassword />}
            </Suspense>
        }
    />,
    <Route
        key={'change-password'}
        path='change-password'
        element={
            <Suspense fallback={<GlobalSmallLoader />}>
                {<ChangePassword />}
            </Suspense>
        }
    />,
   
    <Route
        path="*"
        //element={<NotFound disableCountdown={true} time={5} redirect="/login" />}
        element={<NotFound />}
    />

]

export default KitchnTabsSharedRoutes;