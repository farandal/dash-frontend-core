import React, { createContext, useContext, ReactNode } from 'react';

import IDashAutoAdminResourceConfig from 'dash-auto-admin/src/interfaces/IDashAutoAdminResourceConfig';

// Define the context type
interface DashResourceContextType {
  resourceConfig: IDashAutoAdminResourceConfig | null;
}

// Create the context with a default value
const DashResourceContext = createContext<DashResourceContextType>({
  resourceConfig: null,
});

// Create a provider component
interface DashResourceProviderProps {
  resourceConfig: IDashAutoAdminResourceConfig;
  children: ReactNode;
}

export const DashResourceProvider: React.FC<DashResourceProviderProps> = ({
  resourceConfig,
  children,
}) => {
  return (
    <DashResourceContext.Provider value={{ resourceConfig }}>
      {children}
    </DashResourceContext.Provider>
  );
};

// Create a hook to use the context
export const useDashResource = (): DashResourceContextType => {
  const context = useContext(DashResourceContext);
  if (!context) {
    throw new Error('useDashResource must be used within a DashResourceProvider');
  }
  return context;
};

export default DashResourceContext;