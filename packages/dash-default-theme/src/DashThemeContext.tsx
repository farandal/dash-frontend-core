import React, { createContext, useContext, useState, useEffect } from 'react';
import { Theme, createTheme } from '@mui/material/styles';
import { appTheme } from 'dash-styles';
import { useAuthContext } from 'dash-admin';
import { useSelector } from 'react-redux';
import { IDASHAppState, DASH_THEME_SETTINGS } from 'dash-admin-state';

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
  const auth = useAuthContext();

  // Get theme type from Redux state
  const themeType = useSelector((state: IDASHAppState<any, any, any>) =>
      state.settings.themeType
  );


  const getAllCssVariablesFromStyleSheets = (selector:string) => {
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
      console.log("cssVariables",cssVariables);
      setCssVariablesCache(cssVariables);
      return cssVariables;
    };

  // Function to update CSS variables based on tenant settings
  const updateCSSVariables = (themeType: string, settingsColors: { [x: string]: string }) => {
   
      const root = document.documentElement
       
      const _cssVars = getAllCssVariablesFromStyleSheets(":root");
     
      const cssVars = Object.keys(_cssVars).filter(prop => prop.endsWith(`--${themeType}`));
      cssVars.forEach(varName => {
          //console.log(varName);
          const baseVarName = varName.replace(`--${themeType}`, '');
          const value = _cssVars[varName];
          if(value) {
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

  // Function to recreate theme after CSS variables are updated
  const updateTheme = (settings?: any) => {

      updateCSSVariables(themeType, settings?.colors || null);
      // Determine which theme function to use based on theme type
      let themeFunction = () => appTheme(extendedOptions);

      // Recreate theme options with updated CSS variables and theme type
      const newThemeOptions = themeFunction();
      setThemeOptions(newThemeOptions);

      // Create actual theme from options
      const newTheme = createTheme(newThemeOptions);
      setTheme(newTheme);

      
  };

  // Listen for tenant settings changes
  useEffect(() => {
      if (auth.authenticated && auth.auth) {
          updateTheme(auth.auth.tenantSettings);
      }
  }, [auth]);

  // Listen for theme type changes
  useEffect(() => {
      updateTheme(auth.auth?.tenantSettings);
  }, [themeType]);

  return (
      <DashThemeContext.Provider value={{ theme, themeOptions, updateTheme }}>
          {children}
      </DashThemeContext.Provider>
  );
};

export default DashThemeContext;