import ISettingsState from "../redux/interfaces/ISettings";
import {DASHAdminSystemConstants} from 'dash-constants';

/**
 * Default Settings State
 * 
 * Provides default values for all settings. These can be overridden
 * by the consuming application during store initialization.
 */
const defaultSettings: ISettingsState = {
  // Loading state
  loading: false,
  
  // Navigation and layout
  navStyle: DASHAdminSystemConstants.panel.NAV_STYLE_FIXED,
  layoutType: DASHAdminSystemConstants.panel.LAYOUT_TYPE_FULL,
  themeType: DASHAdminSystemConstants.panel.THEME_TYPE_DARK,
  themeColor: '',
  isDirectionRTL: false,
  
  // Layout settings (dimensions, breakpoints, etc.)
  layoutSettings: {
    // Sidebar dimensions
    sidebarLargeWidth: 255,
    sidebarSmallWidth: 64,
    sidebarHorizontalHeight: 120,
    // Logo dimensions
    logoVerticalMaxWidth: 130,
    logoVerticalMaxHeight: 130,
    logoHorizontalMaxWidth: 200,
    logoHorizontalMaxHeight: 60,
    // Content padding (based on sidebar)
    paddingHorizontal: 255,
    paddingVertical: 120,
    // Breakpoints
    mobileBreakpoint: 768,
    tabletBreakpoint: 1024,
  },
  
  // Localization
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
  
  // Translations (populated by i18n provider)
  translations: {},
};

export default defaultSettings;
