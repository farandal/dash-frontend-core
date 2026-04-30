/**
 * useTabDataQueries.ts
 * 
 * Custom React Query hooks for tab data fetching with caching and deduplication.
 * Adapted from kitchntabs-mall useMallDataQueries.ts.
 * 
 * Features:
 * - Request deduplication
 * - Configurable caching with staleTime
 * - Automatic refetching when dependencies change
 */

import { useGetList } from 'react-admin';
import { useMemo, useEffect } from 'react';
// Assuming Product interface is available here or we use any for now if import fails
// In TabManagerContext it is: import { Product } from 'kt-ecommerce/src/interfaces';
// We will try to use the same import.
import { Product } from 'kt-ecommerce/src/interfaces';

// =====================================
// CACHE CONFIGURATION
// =====================================

export const TAB_CACHE_CONFIG = {
    // How long data is considered "fresh" (10 minutes)
    staleTime: 10 * 60 * 1000, 
    
    // How long to keep data in cache after component unmounts (15 minutes)
    gcTime: 15 * 60 * 1000, 
    
    // Whether to refetch when window regains focus
    refetchOnWindowFocus: false,
    
    // Whether to refetch on component mount if data is stale
    refetchOnMount: false,
    
    // Whether to retry failed requests
    retry: 1,
    
    // Retry delay
    retryDelay: 1000,
};

// =====================================
// PRODUCTS QUERY HOOK
// =====================================

export interface UseTabProductsOptions {
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
    filters?: any;
    searchQuery?: string;
    page?: number;
    perPage?: number;
    sort?: { field: string; order: 'ASC' | 'DESC' };
}

export interface UseTabProductsResult {
    products: Product[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
    isFetching: boolean;
    total: number;
}

/**
 * Hook to fetch tab products with React Query caching and deduplication.
 */
export function useTabProducts(
    productsResource: string,
    options: UseTabProductsOptions = {}
): UseTabProductsResult {
    const {
        enabled = true,
        staleTime = TAB_CACHE_CONFIG.staleTime,
        filters = {},
        searchQuery = '',
        page = 1,
        perPage = 100,
        sort = { field: 'name', order: 'ASC' },
    } = options;
    
    // Build filter object
    const filter = useMemo(() => {
        const f = { ...filters };
        
        // Add default filters if needed
        f.load_gallery = true;
        f.load_modifier_groups = true;
        f.load_prices = true;
        
        if (searchQuery.trim()) {
            f.name = searchQuery.trim();
        }
        
        return f;
    }, [filters, searchQuery]);
    
    // Use React Admin's useGetList which properly accesses the QueryClient context
    const query = useGetList<Product>(
        productsResource,
        {
            pagination: { page, perPage },
            sort,
            filter,
        },
        {
            enabled,
            staleTime,
            refetchOnWindowFocus: TAB_CACHE_CONFIG.refetchOnWindowFocus,
            refetchOnMount: TAB_CACHE_CONFIG.refetchOnMount,
            retry: TAB_CACHE_CONFIG.retry,
            retryDelay: TAB_CACHE_CONFIG.retryDelay,
        }
    );
    
    // Log when data is fetched (for debugging)
    useEffect(() => {
        if (query.data && !query.isPending) {
            // console.log(`✅ [useTabProducts] Loaded ${query.data.length} products`);
        }
    }, [query.data, query.isPending]);
    
    return {
        products: query.data ?? [],
        total: query.total ?? (query.data?.length || 0),
        isLoading: query.isPending,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
        isFetching: query.isFetching,
    };
}
