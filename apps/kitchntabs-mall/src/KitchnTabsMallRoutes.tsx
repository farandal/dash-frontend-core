import React, { Suspense } from 'react';
import { Route } from 'react-router-dom';
import { Box } from '@mui/material';
import RecoverPassword from 'dash-admin/src/pages/RecoverPassword';
import ChangePassword from 'dash-admin/src/pages/ChangePassword';
import VerifyAccount from 'dash-admin/src/pages/VerifyAccount';
//import MallAppWrapper from 'kt-mall/src/components/MallAppWrapper';
//import MallClientWrapper from 'kt-mall/src/components/MallClientWrapper';
import { NotFound } from 'dash-components';
import DASHLightWeightLogin from 'kt-pages/src/dash-pages/DASHLightWeightLogin';
import GlobalSmallLoader from './dash-extensions/components/GlobalSmallLoader';
import MallClientWrapper from './components/mall/MallClientWrapper';
import MallAppWrapper from './components/mall/MallAppWrapper';
import MallPublicWrapper from './components/mall/MallPublicWrapper';
import MallLanding from 'kt-mall/src/components/MallLanding';

// Lazy load shared components
const MarketplaceCallback = React.lazy(() => import('kt-ecommerce/src/components/Marketplace/MarketplaceCallback'));
const DashLanding = React.lazy(() => import('kt-pages/src/dash-pages/DASHLanding'));
const Register = React.lazy(() => import('kt-pages/src/pages/Account/Register'));
const SignUp = React.lazy(() => import('kt-pages/src/pages/Account/SignUp'));
const SignUpSuccess = React.lazy(() => import('kt-pages/src/pages/Account/SignUpSuccess'));
const Legal = React.lazy(() => import('kt-pages/src/pages/Static/Legal'));

const MallClientWelcome = React.lazy(() => import('kt-mall/src/components/MallClientWelcome'));
// Shared routes factory function

export const dashSharedRoutes = () => [
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
        key={'verify'}
        path='verify'
        element={
            <Suspense fallback={<GlobalSmallLoader />}>
                {<VerifyAccount />}
            </Suspense>
        }
    />
]
export const dashPrivateRoutes = () => [
    ...dashSharedRoutes(),
    // Mall client session routes - for guest ordering with session
    // IMPORTANT: This more specific route MUST come before the generic /:mallSlug/* route
    <Route
        key={'mall-client-session'}
        path='/:mallSlug/s/:sessionId/*'
        element={<MallClientWrapper appPath={"/"} />}
    />,
    // Mall admin routes - require React-Admin context (authenticated users)
    <Route
        key={'mall-admin'}
        path='/:mallSlug/*'
        element={<MallAppWrapper appPath={"/"} />}
    />,
    <Route
        key="private-login"
        path="/login"
        element={
            <></> //Welcome - authenticated users don't need login
        }
    />,
    // Catch-all route - must be last
    <Route
        key="private-not-found" 
        path="*"
        element={<NotFound disableCountdown={true} time={5} redirect="/" />}
    />
]

export const dashPublicRoutes = () => [
    ...dashSharedRoutes(),
    // Mall client session routes - for guest ordering with session (public access)
    // IMPORTANT: This more specific route MUST come before the generic /:mallSlug/* route
    <Route
        key={'mall-public-session'}
        path='/:mallSlug/s/:sessionId/*'
        element={<MallClientWrapper appPath={"/"} />}
    />,
    // Mall public routes - lightweight, no React-Admin (unauthenticated users)
    <Route
        key={'mall-public-landing'}
        path='/:mallSlug/*'
        element={<MallPublicWrapper appPath={"/"} />}
    />,
    <Route
        key="landing"
        data-layout="no-layout"
        path='/'
        element={
            <Suspense fallback={<GlobalSmallLoader />}>
                <MallLanding />
            </Suspense>
        }
    />,
    <Route
        key="public-login"
        path="/login"
        element={
            <DASHLightWeightLogin />
        }
    />,
    // Catch-all route - must be last
    <Route
        key="public-not-found"
        path="*"
        element={<NotFound disableCountdown={true} time={5} redirect="/login" />}
    />
];

