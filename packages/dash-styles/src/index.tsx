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
const getCSSVar = (name: string) => {

  const value = window.getComputedStyle(document.documentElement)
    .getPropertyValue(`${name}`)
    .trim();

  return value;

};
export const defaultOptions = () => {
  //const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
  //const themeType = document.documentElement.getAttribute('data-theme') || "light";
  //console.log("REBUILDING MUI THEME!", themeType)

  //const colors = isDarkMode ? darkModeColors : defaultColors;

  return {
    palette: {
      background: {
        default: getCSSVar('--body-background'),
        paper: getCSSVar('--module-background')
      },
      primary: {
        main: getCSSVar('--primary-color'),
      },
      secondary: {
        main: getCSSVar('--secondary-color'),
      },
      text: {
        primary: getCSSVar('--text-color'),
        secondary: getCSSVar('--text-light-color'),
        disabled: getCSSVar('--disabled-color'),
      },
      action: {
        active: getCSSVar('--component-active-background'),
        hover: getCSSVar('--component-hover-background'),
        disabled: getCSSVar('--disabled-color'),
        disabledBackground: getCSSVar('--disabled-bg'),
      },
      divider: getCSSVar('--border-color-split'),
      border: getCSSVar('--border-color'),
      error: {
        main: getCSSVar('--dash-alert-error-bg'),
        contrastText: getCSSVar('--dash-alert-error-title'),
      },
      warning: {
        main: getCSSVar('--dash-alert-warning-bg'),
        contrastText: getCSSVar('--dash-alert-warning-title'),
      },
      info: {
        main: getCSSVar('--dash-alert-info-bg'),
        contrastText: getCSSVar('--dash-alert-info-title'),
      },
      success: {
        main: getCSSVar('--dash-alert-success-bg'),
        contrastText: getCSSVar('--dash-alert-success-title'),
      },
      common: {
        black: getCSSVar('--text-color'),
        white: getCSSVar('--text-contrast-color'),
      },

    },
    typography: {
      allVariants: {
        color: getCSSVar('--text-color')
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            color: getCSSVar('--text-color')
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
              color: getCSSVar('--text-color')
            }
          }
        }
      },
      RaSingleFieldList: {
        styleOverrides: {
          root: {
            '& .RaSingleFieldList-link>*': {
              color: getCSSVar('--text-color')
            }
          }
        }
      },
      MuiInputAdornment: {
        styleOverrides: {
          root: {
            '& svg': {
              color: getCSSVar('--highlight-color')
            }
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
              marginBottom: 8
          }
        }
      },
      /*MuiToolbar: {
        styleOverrides: {
          root: {
            display: 'block'
          }
        }
      },
      MuiGrid: {
        styleOverrides: {
          root: {
            display: 'block'
          }
        }
      },*/

      MuiBox: {
        styleOverrides: {
          root: {
            display: 'flex !important'
          }
        }
      },


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
