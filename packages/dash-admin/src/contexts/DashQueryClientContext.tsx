import React, { FC, useContext } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export type IQueryClientContext = {
  queryClient?: QueryClient;
};

export interface IDASHQueryClientProvider {
  queryClient?: QueryClient; // Optional - if not provided, skip QueryClientProvider wrapper
  children: React.ReactNode;
}

export const DashQueryClientContext = React.createContext<IQueryClientContext | undefined>(undefined);

/**
 * DashQueryClientProvider
 * 
 * Provides a QueryClient context for React Query hooks.
 * 
 * IMPORTANT: This is designed to work with React Admin which has its own QueryClientProvider.
 * - When queryClient is provided, wraps with QueryClientProvider for components OUTSIDE React Admin
 * - When queryClient is NOT provided, just provides the context (React Admin's provider will be used)
 * 
 * In the typical flow:
 * 1. DASHAppProviders wraps with this provider (with queryClient)
 * 2. DASHAdmin/AdminContext wraps with React Admin's QueryClientProvider
 * 3. Components inside React Admin use React Admin's QueryClient (innermost provider wins)
 * 4. Components outside React Admin but inside DASHAppProviders use our QueryClient
 */
const DashQueryClientProvider: FC<IDASHQueryClientProvider> = ({ queryClient, children }) => {
  const contextValue = { queryClient };

  // If queryClient is provided, wrap with QueryClientProvider
  // This ensures hooks can work both inside and outside React Admin's context
  if (queryClient) {
    return (
      <QueryClientProvider client={queryClient}>
        <DashQueryClientContext.Provider value={contextValue}>
          {children}
        </DashQueryClientContext.Provider>
      </QueryClientProvider>
    );
  }

  // If no queryClient, just provide the context (React Admin's provider should handle it)
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
