/**
 * DashThemeProviderLight
 * 
 * A lightweight theme provider for the public app that doesn't pull in heavy dependencies.
 * This avoids importing dash-styles and other packages that have side effects pulling in react-admin.
 * 
 * Instead, it reads theme values from CSS variables that are injected by dash-styles/dash-css-transformer.less
 * or overwritten locally in styles.less.
 */
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { Theme, createTheme, ThemeProvider } from '@mui/material';

// Helper to get CSS variable value from :root
const getCssVariable = (varName: string, defaultValue: string): string => {
    if (typeof document === 'undefined') return defaultValue;
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return value || defaultValue;
};

// Helper to get numeric CSS variable
const getCssVariableNumber = (varName: string, defaultValue: number): number => {
    if (typeof document === 'undefined') return defaultValue;
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
};

// Get theme colors from CSS variables based on mode
const getThemeColors = (mode: 'light' | 'dark') => {
    const suffix = `--${mode}`;
    
    return {
        // Primary colors
        primaryColor: getCssVariable(`--primary-color${suffix}`, mode === 'dark' ? '#4a90d9' : '#1976d2'),
        primaryContrast: getCssVariable(`--primary-contrast${suffix}`, '#ffffff'),
        
        // Secondary colors
        secondaryColor: getCssVariable(`--secondary-color${suffix}`, mode === 'dark' ? '#9c27b0' : '#dc004e'),
        
        // Background colors
        bodyBgPrimary: getCssVariable(`--bodybg-primary${suffix}`, mode === 'dark' ? '#1a1a2e' : '#f5f5f5'),
        bodyBgSecondary: getCssVariable(`--bodybg-secondary${suffix}`, mode === 'dark' ? '#16213e' : '#ffffff'),
        componentBg: getCssVariable(`--component-bg${suffix}`, mode === 'dark' ? '#16213e' : '#ffffff'),
        
        // Text colors
        textColor: getCssVariable(`--text-color${suffix}`, mode === 'dark' ? '#ffffff' : '#000000'),
        textContrast: getCssVariable(`--text-contrast${suffix}`, mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'),
        headingColor: getCssVariable(`--heading-color${suffix}`, mode === 'dark' ? '#ffffff' : '#000000'),
        
        // Link colors
        linkColor: getCssVariable(`--link-color${suffix}`, mode === 'dark' ? '#4a90d9' : '#1976d2'),
        
        // Border colors
        borderColor: getCssVariable(`--border-color${suffix}`, mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'),
    };
};

// Create theme from CSS variables
const createMinimalTheme = (mode: 'light' | 'dark', extendedOptions?: any): Theme => {
    const colors = getThemeColors(mode);
    
    // Get font sizes from CSS variables
    const fontSizeBase = getCssVariableNumber('--font-size-base', 14);
    const borderRadiusBase = getCssVariableNumber('--border-radius-base', 6);
    
    return createTheme({
        palette: {
            mode,
            primary: {
                main: colors.primaryColor,
                contrastText: colors.primaryContrast,
            },
            secondary: {
                main: colors.secondaryColor,
            },
            background: {
                default: colors.bodyBgPrimary,
                paper: colors.componentBg,
            },
            text: {
                primary: colors.textColor,
                secondary: colors.textContrast,
            },
            divider: colors.borderColor,
        },
        typography: {
            fontFamily: '"Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
            fontSize: fontSizeBase,
        },
        shape: {
            borderRadius: borderRadiusBase,
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        transition: 'all 0.2s ease-in-out',
                        textTransform: 'none',
                    }
                }
            },
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        backgroundColor: colors.bodyBgPrimary,
                        color: colors.textColor,
                    }
                }
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                    }
                }
            }
        },
        ...extendedOptions,
    });
};

interface DashThemeContextType {
    theme: Theme;
    currentMode: 'light' | 'dark';
    setMode: (mode: 'light' | 'dark') => void;
    toggleMode: () => void;
    refreshTheme: () => void;
}

const DashThemeContext = createContext<DashThemeContextType | null>(null);

export const useDashThemeContextLight = () => {
    const context = useContext(DashThemeContext);
    if (!context) {
        throw new Error('useDashThemeContextLight must be used within a DashThemeProviderLight');
    }
    return context;
};

interface DashThemeProviderLightProps {
    children: React.ReactNode;
    extendedOptions?: any;
}

export const DashThemeProviderLight: React.FC<DashThemeProviderLightProps> = ({ 
    children, 
    extendedOptions 
}) => {
    const [currentMode, setCurrentMode] = useState<'light' | 'dark'>(() => {
        const stored = document.documentElement.getAttribute('data-theme');
        return (stored === 'light' || stored === 'dark') ? stored : 'dark';
    });

    const [themeVersion, setThemeVersion] = useState(0);

    // Recreate theme when mode or version changes
    const theme = useMemo(() => {
        return createMinimalTheme(currentMode, extendedOptions);
    }, [currentMode, extendedOptions, themeVersion]);

    const setMode = (mode: 'light' | 'dark') => {
        setCurrentMode(mode);
        document.documentElement.setAttribute('data-theme', mode);
        localStorage.setItem('theme', mode);
    };

    const toggleMode = () => {
        setMode(currentMode === 'dark' ? 'light' : 'dark');
    };

    // Force theme recreation (useful when CSS variables change)
    const refreshTheme = () => {
        setThemeVersion(v => v + 1);
    };

    // Observe data-theme attribute changes from external sources
    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                    const newMode = document.documentElement.getAttribute('data-theme');
                    if (newMode === 'light' || newMode === 'dark') {
                        if (newMode !== currentMode) {
                            setCurrentMode(newMode);
                        }
                    }
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });

        return () => observer.disconnect();
    }, [currentMode]);

    // Listen for DASHTRefreshTheme CustomEvent to trigger theme recreation
    useEffect(() => {
        const handler = () => {
            console.log('DashThemeProviderLight: Refreshing theme from CSS variables');
            refreshTheme();
        };
        window.addEventListener('DASHTRefreshTheme', handler);
        return () => window.removeEventListener('DASHTRefreshTheme', handler);
    }, []);

    const contextValue = useMemo(() => ({
        theme,
        currentMode,
        setMode,
        toggleMode,
        refreshTheme,
    }), [theme, currentMode]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <DashThemeContext.Provider value={contextValue}>
                {children}
            </DashThemeContext.Provider>
        </ThemeProvider>
    );
};

export default DashThemeProviderLight;
