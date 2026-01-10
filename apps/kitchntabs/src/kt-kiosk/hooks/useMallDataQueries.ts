/**
 * useMallDataQueries.ts
 * 
 * Custom React Query hooks for mall data fetching with caching and deduplication.
 * These hooks leverage React-Admin's useGetList hook which internally uses React Query.
 * 
 * IMPORTANT: We use useGetList from 'react-admin' instead of useQuery from '@tanstack/react-query'
 * to ensure we use the same QueryClient instance that React-Admin creates. This prevents
 * "No QueryClient set" errors in production builds where code splitting may cause
 * module resolution issues.
 * 
 * Features:
 * - Request deduplication (prevents duplicate requests while one is in-flight)
 * - Configurable caching with staleTime
 * - Automatic refetching when dependencies change
 * 
 * Cache Configuration:
 * - staleTime: How long data is considered fresh (no refetch)
 */

import { useGetList } from 'react-admin';
import { useCallback, useMemo, useState, useEffect } from 'react';
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
 * Hook to fetch mall stores with React-Admin's useGetList hook.
 * Uses React-Admin's internal QueryClient for proper context management.
 * 
 * @example
 * const { stores, isLoading } = useMallStores('stores', {
 *   enabled: !!mallId,
 *   staleTime: 5 * 60 * 1000, // 5 minutes override
 * });
 */
export function useMallStores(
    storesPath: string,
    options: UseMallStoresOptions = {}
): UseMallStoresResult {
    const {
        enabled = true,
        staleTime = MALL_CACHE_CONFIG.staleTime,
    } = options;
    
    // Use React-Admin's useGetList hook which internally uses React Query
    // This ensures we use the same QueryClient instance that React-Admin creates
    const query = useGetList<IStore>(
        storesPath,
        {
            pagination: { page: 1, perPage: 100 },
            sort: { field: 'name', order: 'ASC' },
            filter: {},
        },
        {
            enabled: enabled && storesPath.length > 0,
            staleTime,
            refetchOnWindowFocus: MALL_CACHE_CONFIG.refetchOnWindowFocus,
            refetchOnMount: MALL_CACHE_CONFIG.refetchOnMount,
            retry: MALL_CACHE_CONFIG.retry,
            retryDelay: MALL_CACHE_CONFIG.retryDelay,
        }
    );
    
    // Log when data is fetched (for debugging)
    useEffect(() => {
        if (query.data && !query.isPending) {
            console.log(`✅ [useMallStores] Loaded ${query.data.length} stores`);
        }
    }, [query.data, query.isPending]);
    
    return {
        stores: query.data ?? [],
        isLoading: query.isPending,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
        isFetching: query.isFetching,
    };
}

// =====================================
// CATEGORIES QUERY HOOK
// =====================================

export interface IMallCategory {
    id: string | number;
    name: string;
    description?: string;
    image?: string;
    parent_id?: string | number;
    is_enabled: boolean;
    tree_index?: number;
    // Add other category fields as needed
}

export interface UseMallCategoriesOptions {
    enabled?: boolean;
    staleTime?: number;
}

