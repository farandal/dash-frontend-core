import ICommonState from "../redux/interfaces/ICommonState";

/**
 * Default Common State
 * 
 * Provides default values for common application state including
 * layout, navigation, and panel settings. These can be overridden
 * by the consuming application during store initialization.
 */
const defaultCommon: ICommonState = {
  appPath: '/',
  error: '',
  loading: false,
  message: '',
  navExpanded: true,
  width: typeof window !== 'undefined' ? window.innerWidth : 1920,
  height: typeof window !== 'undefined' ? window.innerHeight : 1080,
  content_width: null,
  content_height: null,
  pathname: '/',
  componentsState: {},
  headerToolBar: null,
  headerToolBarReplace: false,
  navSize: "small",
  
  // Panel settings with sidebar dimensions
  // These values can be overridden by CSS variables at runtime
  panelSettings: {
    // Branding
    appName: 'Dash App',
    horizontalLogo: <>🖥</>,
    squaredLogo: <>🖥</>,
    loginBackground: undefined,
    
    // Sidebar dimensions (can be overridden via CSS variables)
    sidebarLargeWidth: 255,
    sidebarSmallWidth: 64,
    sidebarHorizontalHeight: 120,
    
    // Logo dimensions
    logoVerticalMaxWidth: 130,
    logoVerticalMaxHeight: 130,
    logoHorizontalMaxWidth: 200,
    logoHorizontalMaxHeight: 60,
    
    // Content padding (derived from sidebar)
    paddingHorizontal: 255,
    paddingVertical: 120,
    
    // Position
    sidebarPosition: 'left',
  },
};

export default defaultCommon;
