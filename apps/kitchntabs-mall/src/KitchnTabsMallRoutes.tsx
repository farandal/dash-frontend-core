import React, { Suspense } from 'react';
import { Route } from 'react-router-dom';
import { NotFound } from 'dash-components';
import DASHLightWeightLogin from 'kt-pages/src/dash-pages/DASHLightWeightLogin';
import GlobalSmallLoader from './dash-extensions/components/GlobalSmallLoader';

// Lazy load shared components

// Direct import from specific file (avoid barrel exports for tree-shaking)
//import MallClientWelcome from './kt-mall/components/MallClientWelcome';
import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/system/Box';
import { CardHeader } from '@mui/material';
import { MallClientWelcome } from './kt-mall';
// Shared routes factory function

export const dashSharedRoutes = () => [
      <Route
        key="reset-password"
        path="/reset-password"
        element={
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
            >
                <Card>
                    <CardHeader title="No habilitado" />
                        
                  
                    <CardContent>
                       
                            Lo sentimos, desde esta aplicación no es posible resetear la contraseña
                       
                    </CardContent>
                </Card>
            </Box>
        }
    />
   
]
export const dashPrivateRoutes = () => [
    ...dashSharedRoutes(),
  
     <Route
        key="landing"
        data-layout="no-layout"
        path='/'
        element={
            <Suspense fallback={<GlobalSmallLoader />}>
                <MallClientWelcome/>
            </Suspense>
        }
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
    />,
    
]

export const dashPublicRoutes = () => [
    ...dashSharedRoutes(),
    // Root shows login page for non-session URLs (like https://pw.ngrok.dev/)
    // Users must scan QR code to access a mall session
    <Route
        key="landing"
        data-layout="no-layout"
        path='/'
        element={
            <DASHLightWeightLogin />
        }
    />,
    <Route
        key="public-login"
        path="/login"
        element={
            <DASHLightWeightLogin />
        }
    />,
    // Catch-all route - any path that doesn't match gets 404
    // Session URLs (/:mallSlug/s/:sessionId/*) are handled by MallClientWrapper in Bootstrap
    <Route
        key="public-not-found"
        path="*"
        element={<NotFound disableCountdown={true} time={5} redirect="/" />}
    />
];

