/**
 * SelfServiceRoutes.tsx
 * 
 * Route definitions for the self-service kiosk mode.
 * Provides a "/" home route and minimal navigation for guest ordering.
 */
import React, { lazy, Suspense } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';

// Lazy load the self-service home component
const SelfServiceHome = lazy(() => import('./kt-selfservice/resources/SelfServiceHome'));

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
export const selfServicePublicRoutes = () => [
    <Route
        key="selfservice-home"
        path="/"
        element={
            <SelfServiceHome/>
        }
    />,
    <Route
        key="selfservice-home-index"
        index
        element={
           <SelfServiceHome/>
        }
    />,
    // Catch-all redirect to home
    <Route
        key="selfservice-catch-all"
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
export const selfServicePrivateRoutes = () => [
    <Route
        key="selfservice-private-home"
        path="/"
        element={
             <SelfServiceHome/>
        }
    />,
    <Route
        key="selfservice-private-index"
        index
        element={
            <SelfServiceHome/>
        }
    />,
];

export default {
    selfServicePublicRoutes,
    selfServicePrivateRoutes,
};
