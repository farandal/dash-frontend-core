/**
 * DefaultPublicApp
 * 
 * A minimal public-facing application shell for unauthenticated users.
 * Used as the default fallback when no custom publicAppImport is provided.
 * 
 * Renders default public routes (login, password recovery, etc.)
 * using the DashRouterComponent from dash-utils.
 */
import React from 'react';
import { DashRouterComponent } from 'dash-utils';
import AppLoadingFallback from 'dash-components/src/components/theme/AppLoadingFallback';
import defaultPublicRoutes from "../defaults/extensions/router/dashDefaultPublicRoutes";



interface DefaultPublicAppProps {
    /**
     * Optional custom public routes to use instead of defaults
     */
    customPublicRoutes?: () => React.ReactNode[];
}

const DefaultPublicApp: React.FC<DefaultPublicAppProps> = ({ 
    customPublicRoutes 
}) => {
    // IMPORTANT: Pass the routes FUNCTION, not the result of calling it
    // This ensures routes are created INSIDE the Router context
    // where useNavigate and other Router hooks are available
    const routesProvider = customPublicRoutes || defaultPublicRoutes;
    
    return (
        <DashRouterComponent
            loader={<AppLoadingFallback message="Loading..." />}
            publicRoutes={routesProvider}
        />
    );
};

export default DefaultPublicApp;
