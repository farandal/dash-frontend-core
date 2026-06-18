import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback, ReactNode } from 'react';
import { useProductsCache, useTabCache } from '../hooks/useProductsCache';
import { Product } from "../../types/ecommerce";
import { ITab } from "../interfaces/ITab";
import { priceFormatter } from "dash-utils";

// Configuration constants
export const SEARCH_CONFIG = {
    SERVER_SEARCH_MIN_LENGTH: 6,
    LOCAL_SEARCH_ENABLED: true,
    DEBOUNCE_DELAY: 300,
};

export const BACKEND_PAGINATION_CONFIG = {
    PER_PAGE: 50,
    INITIAL_DISPLAY: 18,
    LOAD_MORE_INCREMENT: 18,
};

export const INFINITE_SCROLL_CONFIG = {
    THRESHOLD: 500,
    DEBOUNCE_MS: 100,
    PRELOAD_THRESHOLD: 10,
};

export const INITIAL_DISPLAY_RESULTS = 18;
export const LOAD_MORE_INCREMENT = 18;

// Interface for search filters
interface SearchFilters {
    tenant_ids?: number[];
    [key: string]: any;
}

// Context type definition
interface ProductsListManagerContextType {
    // Products data
    products: Product[];
    displayProductsList: Product[];
    isLoading: boolean;
    isLoadingMore: boolean;
    isShowingCached: boolean;
    error: any;
    
    // Search and filters
    filter: string;
    setFilter: (filter: string) => void;
    searchFilters: SearchFilters;
    setSearchFilters: (filters: SearchFilters) => void;
    shouldUseServerSearch: boolean;
    isUsingLocalSearch: boolean;
    
    // Pagination and infinite scroll
    displayCount: number;
    totalResults: number;
    hasMoreResults: boolean;
    remainingCount: number;
    loadMore: () => void;
    handleLoadMoreButton: () => void;
    handleShowLess: () => void;
    
    // Cache information
    cacheAge: number | null;
    searchHistory: string[];
    hasCache: boolean;
    cacheInfo: any;
    clearSearchCache: (searchTerm?: string) => void;
    clearMainCache: () => void;
    clearAllCaches: () => void;
    
    // Product interactions
    handleProductClick: (product: Product) => void;
    addProductToOrder: (product: Product, modifiers: any[]) => void;
    
    // Modal state
    dialogOpen: boolean;
    setDialogOpen: (open: boolean) => void;
    selectedProduct: Product | null;
    setSelectedProduct: (product: Product | null) => void;
    selectedModifiers: any[];
    setSelectedModifiers: (modifiers: any[]) => void;
    handleModifierChange: (updatedModifiers: any[]) => void;
    handleDialogConfirm: () => void;
    handleDialogCancel: () => void;
    
    // Configuration
    enableInfiniteScroll: boolean;
    showPrice: boolean;
    productsResource: string;
    
    // Pagination info for infinite scroll
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasMorePages: boolean;
    
    // Refs
    productsGridRef: React.RefObject<HTMLDivElement>;
}

// Context creation
const ProductsListManagerContext = createContext<ProductsListManagerContextType | null>(null);

// Provider props
interface ProductsListManagerProviderProps {
    children: ReactNode;
    tab: ITab;
    productsResource?: string;
    enableInfiniteScroll?: boolean;
    showPrice?: boolean;
    // Form context functions (passed from parent)
    setValue: (name: string, value: any) => void;
    getValues: (name?: string) => any;
    append: (value: any) => void;
    products: any[];
    method?: 'create' | 'edit' | 'view';
}

