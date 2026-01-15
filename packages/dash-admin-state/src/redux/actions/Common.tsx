import { FC, JSX } from 'react';
import {
  LOADING,
  SET_HEADER_COMPONENTS,
  SET_NAV_EXPANDED,
  SET_NAV_SIZE,
  SET_PANEL_SETTINGS,
} from './ActionTypes';

export function loading(loading: boolean) {
  return { type: LOADING, loading };
}

export const setComponentState = (componentId: string, state: any) => {
  return {
    type: 'SET_COMPONENT_STATE',
    componentId,
    state,
  };
};

export const unsetComponentState = (componentId: string) => ({
  type: 'UNSET_COMPONENT_STATE',
  componentId,
});

export const setHeaderComponent = (headerToolBar: FC, headerToolBarReplace?: boolean) => {
  return {
    type: SET_HEADER_COMPONENTS,
    headerToolBar,
    headerToolBarReplace: headerToolBarReplace ?? false,
  };
};

export const setPanelSettings = (panelSettings: any) => {
  return {
    type: SET_PANEL_SETTINGS,
    panelSettings,
  };
};


export const setNavExpanded = (navExpanded: boolean) => ({
  type: SET_NAV_EXPANDED,
  payload: navExpanded,
});

export const setNavSize = (navSize: "large" | "small") => ({
  type: SET_NAV_SIZE,
  payload: navSize,
});
