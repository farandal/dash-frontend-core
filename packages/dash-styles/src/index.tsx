import { defaultTheme } from 'react-admin';
import { deepmerge } from '@mui/utils';
import { theme as antdTheme } from 'antd';

const getAllCssVariablesFromStyleSheets = (selector: string) => {
    const cssVariables = {};

    for (let i = 0; i < document.styleSheets.length; i++) {
        try {
            const styleSheet = document.styleSheets[i];
            // Skip our dynamic theme style element to read only compiled/static defaults.
            // This ensures _color() fallback reads from compiled LESS CSS, not stale tenant values.
            if ((styleSheet.ownerNode as HTMLElement)?.id === 'dash-theme-variables') continue;
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

    // Mirrors getAntTheme()'s resolve(): a tenant's saved `colors` object can be
    // PARTIAL (only the base swatches, not every derived key this palette needs).
    // Previously, a truthy `colors` object short-circuited straight to `{}` for any
    // key it didn't contain, skipping the compiled-CSS fallback entirely — so once
    // the tenant's real (partial) colors started flowing through here, every
    // missing key silently fell back to MUI's own stock palette (blue/magenta)
    // instead of the compiled LESS defaults. Chain through both sources instead.
    const _color = (key, colorKey, mode = null) => {
        const suffix = `${colorKey}--${mode || currentTheme}`;
        const colorValue = colors?.[suffix] || cssVars[`--${suffix}`];
        return colorValue ? { [key]: colorValue } : {};
    };

    const createPalette = (mode = 'light') => {

        const palette = {
            mode,
            background: {
                ..._color('default', 'module-bg', mode),
                ..._color('paper', 'module-bg', mode)
            },
            primary: {
                //..._color('main', 'primary-color', mode),
                //..._color('main', 'highlight-color', mode),
                ..._color('main', 'btn-bg', mode),
                // No explicit contrastText: MUI's palette augmentation derives it via
                // getContrastText(main) when omitted, guaranteeing legible button text
                // regardless of what --primary-contrast happens to be set to (it's also
                // used standalone as a gradient stop elsewhere, so was never guaranteed
                // to be a valid contrast color — see vanexa-system, 2026-08-03).
                //..._color('contrastText', 'primary-contrast', mode)
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
            variant: {
               ..._color('containedBg', 'btn-bg', mode),
      
            }
        };

        // Filter out empty objects and undefined values
        const filtered = Object.fromEntries(
            Object.entries(palette).filter(([_, value]) => {
                if (typeof value === 'object' && value !== null) {
                    return Object.keys(value).length > 0;
                }
                return value !== undefined;
            })
        );

        return filtered;
    };

    return {
        cssVariables: {
            cssVarPrefix: 'dash', // Your custom prefix
            colorSchemeSelector: 'data-theme', // Tell MUI to use data attributes
            colorSchemeStorageKey: 'theme', // Use same key as dashStorage for consistency
        },
        // Enable both light and dark color schemes - NO 'system' to force light/dark only
        colorSchemes: {
            light: {
                palette: createPalette('light')
            },
            dark: {
                palette: createPalette('dark')
            },
        },

        defaultColorScheme: currentTheme || 'dark',


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
                        //background: 'linear-gradient(to bottom, var(--bodybg-primary), var(--bodybg-secondary))',
                        //color: 'var(--text-color)',
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


             /*MuiToolbar: {
                   styleOverrides: {
                    root: {
                        backgroundColor: 'var(--table-header-bg)',
                    }
                }
             },*/

             
     /*MuiButtonBase: {
                styleOverrides: {
                    root: {
                        backgroundColor: 'var(--btn-bg)',
                        color: 'var(--btn-color)',

                        '&.MuiButton-containedPrimary': {
                            backgroundColor: 'var(--btn-primary-bg)',
                            color: 'var(--btn-primary-color)',
                            '&:hover': {
                                backgroundColor: 'var(--highlight-color)',
                            },
                        },
                        '&.MuiButton-containedSecondary': {
                            backgroundColor: 'var(--btn-secondary-bg)',
                            color: 'var(--btn-secondary-color)',
                            '&:hover': {
                                backgroundColor: 'var(--btn-secondary-color)',
                            },
                        },
                        '&.MuiButton-outlinedPrimary': {
                            backgroundColor: 'inherit',
                            borderColor: 'var(--btn-primary-bg)',
                            color: 'var(--text-color)',
                            '&:hover': {
                                borderColor: 'var(--highlight-color)',
                                color: 'var(--highlight-color-contrast)',
                            },
                        },
                        '&.MuiButton-outlinedSecondary': {
                            backgroundColor: 'inherit',
                            borderColor: 'var(--btn-primary-bg)',
                            color: 'var(--text-color)',
                            '&:hover': {
                                borderColor: 'var(--highlight-color)',
                                color: 'var(--highlight-color-contrast)',
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
                            color: 'var(--text-light)',
                            background: 'none',
                            '&:hover': {
                                color: 'var(--text-color)',
                                textDecoration: 'underline',
                                background: 'none',
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

                        "&.MuiButton-contained.MuiButton-colorPrimary": {
                            backgroundColor: 'var(--btn-primary-bg)',
                            color: 'var(--btn-primary-color)',
                            '&:hover': {
                                backgroundColor: 'var(--highlight-color)',
                            },
                        },
                        "&.MuiButton-contained.MuiButton-colorSecondary": {
                            backgroundColor: 'var(--btn-secondary-bg)',
                            color: 'var(--btn-secondary-color)',
                            '&:hover': {
                                backgroundColor: 'var(--btn-secondary-color)',
                            },
                        },
                        "&.MuiButton-outlined.MuiButton-colorPrimary": {
                            backgroundColor: 'inherit',
                            borderColor: 'var(--btn-primary-bg)',
                            color: 'var(--text-color)',
                            '&:hover': {
                                borderColor: 'var(--highlight-color)',
                                color: 'var(--highlight-color-contrast)',
                            },
                        },
                        "&.MuiButton-outlined.MuiButton-colorSecondary": {
                            backgroundColor: 'inherit',
                            borderColor: 'var(--btn-primary-bg)',
                            color: 'var(--text-color)',
                            '&:hover': {
                                borderColor: 'var(--highlight-color)',
                                color: 'var(--highlight-color-contrast)',
                            },
                        },
                        "&.MuiButton-text.MuiButton-colorPrimary": {
                            color: 'var(--link-color)',
                            background: 'none',
                            '&:hover': {
                                color: 'var(--highlight-color)',
                                textDecoration: 'underline',
                                background: 'none',
                            },
                        },
                        "&.MuiButton-text.MuiButton-colorSecondary": {
                            color: 'var(--text-light)',
                            background: 'none',
                            '&:hover': {
                                color: 'var(--text-color)',
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
            MuiDialogTitle: {
                styleOverrides: {
                    root: {

                        '& svg': {
                            color: 'var(--text-color)',
                        },
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

            MuiListItemIcon: {
                styleOverrides: {
                    root: {
                        color: 'var(--sidebar-icon)',
                        '& svg': {
                            color: 'var(--sidebar-icon)',
                        },
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
            /*MuiInputAdornment: {
               styleOverrides: {
                 root: {
                   '& svg': {
                     color: 'var(--highlight-color)',
                   },
                 },
               },
             },*/
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
                        "&.MuiAlert-standard.MuiAlert-colorInfo": {
                            backgroundColor: 'var(--module-bg)',
                            color: 'var(--text-color)',
                            '& .MuiAlert-icon': {
                                color: 'var(--highlight-color)',
                            },
                            '& .MuiAlertTitle-root': {
                                color: 'var(--text-color)',
                            },
                        },
                        "&.MuiAlert-standard.MuiAlert-colorError": {
                            backgroundColor: 'var(--dash-alert-error-bg)',
                            color: 'var(--dash-alert-error-title)',
                        },
                        "&.MuiAlert-standard.MuiAlert-colorWarning": {
                            backgroundColor: 'var(--dash-alert-warning-bg)',
                            color: 'var(--dash-alert-warning-title)',
                        },
                        "&.MuiAlert-standard.MuiAlert-colorSuccess": {
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

             MuiPaper: {
               styleOverrides: {
                 root: {   
                   backgroundColor: 'var(--module-bg)', // Use the correct variable name
                   color: 'var(--text-color)',
                 },
               },
             },

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
                      '& .MuiOutlinedInput-root': {
                    
                        border: 1,
                      },
                    },

                    /*input: {
                      '&::placeholder': {
                        color: 'var(--highlight-color)',
                        opacity: 1,
                      },
                      // For WebKit browsers
                      '&::-webkit-input-placeholder': {
                        color: 'var(--highlight-color)',
                        opacity: 1,
                      },
                    },*/
                    colorPrimary: {
                        color: 'var(--text-color)',
                    },
                },
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
                        /* '& .MuiInputBase-input': {
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
                         },*/
                    },
                },
            },
            // Add more component overrides as needed for other elements that use primary/secondary colors
            MuiIconButton: {
                styleOverrides: {
                    root: {
                        height: 30,
                        width: 30,
                        color: 'var(--text-color)',
                        backgroundColor: 'var(--secondary-color)',
                        '&:hover': {
                            '& svg': {
                                color: 'var(--highlight-color-contrast)',
                                fill: 'var(--highlight-color-contrast)',
                            },
                            color: 'var(--highlight-color-contrast)',
                            backgroundColor: 'var(--highlight-color)',
                        },
                    },
                },
            },
            MuiAvatar: {
                styleOverrides: {
                    root: {

                        color: 'var(--text-color)',
                        backgroundColor: 'var(--secondary-color)',
                        '&:hover': {
                            '& svg': {
                                color: 'var(--highlight-color-contrast)',
                                fill: 'var(--highlight-color-contrast)',
                            },
                            color: 'var(--highlight-color-contrast)',
                            backgroundColor: 'var(--highlight-color)',
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
                        border: '1px solid var(--border-color)',
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
                        '&.MuiDataGrid-row': {
                            backgroundColor: 'var(--bodybg-primary)',
                        },
                        '&.MuiDataGrid-row--odd': {
                            backgroundColor: 'var(--bodybg-secondary)',
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
                        border: '1px solid var(--border-color)',
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

/**
 * Returns only the static component/typography overrides from defaultOptions.
 * These use CSS var() references that resolve at runtime, so they are
 * theme-agnostic and safe to memoize once (no stale palette values).
 * 
 * Use this in the public app's DashThemeProviderLight to avoid
 * passing stale palette/colorSchemes that would overwrite the fresh
 * palette computed by the provider on theme switch.
 */
export const defaultComponentOverrides = (options?: any) => {
    const full = defaultOptions(options || {});
    // Extract only the keys that are safe to memoize (no palette/colorSchemes)
    const { palette, colorSchemes, defaultColorScheme, cssVariables, ...safeOptions } = full;
    return safeOptions;
};

export const appTheme = (muiThemeOptions?: any, options?: {
    tenantSettings?: any;
    colors?: any;
    [key: string]: any;
}) => {
    const { tenantSettings, colors, ...otherOptions } = options || {};

    // cssVariables/colorSchemes/defaultColorScheme are deliberately dropped here.
    // MUI's CSS-vars mode resolves colors via CSS custom properties scoped by
    // `colorSchemeSelector` (`data-theme` here), which emits a `:root` rule
    // (default scheme) alongside a `[data-theme="dark"]` rule — both at equal
    // (0,1,0) specificity. When the `:root` rule lands later in the generated
    // stylesheet it wins the tie even with data-theme="dark" set on <html>,
    // silently falling back to MUI's own default (near-white) palette instead
    // of ours — this was the root cause of the production-only white
    // MuiPaper/"Panel de Control" card bug (confirmed via DevTools: the
    // correct `var(--dash-palette-background-paper)` declaration was present
    // but struck through/overridden). We already rebuild the whole theme via
    // appTheme() on every mode/tenant-color change (see
    // DashThemeContext.recreateTheme's MutationObserver on data-theme), so
    // CSS-vars-driven runtime switching buys nothing and only adds this
    // failure mode. DASHAdmin.tsx already strips these same 3 keys before
    // handing the theme to react-admin (for a related v9 createThemeWithVars
    // bug) — this makes the outer DashThemeProvider's own theme consistent
    // with that, instead of only the inner (react-admin) one.
    const { colorSchemes: _colorSchemes, defaultColorScheme: _defaultColorScheme, cssVariables: _cssVariables, ...restDefaultOptions } = defaultOptions(options);

    const baseTheme = {
        ...restDefaultOptions,
    };

    const theme = muiThemeOptions
        ? deepmerge(deepmerge(defaultTheme, baseTheme), muiThemeOptions)
        : deepmerge(defaultTheme, baseTheme);

    return theme;
};

export const getAntTheme = (options?: {
  tenantSettings?: any;
  colors?: any;
  [key: string]: any;
}): Record<string, any> => {
  const { colors } = options || {};
  const currentTheme =
    document.documentElement.getAttribute('data-theme') || 'dark';
  const cssVars = getAllCssVariablesFromStyleSheets(':root');


  // Resolve a CSS variable key to its computed hex value for the current theme.
  // Mirrors the _color() helper used by defaultOptions() for MUI palette.
  const resolve = (colorKey: string): string | undefined => {
    const suffixed = `--${colorKey}--${currentTheme}`;
    // 1. Tenant color overrides take priority
    if (colors?.[`${colorKey}--${currentTheme}`]) {
      return colors[`${colorKey}--${currentTheme}`];
    }
    // 2. Compiled LESS defaults from stylesheets
    if (cssVars[suffixed]) {
      return cssVars[suffixed];
    }
    // 3. Try the base key (no suffix) as last resort
    if (cssVars[`--${colorKey}`]) {
      return cssVars[`--${colorKey}`];
    }
    return undefined;
  };

  // Build a token object, filtering out undefined values
  const token: Record<string, any> = {
    // Core
    colorPrimary: resolve('btn-bg'),
    colorSuccess: resolve('alert-success-bg'),
    colorWarning: resolve('alert-warning-bg'),
    colorError: resolve('alert-error-bg'),
    colorInfo: resolve('alert-info-bg'),

    // Text
    colorText: resolve('text-color'),
    colorTextSecondary: resolve('text-light-color'),
    colorTextDisabled: resolve('disabled-color'),

    // Background
    colorBgBase: resolve('bodybg-primary'),
    colorBgContainer: resolve('component-bg'),
    colorBgElevated: resolve('module-bg'),
    colorBgLayout: resolve('body-bg'),

    // Borders
    colorBorder: resolve('border-color'),
    colorSplit: resolve('border-color-split'),

    // Typography
    fontSize: 14,
    borderRadius: 6,
  };

  // Remove undefined entries so antd uses its own defaults for missing values
  Object.keys(token).forEach(k => { if (token[k] === undefined) delete token[k]; });


  return {
    cssVar: true,
    hashed: false,
    algorithm: currentTheme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,

    token,

    components: {
      Table: {
        headerBg: resolve('table-header-bg'),
        headerColor: resolve('table-header-color'),
        rowHoverBg: resolve('component-hover-bg'),
        rowSelectedBg: resolve('component-active-bg'),
        borderColor: resolve('border-color'),
        footerBg: resolve('component-bg'),
      },

      Button: {
        colorPrimary: resolve('btn-bg'),
        colorPrimaryHover: resolve('highlight-color'),
        colorPrimaryActive: resolve('btn-active-bg'),
        defaultBg: resolve('secondary-color'),
        defaultColor: resolve('text-color'),
        defaultBorderColor: resolve('border-color'),
      },

      Input: {
        colorBgContainer: resolve('component-bg'),
        colorBorder: resolve('border-color'),
        colorText: resolve('text-color'),
        activeBorderColor: resolve('primary-color'),
        hoverBorderColor: resolve('primary-color'),
      },

      Select: {
        colorBgContainer: resolve('component-bg'),
        colorBorder: resolve('border-color'),
        colorText: resolve('text-color'),
      },

      Dropdown: {
        colorBgElevated: resolve('component-bg'),
        colorText: resolve('text-color'),
      },

      Modal: {
        contentBg: resolve('component-bg'),
        headerBg: resolve('component-bg'),
        titleColor: resolve('text-color'),
      },

      Layout: {
        headerBg: resolve('primary-color'),
        bodyBg: resolve('bodybg-primary'),
        siderBg: resolve('sidebar-bg'),
      },

      Menu: {
        itemBg: 'transparent',
        itemColor: resolve('text-color'),
        itemHoverBg: resolve('component-hover-bg'),
        itemSelectedBg: resolve('component-active-bg'),
        itemSelectedColor: resolve('highlight-color'),
      },

      Card: {
        colorBgContainer: resolve('component-bg'),
        colorBorderSecondary: resolve('border-color'),
      },

      Tooltip: {
        colorBgSpotlight: resolve('module-bg'),
        colorTextLightSolid: resolve('text-color'),
      },

      Tabs: {
        itemColor: resolve('text-color'),
        itemSelectedColor: resolve('highlight-color'),
        inkBarColor: resolve('highlight-color'),
      },
    },
  };
};

export default appTheme;