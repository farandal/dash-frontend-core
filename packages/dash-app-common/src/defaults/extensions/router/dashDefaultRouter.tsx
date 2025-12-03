/**
 * Dash Default Router Extension
 * 
 * Router configuration and wrapper components.
 */
import React from 'react';
import { DashRouterComponent } from 'dash-utils';
import { DASHAdminSystemConstants, getEnv } from 'dash-constants';

/**
 * Environment variables for dash default router configuration
 */
export const getDashDefaultRouterEnvVars = () => ({
    PLATFORM_TYPE: getEnv('PLATFORM_TYPE') || 'desktop',
    PLATFORM: getEnv('PLATFORM') || 'unknown',
    BASE_PATH: DASHAdminSystemConstants.system.URL_PREFIX || '/',
    IS_ELECTRON: JSON.parse(getEnv('IS_ELECTRON') || 'false'),
});

/**
 * DashDefaultRouterWrapper - Memoizable router component
 * Uses environment variables to determine router type
 */
export const DashDefaultRouterWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const envVars = getDashDefaultRouterEnvVars();
    
    return (
        <DashRouterComponent
            platformType={envVars.PLATFORM_TYPE}
            platform={envVars.PLATFORM}
            basename={envVars.BASE_PATH}
        >
            {children}
        </DashRouterComponent>
    );
};

/**
 * Create a dash default router wrapper with specific environment settings
 */
export const createDashDefaultRouterWrapper = (platformType?: string, platform?: string) => {
    const RouterWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <DashRouterComponent
            platformType={platformType || getDashDefaultRouterEnvVars().PLATFORM_TYPE}
            platform={platform || getDashDefaultRouterEnvVars().PLATFORM}
        >
            {children}
        </DashRouterComponent>
    );
    
    return RouterWrapper;
};

export default DashDefaultRouterWrapper;
