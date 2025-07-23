import ISettingsState from "../redux/interfaces/ISettings";
import DASHAdminSystemConstants from 'dash-admin/src/config/DASHAdminSystemConstants';

const defaultSettings: ISettingsState = {
  loading: false,
  navStyle: DASHAdminSystemConstants.panel.NAV_STYLE_FIXED,
  themeColor: '',
  isDirectionRTL: false,
  layoutType: DASHAdminSystemConstants.panel.LAYOUT_TYPE_FULL,
  themeType: DASHAdminSystemConstants.panel.THEME_TYPE_DARK,


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

export default defaultSettings;
