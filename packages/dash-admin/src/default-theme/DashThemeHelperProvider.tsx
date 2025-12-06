import React, { createContext, useContext, useEffect } from 'react';
import { AuthPersistenceService } from 'dash-auth';
import { useColorScheme } from '@mui/material/styles';
import { updateDomCssVariables } from 'dash-utils';
import { dashStorage } from 'dash-utils';

interface DashThemeHelperContextType {
    mode: string;
}

// Get initial mode from storage, defaulting to 'dark'
const getInitialMode = (): string => {
    const stored = dashStorage.getItem('theme');
    return (stored === 'light' || stored === 'dark') ? stored : 'dark';
};

const DashThemeHelperContext = createContext<DashThemeHelperContextType>({
    mode: getInitialMode()
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
    const { mode, setMode } = useColorScheme();

    // Effective mode: use MUI mode if valid, otherwise fallback to stored theme
    const effectiveMode = (mode === 'light' || mode === 'dark') ? mode : getInitialMode();

    // Helper function to get tenant settings (prioritize persisted over auth)
    const getTenantSettings = () => {
        const persistedTenantSettings = AuthPersistenceService.getTenantSettings();
        if (persistedTenantSettings) {
            return persistedTenantSettings;
        }
        return null;
    };

    // Sync MUI mode with stored theme on mount
    useEffect(() => {
        const storedTheme = dashStorage.getItem('theme');
        if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark') && mode !== storedTheme) {
            setMode(storedTheme as 'light' | 'dark');
        } else if (!storedTheme) {
            // No stored theme - set default and persist
            const defaultMode = 'dark';
            dashStorage.setItem('theme', defaultMode);
            document.documentElement.setAttribute('data-theme', defaultMode);
            setMode(defaultMode);
        }
    }, []);

    // Listen for theme mode changes and update DOM CSS variables
    useEffect(() => {
        if (mode !== 'light' && mode !== 'dark') return; // Skip if MUI returns undefined/system
        
        // Emit custom event for theme mode switch
        const themeEvent = new CustomEvent('dash-theme-mode-switched', { detail: { mode } });
        window.dispatchEvent(themeEvent);
     
        const tenantSettings = getTenantSettings();
        if (tenantSettings?.colors || tenantSettings?.values) {
            dashStorage.setItem('theme', mode);
            document.documentElement.setAttribute('data-theme', mode);
            updateDomCssVariables(mode, tenantSettings?.colors || {}, tenantSettings?.values || {});
        }
    }, [mode]);

    return (
        <DashThemeHelperContext.Provider value={{ mode: effectiveMode }}>
            {children}
        </DashThemeHelperContext.Provider>
    );
};

export default DashThemeHelperProvider;