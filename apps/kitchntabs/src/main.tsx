/**
 * KitchnTabs Application Entry Point
 * 
 * This is the main entry point for the KitchnTabs application.
 * It uses the refactored kt-* packages for all domain-specific functionality.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { dashStorage } from 'dash-utils';

import { applyPlatformBodyClasses } from 'dash-utils/src/utils/platformDetection';

// Import AppWrapper after React is confirmed loaded
import AppWrapper from 'dash-admin/src/AppWrapper';
import DASHAuthenticationService from 'dash-admin/src/contexts/auth/DASHAuthenticationService';
import { AuthPersistenceService } from 'dash-auth';

// Import store configuration
import configureStore from 'dash-admin-state/src/redux/store';
import {
  IDASHAppState,
  defaultAuth,
  defaultCommon,
  defaultPageSettings,
  defaultFormState,
  defaultSettings,
  setReduxStore,
} from 'dash-admin-state';

/* Dependency Styles */
import 'react-toastify/dist/ReactToastify.css';

/* Fonts */
import './assets/fonts/Montserrat-Black.ttf';
import './assets/fonts/Montserrat-Bold.ttf';
import './assets/fonts/Montserrat-Medium.ttf';
import './assets/fonts/Montserrat-Regular.ttf';
import './assets/fonts/Montserrat-SemiBold.ttf';

/* App styles */
import "dash-styles/dash.less";
import './styles.less';

// Import assets for initial state
import squaredLogo from './assets/logo-squared.png';
import horizontalLogo from './assets/logo-horizontal.png';
import LoginBackground from './assets/login-back.png';

// Import from local dash-extensions
import { DASHLayoutSettings, DASHGroupIcons } from './dash-extensions/config';

import { updateDomCssVariables } from 'dash-utils';
import { CustomErrorBoundary, GlobalSmallLoader } from './dash-extensions/components';

const rootElement = document.getElementById('root');
if (!rootElement) { throw new Error('Root element not found'); }

// Initialize theme early before React renders to prevent flash
const initializeThemeEarly = () => {
    const stored = localStorage.getItem('theme');
    const theme = (stored === 'light' || stored === 'dark') ? stored : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    if (!stored) {
        localStorage.setItem('theme', theme);
    }
};
initializeThemeEarly();

if (window.electronStore) {
    window.electronStore.syncToLocalStorage().then((all: Record<string, any>) => {
        Object.entries(all).forEach(([key, value]) => {
            window.localStorage.setItem(key, JSON.stringify(value));
        });
    });
}

const root = createRoot(rootElement);

const tenantImages = AuthPersistenceService.getTenantImages();

// Get platform info for sidebar position
//const isMobile = JSON.parse(import.meta.env.VITE_IS_MOBILE || 'false');
//const defaultSidebarPosition = isMobile ? 'bottom' : 'left';

// Helper to get CSS variable value from :root
const getCssVariable = (varName: string, defaultValue: number): number => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
};

// Create initial app state for Redux
const getDefaultAppCommon = () => {
    // Read sidebar dimensions from CSS variables (defined in styles.less)
    const sidebarLargeWidth = getCssVariable('--sidebar-large-width', 255);
    const sidebarSmallWidth = getCssVariable('--sidebar-small-width', 64);
    const sidebarHorizontalHeight = getCssVariable('--sidebar-horizontal-height', 120);
    const logoMaxWidth = getCssVariable('--logo-max-width', 200);
    const logoMaxHeight = getCssVariable('--logo-max-height', 60);

    return {
        ...defaultCommon,
        appPath: '/',
        navExpanded: dashStorage.getItem('dashNavExpanded') ? dashStorage.getItem('dashNavExpanded') === 'true' : true,
        navSize: dashStorage.getItem('dashNavSize') || 'small',       
        width: window.innerWidth,
        height: window.innerHeight,
        headerToolBar: () => <></>,
        panelSettings: {
            appName: 'KitchnTabs.com',
            horizontalLogo: tenantImages?.horizontal_logo?.original || horizontalLogo,
            squaredLogo: tenantImages?.squared_logo?.original || squaredLogo,
            loginBackground: tenantImages?.banner?.original || LoginBackground,
            sidebarPosition: 'left',
            secondarySidebarPosition: 'left',
            // Sidebar sizing (from CSS variables)
            sidebarLargeWidth,
            sidebarSmallWidth,
            sidebarHorizontalHeight,
            // Logo sizing (from CSS variables)
            logoMaxWidth,
            logoMaxHeight,
            // Padding configuration (in pixels, derived from sidebar sizes)
            paddingHorizontal: sidebarLargeWidth,
            paddingVertical: sidebarHorizontalHeight,
        },
    };
};

