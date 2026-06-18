import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetList } from 'react-admin';
import { DASH_REDUX_ACTIONS } from 'dash-admin-state';
import { IDASHAppState } from 'dash-admin-state';
import { ITab } from '../interfaces/ITab';

interface CachedProductsData {
  products: any[];
  lastFetch: number;
  searchHistory: string[];
}

interface CachedTabData {
  [tabId: string]: {
    tab: ITab;
    timestamp: number;
  };
}

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const CACHE_KEY = 'tab.products.cache';
const TAB_CACHE_KEY = 'tab.data.cache';

// Updated hook signature to match TabManagerContext expectations
export const useProductsCache = (
  filters: any = {},
  searchFilter: string = '',
  productsResource: string = 'ecommerce/product',
  perPage: number = 100,
  enableInfiniteScroll: boolean = false,
  tabId?: string | number
) => {
  const dispatch = useDispatch();
  const hookId = useRef(`hook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const mountCountRef = useRef(0);
  
  // 🐛 DEBUG: Track mounting
  useEffect(() => {
    mountCountRef.current += 1;
    console.log(`🟢 [ISSUE01] [useProductsCache] MOUNTED (count: ${mountCountRef.current})`, {
      hookId: hookId.current,
      tabId,
      productsResource,
      enableInfiniteScroll,
      searchFilter: searchFilter || '(empty)',
      filtersKeys: Object.keys(filters)
    });
    return () => {
      console.log(`🔴 [ISSUE01] [useProductsCache] UNMOUNTING (count: ${mountCountRef.current})`, {
        hookId: hookId.current,
        tabId
      });
    };
  }, []);
  
  // Local state for pagination
  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [isLoadingAllPages, setIsLoadingAllPages] = useState(false);
  
  // 📦 Get cached data
  const cachedData = useSelector((state: IDASHAppState<any,any,any>) => 
    state.componentData?.[CACHE_KEY] as CachedProductsData | undefined
  );
  
  // ⏰ Check if cache is valid
  const isCacheValid = cachedData?.lastFetch && 
    (Date.now() - cachedData.lastFetch) < CACHE_DURATION;
  
  // 🌐 Fetch from API with pagination and filters
  // 🐛 DEBUG: Log the query params being sent to API
  const queryParams = useMemo(() => ({
    pagination: { page, perPage },
    sort: { field: 'name', order: 'ASC' },
    filter: { 
      ...filters,
      name: searchFilter, 
      load_gallery: true, 
      load_modifier_groups: true, 
      load_prices: true 
    }
  }), [page, perPage, filters, searchFilter]);
  
  useEffect(() => {
    console.log(`🌐 [ISSUE01] [useProductsCache] useGetList query params`, {
      hookId: hookId.current,
      resource: productsResource,
      page,
      perPage,
      searchFilter: searchFilter || '(empty)',
      filtersKeys: Object.keys(filters)
    });
  }, [queryParams, productsResource]);
  
  const { data: apiProducts, total: apiTotal, isLoading, error } = useGetList(
    productsResource,
    queryParams
  );

  // Debug logging
  useEffect(() => {
    console.log(`🔧 useProductsCache hook initialized: ${hookId.current}`);
    return () => {
      console.log(`🧹 Cleanup for hook ${hookId.current}`);
    };
  }, []);

  useEffect(() => {
    if (apiProducts) {
      console.log(`📊 Total items: ${apiTotal}, Total pages: ${Math.ceil((apiTotal || 0) / perPage)}`);
      console.log(`✅ Fetched ${apiProducts.length} products for ${enableInfiniteScroll ? 'infinite' : 'regular'} pagination`);
      console.log(`🔍 Debug: apiProducts is array: ${Array.isArray(apiProducts)}, length: ${apiProducts.length}`);
    }
  }, [apiProducts, apiTotal, perPage, enableInfiniteScroll]);
  
  // 🔍 Perform local search on cached data
  const getLocalSearchResults = useCallback((searchTerm: string) => {
    if (!cachedData?.products || !searchTerm.trim()) {
      return cachedData?.products || [];
    }
    const term = searchTerm.toLowerCase();
    return cachedData.products.filter(product => 
      product.name?.toLowerCase().includes(term) ||
      product.sku?.toLowerCase().includes(term)
    );
  }, [cachedData?.products]);
  
  // 🚀 Get instant results from cache
  const instantResults = searchFilter ? getLocalSearchResults(searchFilter) : cachedData?.products;
  const hasInstantResults = isCacheValid && instantResults && instantResults.length > 0;

  // 💾 Update cache when all data is collected (modified logic)
  useEffect(() => {
    // Only update cache when we have finished loading all pages in non-infinite mode
    // or when we get the first page in infinite mode
    const shouldUpdateCache = apiProducts && !isLoading && !error && (
      (enableInfiniteScroll && page === 1) || 
      (!enableInfiniteScroll && !isLoadingAllPages && allProducts.length > 0)
    );

    if (shouldUpdateCache) {
      const productsToCache = enableInfiniteScroll ? apiProducts : allProducts;
      
      const newCacheData: CachedProductsData = {
        products: productsToCache,
        lastFetch: Date.now(),
        searchHistory: cachedData?.searchHistory || []
      };
      
      // Add search term to history if it's new
      if (searchFilter && !newCacheData.searchHistory.includes(searchFilter)) {
        newCacheData.searchHistory = [
          searchFilter,
          ...newCacheData.searchHistory.slice(0, 9)
        ];
      }
      
      console.log(`💾 Updating cache with ${productsToCache.length} products`);
      dispatch(DASH_REDUX_ACTIONS.setComponentData(CACHE_KEY, newCacheData));
    }
  }, [apiProducts, isLoading, error, searchFilter, cachedData?.searchHistory, dispatch, page, enableInfiniteScroll, isLoadingAllPages, allProducts]);

  // Pagination/infinite scroll logic - FIXED to handle all pages in non-infinite mode
  useEffect(() => {
    if (apiProducts && !isLoading && !error) {
      console.log(`🔄 Processing API response: page ${page}, products: ${apiProducts.length}`);
      
      if (enableInfiniteScroll) {
        setAllProducts(prev => {
          if (page === 1) {
            console.log(`📦 Infinite scroll: Reset to first page, new length: ${apiProducts.length}`);
            return apiProducts;
          } else {
            const newProducts = [...prev, ...apiProducts];
            console.log(`📦 Infinite scroll: Added page ${page}, total length: ${newProducts.length}`);
            return newProducts;
          }
        });
      } else {
        // Non-infinite scroll mode: collect all pages
        setAllProducts(prev => {
          if (page === 1) {
            console.log(`📦 Regular pagination: First page, length: ${apiProducts.length}`);
            const newProducts = [...apiProducts];
            
            // If there are more pages, start loading them
            const totalPages = Math.ceil((apiTotal || 0) / perPage);
            if (totalPages > 1 && !isLoadingAllPages) {
              console.log(`📄 Regular pagination: Need to load ${totalPages - 1} more pages`);
              setIsLoadingAllPages(true);
              // Load next page
              setTimeout(() => setPage(2), 100);
            }
            
            return newProducts;
          } else {
            // Subsequent pages in regular mode
            const newProducts = [...prev, ...apiProducts];
            console.log(`📦 Regular pagination: Added page ${page}, total length: ${newProducts.length}`);
            
            // Check if we need to load more pages
            const totalPages = Math.ceil((apiTotal || 0) / perPage);
            if (page < totalPages) {
              console.log(`📄 Regular pagination: Loading page ${page + 1} of ${totalPages}`);
              // Load next page after a short delay
              setTimeout(() => setPage(page + 1), 100);
            } else {
              console.log(`✅ Regular pagination: All ${totalPages} pages loaded, total products: ${newProducts.length}`);
              setIsLoadingAllPages(false);
            }
            
            return newProducts;
          }
        });
      }
      
      setTotal(apiTotal || 0);
      setIsLoadingMore(false);
    }
  }, [apiProducts, apiTotal, isLoading, error, enableInfiniteScroll, page, perPage, isLoadingAllPages]);

  // Reset on filter change - IMPROVED to prevent unnecessary resets
  const prevDepsRef = useRef({ searchFilter, filters: JSON.stringify(filters), productsResource, perPage, enableInfiniteScroll });
  useEffect(() => {
    const currentDeps = { searchFilter, filters: JSON.stringify(filters), productsResource, perPage, enableInfiniteScroll };
    const changedKeys = Object.keys(currentDeps).filter(
      key => prevDepsRef.current[key as keyof typeof currentDeps] !== currentDeps[key as keyof typeof currentDeps]
    );
    
    console.log(`🔄 [ISSUE01] [useProductsCache] Filter/config changed, resetting pagination`, {
      hookId: hookId.current,
      changedKeys,
      searchFilter: searchFilter || '(empty)',
      filtersJSON: JSON.stringify(filters),
      productsResource,
      currentPage: page,
      currentProductsCount: allProducts.length
    });
    
    prevDepsRef.current = currentDeps;
    setPage(1);
    setAllProducts([]);
    setIsLoadingMore(false);
    setIsLoadingAllPages(false);
  }, [searchFilter, JSON.stringify(filters), productsResource, perPage, enableInfiniteScroll]);

  // Load more for infinite scroll - IMPROVED with better guards
  const loadMore = useCallback(() => {
    console.log(`🔄 loadMore called: isLoading=${isLoading}, enableInfiniteScroll=${enableInfiniteScroll}, allProducts.length=${allProducts.length}, apiTotal=${apiTotal}, isLoadingMore=${isLoadingMore}`);
    
    if (!isLoading && !isLoadingMore && enableInfiniteScroll && allProducts.length < (apiTotal || 0)) {
      console.log(`📄 Loading more: current page ${page}, will load page ${page + 1}`);
      setIsLoadingMore(true);
      setPage(prev => prev + 1);
    } else {
      console.log(`⏸️ Load more blocked - reason: ${
        isLoading ? 'isLoading' :
        isLoadingMore ? 'isLoadingMore' :
        !enableInfiniteScroll ? 'not infinite scroll' :
        allProducts.length >= (apiTotal || 0) ? 'no more items' : 'unknown'
      }`);
    }
  }, [isLoading, isLoadingMore, enableInfiniteScroll, allProducts.length, apiTotal, page]);

  // Cache debug info
  const cacheInfo = useMemo(() => ({
    currentContext: "Main Products",
    isCacheValid: isCacheValid ? "Yes" : "No", 
    displayedProducts: `${(enableInfiniteScroll ? allProducts : (hasInstantResults ? instantResults : allProducts))?.length || 0} / ${apiTotal || 0}`,
    paginationInfo: `${page} / ${Math.ceil((apiTotal || 0) / perPage)}`,
    mainCacheSize: cachedData?.products?.length || 0,
    apiProductsLoaded: apiProducts?.length || 0,
    isLoadingMore: isLoadingMore,
    isLoadingAllPages: isLoadingAllPages
  }), [
    isCacheValid, enableInfiniteScroll, allProducts, hasInstantResults, 
    instantResults, apiTotal, page, perPage, cachedData?.products?.length, 
    isLoadingMore, isLoadingAllPages
  ]);

  // Log cache debug info
  useEffect(() => {
    console.log('🐛 Cache Debug Info:', cacheInfo);
  }, [cacheInfo]);

  // 🎯 Return the best available data
  const products = useMemo(() => {
    const result = enableInfiniteScroll
      ? allProducts
      : (hasInstantResults ? instantResults : allProducts); // Changed from apiProducts to allProducts
    
    console.log(`🔢 Products count in hook return: ${result?.length || 0}`);
    return result || [];
  }, [enableInfiniteScroll, allProducts, hasInstantResults, instantResults]);

  const isShowingCached = hasInstantResults && isLoading;

  // Pagination info
  const currentPage = page;
  const totalPages = Math.ceil((apiTotal || total || 1) / perPage);
  const hasMorePages = currentPage < totalPages;
  const totalItems = apiTotal || total || products?.length || 0;

  return {
    products,
    isLoading: hasInstantResults ? false : (isLoading || isLoadingAllPages),
    isLoadingMore,
    error,
    isShowingCached,
    cacheAge: cachedData?.lastFetch ? Date.now() - cachedData.lastFetch : null,
    searchHistory: cachedData?.searchHistory || [],
    hasCache: !!cachedData?.products?.length,
    loadMore,
    hasMorePages,
    currentPage,
    totalPages,
    totalItems,
    cacheInfo,
    clearSearchCache: () => dispatch(DASH_REDUX_ACTIONS.setComponentData(CACHE_KEY, {})),
    clearMainCache: () => dispatch(DASH_REDUX_ACTIONS.setComponentData(CACHE_KEY, {})),
    clearAllCaches: () => {
      dispatch(DASH_REDUX_ACTIONS.setComponentData(CACHE_KEY, {}));
      dispatch(DASH_REDUX_ACTIONS.setComponentData(TAB_CACHE_KEY, {}));
    }
  };
};

// 🆕 New hook for tab caching
export const useTabCache = () => {
  const dispatch = useDispatch();
  
  const cachedTabs = useSelector((state: IDASHAppState<any,any,any>) => 
    state.componentData?.[TAB_CACHE_KEY] as CachedTabData | undefined
  );
  
  const cacheTab = useCallback((tab: ITab) => {
    const currentCache = cachedTabs || {};
    const newCache = {
      ...currentCache,
      [tab.id]: {
        tab,
        timestamp: Date.now()
      }
    };
    
    dispatch(DASH_REDUX_ACTIONS.setComponentData(TAB_CACHE_KEY, newCache));
  }, [dispatch, cachedTabs]);
  
  const getCachedTab = useCallback((tabId: string | number): ITab | null => {
    if (!cachedTabs || !tabId) return null;
    
    const cached = cachedTabs[tabId.toString()];
    if (!cached) return null;
    
    // Check if cache is still valid (5 minutes)
    const isValid = (Date.now() - cached.timestamp) < (5 * 60 * 1000);
    return isValid ? cached.tab : null;
  }, [cachedTabs]);
  
  const clearTabCache = useCallback((tabId?: string | number) => {
    if (tabId) {
      const currentCache = cachedTabs || {};
      const newCache = { ...currentCache };
      delete newCache[tabId.toString()];
      dispatch(DASH_REDUX_ACTIONS.setComponentData(TAB_CACHE_KEY, newCache));
    } else {
      dispatch(DASH_REDUX_ACTIONS.setComponentData(TAB_CACHE_KEY, {}));
    }
  }, [dispatch, cachedTabs]);
  
  return {
    cacheTab,
    getCachedTab,
    clearTabCache,
    hasCachedTab: (tabId: string | number) => !!getCachedTab(tabId)
  };
};

export default useProductsCache;

