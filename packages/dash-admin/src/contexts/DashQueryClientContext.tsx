import React, { FC, useContext } from 'react';
import { QueryClient } from '@tanstack/react-query';

export type IQueryClientContext = {
  queryClient?: QueryClient;
};

export interface IDASHQueryClientProvider {
  queryClient: QueryClient; // Make queryClient a required prop
  children: React.ReactNode;
}

export const DashQueryClientContext = React.createContext<IQueryClientContext | undefined>(undefined);

const DashQueryClientProvider: FC<IDASHQueryClientProvider> = ({ queryClient, children }) => {
  const contextValue = { queryClient };

  return (
    <DashQueryClientContext.Provider value={contextValue}>
      {children}
    </DashQueryClientContext.Provider>
  );
};

// Custom hook to use the QueryClient context
export const useDashQueryClient = () => {
  const context = useContext(DashQueryClientContext);
  if (!context) {
    throw new Error('useDashQueryClient must be used within a DASHQueryClientProvider');
  }
  return context.queryClient;
};

export default DashQueryClientProvider;
