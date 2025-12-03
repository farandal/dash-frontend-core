/**
 * Dash Default Theme Options Extension
 * 
 * Extended theme configuration for Material UI.
 * These options are merged with the base dash theme.
 */

/**
 * Dash default extended theme options for the app
 * These are merged with the base DashAdmin theme
 */
export const dashDefaultExtendedThemeOptions = {
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    // Add any default button styles here
                    transition: 'all 0.2s ease-in-out',
                }
            }
        },
        // Add optimizations for layout components
        MuiBox: {
            styleOverrides: {
                root: {
                    // Optimize box rendering
                    contain: 'layout style',
                }
            }
        }
    },
    breakpoints: {
        values: {
            xs: 0,
            sm: 900,
            md: 900,
            lg: 1200,
            xl: 1536,
        },
    },
    // Add transition optimizations
    transitions: {
        duration: {
            shortest: 150,
            shorter: 200,
            short: 250,
            standard: 300,
            complex: 375,
            enteringScreen: 225,
            leavingScreen: 195,
        },
        easing: {
            easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
            easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
            easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
            sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
        },
    }
};

/**
 * Dash default palette overrides
 * Uncomment and modify to customize colors
 */
export const dashDefaultPalette = {
    // primary: {
    //     main: '#1976d2',
    //     light: '#42a5f5',
    //     dark: '#1565c0',
    // },
    // secondary: {
    //     main: '#9c27b0',
    //     light: '#ba68c8',
    //     dark: '#7b1fa2',
    // },
};

/**
 * Dash default typography overrides
 */
export const dashDefaultTypography = {
    // fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    // h1: {
    //     fontSize: '2.5rem',
    //     fontWeight: 500,
    // },
};

export default dashDefaultExtendedThemeOptions;
