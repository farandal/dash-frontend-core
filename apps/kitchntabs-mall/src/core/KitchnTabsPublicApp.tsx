/**
 * KitchnTabsPublicApp
 * 
 * Public (unauthenticated) app for KitchnTabs.
 * Uses kt-pages for login and public pages.
 */
import React, { useMemo, useCallback } from 'react';
import { Routes, BrowserRouter, HashRouter, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { DASHAdminSystemConstants, getEnv } from 'dash-constants';
import { dashStorage } from 'dash-utils';

// Import from kt-pages
//import CustomLogin from 'kt-pages/src/pages/Account/CustomLogin';
// TODO: Load this from dash-admin, not kt-pages. 
import DASHLightWeightLogin from '@kt-pages/dash-pages/DASHLightWeightLogin';

// Import from local dash-extensions
import GlobalSmallLoader from '../dash-extensions/components/GlobalSmallLoader';
import { dashPublicRoutes } from '@app/KitchnTabsMallRoutes';

interface KitchnTabsPublicAppProps {}

const KitchnTabsPublicApp: React.FC<KitchnTabsPublicAppProps> = () => {
    // Memoize environment variables
    const envVars = useMemo(() => ({
        APP_VERSION: getEnv('APP_VERSION') || '1.0.0',
        BUILD_TIME: getEnv('BUILD_TIME') || new Date().toISOString(),
        IS_ELECTRON: JSON.parse(getEnv('IS_ELECTRON') || 'false'),
        PLATFORM: getEnv('PLATFORM') || "unknown",
        PLATFORM_TYPE: getEnv('PLATFORM_TYPE') || "desktop",
    }), []);

    console.log('KitchnTabsPublicApp: Environment Variables:', envVars);

    const routePath = DASHAdminSystemConstants.system.URL_PREFIX || "/";
   
    const RouterComponent = useCallback(({ children }: { children: React.ReactNode }) => {
        return (
            envVars.IS_ELECTRON ? (
                <HashRouter basename={""}>
                    {children}
                </HashRouter>
            ) : (
                <BrowserRouter basename={routePath}>
                    {children}
                </BrowserRouter>
            )
        );
    }, [envVars.IS_ELECTRON, routePath]);

    return (
        <RouterComponent>
            <Box className="kitchntabs-public-app">
              
                <React.Suspense fallback={<GlobalSmallLoader />}>
                    <Routes>
                        {/* Render shared routes */}
                        {dashPublicRoutes()}
                       
                    </Routes>
                </React.Suspense>
            </Box>
        </RouterComponent>
    );
};

export default KitchnTabsPublicApp;
