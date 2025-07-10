import React, { createContext, useContext, useMemo } from 'react';
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';

interface DashResourceContextType {
    resourceConfig: IDashAutoAdminResourceConfig;
}

const DashResourceContext = createContext<DashResourceContextType | undefined>(undefined);

export const DashResourceProvider = React.memo<{
    resourceConfig: IDashAutoAdminResourceConfig;
    children: React.ReactNode;
}>(({ resourceConfig, children }) => {
    // Memoize the context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        resourceConfig
    }), [resourceConfig]);

    return (
        <DashResourceContext.Provider value={contextValue}>
            {children}
        </DashResourceContext.Provider>
    );
});

DashResourceProvider.displayName = 'DashResourceProvider';

export const useDashResource = () => {
    const context = useContext(DashResourceContext);
    if (context === undefined) {
        throw new Error('useDashResource must be used within a DashResourceProvider');
    }
    return context;
};
