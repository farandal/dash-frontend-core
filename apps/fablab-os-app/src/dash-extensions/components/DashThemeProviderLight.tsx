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
/*const getCssVariable = (varName: string, defaultValue: string): string => {
    if (typeof document === 'undefined') return defaultValue;
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return value || defaultValue;
};*/

// Helper to get numeric CSS variable
const getCssVariableNumber = (varName: string, defaultValue: number): number => {
    if (typeof document === 'undefined') return defaultValue;
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
};

// Get theme colors from CSS variables based on mode
// Helper to get CSS variable value from :root, returns null if not set
const getCssVariable = (varName: string): string | null => {
    if (typeof document === 'undefined') return null;
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return value || null;
};

// Get theme colors from CSS variables based on mode, only including defined variables
const getThemeColors = (mode: 'light' | 'dark') => {
    const colors: any = {};
    const suffix = `--${mode}`;
    
    // Primary colors
    const primaryColor = getCssVariable(`--primary-color${suffix}`);
    if (primaryColor) colors.primaryColor = primaryColor;
    
    const primaryContrast = getCssVariable(`--primary-contrast${suffix}`);
    if (primaryContrast) colors.primaryContrast = primaryContrast;
    
    // Secondary colors
    const secondaryColor = getCssVariable(`--secondary-color${suffix}`);
    if (secondaryColor) colors.secondaryColor = secondaryColor;
    
    // Background colors
    const bodyBgPrimary = getCssVariable(`--bodybg-primary${suffix}`);
    if (bodyBgPrimary) colors.bodyBgPrimary = bodyBgPrimary;
    
    const bodyBgSecondary = getCssVariable(`--bodybg-secondary${suffix}`);
    if (bodyBgSecondary) colors.bodyBgSecondary = bodyBgSecondary;
    
    const componentBg = getCssVariable(`--component-bg${suffix}`);
    if (componentBg) colors.componentBg = componentBg;
    
    // Text colors
    const textColor = getCssVariable(`--text-color${suffix}`);
    if (textColor) colors.textColor = textColor;
    
    const textContrast = getCssVariable(`--text-contrast${suffix}`);
    if (textContrast) colors.textContrast = textContrast;
    
    const headingColor = getCssVariable(`--heading-color${suffix}`);
    if (headingColor) colors.headingColor = headingColor;
    
    // Link colors
    const linkColor = getCssVariable(`--link-color${suffix}`);
    if (linkColor) colors.linkColor = linkColor;
    
    // Border colors
    const borderColor = getCssVariable(`--border-color${suffix}`);
    if (borderColor) colors.borderColor = borderColor;

    // Button colors (used for MUI palette.primary to match dash-styles behavior)
    const btnBg = getCssVariable(`--btn-bg${suffix}`);
    if (btnBg) colors.btnBg = btnBg;

    const btnColor = getCssVariable(`--btn-color${suffix}`);
    if (btnColor) colors.btnColor = btnColor;

    const btnPrimaryBg = getCssVariable(`--btn-primary-bg${suffix}`);
    if (btnPrimaryBg) colors.btnPrimaryBg = btnPrimaryBg;

    const btnPrimaryColor = getCssVariable(`--btn-primary-color${suffix}`);
    if (btnPrimaryColor) colors.btnPrimaryColor = btnPrimaryColor;
    
    return colors;
};

// Create theme from CSS variables
const createMinimalTheme = (mode: 'light' | 'dark', extendedOptions?: any): Theme => {
    const colors = getThemeColors(mode);
    
    // Get font sizes from CSS variables
    const fontSizeBase = getCssVariableNumber('--font-size-base', 14);
    const borderRadiusBase = getCssVariableNumber('--border-radius-base', 6);
    
    // Use btn-bg for palette.primary.main to match dash-styles/index.tsx behavior.
    // This ensures MUI buttons (color="primary") use the button color, not the brand primary color.
    // Fallback chain: btn-bg → primaryColor → MUI default
    const primaryMain = colors.btnBg || colors.primaryColor;
    const primaryContrastText = colors.btnColor || colors.primaryContrast;

    return createTheme({
         breakpoints: {
            keys: ['xs', 'sm', 'md', 'lg', 'xl'],
            values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },
        },
        
        palette: {
            mode,
            primary: {
                main: primaryMain,
                contrastText: primaryContrastText,
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
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        color: 'var(--text-color)',
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'var(--border-color)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'var(--primary-color)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'var(--primary-color)',
                        },
                    },
                },
            },
            MuiInputLabel: {
                styleOverrides: {
                    root: {
                        color: 'var(--text-color)',
                        '&.Mui-focused': {
                            color: 'var(--primary-color)',
                        },
                    },
                },
            },
            MuiSelect: {
                styleOverrides: {
                    select: {
                        color: 'var(--text-color)',
                    },
                    icon: {
                        color: 'var(--text-color)',
                    },
                },
            },
            ...(extendedOptions?.components || {}),
        },
        ...(extendedOptions ? (({ components, ...rest }) => rest)(extendedOptions) : {}),
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
        // Check localStorage first
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('theme');
            if (stored === 'light' || stored === 'dark') return stored;
        }
        
        // Fallback to data-theme attribute
        if (typeof document !== 'undefined') {
            const attr = document.documentElement.getAttribute('data-theme');
            return (attr === 'light' || attr === 'dark') ? attr : 'dark';
        }
        
        return 'dark';
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
