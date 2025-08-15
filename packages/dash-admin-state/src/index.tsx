export { default as DASHStoreConfig } from './redux/store/index';
export { createRootReducer as DASHCreateRootReducer } from './redux/reducers/index';

export { default as DASH_THEME_SETTINGS } from './DefaultThemeSettings';

export type { default as IAuthState } from './redux/interfaces/IAuthState';
export type { default as ICommonState } from './redux/interfaces/ICommonState';
export type { default as ISettingsState } from './redux/interfaces/ISettings';
export type { default as IPageState } from './redux/interfaces/IPage';
export type { default as IDASHAppState } from './redux/interfaces/IDASHAppState';
export type { default as IComponentDataState } from './redux/interfaces/IComponentData'; // Add this line

export { default as defaultAuth } from './defaults/defaultAuth';
export { default as defaultCommon } from './defaults/defaultCommon';
export { default as defaultFormState } from './defaults/defaultFormState';
export { default as defaultPageSettings } from './defaults/defaultPage';
export { default as defaultSettings } from './defaults/defaultSettings';

// Export all optimized hooks
export {
  useLayoutState,
  useAuthState,
  useSettingsState,
  useCommonState,
  usePageState,
  useResourcesState,
  useLogoSettings,
  useThemeState,
  useNavigationState
} from './hooks/DashAdminStateSelectors';

export * as DASH_REDUX_ACTIONS from './redux/actions';
export * from './redux/ReduxStoreAccesor';
