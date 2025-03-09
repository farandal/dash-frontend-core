import { defaultTheme } from 'react-admin';
import { deepmerge } from '@mui/utils';
import { createTheme } from '@mui/material/styles';

const defaultColors = {
  main: '#1976d2',
  mainContrast: '#444444',
  white: '#ffffff',
  textPrimary: '#000000',
  textSecondary: '#666666',
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
  info: '#2196f3'
};

const getCSSVar = (name: string) => {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || null;
};

const mainColor = getCSSVar('--main-color-contrast') || defaultColors.mainContrast;
const mainColorContrast = getCSSVar('--main-color-contrast') || defaultColors.mainContrast;

export const globalPallete = {
		success: {
			main: getCSSVar('--success-color') || defaultColors.success,
			contrastText: getCSSVar('--white-color') || defaultColors.white,
		},
		error: {
			main: getCSSVar('--error-color') || defaultColors.error,
			contrastText: getCSSVar('--white-color') || defaultColors.white,
		},
		warning: {
			main: getCSSVar('--warning-color') || defaultColors.warning,
			contrastText: getCSSVar('--white-color') || defaultColors.white,
		},
    info: {
      main: getCSSVar('--info-color') || defaultColors.info,
    },

	primary: {
		main: mainColor,
		light: mainColor,
		dark: mainColor,
	},
	secondary: {
		main: mainColorContrast,
	},

	text: {
		primary: getCSSVar('--text-primary-color') || defaultColors.textPrimary,
		secondary: getCSSVar('--text-secondary-color') || defaultColors.textSecondary,
	},

	action: {
		active: getCSSVar('--main-color-contrast') || defaultColors.main,
	},

	borderRadius: 3,
};

export const appTheme = deepmerge(defaultTheme, {

	breakpoints: {
		values: {
			xs: 0,
			sm: 600,
			md: 900,
			lg: 1200,
			xl: 1536,
		},
	},
	palette: {
		...globalPallete,
	},
	components: {
		/*MuiInputLabel: {
            defaultProps: { shrink: true },
         },*/
		MuiTextField: {
			defaultProps: {
				fullWidth: true,
				variant: 'outlined',
			},
		},

		MuiFormControl: { fullWidth: true },

		MuiButton: {
      defaultProps: {
        size: 'small', // Always use small size (mobile style)
      },
			styleOverrides: {
				label: {
					padding: 'initial',
				},
				root: {
					paddingLeft: 15,
					paddingRight: 15,
					//height: 36,
					margin: 4,
					textTransform: 'none',
					color: globalPallete.primary.main,
					backgroundColor: 'transparent',
					'&:hover': {
						color: getCSSVar('--white-color') || defaultColors.white,
						backgroundColor: mainColorContrast,
					},
					'&:active': {
						color: getCSSVar('--white-color') || defaultColors.white,
						backgroundColor: mainColorContrast,

					},
					'&.default': {
						background: getCSSVar('--white-color') || defaultColors.white,
						color: mainColorContrast,
					},
					'&.submit': {
						background:
							`linear-gradient(101.98deg, ${mainColor} 0%, ${mainColorContrast} 111.65%)`,
						color: getCSSVar('--white-color') || defaultColors.white,
					},
				},
			},
			variants: [

        {
          props: { variant: 'circular' },
          style: {
            borderRadius: '50px',
            minWidth: '0',
            padding: '8px 16px',
            '&.MuiButton-sizeLarge': {
              padding: '12px 24px',
            },
          },
        },

				{
					defaultProps: {
						disableRipple: false,
					},

					props: {
						color: 'primary',

						style: {
							backgroundColor: mainColor,
							color: getCSSVar('--white-color') || defaultColors.white,
							'&:hover': {
								color: getCSSVar('--white-color') || defaultColors.white,
								backgroundColor: mainColorContrast,
							},
							'&:active': {
								color: getCSSVar('--white-color') || defaultColors.white,
								backgroundColor: mainColor,
							},
						},
					},
				},
			],
		},
		MuiDataGrid: {
			/*styleOverrides: {
              root: {
                backgroundColor: '#f2f2f2',
              },
            },*/
		},
	},
});

export const darkTheme = deepmerge(appTheme, {
	palette: {
		mode: 'dark',
		borderRadius: 0,
	},
});

export const lightTheme = deepmerge(appTheme, {
	palette: {
		mode: 'light',
		borderRadius: 0,
	},
});

export const themes = {
  light: createTheme(lightTheme),
  dark: createTheme(darkTheme),
};

export const dashThemeConfig = appTheme;
export const dashTheme = createTheme(appTheme);

export default dashThemeConfig;
