/**
 * Dash Default Initial App State Extension
 * 
 * Defines the initial Redux state for the application.
 */
import {
    IDASHAppState,
    defaultAuth,
    defaultPageSettings,
    defaultFormState
} from 'dash-admin-state';
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import dashDefaultAppSettings from './dashDefaultAppSettings';
import getDashDefaultAppCommon from './dashDefaultAppCommon';



/**
 * Dash default user interface (minimal)
 */
export interface IDashDefaultUser {
    id: number | string;
    name?: string;
    email?: string;
    roles?: string[];
    [key: string]: any;
}

/**
 * Dash default auth interface (minimal)
 */
export interface IDashDefaultAuth {
    user?: IDashDefaultUser;
    token?: string;
    authenticated?: boolean;
    [key: string]: any;
}

/**
 * Dash Default Initial application state
 * Combines default settings with app-specific configurations
 */
export const DASH_DEFAULT_INITIAL_APP_STATE: IDASHAppState<
    IDashDefaultUser,
    IDashDefaultAuth,
    IDashAutoAdminResourceConfig
> = {
    settings: dashDefaultAppSettings(),
    common: getDashDefaultAppCommon(),
    page: defaultPageSettings,
    auth: defaultAuth,
    resources: { items: [] },
    formData: defaultFormState,
    componentData: {},
};

/**
 * Get a fresh copy of the dash default initial state
 * Useful when you need to reset state
 */
export const getDashDefaultInitialAppState = (): IDASHAppState<
    IDashDefaultUser,
    IDashDefaultAuth,
    IDashAutoAdminResourceConfig
> => ({
    settings: dashDefaultAppSettings(),
    common: getDashDefaultAppCommon(),
    page: defaultPageSettings,
    auth: defaultAuth,
    resources: { items: [] },
    formData: defaultFormState,
    componentData: {},
});

export default DASH_DEFAULT_INITIAL_APP_STATE;
