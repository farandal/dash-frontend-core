import React, { createContext, useContext, useState, useEffect } from 'react';
import { appTheme, getAntTheme } from 'dash-styles';
import { AuthPersistenceService } from 'dash-auth';
import { useSelector } from 'react-redux';
import { IDASHAppState } from 'dash-admin-state';
import { updateDomCssVariables } from 'dash-utils';
import CssBaseline from '@mui/material/CssBaseline';
import ConfigProvider from 'antd/es/config-provider';


import {
    Theme,
    createTheme,
    ThemeProvider
} from '@mui/material';

interface DashThemeContextType {
    theme: Theme;
    themeOptions: ReturnType<typeof appTheme>;
    recreateTheme: (tenantSettings?: any) => void;
    currentMode: string;
}



const DashThemeContext = createContext<DashThemeContextType | null>(null);

// Defensive patch for MUI v9: createThemeWithVars can produce a theme where
// breakpoints.internal_mediaKeys is missing. Ensure it is always set so that
// responsive `sx` props (e.g. `padding: { xs: 2, sm: 3 }`) do not crash.
function patchThemeBreakpoints(theme: Theme): Theme {
    const bp = (theme as any).breakpoints;
    if (bp && !bp.internal_mediaKeys && bp.keys && bp.up) {
        bp.internal_mediaKeys = bp.keys.map((key: string) => bp.up(key));
    }
    return theme;
}

export const useDashThemeContext = () => {
    const context = useContext(DashThemeContext);
    if (!context) {
        throw new Error('useDashThemeContext must be used within a DashThemeProvider');
    }
    return context;
};

interface DashThemeProviderProps {
    children?: React.ReactNode;
    extendedOptions?: any;
}

export const DashThemeProvider: React.FC<DashThemeProviderProps> = ({ extendedOptions, children }) => {
    // Track current theme mode from data-theme attribute
    const [currentMode, setCurrentMode] = useState<string>(() => {
        return document.documentElement.getAttribute('data-theme') || 'dark';
    });

    const [themeOptions, setThemeOptions] = useState<ReturnType<typeof appTheme>>(() => {
        // Read persisted tenant settings on initialization to include tenant colors
        // in the initial theme, avoiding a flash of default colors.
        const initialTenantSettings = AuthPersistenceService.getTenantSettings();
        return appTheme(extendedOptions, {
            currentMode,
            colors: initialTenantSettings?.colors,
            tenantSettings: initialTenantSettings,
        });
    });

    const [theme, setTheme] = useState<Theme>(() => {
        const initialTenantSettings = AuthPersistenceService.getTenantSettings();
        /* @ts-ignore */
        return patchThemeBreakpoints(createTheme(appTheme(extendedOptions, {
            currentMode,
            colors: initialTenantSettings?.colors,
            tenantSettings: initialTenantSettings,
        })));
    });


    const [antTheme, setAntTheme] = useState<any>(() => {
        const initialTenantSettings = AuthPersistenceService.getTenantSettings();

        return getAntTheme({
            currentMode,
            colors: initialTenantSettings?.colors,
            tenantSettings: initialTenantSettings,
        });
    });

    const getTenantSettings = () => {
        const persistedTenantSettings = AuthPersistenceService.getTenantSettings();
        return persistedTenantSettings || null;
    };

    const recreateTheme = (tenantSettings?: any, mode?: string) => {
        const settings = tenantSettings || getTenantSettings();
        //const themeMode = mode || currentMode;
        const themeMode = mode || document.documentElement.getAttribute('data-theme') || 'dark';

        const newThemeOptions = appTheme(
            extendedOptions,
            {
                tenantSettings: settings,
                colors: settings?.colors,
                currentMode: themeMode,
            }
        );
        /* @ts-ignore */
        const newTheme = patchThemeBreakpoints(createTheme(newThemeOptions));

        setThemeOptions(newThemeOptions);
        setTheme(newTheme);


        setAntTheme(getAntTheme({
                tenantSettings: settings,
                colors: settings?.colors,
                currentMode: themeMode,
            }));

            updateDomCssVariables(themeMode, settings?.colors, settings?.values);
        /*if (settings?.colors || settings?.values) {
            updateDomCssVariables(themeMode, settings?.colors, settings?.values);
        }*/
    };

    // Observer for data-theme attribute changes
    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                    const newMode = document.documentElement.getAttribute('data-theme') || 'dark';
                    if (newMode !== currentMode) {
                        setCurrentMode(newMode);
                        const settings = getTenantSettings();
                        updateDomCssVariables(newMode, settings?.colors, settings?.values);
                    }
                }
            });
        });

        // Start observing
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });

        // Cleanup observer on unmount
        return () => observer.disconnect();
    }, [currentMode]);

    // React to mode changes
    useEffect(() => {
        const tenantSettings = getTenantSettings();
        recreateTheme(tenantSettings, currentMode);
    }, [currentMode]);

    // Initial setup
    useEffect(() => {
        const tenantSettings = getTenantSettings();
        if (tenantSettings) {
            recreateTheme(tenantSettings, currentMode);
        }
    }, []);

    // Listen for DASHTRefreshTheme CustomEvent to trigger theme recreation
    useEffect(() => {
        const handler = (event: Event) => {
            if (event.type === 'DASHTRefreshTheme') {
                const tenantSettings = getTenantSettings();
                recreateTheme(tenantSettings, currentMode);
            }
        };
        window.addEventListener('DASHTRefreshTheme', handler);
        return () => window.removeEventListener('DASHTRefreshTheme', handler);
    }, []);

    const contextValue: DashThemeContextType = {
        theme,
        themeOptions,
        recreateTheme,
        currentMode,
       
    };
    
    return (
        <ThemeProvider noSsr disableTransitionOnChange theme={theme}>
            <CssBaseline />
            <DashThemeContext.Provider value={contextValue}>


                <ConfigProvider
                    theme={antTheme}
                >

                    {children}

                </ConfigProvider>





            </DashThemeContext.Provider>
        </ThemeProvider>
    );
};

export default DashThemeContext;