const defaultAppSettings = () => {
    const tenantSettings = AuthPersistenceService.getTenantSettings();
    return {
        ...defaultSettings,
        ...(tenantSettings || {}),
        loading: false,
        navStyle: DASHLayoutSettings.NAV_STYLE_FIXED,
        layoutType: DASHLayoutSettings.LAYOUT_TYPE_FRAMED,
        themeType: DASHLayoutSettings.THEME_TYPE_DARK,
        layoutSettings: DASHLayoutSettings,
        groupIcons: DASHGroupIcons,
        themeColor: '',
        isDirectionRTL: false,
        locale: 'es',
        availableLocales: [
            {
                locale: 'es',
                languageId: 'spanish',
                name: 'Español',
                icon: 'es',
            },
            {
                locale: 'en',
                languageId: 'english',
                name: 'English',
                icon: 'en',
            },
        ],
    };
};

const INITIAL_APP_STATE: IDASHAppState<any, any, any> = {
    settings: defaultAppSettings(),
    common: getDefaultAppCommon(),
    page: defaultPageSettings,
    auth: DASHAuthenticationService.getInitialAuthState(),
    resources: { items: [] },
    formData: defaultFormState,
    componentData: {},
};

// Create Redux store
const store = configureStore(INITIAL_APP_STATE);
setReduxStore(store);

// Inject CSS variables from tenant settings
const defaultTheme = DASHLayoutSettings.THEME_TYPE_DARK;
const injectTenantStyles = () => {
    const tenantSettings = AuthPersistenceService.getTenantSettings();
    if (tenantSettings) {
        try {
            const colors = tenantSettings.colors;
            console.log('updating colors from local storage');
            updateDomCssVariables(defaultTheme, colors);
        } catch (error) {
            console.error('Error parsing tenant settings:', error);
        }
    }
};

injectTenantStyles();

// Lazy load with proper error handling - Load the main app controller
const AppComponent = React.lazy<React.FC>(() => {
    return new Promise<{ default: React.FC }>((resolve) => {
        setTimeout(() => {
            import('./KitchnTabsBootstrap').then((mod) => {
                resolve({ default: mod.default });
            }).catch((error) => {
                console.error('Failed to load KitchnTabsBootstrap:', error);
                resolve({
                    default: () => (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100vh',
                            color: 'red'
                        }}>
                            Failed to load application
                        </div>
                    )
                });
            });
        }, 150);
    });
});

applyPlatformBodyClasses();

//const version = import.meta.env.VITE_APP_VERSION;
// Using process.env as defined in vite.config.mts
// @ts-ignore
const version = process.env.VITE_APP_VERSION;

const VersionOverlay = () => (
    <div style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        color: 'white',
        fontSize: '12px',
        padding: '5px',
        zIndex: 9999,
        pointerEvents: 'none',
        fontFamily: 'Montserrat, sans-serif'
    }}>
        v{version}
    </div>
);

// Render with Redux Provider at the top level
root.render(
    <CustomErrorBoundary>
        <Provider store={store}>
            <AppWrapper>
                <React.Suspense fallback={
                    <>
                        <GlobalSmallLoader />
                 
                    </>
                }>
                    <AppComponent />
                           <VersionOverlay />
                </React.Suspense>
            </AppWrapper>
        </Provider>
    </CustomErrorBoundary>
);
