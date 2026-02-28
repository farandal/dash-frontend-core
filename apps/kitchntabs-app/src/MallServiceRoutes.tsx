/**
 * MallServiceRoutes.tsx
 * 
 * Route definitions for the Mall Service mode (food court multi-tenant ordering).
 * Provides a "/" home route and minimal navigation for guest ordering across multiple stores.
 */
import React, { lazy, Suspense } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';

// Lazy load the self-service home component
const MallServiceHome = lazy(() => import('./kt-mallservice/components/MallServiceHome'));

// Loading fallback
const LoadingFallback = () => (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
    </Box>
);

/**
 * Self-Service Public Routes
 * 
 * These routes are available without authentication in self-service mode.
 * The "/" route is the main landing page for kiosk ordering.
 */
export const MallServicePublicRoutes = () => [
    <Route
        key="MallService-home"
        path="/"
        element={
            <MallServiceHome/>
        }
    />,
    <Route
        key="MallService-home-index"
        index
        element={
           <MallServiceHome/>
        }
    />,
    // Catch-all redirect to home
    <Route
        key="MallService-catch-all"
        path="*"
        element={<Navigate to="/" replace />}
    />,
];

/**
 * Self-Service Private Routes
 * 
 * These routes are for authenticated sessions (after QR validation).
 * In self-service mode, "authenticated" means a valid session hash.
 */
export const MallServicePrivateRoutes = () => [
    <Route
        key="MallService-private-home"
        path="/"
        element={
             <MallServiceHome/>
        }
    />,
    <Route
        key="MallService-private-index"
        index
        element={
            <MallServiceHome/>
        }
    />,
];

export default {
    MallServicePublicRoutes,
    MallServicePrivateRoutes,
};
