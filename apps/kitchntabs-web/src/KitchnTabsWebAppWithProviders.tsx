/**
 * KitchnTabsWebAppWithProviders
 * 
 * This component is lazy-loaded from main.tsx and contains all heavy dependencies:
 * - Redux store and Provider
 * - Dash admin state initialization
 * - Heavy styles loading
 * - Platform body classes
 * 
 * By lazy-loading this component, we keep react-admin and other heavy deps
 * out of the initial bundle, reducing initial load from ~2MB to ~200KB.
 */
import React from 'react';
import { Provider } from 'react-redux';
import { dashStorage } from 'dash-utils';
import { applyPlatformBodyClasses } from 'dash-utils/src/utils/platformDetection';

// These imports are now lazy-loaded instead of in the critical path
import DASHAuthenticationService from 'dash-admin/src/contexts/auth/DASHAuthenticationService';
import { AuthPersistenceService } from 'dash-auth';

// Import store configuration
import configureStore from 'dash-admin-state/src/redux/store';
import {
    IDASHAppState,
    defaultCommon,
    defaultPageSettings,
    defaultFormState,
    defaultSettings,
    setReduxStore,
} from 'dash-admin-state';

/* Dependency Styles - now async loaded */
import 'react-toastify/dist/ReactToastify.css';

/* Fonts */
import './assets/fonts/Montserrat-Black.ttf';
import './assets/fonts/Montserrat-Bold.ttf';
import './assets/fonts/Montserrat-Medium.ttf';
import './assets/fonts/Montserrat-Regular.ttf';
import './assets/fonts/Montserrat-SemiBold.ttf';

/* App styles - now async loaded */
import "dash-styles/dash.less";
import './styles.less';

// Import assets for initial state
import squaredLogo from './assets/logo-squared.png';
import horizontalLogo from './assets/logo-horizontal.png';
import LoginBackground from './assets/login-back.png';

// Import from local dash-extensions
import { DASHLayoutSettings, DASHGroupIcons } from './dash-extensions/config';
import { updateDomCssVariables } from 'dash-utils';

// Import the bootstrap component
import KitchnTabsWebBootstrap from './KitchnTabsWebBootstrap';


import PublicHeaderActions from './components/PublicHeaderActions';

// Helper to get CSS variable value from :root
const getCssVariable = (varName: string, defaultValue: number): number => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
};

// Get tenant images from persistence
const getTenantImages = () => {
    try {
        return AuthPersistenceService.getTenantImages();
    } catch {
        return null;
    }
};

// Create initial app state for Redux
const getDefaultAppCommon = () => {
    const tenantImages = getTenantImages();
    
    // Read sidebar dimensions from CSS variables (defined in styles.less)
    const sidebarLargeWidth = getCssVariable('--sidebar-large-width', 255);
    const sidebarSmallWidth = getCssVariable('--sidebar-small-width', 64);
    const sidebarHorizontalHeight = getCssVariable('--sidebar-horizontal-height', 120);
    const logoMaxWidth = getCssVariable('--logo-max-width', 100);
    const logoMaxHeight = getCssVariable('--logo-max-height', 60);

    return {
        ...defaultCommon,
        appPath: '/',
        navExpanded: dashStorage.getItem('dashNavExpanded') ? dashStorage.getItem('dashNavExpanded') === 'true' : true,
        navSize: dashStorage.getItem('dashNavSize') || 'small',       
        width: window.innerWidth,
        height: window.innerHeight,
        // Custom header toolbar with language switcher and dark mode toggle for light app
        headerToolBar: PublicHeaderActions,
        // Replace the default sidebar actions (BridgedLocalesMenuButton, etc.) with our custom headerToolBar
        headerToolBarReplace: true,
        panelSettings: {
            appName: 'KitchnTabs.com',
            horizontalLogo: tenantImages?.horizontal_logo?.original || horizontalLogo,
            squaredLogo: tenantImages?.squared_logo?.original || squaredLogo,
            loginBackground: tenantImages?.banner?.original || LoginBackground,
            sidebarPosition: 'top',
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

// Create the initial state
const createInitialState = (): IDASHAppState<any, any, any> => ({
    settings: defaultAppSettings(),
    common: getDefaultAppCommon(),
    page: defaultPageSettings,
    auth: DASHAuthenticationService.getInitialAuthState(),
    resources: { items: [] },
    formData: defaultFormState,
    componentData: {},
});

// Create Redux store - this is now lazy loaded
const INITIAL_APP_STATE = createInitialState();
const store = configureStore(INITIAL_APP_STATE);
setReduxStore(store);

// Inject CSS variables from tenant settings
const injectTenantStyles = () => {
    const tenantSettings = AuthPersistenceService.getTenantSettings();
    if (tenantSettings) {
        try {
            const colors = tenantSettings.colors;
            console.log('Updating colors from local storage');
            updateDomCssVariables(DASHLayoutSettings.THEME_TYPE_DARK, colors);
        } catch (error) {
            console.error('Error parsing tenant settings:', error);
        }
    }
};

// Apply platform classes and inject styles
applyPlatformBodyClasses();
injectTenantStyles();

/**
 * KitchnTabsWebAppWithProviders
 * 
 * Wraps the main bootstrap component with all required providers.
 * This is lazy-loaded to keep heavy deps out of the initial bundle.
 */
const KitchnTabsWebAppWithProviders: React.FC = () => {
    return (
        <Provider store={store}>
            <KitchnTabsWebBootstrap />
        </Provider>
    );
};

export default KitchnTabsWebAppWithProviders;