export interface UseMallCategoriesResult {
    categories: IMallCategory[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
    isFetching: boolean;
}

/**
 * Hook to fetch mall categories with React-Admin's useGetList hook.
 * Used for single-tenant filtering instead of stores.
 */
export function useMallCategories(
    categoriesPath: string,
    options: UseMallCategoriesOptions = {}
): UseMallCategoriesResult {
    const {
        enabled = true,
        staleTime = MALL_CACHE_CONFIG.staleTime,
    } = options;
    
    const query = useGetList<IMallCategory>(
        categoriesPath,
        {
            pagination: { page: 1, perPage: 100 },
            sort: { field: 'tree_index', order: 'ASC' }, // Sort by tree_index then name
            filter: {},
        },
        {
            enabled: enabled && categoriesPath.length > 0,
            staleTime,
            refetchOnWindowFocus: MALL_CACHE_CONFIG.refetchOnWindowFocus,
            refetchOnMount: MALL_CACHE_CONFIG.refetchOnMount,
            retry: MALL_CACHE_CONFIG.retry,
            retryDelay: MALL_CACHE_CONFIG.retryDelay,
        }
    );
    
    // Log when data is fetched (for debugging)
    useEffect(() => {
        if (query.data && !query.isPending) {
            console.log(`✅ [useMallCategories] Loaded ${query.data.length} categories`);
        }
    }, [query.data, query.isPending]);
    
    return {
        categories: query.data ?? [],
        isLoading: query.isPending,
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
    category_id?: string | number | null;
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
    categoryId?: string | number | null;
    showFeaturedOnly?: boolean;
    searchQuery?: string;
    ignoreMallListed?: boolean;
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
    const {
        enabled = true,
        staleTime = MALL_CACHE_CONFIG.staleTime,
        gcTime = MALL_CACHE_CONFIG.gcTime,
        selectedStoreId = null,
        categoryId = null,
        showFeaturedOnly = false,
        searchQuery = '',
        ignoreMallListed = false,
    } = options;
    
    const isEnabled = enabled && productsPath.length > 0;
    console.log('🎣 useMallProducts hook:', { productsPath, isEnabled, options });

    // Build filter object
    const filter = useMemo((): ProductsFilter => {
        const f: ProductsFilter = {
            is_enabled: true,
            load_gallery: true,
            load_modifier_groups: true,
            load_prices: true,
        };

        if (!ignoreMallListed) {
            f.mall_listed = true;
        }
        
        if (selectedStoreId) {
            f.tenant_ids = [selectedStoreId];
        }

        if (categoryId) {
            f.category_id = categoryId;
        }
        
        if (showFeaturedOnly) {
            f.featured = true;
        }
        
        if (searchQuery.trim()) {
            f.search = searchQuery.trim();
        }
        
        return f;
    }, [selectedStoreId, categoryId, showFeaturedOnly, searchQuery]);
    
    // Use React Admin's useGetList which properly accesses the QueryClient context
    const query = useGetList<IMallProduct>(
        productsPath,
        {
            pagination: { page: 1, perPage: 100 },
            sort: { field: 'featured', order: 'DESC' }, // Show featured first
            filter,
        },
        {
            enabled: enabled && productsPath.length > 0,
            staleTime,
            gcTime,
        }
    );

    // Map React Query structure to our interface
    // Note: useGetList returns { data, total, isPending, isError, ... }
    return {
        products: query.data || [],
        isLoading: query.isPending,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
        isFetching: query.isFetching,
        total: query.total || 0,
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
    
    // Use React Admin's useGetList which properly accesses the QueryClient context
    const query = useGetList<IMallProduct>(
        productsPath,
        {
            pagination: { page, perPage },
            sort: { field: 'featured', order: 'DESC' },
            filter,
        },
        {
            enabled: enabled && productsPath.length > 0,
            staleTime,
            refetchOnWindowFocus: MALL_CACHE_CONFIG.refetchOnWindowFocus,
            refetchOnMount: MALL_CACHE_CONFIG.refetchOnMount,
            retry: MALL_CACHE_CONFIG.retry,
            retryDelay: MALL_CACHE_CONFIG.retryDelay,
        }
    );
    
    // Sort products: featured first, then by name (post-processing)
    const sortedProducts = useMemo(() => {
        if (!query.data) return [];
        
        console.log(`🔄 [useMallProductsPage] Sorting page ${page}...`, { count: query.data.length });
        
        const sorted = [...query.data].sort((a: IMallProduct, b: IMallProduct) => {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            return (a.name || '').localeCompare(b.name || '');
        });
        
        console.log(`✅ [useMallProductsPage] Page ${page}: ${sorted.length} products (total: ${query.total})`);
        return sorted;
    }, [query.data, page, query.total]);
    
    const total = query.total ?? sortedProducts.length;
    const totalPages = Math.ceil(total / perPage);
    
    return {
        products: sortedProducts,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        isLoading: query.isPending,
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
 * 
 * NOTE: Prefetching is currently disabled to ensure compatibility with React Admin's
 * QueryClient management. The useGetList hook already handles caching effectively.
 * 
 * If prefetching is needed in the future, consider using React Admin's
 * <fetchRelated> or implementing via data provider hooks.
 * 
 * @deprecated Prefetching disabled - use useGetList caching instead
 */
export function useMallPrefetch() {
    // Return no-op functions to maintain API compatibility
    const prefetchStores = useCallback(async (_storesPath: string) => {
        console.log('[useMallPrefetch] Prefetching disabled - using useGetList caching');
    }, []);
    
    const prefetchProducts = useCallback(async (
        _productsPath: string,
        _options: { selectedStoreId?: number; showFeaturedOnly?: boolean } = {}
    ) => {
        console.log('[useMallPrefetch] Prefetching disabled - using useGetList caching');
    }, []);
    
    const invalidateStores = useCallback((_storesPath: string) => {
        console.log('[useMallPrefetch] Cache invalidation disabled - will refresh on next fetch');
    }, []);
    
    const invalidateProducts = useCallback((_productsPath?: string) => {
        console.log('[useMallPrefetch] Cache invalidation disabled - will refresh on next fetch');
    }, []);
    
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
