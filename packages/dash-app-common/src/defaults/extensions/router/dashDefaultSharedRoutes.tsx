/**
 * Dash Default Shared Routes Extension
 * 
 * Routes that are shared between public and private contexts.
 * These can be used as base routes for both authenticated and unauthenticated users.
 */
import React, { Suspense } from 'react';
import { Route } from 'react-router-dom';
import { Box } from '@mui/material';

// Loading fallback component
const DashDefaultRouteLoader = () => (
    <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
        sx={{ color: 'var(--text-color, inherit)' }}
    >
        Loading...
    </Box>
);

// Dash default simple landing component
const DashDefaultLanding = () => (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(to bottom, var(--bodybg-primary), var(--bodybg-secondary))',
        color: 'var(--text-color, @text-color--dark)'
    }}>
        <h1>Welcome to Dash</h1>
    </div>
);

/**
 * Dash Default Shared routes configuration
 * These routes are accessible in both public and private contexts
 */
export const dashDefaultSharedRoutes = () => [
    // Landing page
    <Route
        key="landing"
        data-layout="no-layout"
        path="/"
        element={
            <Suspense fallback={<DashDefaultRouteLoader />}>
                <DashDefaultLanding />
            </Suspense>
        }
    />,
];

export default dashDefaultSharedRoutes;
