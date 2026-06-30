import React, { Suspense } from 'react';
import { Route } from 'react-router-dom';
import { Box } from '@mui/material';
import RecoverPassword from 'dash-admin/pages/RecoverPassword';
import ChangePassword from 'dash-admin/pages/ChangePassword';
import VerifyAccount from 'dash-admin/pages/VerifyAccount';
import GlobalSmallLoader from '../components/GlobalSmallLoader';

// Lazy load shared components from kt-* packages
const MarketplaceCallback = React.lazy(() => import('kt-ecommerce/components/Marketplace/MarketplaceCallback'));
const Register = React.lazy(() => import('kt-pages/pages/Account/Register'));
const SignUp = React.lazy(() => import('kt-pages/pages/Account/SignUp'));
const SignUpSuccess = React.lazy(() => import('kt-pages/pages/Account/SignUpSuccess'));
const Legal = React.lazy(() => import('kt-pages/pages/Static/Legal'));
const DASHLanding = React.lazy(() => import('kt-pages/dash-pages/DASHLanding'));


// Shared routes factory function


export const createSharedRoutes = () => { return [
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
        key="landing"
        data-layout="no-layout"
        path='/'
        element={
            <Suspense fallback={<GlobalSmallLoader />}>
                <DASHLanding /*panelSettings={panelSettings}*/ />
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
        key="signup"
        path='/signup'
        element={
            <Suspense fallback={<GlobalSmallLoader />}>
                <SignUp />
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
                <Legal  />
            </Suspense>
        }
    />,
    <Route
        key={'reset-password'}
        path='reset-password'
        element={
            <Suspense fallback={<GlobalSmallLoader />}>
                {<RecoverPassword   />}
            </Suspense>
        }
    />,
    <Route
        key={'change-password'}
        path='change-password'
        element={
            <Suspense fallback={<GlobalSmallLoader />}>
                {<ChangePassword    />}
            </Suspense>
        }
    />,
    <Route
        key={'verify-account'}
        path='verify-email'
        element={
            <Suspense fallback={<GlobalSmallLoader />}>
                {<VerifyAccount   />}
            </Suspense>
        }
    />
]
}
export default createSharedRoutes;
