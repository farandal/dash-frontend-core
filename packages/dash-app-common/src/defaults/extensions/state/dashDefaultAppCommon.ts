/**
 * Dash Default App Common State Extension
 * 
 * Default common state configuration for the app.
 */
import React from 'react';
import { ICommonState, defaultCommon } from 'dash-admin-state';
import { AuthPersistenceService } from 'dash-auth';
import { dashStorage } from 'dash-utils';

/**
 * Get dash default app common state
 * Retrieves persisted tenant images and navigation state from storage
 */
export const getDashDefaultAppCommon = (): ICommonState => {
    const persistedTenantImages = AuthPersistenceService.getTenantImages();

    return {
        ...defaultCommon,
        appPath: '/',
        navExpanded: dashStorage.getItem('dashNavExpanded') 
            ? dashStorage.getItem('dashNavExpanded') === 'true' 
            : true,
        navSize: dashStorage.getItem('dashNavSize') || 'small',       
        width: typeof window !== 'undefined' ? window.innerWidth : 1024,
        height: typeof window !== 'undefined' ? window.innerHeight : 768,
        headerToolBar: () => React.createElement(React.Fragment),
        panelSettings: {
            horizontalLogo: persistedTenantImages?.horizontal_logo?.original || '',
            squaredLogo: persistedTenantImages?.squared_logo?.original || '',
            loginBackground: persistedTenantImages?.banner?.original || '',
        },
    };
};

/**
 * Get dash default app path
 */
export const getDashDefaultAppPath = (): string => '/';

/**
 * Get dash default panel images with fallbacks
 */
export const getDashDefaultPanelImages = () => {
    const persistedTenantImages = AuthPersistenceService.getTenantImages();
    
    return {
        horizontalLogo: persistedTenantImages?.horizontal_logo?.original || '',
        squaredLogo: persistedTenantImages?.squared_logo?.original || '',
        loginBackground: persistedTenantImages?.banner?.original || '',
    };
};

export default getDashDefaultAppCommon;
