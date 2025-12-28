/**
 * Dash Default Private Routes Extension
 * 
 * Routes that require authentication.
 * These routes are rendered when the user is logged in.
 */
import React, { Suspense } from 'react';
import { Route } from 'react-router-dom';
import { DashDefaultLoader } from '../components/DashDefaultLoader';

// Dash default simple landing component for authenticated users
const DashDefaultAuthenticatedLanding = () => (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(to bottom, var(--bodybg-primary), var(--bodybg-secondary))',
        color: 'var(--text-color, @text-color--dark)'
    }}>
        <h1>Welcome back!</h1>
    </div>
);

/**
 * Dash Default Private routes configuration
 * These routes require authentication
 */
export const dashDefaultPrivateRoutes = () => [
    // Landing page (authenticated view)
    <Route
        key="landing"
        data-layout="no-layout"
        path="/"
        element={
            <Suspense fallback={<DashDefaultLoader />}>
                <DashDefaultAuthenticatedLanding />
            </Suspense>
        }
    />,
    
    // Login redirect (when already authenticated)
    <Route
        key="login-redirect"
        path="/login"
        element={<></>}
    />,
];

export default dashDefaultPrivateRoutes;
