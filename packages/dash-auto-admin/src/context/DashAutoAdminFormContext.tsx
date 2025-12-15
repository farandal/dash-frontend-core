import React, { createContext, useContext } from 'react';

export interface IDashAutoAdminFormContext {
    /**
     * The save handler that wraps form submission with validation.
     * This is exposed so child components (like SaveButton) can trigger it manually.
     */
    onSave?: (values: any) => Promise<void> | void;
    /**
     * The current form mode
     */
    mode: 'create' | 'edit';
}

const DashAutoAdminFormContext = createContext<IDashAutoAdminFormContext>({
    mode: 'create',
});

export const DashAutoAdminFormProvider = DashAutoAdminFormContext.Provider;

/**
 * Hook to access the DashAutoAdminForm context.
 * This is useful for child components that need to trigger form submission manually,
 * such as when using SaveButton with type="button".
 */
export const useDashAutoAdminForm = () => {
    const context = useContext(DashAutoAdminFormContext);
    return context;
};

export default DashAutoAdminFormContext;
