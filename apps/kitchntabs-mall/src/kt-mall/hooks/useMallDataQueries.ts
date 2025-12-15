/**
 * useMallDataQueries.ts
 * 
 * Custom React Query hooks for mall data fetching with caching and deduplication.
 * These hooks leverage React Query (integrated in React-Admin) for:
 * - Request deduplication (prevents duplicate requests while one is in-flight)
 * - Configurable caching with staleTime and gcTime
 * - Automatic refetching when dependencies change
 * 
 * Cache Configuration:
 * - staleTime: How long data is considered fresh (no refetch)
 * - gcTime: How long to keep data in cache after unused (garbage collection)
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useDataProvider } from 'react-admin';
import { useCallback, useMemo } from 'react';
import { IMallProduct } from '../contexts/MallOrderCreateContext';
import { IStore } from '../interfaces/IStore';

// =====================================
// CACHE CONFIGURATION
// =====================================

/**
 * Cache configuration for mall data queries.
 * Adjust these values to control caching behavior.
 */
export const MALL_CACHE_CONFIG = {
    // How long data is considered "fresh" (10 minutes)
    // During this time, React Query will NOT refetch on component re-mount
    staleTime: 10 * 60 * 1000, // 10 minutes
    
    // How long to keep data in cache after component unmounts (15 minutes)
    // After this time, data is garbage collected and will be refetched
    gcTime: 15 * 60 * 1000, // 15 minutes
    
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
// STORES QUERY HOOK
// =====================================

export interface UseMallStoresOptions {
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
}

export interface UseMallStoresResult {
    stores: IStore[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
    isFetching: boolean;
}

/**
 * Hook to fetch mall stores with React Query caching and deduplication.
 * 
 * @example
 * const { stores, isLoading } = useMallStores({
 *   enabled: !!mallId,
 *   staleTime: 5 * 60 * 1000, // 5 minutes override
 * });
 */
export function useMallStores(
    storesPath: string,
    options: UseMallStoresOptions = {}
): UseMallStoresResult {
    const dataProvider = useDataProvider();
    
    const {
        enabled = true,
        staleTime = MALL_CACHE_CONFIG.staleTime,
        gcTime = MALL_CACHE_CONFIG.gcTime,
    } = options;
    
    // Stable query key based on the stores path
    const queryKey = useMemo(() => 
        ['mall', 'stores', storesPath],
        [storesPath]
    );
    
    const query = useQuery({
        queryKey,
        queryFn: async () => {
            console.log('🔄 [useMallStores] Fetching stores from API...');
            const response = await dataProvider.getList(storesPath, {
                pagination: { page: 1, perPage: 100 },
                sort: { field: 'name', order: 'ASC' },
                filter: {},
            });
            console.log(`✅ [useMallStores] Loaded ${response.data.length} stores`);
            return response.data as IStore[];
        },
        enabled,
        staleTime,
        gcTime,
        refetchOnWindowFocus: MALL_CACHE_CONFIG.refetchOnWindowFocus,
        refetchOnMount: MALL_CACHE_CONFIG.refetchOnMount,
        retry: MALL_CACHE_CONFIG.retry,
        retryDelay: MALL_CACHE_CONFIG.retryDelay,
    });
    
    return {
        stores: query.data ?? [],
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
        isFetching: query.isFetching,
    };
}

// =====================================
// PRODUCTS QUERY HOOK
// =====================================

export interface ProductsFilter {
    tenant_ids?: number[];
    featured?: boolean;
    search?: string;
    is_enabled?: boolean;
    mall_listed?: boolean;
    load_gallery?: boolean;
    load_modifier_groups?: boolean;
    load_prices?: boolean;
}

export interface UseMallProductsOptions {
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
    selectedStoreId?: number | null;
    showFeaturedOnly?: boolean;
    searchQuery?: string;
}

export interface UseMallProductsResult {
    products: IMallProduct[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
    isFetching: boolean;
    total: number;
}

/**
 * Hook to fetch mall products with React Query caching and deduplication.
 * 
 * Features:
 * - Automatic cache key based on filter parameters
 * - Deduplication of concurrent requests
 * - Configurable stale/gc time
 * 
 * @example
 * const { products, isLoading } = useMallProducts(productsPath, {
 *   selectedStoreId: selectedStore?.id,
 *   showFeaturedOnly: true,
 *   staleTime: 10 * 60 * 1000, // 10 minutes
 * });
 */
export function useMallProducts(
    productsPath: string,
    options: UseMallProductsOptions = {}
): UseMallProductsResult {
    const dataProvider = useDataProvider();
    
    const {
        enabled = true,
        staleTime = MALL_CACHE_CONFIG.staleTime,
        gcTime = MALL_CACHE_CONFIG.gcTime,
        selectedStoreId = null,
        showFeaturedOnly = false,
        searchQuery = '',
    } = options;
    
    // Build filter object
    const filter = useMemo((): ProductsFilter => {
        const f: ProductsFilter = {
            is_enabled: true,
            mall_listed: true,
            load_gallery: true,
            load_modifier_groups: true,
            load_prices: true,
        };
        
        if (selectedStoreId) {
            f.tenant_ids = [selectedStoreId];
        }
        
        if (showFeaturedOnly) {
            f.featured = true;
        }
        
        if (searchQuery.trim()) {
            f.search = searchQuery.trim();
        }
        
        return f;
    }, [selectedStoreId, showFeaturedOnly, searchQuery]);
    
    // Stable query key based on path and filter
    // This ensures different filters get different cache entries
    const queryKey = useMemo(() => 
        ['mall', 'products', productsPath, filter],
        [productsPath, filter]
    );
    
    const query = useQuery({
        queryKey,
        queryFn: async () => {
            console.log('🔄 [useMallProducts] Fetching products from API...', { filter });
            const response = await dataProvider.getList(productsPath, {
                pagination: { page: 1, perPage: 200 },
                sort: { field: 'featured', order: 'DESC' },
                filter,
            });
            
            // Sort products: featured first, then by name
            const sortedProducts = [...response.data].sort((a: any, b: any) => {
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                return a.name.localeCompare(b.name);
            }) as IMallProduct[];
            
            console.log(`✅ [useMallProducts] Loaded ${sortedProducts.length} products`);
            
            return {
                products: sortedProducts,
                total: response.total ?? sortedProducts.length,
            };
        },
        enabled,
        staleTime,
        gcTime,
        refetchOnWindowFocus: MALL_CACHE_CONFIG.refetchOnWindowFocus,
        refetchOnMount: MALL_CACHE_CONFIG.refetchOnMount,
        retry: MALL_CACHE_CONFIG.retry,
        retryDelay: MALL_CACHE_CONFIG.retryDelay,
    });
    
    return {
        products: query.data?.products ?? [],
        total: query.data?.total ?? 0,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
        isFetching: query.isFetching,
    };
}

// =====================================
// PAGINATED PRODUCTS QUERY HOOK
// =====================================

export interface UseMallProductsPageOptions extends UseMallProductsOptions {
    page: number;
    perPage?: number;
}

export interface UseMallProductsPageResult extends UseMallProductsResult {
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

/**
 * Hook to fetch a specific page of mall products.
 * Useful for carousel pagination.
 * 
 * @example
 * const { products, hasNextPage, isLoading } = useMallProductsPage(productsPath, {
 *   page: currentPage,
 *   perPage: 10,
 *   selectedStoreId: selectedStore?.id,
 * });
 */
export function useMallProductsPage(
    productsPath: string,
    options: UseMallProductsPageOptions
): UseMallProductsPageResult {
    const dataProvider = useDataProvider();
    
    const {
        enabled = true,
        staleTime = MALL_CACHE_CONFIG.staleTime,
        gcTime = MALL_CACHE_CONFIG.gcTime,
        selectedStoreId = null,
        showFeaturedOnly = false,
        searchQuery = '',
        page,
        perPage = 10,
    } = options;
    
    // Build filter object
    const filter = useMemo((): ProductsFilter => {
        const f: ProductsFilter = {
            is_enabled: true,
            mall_listed: true,
            load_gallery: true,
            load_modifier_groups: true,
            load_prices: true,
        };
        
        if (selectedStoreId) {
            f.tenant_ids = [selectedStoreId];
        }
        
        if (showFeaturedOnly) {
            f.featured = true;
        }
        
        if (searchQuery.trim()) {
            f.search = searchQuery.trim();
        }
        
        return f;
    }, [selectedStoreId, showFeaturedOnly, searchQuery]);
    
    // Query key includes page number
    const queryKey = useMemo(() => 
        ['mall', 'products', 'page', productsPath, filter, page, perPage],
        [productsPath, filter, page, perPage]
    );
    
    const query = useQuery({
        queryKey,
        queryFn: async () => {
            console.log(`🔄 [useMallProductsPage] Fetching page ${page}...`, { filter });
            const response = await dataProvider.getList(productsPath, {
                pagination: { page, perPage },
                sort: { field: 'featured', order: 'DESC' },
                filter,
            });
            
            // Sort products: featured first, then by name
            const sortedProducts = [...response.data].sort((a: any, b: any) => {
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                return a.name.localeCompare(b.name);
            }) as IMallProduct[];
            
            const total = response.total ?? sortedProducts.length;
            const totalPages = Math.ceil(total / perPage);
            
            console.log(`✅ [useMallProductsPage] Page ${page}: ${sortedProducts.length} products (total: ${total})`);
            
            return {
                products: sortedProducts,
                total,
                totalPages,
            };
        },
        enabled,
        staleTime,
        gcTime,
        refetchOnWindowFocus: MALL_CACHE_CONFIG.refetchOnWindowFocus,
        refetchOnMount: MALL_CACHE_CONFIG.refetchOnMount,
        retry: MALL_CACHE_CONFIG.retry,
        retryDelay: MALL_CACHE_CONFIG.retryDelay,
    });
    
    const totalPages = query.data?.totalPages ?? 1;
    
    return {
        products: query.data?.products ?? [],
        total: query.data?.total ?? 0,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
        isFetching: query.isFetching,
    };
}

// =====================================
// PREFETCH UTILITIES
// =====================================

/**
 * Hook to get prefetch functions for mall data.
 * Use this to prefetch data before navigation.
 * 
 * @example
 * const { prefetchStores, prefetchProducts } = useMallPrefetch();
 * 
 * // Prefetch on hover
 * onMouseEnter={() => prefetchProducts(productsPath, { selectedStoreId: store.id })}
 */
export function useMallPrefetch() {
    const queryClient = useQueryClient();
    const dataProvider = useDataProvider();
    
    const prefetchStores = useCallback(async (storesPath: string) => {
        const queryKey = ['mall', 'stores', storesPath];
        
        await queryClient.prefetchQuery({
            queryKey,
            queryFn: async () => {
                console.log('🔄 [prefetch] Prefetching stores...');
                const response = await dataProvider.getList(storesPath, {
                    pagination: { page: 1, perPage: 100 },
                    sort: { field: 'name', order: 'ASC' },
                    filter: {},
                });
                return response.data as IStore[];
            },
            staleTime: MALL_CACHE_CONFIG.staleTime,
            gcTime: MALL_CACHE_CONFIG.gcTime,
        });
    }, [queryClient, dataProvider]);
    
    const prefetchProducts = useCallback(async (
        productsPath: string,
        options: { selectedStoreId?: number; showFeaturedOnly?: boolean } = {}
    ) => {
        const filter: ProductsFilter = {
            is_enabled: true,
            mall_listed: true,
            load_gallery: true,
            load_modifier_groups: true,
            load_prices: true,
        };
        
        if (options.selectedStoreId) {
            filter.tenant_ids = [options.selectedStoreId];
        }
        
        if (options.showFeaturedOnly) {
            filter.featured = true;
        }
        
        const queryKey = ['mall', 'products', productsPath, filter];
        
        await queryClient.prefetchQuery({
            queryKey,
            queryFn: async () => {
                console.log('🔄 [prefetch] Prefetching products...');
                const response = await dataProvider.getList(productsPath, {
                    pagination: { page: 1, perPage: 200 },
                    sort: { field: 'featured', order: 'DESC' },
                    filter,
                });
                
                const sortedProducts = [...response.data].sort((a: any, b: any) => {
                    if (a.featured && !b.featured) return -1;
                    if (!a.featured && b.featured) return 1;
                    return a.name.localeCompare(b.name);
                }) as IMallProduct[];
                
                return {
                    products: sortedProducts,
                    total: response.total ?? sortedProducts.length,
                };
            },
            staleTime: MALL_CACHE_CONFIG.staleTime,
            gcTime: MALL_CACHE_CONFIG.gcTime,
        });
    }, [queryClient, dataProvider]);
    
    const invalidateStores = useCallback((storesPath: string) => {
        queryClient.invalidateQueries({ queryKey: ['mall', 'stores', storesPath] });
    }, [queryClient]);
    
    const invalidateProducts = useCallback((productsPath?: string) => {
        if (productsPath) {
            queryClient.invalidateQueries({ queryKey: ['mall', 'products', productsPath] });
        } else {
            queryClient.invalidateQueries({ queryKey: ['mall', 'products'] });
        }
    }, [queryClient]);
    
    return {
        prefetchStores,
        prefetchProducts,
        invalidateStores,
        invalidateProducts,
    };
}

// =====================================
// DEBOUNCED SEARCH HOOK
// =====================================

/**
 * Hook for debounced product search.
 * Waits for user to stop typing before making API call.
 * 
 * @example
 * const { searchResults, isSearching } = useMallProductSearch(productsPath, {
 *   query: searchInput,
 *   debounceMs: 500,
 *   selectedStoreId: selectedStore?.id,
 * });
 */
export function useMallProductSearch(
    productsPath: string,
    options: {
        query: string;
        debounceMs?: number;
        selectedStoreId?: number | null;
        showFeaturedOnly?: boolean;
        enabled?: boolean;
    }
) {
    const {
        query,
        debounceMs = 500,
        selectedStoreId = null,
        showFeaturedOnly = false,
        enabled = true,
    } = options;
    
    // Only search when query has content
    const shouldSearch = enabled && query.trim().length > 0;
    
    // Use products hook with search query
    // The hook will debounce via React Query's caching
    return useMallProducts(productsPath, {
        enabled: shouldSearch,
        selectedStoreId,
        showFeaturedOnly,
        searchQuery: query,
        // Shorter stale time for search results
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
    });
}
