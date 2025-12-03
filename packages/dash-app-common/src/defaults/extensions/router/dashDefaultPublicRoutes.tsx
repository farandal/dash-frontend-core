/**
 * Default Public Routes
 * 
 * These are the default routes for the public app when no custom routes are provided.
 * They include basic authentication routes (login, password recovery, etc.)
 * 
 * NOTE: Uses standalone components that don't depend on react-admin hooks.
 * react-admin hooks (useRedirect, useNotify, etc.) require <Admin> context,
 * which is not available in the public routes.
 */
import React, { Suspense } from 'react';
import { Route, Navigate } from 'react-router-dom';
import AppLoadingFallback from 'dash-components/src/components/theme/AppLoadingFallback';

// Lazy load auth pages - these are standalone components that use React Router hooks
const DashDefaultLogin = React.lazy(() => import('../../pages/DashDefaultLogin'));
const RecoverPassword = React.lazy(() => import('dash-admin/src/pages/RecoverPassword'));
const ChangePassword = React.lazy(() => import('dash-admin/src/pages/ChangePassword'));
const VerifyAccount = React.lazy(() => import('dash-admin/src/pages/VerifyAccount'));

// Loading fallback
const LoadingFallback = () => <AppLoadingFallback message="Loading..." />;

// Simple landing that redirects to login
const SimpleLanding = () => <Navigate to="/login" replace />;

/**
 * Default Public Routes configuration
 * These routes are accessible without authentication
 */
export const dashDefaultPublicRoutes = () => {
    return [
    // Default landing page - redirect to login
    <Route
        key="landing"
        data-layout="no-layout"
        path="/"
        element={<SimpleLanding />}
    />,

    // Login page - uses standalone component
    <Route
        key="login"
        data-layout="no-layout"
        path="/login"
        element={
            <Suspense fallback={<LoadingFallback />}>
                <DashDefaultLogin />
            </Suspense>
        }
    />,

    // Password recovery
    <Route
        key="reset-password"
        path="/reset-password"
        element={
            <Suspense fallback={<LoadingFallback />}>
                <RecoverPassword />
            </Suspense>
        }
    />,
    <Route
        key="change-password"
        path="/change-password"
        element={
            <Suspense fallback={<LoadingFallback />}>
                <ChangePassword />
            </Suspense>
        }
    />,

    // Account verification
    <Route
        key="verify-account"
        path="/verify-email"
        element={
            <Suspense fallback={<LoadingFallback />}>
                <VerifyAccount />
            </Suspense>
        }
    />,
];
};

export default dashDefaultPublicRoutes;
