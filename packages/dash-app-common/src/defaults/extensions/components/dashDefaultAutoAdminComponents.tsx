/**
 * Dash Default Auto Admin Components Extension
 * 
 * Default components that can be dynamically rendered in auto-admin forms.
 * These are registered with the DashAutoAdmin system and can be referenced
 * by name in resource schemas.
 */
import React from 'react';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';

/**
 * Dash default auto admin components
 * Use this for components that are already imported
 */
export const dashDefaultAutoAdminComponents: Record<string, React.FC<IDashAutoAdminCustomFieldComponent>> = {
    // Add default components here
};

/**
 * Load dash default auto admin components asynchronously
 * This function is used by DASHLazyAdminApp to register default components
 */
export const loadDashDefaultAutoAdminComponents = async (): Promise<Record<string, React.ComponentType<any>>> => {
    try {
        const [
            JsonComp,
            JsonColorSelectorComp,
            JsonCssVarValuesComp
        ] = await Promise.all([
            import('dash-components').then(module => ({ default: module.Json })),
            import('dash-components').then(module => ({ default: module.JsonColorSelectorEnhanced })),
            import('dash-components').then(module => ({ default: module.JsonCssVarValues }))
        ]);

        return {
            // Dash components
            Json: JsonComp.default,
            JsonColorSelector: JsonColorSelectorComp.default,
            JsonCssVarValues: JsonCssVarValuesComp.default,
            // App-specific components
            ...dashDefaultAutoAdminComponents,
        };
    } catch (error) {
        console.error('Failed to load dash default auto admin components:', error);
        return dashDefaultAutoAdminComponents;
    }
};

export default loadDashDefaultAutoAdminComponents;
