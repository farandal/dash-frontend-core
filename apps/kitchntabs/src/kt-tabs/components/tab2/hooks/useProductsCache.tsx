import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetList } from 'react-admin';
import { DASH_REDUX_ACTIONS } from 'dash-admin-state';
import { IDASHAppState } from 'dash-admin-state';
import { ITab } from '../../tab/interfaces/ITab';

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
const CACHE_KEY = 'tab2.products.cache'; // Changed to avoid conflicts with tab
const TAB_CACHE_KEY = 'tab2.data.cache'; // Changed to avoid conflicts with tab

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
  const { data: apiProducts, total: apiTotal, isLoading, error } = useGetList(
    productsResource,
    {
      pagination: { page, perPage },
      sort: { field: 'name', order: 'ASC' },
      filter: { 
        ...filters,
        name: searchFilter, 
        load_gallery: true, 
        load_modifier_groups: true, 
        load_prices: true 
      }
    }
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

  // Pagination/infinite scroll logic
  useEffect(() => {
    if (enableInfiniteScroll) {
      if (apiProducts && !isLoading && !error) {
        setAllProducts(prev =>
          page === 1 ? apiProducts : [...prev, ...apiProducts]
        );
        setTotal(apiTotal || 0);
        setIsLoadingMore(false);
      }
    } else {
      // Non-infinite scroll mode: collect all pages
      if (apiProducts && !isLoading && !error) {
        setAllProducts(prev => {
          if (page === 1) {
            const newProducts = [...apiProducts];
            
            // If there are more pages, start loading them
            const totalPages = Math.ceil((apiTotal || 0) / perPage);
            if (totalPages > 1 && !isLoadingAllPages) {
              setIsLoadingAllPages(true);
              setTimeout(() => setPage(2), 100);
            }
            
            return newProducts;
          } else {
            const newProducts = [...prev, ...apiProducts];
            
            // Check if we need to load more pages
            const totalPages = Math.ceil((apiTotal || 0) / perPage);
            if (page < totalPages) {
              setTimeout(() => setPage(page + 1), 100);
            } else {
              setIsLoadingAllPages(false);
            }
            
            return newProducts;
          }
        });
      }
      setTotal(apiTotal || 0);
    }
  }, [apiProducts, apiTotal, isLoading, error, enableInfiniteScroll, page, perPage, isLoadingAllPages]);

  // Reset on filter change
  useEffect(() => {
    setPage(1);
    setAllProducts([]);
    setIsLoadingAllPages(false);
  }, [searchFilter, JSON.stringify(filters), productsResource, perPage, enableInfiniteScroll]);

  // Load more for infinite scroll
  const loadMore = useCallback(() => {
    if (!isLoading && enableInfiniteScroll && allProducts.length < (apiTotal || 0)) {
      setIsLoadingMore(true);
      setPage(prev => prev + 1);
    }
  }, [isLoading, enableInfiniteScroll, allProducts.length, apiTotal]);

  // Cache debug info
  const cacheInfo = useMemo(() => ({
    currentContext: "Main Products",
    isCacheValid: isCacheValid ? "Yes" : "No", 
    displayedProducts: `${(enableInfiniteScroll ? allProducts : (hasInstantResults ? instantResults : apiProducts))?.length || 0} / ${apiTotal || 0}`,
    paginationInfo: `${page} / ${Math.ceil((apiTotal || 0) / perPage)}`,
    mainCacheSize: cachedData?.products?.length || 0,
    apiProductsLoaded: apiProducts?.length || 0,
    isLoadingMore: isLoadingMore
  }), [
    isCacheValid, enableInfiniteScroll, allProducts, hasInstantResults, 
    instantResults, apiProducts, apiTotal, page, perPage, cachedData?.products?.length, 
    isLoadingMore
  ]);

  // Log cache debug info
  useEffect(() => {
    console.log('🐛 Cache Debug Info:', cacheInfo);
  }, [cacheInfo]);

  // 🎯 Return the best available data
  const products = enableInfiniteScroll
    ? allProducts
    : (hasInstantResults ? instantResults : allProducts);

  const isShowingCached = hasInstantResults && isLoading;

  // Pagination info
  const currentPage = page;
  const totalPages = Math.ceil((apiTotal || total || 1) / perPage);
  const hasMorePages = currentPage < totalPages;
  const totalItems = apiTotal || total || products?.length || 0;

  return {
    products: products || [],
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