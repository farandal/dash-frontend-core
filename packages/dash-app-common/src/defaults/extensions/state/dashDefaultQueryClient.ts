/**
 * Dash Default Query Client Configuration Extension
 * 
 * React Query client configuration for data fetching and caching.
 */
import { QueryClient, QueryClientConfig } from '@tanstack/react-query';

/**
 * Dash default query client configuration
 */
export const dashDefaultQueryClientConfig: QueryClientConfig = {
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: 1,
        },
    },
};

/**
 * Dash default development query client configuration with logging
 */
export const dashDefaultDevQueryClientConfig: QueryClientConfig = {
    ...dashDefaultQueryClientConfig,
    // @ts-ignore: required to avoid error during development
    logger: {
        log: (...args: any[]) => {
            console.log('[DashDefaultQueryClient]', ...args);
        },
        warn: (...args: any[]) => {
            console.warn('[DashDefaultQueryClient]', ...args);
        },
        error: (...args: any[]) => {
            console.error('[DashDefaultQueryClient]', ...args);
        },
    },
};

/**
 * Create a dash default query client instance
 * Uses dev config in development mode for logging
 */
export const createDashDefaultQueryClient = (): QueryClient => {
    // Check if we're in development mode
    const isDev = typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    
    const config = isDev ? dashDefaultDevQueryClientConfig : dashDefaultQueryClientConfig;
    
    return new QueryClient(config);
};

/**
 * Pre-configured dash default query client instance
 */
export const dashDefaultQueryClient = createDashDefaultQueryClient();

export default dashDefaultQueryClient;
