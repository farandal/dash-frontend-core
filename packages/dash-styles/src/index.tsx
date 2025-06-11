import { defaultTheme } from 'react-admin';
import { deepmerge } from '@mui/utils';
const defaultColors = {
  main: '#F5F5F5',
  mainContrast: '#E0E0E0',
  white: '#FFFFFF',
  textPrimary: '#212121',
  textSecondary: '#757575',
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
  info: '#2196f3',
  background: '#FAFAFA',
  paper: '#FFFFFF'
};

// Dark mode colors
const darkModeColors = {
  main: '#121212',
  mainContrast: '#1E1E1E',
  white: '#E0E0E0',
  textPrimary: '#FAFAFA',
  textSecondary: '#9E9E9E',
  success: '#66bb6a',
  error: '#f44336',
  warning: '#ffa726',
  info: '#29b6f6',
  background: '#0A0A0A',
  paper: '#1A1A1A'
};

    const getAllCssVariablesFromStyleSheets = (selector: string) => {

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


        return cssVariables;
    };

const getCSSVar = (name: string, defaultColor?: string) => {

  const value = window.getComputedStyle(document.documentElement)
    .getPropertyValue(`${name}`)
    .trim();

  return value || defaultColor || '#000000';

};



export const defaultOptions = () => {
  //const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
  //const themeType = document.documentElement.getAttribute('data-theme') || "light";
  //console.log("REBUILDING MUI THEME!", themeType)

  //const colors = isDarkMode ? darkModeColors : defaultColors;
  const cssVars = getAllCssVariablesFromStyleSheets(":root");

  return {
    palette: {
      background: {
        default: cssVars['--body-background'],
        paper: cssVars['--module-background']
      },
      primary: {
        main: cssVars['--primary-color'],
      },
      secondary: {
        main: cssVars['--secondary-color'],
      },
      text: {
        primary: cssVars['--text-color'],
        secondary: cssVars['--text-light-color'],
        disabled: cssVars['--disabled-color'],
      },
      action: {
        active: cssVars['--component-active-background'],
        hover: cssVars['--component-hover-background'],
        disabled: cssVars['--disabled-color'],
        disabledBackground: cssVars['--disabled-bg'],
      },
      divider: cssVars['--border-color-split'],
      border: cssVars['--border-color'],
      error: {
        main: cssVars['--dash-alert-error-bg'],
        contrastText: cssVars['--dash-alert-error-title'],
      },
      warning: {
        main: cssVars['--dash-alert-warning-bg'],
        contrastText: cssVars['--dash-alert-warning-title'],
      },
      info: {
        main: cssVars['--dash-alert-info-bg'],
        contrastText: cssVars['--dash-alert-info-title'],
      },
      success: {
        main: cssVars['--dash-alert-success-bg'],
        contrastText: cssVars['--dash-alert-success-title'],
      },
      common: {
        black: cssVars['--text-color'],
        white: cssVars['--text-contrast-color'],
      },

    },
    typography: {
      allVariants: {
        color: cssVars['--text-color']
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            color: cssVars['--text-color']
          }
        }
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            textWrapMode: 'nowrap'
          }
        }
      },

      RaReferenceField: {
        styleOverrides: {
          root: {
            '& .RaReferenceField-link>*': {
              color: cssVars['--text-color']
            }
          }
        }
      },
      RaSingleFieldList: {
        styleOverrides: {
          root: {
            '& .RaSingleFieldList-link>*': {
              color: cssVars['--text-color']
            }
          }
        }
      },
      MuiInputAdornment: {
        styleOverrides: {
          root: {
            '& svg': {
              color: cssVars['--highlight-color']
            }
          }
        }
      },
      MuiTab: {
              styleOverrides: {
                root: {
                  '&.MuiButtonBase-root': {
                    '&.Mui-selected': {
                      color: cssVars['--highlight-color'],
                      backgroundColor: cssVars['--tab-selected-bg'],
                    },
                    '&.MuiTab-textColorPrimary': {
                      color: cssVars['--text-color'],
                    },

                  }
                }
              }
            },

      MuiAlert: {
        styleOverrides: {
          root: {
            '&.MuiAlert-standardInfo': {
              backgroundColor: cssVars['--module-background'],
              color: cssVars['--text-color'],
              '& .MuiAlert-icon': {
                color: cssVars['--highlight-color']
              },
              '& .MuiAlertTitle-root': {
                color: cssVars['--text-color']
              }
            }
          }
        }
      },




      MuiAccordion: {
        styleOverrides: {
          root: {
            backgroundColor: cssVars['--module-background'],

            '&.MuiPaper-root': {
              backgroundColor: cssVars['--module-background'],
            }
          }
        }
      },
      MuiAccordionSummary: {
        styleOverrides: {
          expandIconWrapper: {
            color: 'inherit', // This makes the color inherited from parent
            '& .MuiSvgIcon-root': {
              color: 'inherit' // Also ensure the SVG icon inherits color
            }
          }
        }
      },

      MuiBox: {
        styleOverrides: {
          root: {
            display: 'flex !important'
          }
        }
      },

      MuiCard: {
        styleOverrides: {
          root: {
             backgroundColor: cssVars['--module-background'],
          }
        }
      },

       MuiPaper: {
        styleOverrides: {
          root: {
              marginBottom: 8,
              backgroundColor: cssVars['--module-background'],
          }
        }
      },

      //MuiToolbar: {
      //  styleOverrides: {
      //    root: {
      //      display: 'block'
      //    }
      //  }
      //},
      //MuiGrid: {
      //  styleOverrides: {
      //    root: {
      //      display: 'block'
      //    }
      //  }
      //},
//
    }
  }

};

export const appTheme = (muiThemeOptions?: any) => {

  const themeType = document.documentElement.getAttribute('data-theme') || "light";


  const theme = muiThemeOptions ? deepmerge(deepmerge(defaultTheme, {
    mode: themeType,
    ...defaultOptions(),

  }), muiThemeOptions) : deepmerge(defaultTheme, {
    mode: themeType,

    ...defaultOptions(),

  });

  return theme;

}


export default appTheme;