// Custom hook for window/document infinite scrolling
const useWindowInfiniteScroll = (
    enabled: boolean,
    hasMoreResults: boolean,
    isLoading: boolean,
    onLoadMore: () => void,
    triggerElementRef?: React.RefObject<HTMLElement>
) => {
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleScroll = useCallback(() => {
        if (!enabled || !hasMoreResults || isLoading) {
            return;
        }

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        if (triggerElementRef?.current) {
            const triggerRect = triggerElementRef.current.getBoundingClientRect();
            const distanceFromViewportBottom = triggerRect.bottom - windowHeight;
            
            if (distanceFromViewportBottom <= INFINITE_SCROLL_CONFIG.THRESHOLD) {
                console.log('🔄 Infinite scroll triggered by element position, loading more...');
                onLoadMore();
                return;
            }
        }

        const distanceFromBottom = documentHeight - (scrollTop + windowHeight);
        
        if (distanceFromBottom <= INFINITE_SCROLL_CONFIG.THRESHOLD) {
            console.log('🔄 Infinite scroll triggered by document scroll, loading more...');
            onLoadMore();
        }
    }, [enabled, hasMoreResults, isLoading, onLoadMore, triggerElementRef]);

    const debouncedHandleScroll = useCallback(() => {
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }
        
        scrollTimeoutRef.current = setTimeout(handleScroll, INFINITE_SCROLL_CONFIG.DEBOUNCE_MS);
    }, [handleScroll]);

    useEffect(() => {
        if (!enabled) return;

        window.addEventListener('scroll', debouncedHandleScroll, { passive: true });
        window.addEventListener('resize', debouncedHandleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', debouncedHandleScroll);
            window.removeEventListener('resize', debouncedHandleScroll);
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, [enabled, debouncedHandleScroll]);

    useEffect(() => {
        return () => {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, []);
};

// Provider component
export const ProductsListManagerProvider: React.FC<ProductsListManagerProviderProps> = ({
    children,
    tab,
    productsResource = "ecommerce/product",
    enableInfiniteScroll = false,
    showPrice = false,
    setValue,
    getValues,
    append,
    products: formProducts,
    method = 'edit'
}) => {
    // Local state
    const [filter, setFilter] = useState("");
    const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedModifiers, setSelectedModifiers] = useState<any[]>([]);
    const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_RESULTS);
    
    // Refs
    const productsGridRef = useRef<HTMLDivElement>(null);
    
    // Determine search mode
    const shouldUseServerSearch = filter.length >= SEARCH_CONFIG.SERVER_SEARCH_MIN_LENGTH;
    const serverSearchQuery = shouldUseServerSearch ? filter : "";
    
    // Use the enhanced caching hook
    const { 
        products: serverProductsList, 
        isLoading, 
        isLoadingMore,
        isShowingCached, 
        cacheAge, 
        searchHistory,
        hasCache,
        loadMore,
        hasMorePages,
        currentPage,
        totalPages,
        totalItems,
        error,
        cacheInfo,
        clearSearchCache,    
        clearMainCache,     
        clearAllCaches      
    } = useProductsCache(
        searchFilters,
        serverSearchQuery, 
        productsResource,
        BACKEND_PAGINATION_CONFIG.PER_PAGE,
        enableInfiniteScroll,
        tab?.id
    );

    useEffect(()=> {
        console.log("Search filters updated ",searchFilters);

    },[searchFilters])
    
    // Tab caching
    const { cacheTab } = useTabCache();
    
    // Local search in cached results
    const localFilteredProducts = useMemo(() => {
        if (!SEARCH_CONFIG.LOCAL_SEARCH_ENABLED || shouldUseServerSearch || !filter) {
            return serverProductsList;
        }
        
        if (!serverProductsList || !Array.isArray(serverProductsList)) {
            return [];
        }
        
        const searchTerm = filter.toLowerCase();
        return serverProductsList.filter(product => 
            product.name?.toLowerCase().includes(searchTerm) ||
            product.sku?.toLowerCase().includes(searchTerm) ||
            product.description?.toLowerCase().includes(searchTerm)
        );
    }, [serverProductsList, filter, shouldUseServerSearch]);
    
    // Final products list
    const productsList = shouldUseServerSearch ? serverProductsList : localFilteredProducts;
    const isUsingLocalSearch = !shouldUseServerSearch && filter.length > 0;
    
    // Reset display count when filter changes (only for non-infinite scroll)
    useEffect(() => {
        if (!enableInfiniteScroll) {
            setDisplayCount(INITIAL_DISPLAY_RESULTS);
        }
    }, [filter, enableInfiniteScroll]);
    
    // Display products list based on scroll mode
    const displayProductsList = useMemo(() => {
        const products = productsList;
        
        if (enableInfiniteScroll) {
            return products || [];
        } else {
            return products && Array.isArray(products) 
                ? products.slice(0, displayCount) 
                : [];
        }
    }, [productsList, enableInfiniteScroll, displayCount]);

    // Results calculation
    const totalResults = useMemo(() => {
        if (enableInfiniteScroll) {
            return shouldUseServerSearch ? totalItems : (serverProductsList?.length || 0);
        } else {
            return productsList?.length || 0;
        }
    }, [enableInfiniteScroll, shouldUseServerSearch, totalItems, serverProductsList?.length, productsList?.length]);

    const hasMoreResults = useMemo(() => {
        if (enableInfiniteScroll) {
            return hasMorePages;
        } else {
            return totalResults > displayCount;
        }
    }, [enableInfiniteScroll, hasMorePages, totalResults, displayCount]);

    const remainingCount = useMemo(() => {
        if (enableInfiniteScroll) {
            return totalItems - displayProductsList.length;
        } else {
            return totalResults - displayCount;
        }
    }, [enableInfiniteScroll, totalItems, displayProductsList.length, totalResults, displayCount]);
    
    // Helper function to get product price
    const getProductPrice = useCallback((product: Product) => {
        if (!showPrice) return null;
        
        const price = product.prices?.find(p => p.pricelist_id === tab?.order?.pricelist_id)?.price;
        const fallbackPrice = price || product.prices?.[0]?.price;
        
        if (fallbackPrice) {
            const numericPrice = parseFloat(fallbackPrice.toString());
            if (!isNaN(numericPrice)) {
                return priceFormatter(numericPrice, 'CLP');
            }
            return fallbackPrice;
        }
        
        return null;
    }, [showPrice, tab?.order?.pricelist_id]);
    
    // Handle load more (for button mode)
    const handleLoadMoreButton = useCallback(() => {
        if (enableInfiniteScroll) {
            loadMore();
        } else {
            setDisplayCount(prev => Math.min(prev + LOAD_MORE_INCREMENT, totalResults));
        }
    }, [enableInfiniteScroll, loadMore, totalResults]);
    
    // Handle show less (only for button mode)
    const handleShowLess = useCallback(() => {
        setDisplayCount(INITIAL_DISPLAY_RESULTS);
        if (productsGridRef.current) {
            productsGridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, []);

    // Product interaction handlers
    const handleProductClick = useCallback((product: Product) => {
        debugger;
        if (product.modifier_groups && product.modifier_groups.length > 0) {
            setSelectedProduct(product);
            
            const defaultModifiers = product.modifier_groups.flatMap(group =>
                group.options.filter(option => option.is_default).map(option => ({
                    modifier_option_id: option.id,
                    modifier_group_id: group.id,
                    price_adjustment: option.price_adjustment,
                    modifier_option: {
                        id: option.id,
                        name: option.name,
                        price_adjustment: option.price_adjustment,
                        modifierGroup: {
                            id: group.id,
                            name: group.name,
                            type: group.type 
                        }
                    }
                }))
            ) || [];
            
            setSelectedModifiers(defaultModifiers);
            setDialogOpen(true);
        } else {
            addProductToOrder(product, []);
        }
    }, []);
    
    const handleModifierChange = useCallback((updatedModifiers: any[]) => {
        setSelectedModifiers(updatedModifiers);
    }, []);

    const handleDialogConfirm = useCallback(() => {
        debugger;
        if (selectedProduct) {
            addProductToOrder(selectedProduct, selectedModifiers);
            setDialogOpen(false);
            setSelectedProduct(null);
            setSelectedModifiers([]);
        }
    }, [selectedProduct, selectedModifiers]);
    
    const handleDialogCancel = useCallback(() => {
        setDialogOpen(false);
        setSelectedProduct(null);
        setSelectedModifiers([]);
    }, []);

    const addProductToOrder = useCallback((product: Product, modifiers: any[]) => {
        try {
            const price = product.prices?.find(p => p.pricelist_id === tab?.order?.pricelist_id)?.price;
            
            if (!price) {
                console.warn(`No price found for product ${product.id} with pricelist ${tab?.order?.pricelist_id}`);
                console.log("Available prices:", product.prices);
            }
            
            const appendProduct = {
                id: undefined,
                order_id: tab?.order_id || null,
                product_id: product.id,
                quantity: 1,
                unit_price: price || product.prices?.[0]?.price || "0",
                product: product,
                line_id: Date.now().toString(),
                note: "",
                modifiers: modifiers
            };
    
            const currentProducts = (getValues("products") || method === "create" ? formProducts : tab.order.items) || [];
            setValue("products", [...currentProducts, appendProduct]);
    
        } catch (error) {
            console.error("Error adding product:", error);
        }
    }, [tab, getValues, setValue, formProducts, method]);

    // Setup window infinite scroll
    useWindowInfiniteScroll(
        enableInfiniteScroll && !isLoading,
        hasMoreResults,
        isLoadingMore,
        loadMore,
        productsGridRef
    );

    // Listen for form submission success to cache the response
    useEffect(() => {
        const handleFormSuccess = (event: CustomEvent) => {
            const { response } = event.detail;
            
            if (response && response.id) {
                console.log('🎯 Tab created successfully, caching response:', response);
                cacheTab(response);
            }
        };

        window.addEventListener('tabCreated', handleFormSuccess as EventListener);
        
        return () => {
            window.removeEventListener('tabCreated', handleFormSuccess as EventListener);
        };
    }, [cacheTab]);

    // Context value
    const contextValue: ProductsListManagerContextType = {
        // Products data
        products: productsList || [],
        displayProductsList,
        isLoading,
        isLoadingMore,
        isShowingCached,
        error,
        
        // Search and filters
        filter,
        setFilter,
        searchFilters,
        setSearchFilters,
        shouldUseServerSearch,
        isUsingLocalSearch,
        
        // Pagination and infinite scroll
        displayCount,
        totalResults,
        hasMoreResults,
        remainingCount,
        loadMore,
        handleLoadMoreButton,
        handleShowLess,
        
        // Cache information
        cacheAge,
        searchHistory,
        hasCache,
        cacheInfo,
        clearSearchCache,
        clearMainCache,
        clearAllCaches,
        
        // Product interactions
        handleProductClick,
        addProductToOrder,
        
        // Modal state
        dialogOpen,
        setDialogOpen,
        selectedProduct,
        setSelectedProduct,
        selectedModifiers,
        setSelectedModifiers,
        handleModifierChange,
        handleDialogConfirm,
        handleDialogCancel,
        
        // Configuration
        enableInfiniteScroll,
        showPrice,
        productsResource,
        
        // Pagination info for infinite scroll
        currentPage,
        totalPages,
        totalItems,
        hasMorePages,
        
        // Refs
        productsGridRef,
    };

    return (
        <ProductsListManagerContext.Provider value={contextValue}>
            {children}
        </ProductsListManagerContext.Provider>
    );
};

// Custom hook to use the context
export const useProductsListManager = (): ProductsListManagerContextType => {
    const context = useContext(ProductsListManagerContext);
    if (!context) {
        throw new Error('useProductsListManager must be used within a ProductsListManagerProvider');
    }
    return context;
};

export default ProductsListManagerContext;
