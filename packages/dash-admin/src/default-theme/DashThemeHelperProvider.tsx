import React, { createContext, useContext, useEffect } from 'react';
//import { useAuthContext } from '../..';
import { AuthPersistenceService } from 'dash-auth';
import { useColorScheme } from '@mui/material/styles';
import { updateDomCssVariables } from 'dash-utils';

interface DashThemeHelperContextType {
    mode: string;
}

const DashThemeHelperContext = createContext<DashThemeHelperContextType>({
    mode: localStorage.getItem('theme') || 'light'
});


export const useDashThemeHelperContext = () => useContext(DashThemeHelperContext);

/**
 * Props interface for DashThemeHelperProvider component
 * @interface DashThemeHelperProviderProps
 * @property {React.ReactNode} [children] - Child components to be rendered within the provider
 */
interface DashThemeHelperProviderProps {
    children?: React.ReactNode;
}

/**
 * DashThemeHelperProvider component
 * 
 * This component is responsible for:
 * - Listening to MUI theme mode changes (light/dark)
 * - Updating CSS custom properties (variables) in the DOM based on the current theme mode
 * - Applying tenant-specific color settings to the theme
 * - Providing theme mode context to child components
 * 
 * @component
 * @param {DashThemeHelperProviderProps} props - Component props
 * @returns {React.ReactElement} Provider component with theme context
 */
export const DashThemeHelperProvider: React.FC<DashThemeHelperProviderProps> = ({ children }) => {
    //const { auth, authenticated } = useAuthContext();
    const { mode, setMode } = useColorScheme();

    // Helper function to get tenant settings (prioritize persisted over auth)
    const getTenantSettings = () => {
        const persistedTenantSettings = AuthPersistenceService.getTenantSettings();
        if (persistedTenantSettings) {
            return persistedTenantSettings;
        }
        return null;
    };

    // Listen for theme mode changes and update DOM CSS variables
    useEffect(() => {
        // Emit custom event for theme mode switch
      
        const themeEvent = new CustomEvent('dash-theme-mode-switched', { detail: { mode } });
        window.dispatchEvent(themeEvent);
     
        //console.log("mode change from dash helper   ", mode);
        const tenantSettings = getTenantSettings();
        if (tenantSettings?.colors || tenantSettings?.values) {
            //document.documentElement.setAttribute('data-theme', mode);
           
            localStorage.setItem('theme', mode);
            updateDomCssVariables(mode, tenantSettings?.colors || {},tenantSettings?.values || {});
        }
    }, [mode]);

   

    return (
        <DashThemeHelperContext.Provider value={{ mode: mode }}>
            {children}
        </DashThemeHelperContext.Provider>
    );
};

export default DashThemeHelperProvider;