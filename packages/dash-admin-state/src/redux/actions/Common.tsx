import { JSX } from 'react';
import {
  LOADING,
  SET_HEADER_COMPONENTS,
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

export const setHeaderComponents = (headerComponents: JSX.Element[]) => {
  return {
    type: SET_HEADER_COMPONENTS,
    headerComponents,
  };
};

export const setPanelSettings = (panelSettings: any) => {
  return {
    type: SET_PANEL_SETTINGS,
    panelSettings,
  };
};
