import React, { createContext, useContext, useState, useEffect } from 'react';
import { Theme, createTheme } from '@mui/material/styles';
import { appTheme } from 'dash-styles';
import { useAuthContext } from 'dash-admin';
import { useSelector } from 'react-redux';
import { IDASHAppState, DASH_THEME_SETTINGS } from 'dash-admin-state';
import { AuthPersistenceService } from 'dash-admin/src/contexts/auth/AuthContext'; // Add this import

interface DashThemeContextType {
    theme: Theme;
    themeOptions: ReturnType<typeof appTheme>; // Expose theme options
    updateTheme: (settings?: any) => void;
}

const defaultThemeOptions = appTheme();
const defaultTheme = createTheme(defaultThemeOptions);

const DashThemeContext = createContext<DashThemeContextType>({
    theme: defaultTheme,
    themeOptions: defaultThemeOptions,
    updateTheme: () => { }
});

export const useDashThemeContext = () => useContext(DashThemeContext);

interface DashThemeProviderProps {
    children?: React.ReactNode;
    extendedOptions?: any;
}

export const DashThemeProvider: React.FC<DashThemeProviderProps> = ({ extendedOptions, children }) => {
    const [themeOptions, setThemeOptions] = useState<ReturnType<typeof appTheme>>(() => appTheme(extendedOptions));
    const [theme, setTheme] = useState<Theme>(() => createTheme(appTheme(extendedOptions)));
    const [cssVariablesCache, setCssVariablesCache] = useState<Record<string, string> | null>(null);
    const { auth, authenticated } = useAuthContext();

    // Get theme type from Redux state
    const themeType = useSelector((state: IDASHAppState<any, any, any>) =>
        state.settings.themeType
    );

    // Helper function to get tenant settings (prioritize persisted over auth)
    const getTenantSettings = () => {
        // First try to get persisted tenant settings
        const persistedTenantSettings = AuthPersistenceService.getTenantSettings();
        if (persistedTenantSettings) {
            return persistedTenantSettings;
        }
        
        // Fallback to auth tenant settings if no persisted data
        return auth?.tenantSettings || null;
    };

    const getAllCssVariablesFromStyleSheets = (selector: string) => {
        if (cssVariablesCache) {
            return cssVariablesCache;
        }

        const cssVariables = {};

        // Loop through all style sheets
        for (let i = 0; i < document.styleSheets.length; i++) {
            try {
                const styleSheet = document.styleSheets[i];
                // Skip if the stylesheet is from a different origin and can't be accessed
                if (!styleSheet.cssRules) continue;

                // Loop through all CSS rules in the stylesheet
                for (let j = 0; j < styleSheet.cssRules.length; j++) {
                    const rule = styleSheet.cssRules[j];

                    // Check if it's a style rule (type 1)

                    /* @ts-ignore */
                    if (rule.selectorText === selector) {

                        /* @ts-ignore */
                        const style = rule.style;

                        // Loop through all style properties
                        for (let k = 0; k < style.length; k++) {
                            const prop = style[k];
                            if (prop.startsWith('--')) {
                                //console.log(prop,style.getPropertyValue(prop).trim());
                                cssVariables[prop] = style.getPropertyValue(prop).trim();
                            }
                        }
                    }

                }
            } catch (e) {
                // Skip cross-origin stylesheets that throw security errors
                console.warn('Could not access stylesheet:', e);
            }
        }

        setCssVariablesCache(cssVariables);
        return cssVariables;
    };

    // Function to update CSS variables based on tenant settings
    const updateCSSVariablesCopy = (themeType: string, settingsColors: { [x: string]: string }) => {

        const root = document.documentElement

        const _cssVars = getAllCssVariablesFromStyleSheets(":root");

        const cssVars = Object.keys(_cssVars).filter(prop => prop.endsWith(`--${themeType}`));
        cssVars.forEach(varName => {
            //console.log(varName);
            const baseVarName = varName.replace(`--${themeType}`, '');
            const value = _cssVars[varName];
            if (value) {
                //console.log("replaced",themeType,baseVarName,value)
                root.style.setProperty(baseVarName, value);
            }
        });

        if (!settingsColors) return;
        // Update CSS specific variables from backend config

        // Update any CSS variables that match the incoming settings
        Object.entries(settingsColors).forEach(([key, value]) => {
            const cssVar = `--${key}`;
            root.style.setProperty(cssVar, value);
        });
    };

    // TODO: this is too slow, setting properties one by one.
    const updateCSSVariables2 = (currentTheme, colors: { [x: string]: string }) => {


        const themeSuffix = `--${currentTheme}`;

        Object.entries(colors).forEach(([key, value]) => {
            if (key.endsWith(themeSuffix)) {
                const baseKey = key.slice(0, -themeSuffix.length);
                document.documentElement.style.setProperty(`--${baseKey}`, String(value));
            }
        });



    };

    // TODO: this method is faster, but still slow.

    const updateCSSVariables3 = (currentTheme, colors: { [x: string]: string }) => {


        const themeSuffix = `--${currentTheme}`;

        let styleString = '';
        Object.entries(colors).forEach(([key, value]) => {
            if (key.endsWith(themeSuffix)) {
                const baseKey = key.slice(0, -themeSuffix.length);
                styleString += `--${baseKey}: ${value}; `;
            }
        });
        document.documentElement.setAttribute('style', styleString);



    };

    let themeStyleElement: HTMLStyleElement | null = null;

    const updateCSSVariables = (currentTheme: string, colors: { [x: string]: string }) => {
        const startTime = performance.now();
        const themeSuffix = `--${currentTheme}`;
        
        // Create or get existing style element
        if (!themeStyleElement) {
            themeStyleElement = document.createElement('style');
            themeStyleElement.id = 'dash-theme-variables';
            document.head.appendChild(themeStyleElement);
        }
        
        // Build CSS rule
        /*const cssVariables: string[] = [];
        Object.entries(colors).forEach(([key, value]) => {
            if (key.endsWith(themeSuffix)) {
                const baseKey = key.slice(0, -themeSuffix.length);
                cssVariables.push(`--${baseKey}: ${value}`);
            }
        });*/

        let styleString = '';
        Object.entries(colors).forEach(([key, value]) => {
            if (key.endsWith(themeSuffix)) {
                const baseKey = key.slice(0, -themeSuffix.length);
                styleString += `--${baseKey}: ${value}; `;
            }
        });
   
        // Update the style element content in one operation
        themeStyleElement.textContent = `:root { ${styleString} }`;
        
        //const endTime = performance.now();
        //console.log(`updateCSSVariables execution time: ${endTime - startTime}ms`);
    };
    
    // Function to recreate theme after CSS variables are updated
    const updateTheme = (colors?: any) => {
        // Get tenant settings from persisted data or auth
        const tenantSettings = getTenantSettings();
        const colorsToUse = colors || tenantSettings?.colors || {};
        
        console.log('Updating theme with colors:', colorsToUse);
        console.log('Using tenant settings from:', tenantSettings ? 'persisted/auth data' : 'none available');
        
        updateCSSVariables(themeType, colorsToUse);
        
        // Determine which theme function to use based on theme type
        let themeFunction = () => appTheme(extendedOptions);

        // Recreate theme options with updated CSS variables and theme type
        const newThemeOptions = themeFunction();
        setThemeOptions(newThemeOptions);

        // Create actual theme from options
        const newTheme = createTheme(newThemeOptions);
        setTheme(newTheme); 
    };

    // Listen for tenant settings changes (both from auth and persisted)
    useEffect(() => {
        const tenantSettings = getTenantSettings();
        
        if (tenantSettings?.colors) {
            console.log('Tenant settings detected, updating theme');
            updateTheme(tenantSettings.colors);
        } else if (authenticated && auth) {
            // Fallback to auth tenant settings if available
            updateTheme(auth?.tenantSettings?.colors);
        } else {
            // Apply theme even without tenant settings (for theme type changes)
            updateTheme();
        }
    }, [auth, authenticated]); // Remove auth?.tenantSettings from dependency since we're using getTenantSettings()

    // Listen for theme type changes
    useEffect(() => {
        const tenantSettings = getTenantSettings();
        updateTheme(tenantSettings?.colors);
    }, [themeType]);

    // Initialize theme on mount with persisted settings
    useEffect(() => {
        const tenantSettings = getTenantSettings();
        if (tenantSettings?.colors) {
            console.log('Initializing theme with persisted tenant settings');
            updateTheme(tenantSettings.colors);
        }
    }, []); // Run only on mount

    return (
        <DashThemeContext.Provider value={{ theme, themeOptions, updateTheme }}>
            {children}
        </DashThemeContext.Provider>
    );
};

export default DashThemeContext;
