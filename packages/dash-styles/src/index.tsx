import { defaultTheme } from 'react-admin';
import { deepmerge } from '@mui/utils';

const getAllCssVariablesFromStyleSheets = (selector: string) => {
  const cssVariables = {};

  for (let i = 0; i < document.styleSheets.length; i++) {
    try {
      const styleSheet = document.styleSheets[i];
      if (!styleSheet.cssRules) continue;

      for (let j = 0; j < styleSheet.cssRules.length; j++) {
        const rule = styleSheet.cssRules[j];

        /* @ts-ignore */
        if (rule.selectorText === selector) {
          /* @ts-ignore */
          const style = rule.style;

          for (let k = 0; k < style.length; k++) {
            const prop = style[k];
            if (prop.startsWith('--')) {
              cssVariables[prop] = style.getPropertyValue(prop).trim();
            }
          }
        }
      }
    } catch (e) {
      console.warn('Could not access stylesheet:', e);
    }
  }

  return cssVariables;
};

export const defaultOptions = (options) => {
  const { tenantSettings, colors, ...otherOptions } = options || {};
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const cssVars = getAllCssVariablesFromStyleSheets(":root");

  const _color = (key, colorKey, mode = null) => {
    if (colors) {
      const colorValue = colors[`${colorKey}--${mode || currentTheme}`];
      return colorValue ? { [key]: colorValue } : {};
    } else if (cssVars[`--${colorKey}--${mode || currentTheme}`]) {
      const cssVarValue = cssVars[`--${colorKey}--${mode || currentTheme}`];
      return cssVarValue ? { [key]: cssVarValue } : {};
    } else {
      return {};
    }
  };

  const createPalette = (mode = 'light') => {
    const palette = {
      mode,
      background: {
        ..._color('default', 'module-bg', mode),
        ..._color('paper', 'module-bg', mode)
      },
      primary: {
        ..._color('main', 'primary-color', mode),
        ..._color('contrastText', 'primary-contrast', mode)
      },
      secondary: {
        ..._color('main', 'secondary-color', mode)
      },
      text: {
        ..._color('primary', 'text-color', mode),
        ..._color('secondary', 'text-light', mode),
        ..._color('disabled', 'disabled-color', mode)
      },
      action: {
        ..._color('active', 'component-active-bg', mode),
        ..._color('hover', 'component-hover-bg', mode),
        ..._color('disabled', 'disabled-color', mode),
        ..._color('disabledBackground', 'disabled-bg', mode)
      },
      //..._color('divider', 'component-border-split', mode),
      ..._color('border', 'border-color', mode),
      error: {
        ..._color('main', 'alert-error-bg', mode),
        ..._color('contrastText', 'alert-error-title', mode)
      },
      warning: {
        ..._color('main', 'alert-warning-bg', mode),
        ..._color('contrastText', 'alert-warning-title', mode)
      },
      info: {
        ..._color('main', 'alert-info-bg', mode),
        ..._color('contrastText', 'alert-info-title', mode)
      },
      success: {
        ..._color('main', 'alert-success-bg', mode),
        ..._color('contrastText', 'alert-success-title', mode)
      },
      common: {
        ..._color('black', 'text-color', mode),
        ..._color('white', 'text-contrast', mode)
      },
      /* variant: {
         ..._color('containedBg', 'btn-bg', mode),

       }*/
    };

    // Filter out empty objects and undefined values
    return Object.fromEntries(
      Object.entries(palette).filter(([_, value]) => {
        if (typeof value === 'object' && value !== null) {
          return Object.keys(value).length > 0;
        }
        return value !== undefined;
      })
    );
  };

  return {
    cssVariables: {
      cssVarPrefix: 'dash', // Your custom prefix
      colorSchemeSelector: 'data-theme', // Tell MUI to use data attributes
    },
    // Enable both light and dark color schemes
    /*colorSchemes: {
      light: true,
      dark: true,
    },*/

    colorSchemes: {
      light: {
        palette: createPalette('light')
      },
      dark: {
        palette: createPalette('dark')
      },
      /*system: {
        palette: createPalette('dark')
      },*/
    },

    defaultColorScheme: currentTheme,


    palette: createPalette(currentTheme),


    // Don't put your custom CSS variables in the palette
    // Instead, use them directly in component overrides
    typography: {
      allVariants: {
        //color: 'var(--text-color)', // Keep using your CSS variables here
      },
    },
    components: {
      // Override ALL color usage in component overrides
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: 'var(--body-bg)',
            color: 'var(--text-color)',
          },
        },
      },


      /* MuiIconButton: {
         styleOverrides: {
           root: {
             backgroundColor: 'var(--btn-bg)',
             color: 'var(--btn-color)',

             '&.MuiIconButton-containedPrimary': {
               backgroundColor: 'var(--primary-color)',
               color: 'var(--btn-color)',
               '&:hover': {
                 backgroundColor: 'var(--highlight-color)',
               },
             },
             '&.MuiIconButton-containedSecondary': {
               backgroundColor: 'var(--secondary-color)',
               color: 'var(--btn-color)',
               '&:hover': {
                 backgroundColor: 'var(--highlight-color)',
               },
             },
             '&.MuiIconButton-outlinedPrimary': {
               backgroundColor: 'inherit',
               borderColor: 'var(--primary-color)',
               color: 'var(--text-color)',
               '&:hover': {
                 borderColor: 'var(--highlight-color)',
               },
             },
             '&.MuiIconButton-outlinedSecondary': {
               backgroundColor: 'inherit',
               borderColor: 'var(--primary-color)',
               color: 'var(--text-color)',
               '&:hover': {
                 borderColor: 'var(--highlight-color)',
               },
             },
           },
         },
       },*/
      MuiButton: {
        styleOverrides: {
          root: {
            backgroundColor: 'var(--btn-bg)',
            color: 'var(--btn-color)',

            '&.MuiButton-containedPrimary': {
              backgroundColor: 'var(--primary-color)',
              color: 'var(--btn-color)',
              '&:hover': {
                backgroundColor: 'var(--highlight-color)',
              },
            },
            '&.MuiButton-containedSecondary': {
              backgroundColor: 'var(--secondary-color)',
              color: 'var(--btn-color)',
              '&:hover': {
                backgroundColor: 'var(--highlight-color)',
              },
            },
            '&.MuiButton-outlinedPrimary': {
              backgroundColor: 'inherit',
              borderColor: 'var(--primary-color)',
              color: 'var(--text-color)',
              '&:hover': {
                borderColor: 'var(--highlight-color)',
              },
            },
            '&.MuiButton-outlinedSecondary': {
              backgroundColor: 'inherit',
              borderColor: 'var(--primary-color)',
              color: 'var(--text-color)',
              '&:hover': {
                borderColor: 'var(--highlight-color)',
              },
            },
            '&.MuiButton-textPrimary': {
              color: 'var(--link-color)',
              background: 'none',
              '&:hover': {
                color: 'var(--highlight-color)',
                textDecoration: 'underline',
                background: 'none',
              },
            },
            '&.MuiButton-textSecondary': {
              color: 'var(--text-light-color)',
              background: 'none',
              '&:hover': {
                color: 'var(--highlight-color)',
                textDecoration: 'underline',
                background: 'none',
              },
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          root: {
            zIndex: 100
          }
        }
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: 'var(--module-bg)',
            color: 'var(--text-color)',
            border: '1px solid var(--border-color)',
            fontSize: '0.75rem',
            maxWidth: 300,
            '& .MuiTooltip-arrow': {
              color: 'var(--module-bg)',
              '&::before': {
                border: '1px solid var(--border-color)',
              },
            },
          },
          popper: {
            '&[data-popper-placement*="bottom"] .MuiTooltip-tooltip': {
              marginTop: '8px',
            },
            '&[data-popper-placement*="top"] .MuiTooltip-tooltip': {
              marginBottom: '8px',
            },
            '&[data-popper-placement*="right"] .MuiTooltip-tooltip': {
              marginLeft: '8px',
            },
            '&[data-popper-placement*="left"] .MuiTooltip-tooltip': {
              marginRight: '8px',
            },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            backgroundColor: 'var(--highlight-color)',
          },
        },
      },

      RaReferenceField: {
        styleOverrides: {
          root: {
            '& .RaReferenceField-link>*': {
              color: 'var(--text-color)',
            },
          },
        },
      },
      RaSingleFieldList: {
        styleOverrides: {
          root: {
            '& .RaSingleFieldList-link>*': {
              color: 'var(--text-color)',
            },
          },
        },
      },
      MuiInputAdornment: {
        styleOverrides: {
          root: {
            '& svg': {
              color: 'var(--highlight-color)',
            },
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            '&.MuiButtonBase-root': {
              '&.Mui-selected': {
                color: 'var(--highlight-color)',
                backgroundColor: 'var(--tab-selected-bg)',
              },
              '&.MuiTab-textColorPrimary': {
                color: 'var(--table-color)',
              },
            },
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            '&.MuiAlert-standardInfo': {
              backgroundColor: 'var(--module-bg)',
              color: 'var(--text-color)',
              '& .MuiAlert-icon': {
                color: 'var(--highlight-color)',
              },
              '& .MuiAlertTitle-root': {
                color: 'var(--text-color)',
              },
            },
            '&.MuiAlert-standardError': {
              backgroundColor: 'var(--dash-alert-error-bg)',
              color: 'var(--dash-alert-error-title)',
            },
            '&.MuiAlert-standardWarning': {
              backgroundColor: 'var(--dash-alert-warning-bg)',
              color: 'var(--dash-alert-warning-title)',
            },
            '&.MuiAlert-standardSuccess': {
              backgroundColor: 'var(--dash-alert-success-bg)',
              color: 'var(--dash-alert-success-title)',
            },
          },
        },
      },
      MuiAccordion: {
        styleOverrides: {
          root: {
            backgroundColor: 'var(--module-bg)',
            '&.MuiPaper-root': {
              backgroundColor: 'var(--module-bg)',
            },
          },
        },
      },
      MuiAccordionSummary: {
        styleOverrides: {
          expandIconWrapper: {
            color: 'inherit',
            '& .MuiSvgIcon-root': {
              color: 'inherit',
            },
          },
        },
      },
      MuiBox: {
        styleOverrides: {
          root: {
            display: 'flex !important',
          },
        },
      },
      /* MuiCard: {
         styleOverrides: {
           root: {
             backgroundColor: 'var(--module-bg)',
           },
         },
       },
       MuiPaper: {
         styleOverrides: {
           root: {
             marginBottom: 8,
             backgroundColor: 'var(--module-bg)', // Use the correct variable name
             color: 'var(--text-color)',
           },
         },
       },
       */
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: 'var(--primary-color)',
            color: 'var(--text-contrast-color)',
          },
        },
      },
      /*MuiChip: {
        styleOverrides: {
          root: {
            '&.MuiChip-colorPrimary': {
              backgroundColor: 'var(--primary-color)',
              color: 'var(--text-light-color)',
            },
            '&.MuiChip-colorSecondary': {
              backgroundColor: 'var(--secondary-color)',
              color: 'var(--text-light-color)',
            },
          },
        },
      },*/
      MuiInputBase: {
      styleOverrides: {
        input: {
          '&::placeholder': {
            color: 'var(--highlight-color)',
            opacity: 1,
          },
          // For WebKit browsers
          '&::-webkit-input-placeholder': {
            color: 'var(--highlight-color)',
            opacity: 1,
          },
        },
      },
    },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'var(--border-color)',
              },
              '&:hover fieldset': {
                borderColor: 'var(--primary-color)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'var(--primary-color)',
              },
            },
            '& .MuiInputLabel-root': {
              color: 'var(--text-light-color)',
              '&.Mui-focused': {
                color: 'var(--primary-color)',
              },
            },
            '& .MuiInputBase-input': {
              color: 'var(--text-color)',
              // Add placeholder styling here
              '&::placeholder': {
                color: 'var(--highlight-color)',
                opacity: 0.7,
              },
              '&::-webkit-input-placeholder': {
                color: 'var(--highlight-color)',
                opacity: 0.7,
              },
              '&::-moz-placeholder': {
                color: 'var(--highlight-color)',
                opacity: 0.7,
              },
              '&:-ms-input-placeholder': {
                color: 'var(--highlight-color)',
                opacity: 0.7,
              },
              '&:-moz-placeholder': {
                color: 'var(--highlight-color)',
                opacity: 0.7,
              },
            },
          },
        },
      },
      // Add more component overrides as needed for other elements that use primary/secondary colors
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: 'var(--text-color)',
            '&:hover': {
              backgroundColor: 'var(--component-hover-bg)',
            },
          },
        },
      },
      MuiTable: {
        styleOverrides: {
          root: {
            backgroundColor: 'var(--component-bg)',
            color: 'var(--text-color)',
          },
        },
      },

      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: 'var(--table-header-bg) !important',
            color: 'var(--table-header-color) !important',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: 'var(--component-hover-bg)',
            },
            '&.MuiTableRow-head': {
              backgroundColor: 'var(--table-header-bg) !important',
              color: 'var(--table-header-color) !important',
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            textWrapMode: 'nowrap',
            borderColor: 'var(--border-color-split)',
            color: 'var(--text-color)',
            //borderBottom: '1px solid var(--border-color)',
            '& .MuiTableSortLabel-root, & .MuiTableSortLabel-icon': {
              color: 'var(--table-header-color) !important',
            },
          },
          head: {
            fontWeight: 600,
            color: 'var(--table-header-color) !important',
            backgroundColor: 'var(--table-header-bg) !important',
          },
        },
      },
      MuiDataGrid: {
        styleOverrides: {
          root: {

            backgroundColor: 'var(--component-bg)',
            color: 'var(--text-color)',
            border: '1px solid var(--dash-border-color)',
            '& .MuiDataGrid-main': {
              backgroundColor: 'var(--component-bg)',
            },
            '& .MuiDataGrid-overlay': {
              backgroundColor: 'var(--component-bg)',
              color: 'var(--text-color)',
            },
            // Add this to target the header row specifically
            '& .MuiDataGrid-columnHeaderRow': {
              color: 'var(--table-header-color) !important',
              backgroundColor: 'var(--table-header-bg) !important',
            },
            // Also target the container that holds the header
            '& .MuiDataGrid-container--top [role=row]': {
              color: 'var(--table-header-color) !important',
              backgroundColor: 'var(--table-header-bg) !important',
            },
          },
          columnHeader: {
            color: 'var(--table-header-color) !important',
            backgroundColor: 'var(--table-header-bg) !important',
            '&  .MuiSvgIcon-root': {
              color: 'var(--highlight-color) !important',

            },

          },
          columnHeaders: {
            backgroundColor: 'var(--primary-contrast)',
            color: 'var(--btn-primary-color)',
            borderBottom: '1px solid var(--border-color)',
            '& .MuiDataGrid-columnHeaderTitle': {
              color: 'var(--btn-primary-color)',
              fontWeight: 600,
            },
            '& .MuiDataGrid-iconSeparator': {
              color: 'var(--btn-primary-color)',
            },
            '& .MuiDataGrid-sortIcon': {
              color: 'var(--btn-primary-color)',
            },
            '& .MuiDataGrid-menuIcon': {
              color: 'var(--btn-primary-color)',
            },
          },
          // Add this new selector for the column header row
          columnHeaderRow: {
            color: 'var(--table-header-color) !important',
            backgroundColor: 'var(--table-header-bg) !important',
          },
          cell: {
            borderBottom: '1px solid var(--border-color)',
            color: 'var(--text-color)',
            '&:focus': {
              outline: '1px solid var(--primary-color)',
            },
            '&.MuiDataGrid-cell--editing': {
              backgroundColor: 'var(--component-active-bg)',
            },
          },
          row: {
            backgroundColor: 'var(--component-bg)',
            '&:hover': {
              backgroundColor: 'var(--component-hover-bg)',
            },
            '&.Mui-selected': {
              backgroundColor: 'var(--component-active-bg)',
              '&:hover': {
                backgroundColor: 'var(--component-hover-bg)',
              },
            },
            '&.MuiDataGrid-row--odd': {
              backgroundColor: 'var(--body-bg)',
            },
          },
          footerContainer: {
            backgroundColor: 'var(--component-bg)',
            borderTop: '1px solid var(--border-color-split)',
            color: 'var(--text-color)',
          },
          toolbarContainer: {
            backgroundColor: 'var(--component-bg)',
            borderBottom: '1px solid var(--border-color-split)',
            color: 'var(--text-color)',
            '& .MuiButton-root': {
              color: 'var(--btn-color)',
              '&:hover': {
                backgroundColor: 'var(--btn-hover-bg)',
              },
            },
          },
          filterForm: {
            backgroundColor: 'var(--component-bg)',
            color: 'var(--text-color)',
          },
          panel: {
            backgroundColor: 'var(--component-bg)',
            color: 'var(--text-color)',
            border: '1px solid var(--dash-border-color)',
          },
          panelHeader: {
            backgroundColor: 'var(--primary-contrast)',
            borderBottom: '1px solid var(--border-color-split)',
          },
          panelContent: {
            backgroundColor: 'var(--component-bg)',
          },
          columnMenu: {
            backgroundColor: 'var(--component-bg)',
            color: 'var(--text-color)',
            '& .MuiMenuItem-root': {
              color: 'var(--text-color)',
              '&:hover': {
                backgroundColor: 'var(--component-hover-bg)',
              },
            },
          },
        },
      },
    },
  };


};

export const appTheme = (muiThemeOptions?: any, options?: {
  tenantSettings?: any;
  colors?: any;
  [key: string]: any;
}) => {
  const { tenantSettings, colors, ...otherOptions } = options || {};

  const baseTheme = {
    cssVariables: true,
    ...defaultOptions(options),
  };

  const theme = muiThemeOptions
    ? deepmerge(deepmerge(defaultTheme, baseTheme), muiThemeOptions)
    : deepmerge(defaultTheme, baseTheme);

  return theme;
};

export default appTheme;

