import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import { isEqual } from 'lodash';
import { IDASHAppState } from 'dash-admin-state';
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';

// Custom hook for layout-related state
export const useLayoutState = <U, A>() => {
  return useSelector(
    (state: IDASHAppState<U, A, IDashAutoAdminResourceConfig>) => ({
      navStyle: state.settings.navStyle,
      layoutType: state.settings.layoutType,
      themeType: state.settings.themeType,
      layoutSettings: state.settings.layoutSettings,
      navExpanded: state.common?.navExpanded ?? state.common?.navExpanded ?? true,
      navSize: state.common.navSize,
      panelSettings: state.common.panelSettings,
    }),
    isEqual
  );
};

// Custom hook for authentication state
export const useAuthState = <U, A>() => {
  return useSelector(
    (state: IDASHAppState<U, A, IDashAutoAdminResourceConfig>) => ({
      authenticated: state.auth.authenticated,
      user: state.auth.user,
    }),
    isEqual
  );
};

// Custom hook for app settings
export const useSettingsState = <U, A>() => {
  return useSelector(
    (state: IDASHAppState<U, A, IDashAutoAdminResourceConfig>) => ({
      groupIcons: state.settings.groupIcons,
      locale: state.settings.locale,
      themeColor: state.settings.themeColor,
      availableLocales: state.settings.availableLocales,
      isDirectionRTL: state.settings.isDirectionRTL,
    }),
    isEqual
  );
};

// Custom hook for common state
export const useCommonState = <U, A>() => {
  return useSelector(
    (state: IDASHAppState<U, A, IDashAutoAdminResourceConfig>) => ({
      appPath: state.common.appPath,
      width: state.common.width,
      height: state.common.height,
      headerToolBar: state.common.headerToolBar,
      panelSettings: state.common.panelSettings,
    }),
    isEqual
  );
};

// Custom hook for page state
export const usePageState = <U, A>() => {
  return useSelector(
    (state: IDASHAppState<U, A, IDashAutoAdminResourceConfig>) => ({
      title: state.page.title,
      icon: state.page.icon,
      subTitle: state.page.subTitle,
    }),
    isEqual
  );
};

// Custom hook for resources state
export const useResourcesState = <U, A>() => {
  return useSelector(
    (state: IDASHAppState<U, A, IDashAutoAdminResourceConfig>) => ({
      items: state.resources.items,
    }),
    isEqual
  );
};

// Memoized hook for logo settings specifically
export const useLogoSettings = <U, A>() => {
  const { panelSettings } = useCommonState<U, A>();

  return useMemo(() => ({
    horizontalLogo: panelSettings?.horizontalLogo || <>🖥 DASH.</>,
    squaredLogo: panelSettings?.squaredLogo || <>🖥..</>,
    loginBackground: panelSettings?.loginBackground,
  }), [panelSettings]);
};

// Combined hook for theme-related state (optimized for DomainTheme)
export const useThemeState = <U, A>() => {
  const layoutState = useLayoutState<U, A>();
  const logoSettings = useLogoSettings<U, A>();

  return useMemo(() => ({
    ...layoutState,
    ...logoSettings,
  }), [layoutState, logoSettings]);
};

// Hook for navigation state specifically
export const useNavigationState = <U, A>() => {
  return useSelector(
    (state: IDASHAppState<U, A, IDashAutoAdminResourceConfig>) => ({
      navExpanded: state.common?.navExpanded ?? state.common?.navExpanded ?? true,
      navSize: state.common.navSize,
      navStyle: state.settings.navStyle,
      layoutSettings: state.settings.layoutSettings,
    }),
    isEqual
  );
};
