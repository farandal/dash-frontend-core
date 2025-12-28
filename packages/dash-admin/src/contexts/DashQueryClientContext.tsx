import React, { FC, useContext } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider, Persister, PersistQueryClientOptions } from '@tanstack/react-query-persist-client';

export type IQueryClientContext = {
  queryClient?: QueryClient;
  persister?: Persister;
};

export interface IDASHQueryClientProvider {
  queryClient?: QueryClient; // Optional - if not provided, skip QueryClientProvider wrapper
  children: React.ReactNode;
  /** Optional persister for localStorage caching (uses @tanstack/react-query-persist-client) */
  persister?: Persister;
  /** Optional persist options for fine-grained control over cache persistence */
  persistOptions?: Omit<PersistQueryClientOptions, 'queryClient' | 'persister'>;
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
const DashQueryClientProvider: FC<IDASHQueryClientProvider> = ({ 
  queryClient, 
  children,
  persister,
  persistOptions 
}) => {
  const contextValue = { queryClient, persister };

  // If queryClient is provided, wrap with appropriate provider
  if (queryClient) {
    // If persister is also provided, use PersistQueryClientProvider for localStorage caching
    if (persister) {
      const defaultPersistOptions: Omit<PersistQueryClientOptions, 'queryClient' | 'persister'> = {
        maxAge: 1000 * 60 * 60 * 2, // 2 hours default
        dehydrateOptions: {
          // Only persist successful queries that have data
          shouldDehydrateQuery: (query) => {
            return query.state.status === 'success' && query.state.data !== undefined;
          },
        },
        ...persistOptions,
      };

      return (
        <PersistQueryClientProvider 
          client={queryClient} 
          persistOptions={{ 
            persister,
            ...defaultPersistOptions 
          }}
        >
          <DashQueryClientContext.Provider value={contextValue}>
            {children}
          </DashQueryClientContext.Provider>
        </PersistQueryClientProvider>
      );
    }

    // No persister - use standard QueryClientProvider
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

// Custom hook to check if persistence is enabled
export const useDashQueryPersister = () => {
  const context = useContext(DashQueryClientContext);
  return context?.persister;
};

// Custom hook to check if cache is persisted
export const useIsCachePersisted = () => {
  const context = useContext(DashQueryClientContext);
  return !!context?.persister;
};

export default DashQueryClientProvider;
