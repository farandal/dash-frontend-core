/**
 * Dash Default Static Components Extension
 * 
 * Static/memoized components used throughout the application.
 */
import React from 'react';

// Lazy load password pages from dash-admin
const RecoverPassword = React.lazy(() => import('dash-admin/src/pages/RecoverPassword'));
const ChangePassword = React.lazy(() => import('dash-admin/src/pages/ChangePassword'));

/**
 * Dash default static components configuration
 * These are pre-rendered components that don't need to be recreated
 */
export const dashDefaultStaticComponents = {
    defaultRecoverPassword: (
        <React.Suspense fallback={<div>Loading...</div>}>
            <RecoverPassword />
        </React.Suspense>
    ),
    defaultChangePassword: (
        <React.Suspense fallback={<div>Loading...</div>}>
            <ChangePassword />
        </React.Suspense>
    ),
};

/**
 * Get dash default static components - useful for memoization
 */
export const getDashDefaultStaticComponents = () => dashDefaultStaticComponents;

export default dashDefaultStaticComponents;
