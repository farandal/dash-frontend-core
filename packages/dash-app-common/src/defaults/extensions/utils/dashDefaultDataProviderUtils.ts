/**
 * Dash Default Data Provider Utilities
 * 
 * Dash default data provider utilities.
 * Re-exports from dash-utils with default types.
 */
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import {
    setResourceConfigs as setConfigs,
    getResourceConfig as getConfig,
    processPostData as processData,
    processFormData,
    buildQueryString,
    isFormDataResource
} from 'dash-utils';

// Type-safe wrappers for the app's resource config type
export const dashDefaultSetResourceConfigs = (configs: IDashAutoAdminResourceConfig[]): void => {
    setConfigs(configs as any);
};

export const dashDefaultGetResourceConfig = (resource: string): IDashAutoAdminResourceConfig | undefined => {
    return getConfig(resource) as IDashAutoAdminResourceConfig | undefined;
};

export const dashDefaultProcessPostData = (
    resource: string,
    data: Record<string, any>,
    operation: 'create' | 'update' | 'getList' | 'import'
): Record<string, any> => {
    return processData(resource, data, operation);
};

// Re-export other utilities with DashDefault prefix
export const dashDefaultProcessFormData = processFormData;
export const dashDefaultBuildQueryString = buildQueryString;
export const dashDefaultIsFormDataResource = isFormDataResource;

export default {
    dashDefaultGetResourceConfig,
    dashDefaultSetResourceConfigs,
    dashDefaultProcessPostData,
    dashDefaultProcessFormData,
    dashDefaultBuildQueryString,
    dashDefaultIsFormDataResource
};
