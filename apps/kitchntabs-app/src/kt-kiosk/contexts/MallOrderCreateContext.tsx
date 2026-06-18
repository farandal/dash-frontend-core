import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, PropsWithChildren, useRef } from 'react';
import { useDataProvider, useNotify, useTranslate } from 'react-admin';
import { useFormContext } from 'react-hook-form';
import { useAxios } from 'dash-axios-hook';
import { dashStorage } from 'dash-utils';
import { useMediaQuery, useTheme } from '@mui/material';
import { IMallCurrency as ILocalCurrency } from '../utils/formatCurrency';
import { priceFormatter } from 'dash-utils';
import { IStore } from '../interfaces/IStore';
import { useMallStores, useMallProducts, useMallProductSearch, useMallCategories, MALL_CACHE_CONFIG, IMallCategory } from '../hooks/useMallDataQueries';

/**
 * Local currency interface compatible with API response
 * The API may not include decimals, so we make it optional
 */
export interface IMallCurrency {
    id?: number;
    code: string;
    symbol: string;
    format?: string;
    decimals?: number;
}

/**
 * Convert mall currency to local currency format for formatting
 */
const toLocalCurrency = (currency: IMallCurrency | undefined): ILocalCurrency | undefined => {
    if (!currency) return undefined;
    return {
        code: currency.code,
        symbol: currency.symbol,
        format: currency.format,
    };
};

/**
 * Product item format for API submission (matching kt-tabs ProductItem interface)
 */
export interface IMallProductItem {
    id?: number;
    order_id?: string | null;
    product_id: string | number;
    quantity: number;
    unit_price: string;
    product: IMallProduct;
    line_id: string;
    note?: string;
    modifiers?: Array<{
        modifier_option_id: number;
        modifier_group_id?: number;
        price_adjustment: string;
    }>;
}

/**
 * Product interface from the mall API
 */
export interface IMallProduct {
    id: string | number;
    tenant_id: string;
    sku: string;
    name: string;
    description: string | null;
    keywords: string | null;
    category_id: string | number;
    brand_id: string | number;
    gallery_id: string | number;
    is_pack: boolean;
    is_enabled: boolean;
    featured: boolean;
    mall_listed: boolean;
    infinite_stock: boolean;
    tenant?: {
        id: string | number;
        name: string;
        public_id: string | null;
        public_name: string | null;
        address: string | null;
        phone: string | null;
        mobile: string | null;
        contact_name: string | null;
        contact_email: string | null;
        contact_phone: string | null;
        settings: Record<string, any>;
        currencies: Array<{
            id: number;
            code: string;
            symbol: string;
            format: string;
        }>;
    };
    prices: Array<{
        id: number;
        price: string;
        product_id: number;
        pricelist_id: number;
        pricelist: {
            id: number;
            tenant_id: string;
            currency_id: number;
            name: string;
            is_primary: boolean;
            is_internal: boolean;
            currency: {
                id: number;
                code: string;
                symbol: string;
                format: string;
            }
        }
    }>;
    gallery?: {
        id: number;
        title: string;
        description: string | null;
        tenant_id: string;
        created_at: string;
        updated_at: string;
        images: Array<{
            id: number;
            url: string;
        }>;
        primary_image_id: number;
        primary_image_url: string;
        images_count: number;
        has_images: boolean;
    };
    _gallery_debug?: {
        gallery_id: number;
        relation_loaded: boolean;
        gallery_exists: boolean;
    };
    modifier_groups?: Array<{
        id: number;
        tenant_id: string;
        name: string;
        type: string;
        description: string | null;
        is_required: boolean;
        min_selections: number;
        max_selections: number | null;
        options?: Array<{
            id: number;
            modifier_group_id: number;
            name: string;
            price_adjustment: string;
            description: string | null;
            is_default: boolean;
            display_order: number;
        }>;
    }>;
    modifier_groups_ids?: number[];
    primary_product_image_id: number | null;
    images: Array<any>;
    primary_product_image_url: string | null;
    has_product_images: boolean;
    primary_image: string | null;
}

/**
 * Cart item interface
 */
export interface IMallCartItem {
    uniqueId: string;
    product: IMallProduct;
    quantity: number;
    selectedModifiers: Record<number, number[]>;
    note?: string;
    lineTotal: number;
}

/**
 * Pagination mode
 */
export type PaginationMode = 'horizontal' | 'infinite';

/**
 * Context value interface
 */
interface MallOrderCreateContextValue {
    // Stores
    stores: IStore[];
    isLoadingStores: boolean;
    selectedStore: IStore | null;
    setSelectedStore: (store: IStore | null) => void;
    showFeaturedOnly: boolean;
    setShowFeaturedOnly: (show: boolean) => void;
    toggleFeaturedOnly: () => void;
    
    // Products
    products: IMallProduct[];
    allProducts: IMallProduct[];
    featuredProducts: IMallProduct[];
    isLoadingProducts: boolean;
    currentPage: number;
    totalPages: number;
    setCurrentPage: (page: number) => void;
    ITEMS_PER_PAGE: number;
    
    // Carousel pagination (horizontal infinite scroll)
    carouselProducts: IMallProduct[]; // All loaded products for carousel (merged pages)
    isLoadingCarouselPage: boolean;
    hasMoreCarouselPages: boolean;
    loadNextCarouselPage: () => void;
    loadPrevCarouselPage: () => void;
    resetCarouselPagination: () => void;
    carouselCurrentPage: number;
    carouselTotalPages: number;
    carouselTotalCount: number;
    
    // Search
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    isSearching: boolean;

    // Categories
    categories: IMallCategory[];
    selectedCategory: IMallCategory | null;
    selectCategory: (category: IMallCategory | null) => void;
    isLoadingCategories: boolean;
    // UI state
    isLargeScreen: boolean;
    
    // Pagination mode
    paginationMode: PaginationMode;
    setPaginationMode: (mode: PaginationMode) => void;
    
    // Cart
    cartItems: IMallCartItem[];
    addToCart: (product: IMallProduct, modifiers?: Record<number, number[]>, note?: string) => void;
    removeFromCart: (uniqueId: string) => void;
    updateQuantity: (uniqueId: string, quantity: number) => void;
    updateCartItem: (uniqueId: string, modifiers: Record<number, number[]>, note?: string) => void;
    clearCart: () => void;
    cartTotal: number;
    cartItemCount: number;
    
    // Drawer
    isCartDrawerOpen: boolean;
    setIsCartDrawerOpen: (open: boolean) => void;
    
    // Modifier Modal
    selectedProductForModifier: IMallProduct | null;
    isModifierModalOpen: boolean;
    openModifierModal: (product: IMallProduct) => void;
    closeModifierModal: () => void;
    // Edit mode for cart items
    editingCartItemId: string | null;
    editCartItem: (uniqueId: string) => void;
    getEditingCartItem: () => IMallCartItem | null;
    
    // Assistance
    isAssistanceLoading: boolean;
    requestAssistance: () => Promise<void>;
    // Assistance dialog state
    isAssistanceDialogOpen: boolean;
    assistanceDialogData: {
        store_name: string;
        customer_name: string;
        table_number: string;
        estimated_response_time: string;
        assistance_available: boolean;
        remaining_requests?: number;
    } | null;
    closeAssistanceDialog: () => void;
    // Cooldown (key: storeId, value: cooldown end timestamp)
    assistanceCooldowns: Record<number, number>;
    getAssistanceCooldownRemaining: (storeId: number) => number;
    
    // Utils (V1-compatible pricing)
    formatPrice: (amount: number | string | undefined | null, currency?: IMallCurrency) => string;
    getCurrency: () => IMallCurrency | null;
    getProductPrice: (product: IMallProduct) => number;
    getProductCurrency: (product: IMallProduct) => IMallCurrency | undefined;
    
    // Cache info - now using React Query
    isShowingCached: boolean;
    cacheAge: number | null;
    invalidateProductsCache: () => void;
    invalidateStoresCache: () => void;
    invalidateAllCaches: () => void;
}

const MallOrderCreateContext = createContext<MallOrderCreateContextValue | null>(null);

const ITEMS_PER_PAGE = 20;
// Default paths - can be overridden via props for Self-Service mode
const DEFAULT_STORES_PATH = 'public/mall/stores';
const DEFAULT_PRODUCTS_PATH = 'public/mall/products';
const DEFAULT_SESSION_STORAGE_KEY = 'mall-session-hash';

// Note: Caching is now handled by React Query via useMallDataQueries hooks.
// See MALL_CACHE_CONFIG in ../hooks/useMallDataQueries.ts for cache settings.

interface MallOrderCreateProviderProps extends PropsWithChildren {
    storesPath?: string;
    productsPath?: string;
    categoriesPath?: string;
    productsField?: string;
    /** Storage key for session hash (e.g., 'mall-session-hash' or 'selfservice-session-hash') */
    sessionStorageKey?: string;
    /** If true, skip stores loading (for single-tenant self-service mode) */
    singleTenantMode?: boolean;
}

export const MallOrderCreateProvider: React.FC<MallOrderCreateProviderProps> = ({
    children,
    storesPath = DEFAULT_STORES_PATH,
    productsPath = DEFAULT_PRODUCTS_PATH,
    categoriesPath,
    productsField = 'products',
    sessionStorageKey = DEFAULT_SESSION_STORAGE_KEY,
    singleTenantMode = false,
}) => {
    const dataProvider = useDataProvider();
    const axios = useAxios();
    const notify = useNotify();
    const translate = useTranslate();
    
    // Get form context for syncing cart with form
    let formContext: ReturnType<typeof useFormContext> | null = null;
    try {
        formContext = useFormContext();
    } catch (e) {
        // Not inside a form context - that's okay for standalone usage
        console.warn('MallOrderCreateProvider: Not inside a FormContext, cart will not sync with form');
    }
    
    // Ref to track if we're updating form to prevent infinite loops
    const isUpdatingFormRef = useRef(false);
    
    // Store state - using React Query hook for caching and deduplication
    const [selectedStore, setSelectedStore] = useState<IStore | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<IMallCategory | null>(null);
    const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

    // Search state - separate from main products query for debouncing
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    
    // =====================================
    // REACT QUERY HOOKS FOR DATA FETCHING
    // =====================================
    
    // Stores - fetched once and cached via React Query
    const { 
        stores, 
        isLoading: isLoadingStores,
        refetch: refetchStores,
    } = useMallStores(storesPath, {
        enabled: !singleTenantMode, // Only fetch stores if not in single tenant mode
        staleTime: MALL_CACHE_CONFIG.staleTime,
        gcTime: MALL_CACHE_CONFIG.gcTime,
    });

    // Categories - fetched if categoriesPath is provided (usually single tenant mode)
    const {
        categories,
        isLoading: isLoadingCategories,
    } = useMallCategories(categoriesPath || '', {
        enabled: Boolean(categoriesPath && categoriesPath.length > 0),
        staleTime: MALL_CACHE_CONFIG.staleTime,
    });
    
    // Products - depends on store selection (or single tenant mode) and category
    const selectedStoreId = singleTenantMode ? null : (selectedStore?.id ?? null);
    
    console.log('🛒 MallOrderCreateContext: Fetching products with:', {
        productsPath,
        singleTenantMode,
        selectedStoreId,
        categoryId: selectedCategory?.id,
        ignoreMallListed: singleTenantMode,
        enabled: Boolean(productsPath && productsPath.length > 0)
    });

    const { 
        products: queriedProducts, 
        isLoading: isLoadingProducts,
        isFetching: isFetchingProducts,
        refetch: refetchProducts,
        total: totalProducts,
    } = useMallProducts(productsPath, {
        selectedStoreId,
        categoryId: selectedCategory?.id ?? null,
        showFeaturedOnly,
        searchQuery: isSearching ? searchQuery : '',
        ignoreMallListed: singleTenantMode,
    });
    
    // Sync queried products to local state for filtering/pagination
    const [allProducts, setAllProducts] = useState<IMallProduct[]>([]);
    const lastProductsSyncHashRef = useRef<string>('');
    
    // Update allProducts when queriedProducts changes
    useEffect(() => {
        if (queriedProducts && queriedProducts.length > 0) {
            // Generate a quick hash to detect actual product changes
            const newHash = `${queriedProducts.slice(0, 5).map(p => p.id).join(',')}-${queriedProducts.length}`;
            
            if (lastProductsSyncHashRef.current !== newHash) {
                console.log('📦 React Query products synced to allProducts:', {
                    count: queriedProducts.length,
                    previousHash: lastProductsSyncHashRef.current,
                    newHash
                });
                lastProductsSyncHashRef.current = newHash;
                setAllProducts(queriedProducts);
            }
        }
    }, [queriedProducts]);
    
    // Products state for local pagination
    const [currentPage, setCurrentPage] = useState(1);
    // Responsive breakpoint detection
    const theme = useTheme();
    const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
    
    // Pagination mode state - default based on screen size
    // Small/medium screens: horizontal carousel, Large screens: infinite scroll
    const [paginationMode, setPaginationMode] = useState<PaginationMode>(() => 
        typeof window !== 'undefined' && window.innerWidth >= 1200 ? 'infinite' : 'horizontal'
    );
    
    // Track if user has manually changed the mode
    const userChangedModeRef = useRef(false);
    
    // Wrapper to track user-initiated mode changes
    const handleSetPaginationMode = useCallback((mode: PaginationMode) => {
        userChangedModeRef.current = true;
        setPaginationMode(mode);
    }, []);
    
    // Auto-switch pagination mode based on screen size (only if user hasn't manually changed it)
    useEffect(() => {
        if (!userChangedModeRef.current) {
            const newMode = isLargeScreen ? 'infinite' : 'horizontal';
            if (newMode !== paginationMode) {
                console.log(`📱 Screen size changed, switching to ${newMode} mode`);
                setPaginationMode(newMode);
            }
        }
    }, [isLargeScreen]);
    
    // Carousel pagination state (for horizontal infinite scroll)
    const [carouselPages, setCarouselPages] = useState<Record<number, IMallProduct[]>>({});
    const [carouselCurrentPage, setCarouselCurrentPage] = useState(1);
    const [carouselTotalPages, setCarouselTotalPages] = useState(1);
    const [carouselTotalCount, setCarouselTotalCount] = useState(0);
    const [isLoadingCarouselPage, setIsLoadingCarouselPage] = useState(false);
    const carouselLoadedPagesRef = useRef<Set<number>>(new Set());
    
    // Cart state
    const [cartItems, setCartItems] = useState<IMallCartItem[]>([]);
    
    // Drawer state
    const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
    
    // Modifier modal state
    const [selectedProductForModifier, setSelectedProductForModifier] = useState<IMallProduct | null>(null);
    const [isModifierModalOpen, setIsModifierModalOpen] = useState(false);
    const [editingCartItemId, setEditingCartItemId] = useState<string | null>(null);
    
    // Assistance state
    const [isAssistanceLoading, setIsAssistanceLoading] = useState(false);
    const [isAssistanceDialogOpen, setIsAssistanceDialogOpen] = useState(false);
    const [assistanceDialogData, setAssistanceDialogData] = useState<{
        store_name: string;
        customer_name: string;
        table_number: string;
        estimated_response_time: string;
        assistance_available: boolean;
        remaining_requests?: number;
    } | null>(null);
    // Cooldown: key = storeId, value = timestamp when cooldown ends
    const [assistanceCooldowns, setAssistanceCooldowns] = useState<Record<number, number>>(() => {
        // Load from storage on init
        const stored = dashStorage.getItem('assistance-cooldowns');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch {
                return {};
            }
        }
        return {};
    });
    // Default cooldown interval: 5 minutes (configurable)
    const ASSISTANCE_COOLDOWN_MINUTES = 5;
    
    // =====================================
    // DATA FETCHING - Now handled by React Query hooks
    // See useMallStores and useMallProducts hooks above.
    // React Query provides:
    // - Request deduplication (no duplicate requests while one is in-flight)
    // - Caching with configurable staleTime and gcTime
    // - Automatic refetch when dependencies change
    // =====================================
    
    // =====================================
    // CAROUSEL PAGINATION FUNCTIONS
    // =====================================
    
    // Load a specific carousel page from cached products (no API call)
    const loadCarouselPage = useCallback((page: number): IMallProduct[] => {
        // Check if already cached in carousel state
        if (carouselPages[page] && carouselPages[page].length > 0) {
            console.log(`📦 Using cached carousel page ${page}`);
            return carouselPages[page];
        }
        
        // If we don't have products from React Query yet, return empty
        if (!queriedProducts || queriedProducts.length === 0) {
            console.log(`⏳ Waiting for products to load for page ${page}...`);
            return [];
        }
        
        // Sort products: featured first, then by name
        const sortedProducts = [...queriedProducts].sort((a: any, b: any) => {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            return a.name.localeCompare(b.name);
        }) as IMallProduct[];
        
        // Calculate page slice
        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const pageProducts = sortedProducts.slice(startIndex, endIndex);
        
        // Update total count and pages
        const total = sortedProducts.length;
        setCarouselTotalCount(total);
        setCarouselTotalPages(Math.ceil(total / ITEMS_PER_PAGE));
        
        // Cache the page
        setCarouselPages(prev => ({
            ...prev,
            [page]: pageProducts,
        }));
        carouselLoadedPagesRef.current.add(page);
        
        console.log(`✅ Carousel page ${page} loaded from cache: ${pageProducts.length} products (total: ${total})`);
        
        return pageProducts;
    }, [queriedProducts, carouselPages]);
    
    // Preload adjacent pages for smooth scrolling (now synchronous since we use cached data)
    const preloadAdjacentPages = useCallback((currentPage: number) => {
        const pagesToLoad = [currentPage - 1, currentPage + 1].filter(
            p => p >= 1 && p <= carouselTotalPages && !carouselLoadedPagesRef.current.has(p)
        );
        
        for (const page of pagesToLoad) {
            loadCarouselPage(page);
        }
    }, [carouselTotalPages, loadCarouselPage]);
    
    // Load next carousel page (now synchronous)
    const loadNextCarouselPage = useCallback(() => {
        if (carouselCurrentPage >= carouselTotalPages) {
            return;
        }
        
        const nextPage = carouselCurrentPage + 1;
        loadCarouselPage(nextPage);
        setCarouselCurrentPage(nextPage);
        
        // Preload next adjacent page
        preloadAdjacentPages(nextPage);
    }, [carouselCurrentPage, carouselTotalPages, loadCarouselPage, preloadAdjacentPages]);
    
    // Load previous carousel page (now synchronous)
    const loadPrevCarouselPage = useCallback(() => {
        if (carouselCurrentPage <= 1) {
            return;
        }
        
        const loadingPage = Math.min(...Array.from(carouselLoadedPagesRef.current));
        if (loadingPage <= 1) return;
        
        loadCarouselPage(loadingPage - 1);
    }, [carouselCurrentPage, loadCarouselPage]);
    
    // Reset carousel pagination (when store changes)
    const resetCarouselPagination = useCallback(() => {
        setCarouselPages({});
        setCarouselCurrentPage(1);
        setCarouselTotalPages(1);
        setCarouselTotalCount(0);
        carouselLoadedPagesRef.current.clear();
        lastProductsHashRef.current = ''; // Reset hash to allow re-initialization
    }, []);
    
    // Merged carousel products from all loaded pages
    const carouselProducts = useMemo(() => {
        const pageNumbers = Object.keys(carouselPages)
            .map(Number)
            .sort((a, b) => a - b);
        
        const merged: IMallProduct[] = [];
        const seenIds = new Set<string | number>();
        
        for (const pageNum of pageNumbers) {
            const pageProducts = carouselPages[pageNum] || [];
            for (const product of pageProducts) {
                // Deduplicate products by ID to prevent React key warnings
                if (!seenIds.has(product.id)) {
                    seenIds.add(product.id);
                    merged.push(product);
                }
            }
        }
        
        // Apply search filter if needed
        if (!searchQuery.trim()) return merged;
        
        const query = searchQuery.toLowerCase();
        return merged.filter(product => 
            product.name.toLowerCase().includes(query) ||
            product.description?.toLowerCase().includes(query) ||
            product.sku?.toLowerCase().includes(query)
        );
    }, [carouselPages, searchQuery]);
    
    // Check if there are more pages to load
    const hasMoreCarouselPages = useMemo(() => {
        return carouselCurrentPage < carouselTotalPages;
    }, [carouselCurrentPage, carouselTotalPages]);
    
    // Ref to track the last products hash to detect actual content changes
    const lastProductsHashRef = useRef<string>('');
    
    // Generate a simple hash from product IDs to detect content changes
    const getProductsHash = useCallback((products: IMallProduct[]): string => {
        if (!products || products.length === 0) return '';
        // Use first 10 product IDs + count as a quick hash
        const ids = products.slice(0, 10).map(p => p.id).join(',');
        return `${ids}-${products.length}`;
    }, []);
    
    // Initialize carousel/grid from React Query products (no API call needed)
    // This runs for both horizontal and infinite modes to keep carouselProducts in sync
    useEffect(() => {
        if (!queriedProducts || queriedProducts.length === 0) return;
        
        // Generate hash of current products
        const currentHash = getProductsHash(queriedProducts);
        
        // Skip if products haven't actually changed
        if (lastProductsHashRef.current === currentHash) {
            console.log('📦 Products: unchanged, skipping update');
            return;
        }
        
        console.log(`🔄 Initializing products for ${paginationMode} mode...`, { 
            productsCount: queriedProducts.length,
            showFeaturedOnly,
            previousHash: lastProductsHashRef.current,
            newHash: currentHash,
            paginationMode
        });
        
        // Sort products: featured first, then by name
        const sortedProducts = [...queriedProducts].sort((a: any, b: any) => {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            return a.name.localeCompare(b.name);
        }) as IMallProduct[];
        
        const total = sortedProducts.length;
        
        // Update allProducts state to keep in sync
        setAllProducts(sortedProducts);
        
        // For infinite mode, load all products; for horizontal mode, paginate
        if (paginationMode === 'infinite') {
            // Load all products at once for infinite scroll
            setCarouselPages({ 1: sortedProducts });
            setCarouselCurrentPage(1);
            setCarouselTotalCount(total);
            setCarouselTotalPages(1); // All on one "page"
            carouselLoadedPagesRef.current.clear();
            carouselLoadedPagesRef.current.add(1);
            
            console.log(`✅ Infinite grid initialized: ${sortedProducts.length} products`);
        } else {
            // Horizontal carousel: paginate
            const firstPageProducts = sortedProducts.slice(0, ITEMS_PER_PAGE);
            
            setCarouselPages({ 1: firstPageProducts });
            setCarouselCurrentPage(1);
            setCarouselTotalCount(total);
            setCarouselTotalPages(Math.ceil(total / ITEMS_PER_PAGE));
            carouselLoadedPagesRef.current.clear();
            carouselLoadedPagesRef.current.add(1);
            
            console.log(`✅ Carousel initialized: ${firstPageProducts.length} products (total: ${total})`);
        }
        
        // Update hash to track this set of products
        lastProductsHashRef.current = currentHash;
        
    }, [paginationMode, queriedProducts, showFeaturedOnly, getProductsHash]);
    
    // Ref to track last search query to avoid duplicate processing
    const lastProcessedSearchRef = useRef<string>('');
    
    // Backend search effect - debounced search query triggers API call
    // Only makes API call for actual searches, not for clearing
    useEffect(() => {
        // If search is cleared, use cached products from React Query
        if (!searchQuery.trim()) {
            if (lastProcessedSearchRef.current !== '') {
                console.log('🔄 Search cleared, using cached products...');
                lastProcessedSearchRef.current = '';
                
                // Reset to React Query products (already cached)
                if (queriedProducts && queriedProducts.length > 0) {
                    setAllProducts(queriedProducts);
                    
                    // Reset carousel if in horizontal mode
                    if (paginationMode === 'horizontal') {
                        const sortedProducts = [...queriedProducts].sort((a: any, b: any) => {
                            if (a.featured && !b.featured) return -1;
                            if (!a.featured && b.featured) return 1;
                            return a.name.localeCompare(b.name);
                        });
                        setCarouselPages({ 1: sortedProducts.slice(0, ITEMS_PER_PAGE) });
                        setCarouselCurrentPage(1);
                        setCarouselTotalCount(sortedProducts.length);
                        setCarouselTotalPages(Math.ceil(sortedProducts.length / ITEMS_PER_PAGE));
                        carouselLoadedPagesRef.current.clear();
                        carouselLoadedPagesRef.current.add(1);
                    }
                }
            }
            return;
        }
        
        // Avoid duplicate processing of same search
        if (lastProcessedSearchRef.current === searchQuery.trim()) {
            return;
        }
        
        // Debounce backend search (500ms after local filter already applied)
        setIsSearching(true);
        const searchTimer = setTimeout(async () => {
            console.log('🔍 Backend search for:', searchQuery);
            lastProcessedSearchRef.current = searchQuery.trim();
            
            const filter: any = {
                is_enabled: true,
                mall_listed: true,
                load_gallery: true,
                load_modifier_groups: true,
                load_prices: true,
                search: searchQuery.trim(), // Backend search parameter
            };
            
            if (selectedStore) {
                filter.tenant_ids = [selectedStore.id];
            }

            if (selectedCategory) {
                filter.category_id = selectedCategory.id;
            }
            
            // Add featured filter when showFeaturedOnly is true
            if (showFeaturedOnly) {
                filter.featured = true;
            }
            
            try {
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
                
                console.log(`✅ Backend search returned ${sortedProducts.length} products`);
                
                // Update allProducts with search results
                setAllProducts(sortedProducts);
                
                // Also update carousel pages if in horizontal mode
                if (paginationMode === 'horizontal') {
                    setCarouselPages({ 1: sortedProducts.slice(0, ITEMS_PER_PAGE) });
                    setCarouselCurrentPage(1);
                    setCarouselTotalCount(sortedProducts.length);
                    setCarouselTotalPages(Math.ceil(sortedProducts.length / ITEMS_PER_PAGE));
                    carouselLoadedPagesRef.current.clear();
                    carouselLoadedPagesRef.current.add(1);
                }
                
            } catch (error) {
                console.error('Error in backend search:', error);
            } finally {
                setIsSearching(false);
            }
        }, 500); // 500ms debounce for backend search
        
        return () => {
            clearTimeout(searchTimer);
            setIsSearching(false);
        };
    }, [searchQuery, selectedStore, selectedCategory, dataProvider, productsPath, paginationMode, showFeaturedOnly, queriedProducts]);

    // Filter products by search query and featured filter
    const filteredProducts = useMemo(() => {
        let result = allProducts;
        
        // Filter by featured only if enabled
        if (showFeaturedOnly) {
            result = result.filter(product => product.featured);
        }
        
        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(product => 
                product.name.toLowerCase().includes(query) ||
                product.description?.toLowerCase().includes(query) ||
                product.sku?.toLowerCase().includes(query)
            );
        }
        
        return result;
    }, [allProducts, searchQuery, showFeaturedOnly]);
    
    // Get featured products
    const featuredProducts = useMemo(() => {
        return allProducts.filter(p => p.featured);
    }, [allProducts]);
    
    // Paginated products for horizontal mode
    const products = useMemo(() => {
        if (paginationMode === 'infinite') {
            return filteredProducts;
        }
        
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredProducts, currentPage, paginationMode]);
    
    // Total pages
    const totalPages = useMemo(() => {
        return Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    }, [filteredProducts]);
    
    // Get currency from product (V1 getProductCurrency pattern)
    const getProductCurrency = useCallback((product: IMallProduct): IMallCurrency | undefined => {
        if (!product.prices || product.prices.length === 0) {
            return undefined;
        }
        
        // Try to find primary pricelist currency first (V1 logic)
        const primaryPrice = product.prices.find((price) => 
            price.pricelist && price.pricelist.is_primary
        );
        
        if (primaryPrice?.pricelist?.currency) {
            return primaryPrice.pricelist.currency as IMallCurrency;
        }
        
        // Fallback to first price currency
        if (product.prices[0]?.pricelist?.currency) {
            return product.prices[0].pricelist.currency as IMallCurrency;
        }
        
        return undefined;
    }, []);
    
    // Get currency from first store or product (V1 compatible)
    const getCurrency = useCallback((): IMallCurrency | null => {
        // First try to get from stores
        if (stores.length > 0 && stores[0].currencies?.length > 0) {
            return stores[0].currencies[0] as IMallCurrency;
        }
        // Then try from products
        if (allProducts.length > 0) {
            const currency = getProductCurrency(allProducts[0]);
            if (currency) return currency;
        }
        // Default fallback
        return { id: 0, code: 'USD', symbol: '$', format: ',', decimals: 0 };
    }, [stores, allProducts, getProductCurrency]);
    
    const toggleFeaturedOnly = useCallback(() => {
        setShowFeaturedOnly(prev => !prev);
    }, []);

    // Format price using centralized priceFormatter from dash-utils
    const formatPrice = useCallback((amount: number | string | undefined | null, currency?: IMallCurrency): string => {
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : (amount || 0);
        
        if (isNaN(numAmount)) {
            const fallbackCurrency = getCurrency();
            return `${fallbackCurrency?.symbol || '$'}0`;
        }
        
        // Use centralized priceFormatter with currency code
        const currencyToUse = currency || getCurrency();
        const currencyCode = currencyToUse?.code || 'CLP';
        return priceFormatter(numAmount, currencyCode);
    }, [getCurrency]);
    
    // Get product price (V1 getPrimaryPrice pattern)
    const getProductPrice = useCallback((product: IMallProduct): number => {
        if (!product.prices || product.prices.length === 0) {
            return 0;
        }
        
        // Try to find primary pricelist price first (V1 logic)
        const primaryPrice = product.prices.find((price) => 
            price.pricelist && price.pricelist.is_primary
        );
        
        if (primaryPrice) {
            return parseFloat(primaryPrice.price) || 0;
        }
        
        // Fallback to first price
        return parseFloat(product.prices[0].price) || 0;
    }, []);
    
    // Cart operations
    const addToCart = useCallback((product: IMallProduct, modifiers: Record<number, number[]> = {}, note?: string) => {
        const basePrice = getProductPrice(product);
        
        // Calculate modifier price adjustments
        let modifierTotal = 0;
        if (product.modifier_groups) {
            product.modifier_groups.forEach(group => {
                const selectedOptions = modifiers[group.id] || [];
                selectedOptions.forEach(optionId => {
                    const option = group.options?.find(o => o.id === optionId);
                    if (option) {
                        modifierTotal += parseFloat(option.price_adjustment) || 0;
                    }
                });
            });
        }
        
        const lineTotal = basePrice + modifierTotal;
        
        const newItem: IMallCartItem = {
            uniqueId: `${product.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            product,
            quantity: 1,
            selectedModifiers: modifiers,
            note,
            lineTotal,
        };
        
        setCartItems(prev => [...prev, newItem]);
        
        // Show toast with product name if no modifiers were selected (direct add)
        const hasModifiers = Object.keys(modifiers).length > 0 && 
            Object.values(modifiers).some(arr => arr.length > 0);
        
        if (!hasModifiers) {
            notify(translate('mall.product_added_with_name', { name: product.name }), { type: 'success' });
        } else {
            notify(translate('mall.product_added'), { type: 'success' });
        }
    }, [getProductPrice, notify, translate]);
    
    const removeFromCart = useCallback((uniqueId: string) => {
        setCartItems(prev => prev.filter(item => item.uniqueId !== uniqueId));
    }, []);
    
    const updateQuantity = useCallback((uniqueId: string, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(uniqueId);
            return;
        }
        
        setCartItems(prev => prev.map(item => {
            if (item.uniqueId === uniqueId) {
                const basePrice = getProductPrice(item.product);
                let modifierTotal = 0;
                
                if (item.product.modifier_groups) {
                    item.product.modifier_groups.forEach(group => {
                        const selectedOptions = item.selectedModifiers[group.id] || [];
                        selectedOptions.forEach(optionId => {
                            const option = group.options?.find(o => o.id === optionId);
                            if (option) {
                                modifierTotal += parseFloat(option.price_adjustment) || 0;
                            }
                        });
                    });
                }
                
                return {
                    ...item,
                    quantity,
                    lineTotal: (basePrice + modifierTotal) * quantity,
                };
            }
            return item;
        }));
    }, [getProductPrice, removeFromCart]);
    
    // Update cart item modifiers and note (for editing from cart)
    const updateCartItem = useCallback((uniqueId: string, modifiers: Record<number, number[]>, note?: string) => {
        setCartItems(prev => prev.map(item => {
            if (item.uniqueId === uniqueId) {
                const basePrice = getProductPrice(item.product);
                let modifierTotal = 0;
                
                if (item.product.modifier_groups) {
                    item.product.modifier_groups.forEach(group => {
                        const selectedOptions = modifiers[group.id] || [];
                        selectedOptions.forEach(optionId => {
                            const option = group.options?.find(o => o.id === optionId);
                            if (option) {
                                modifierTotal += parseFloat(option.price_adjustment) || 0;
                            }
                        });
                    });
                }
                
                return {
                    ...item,
                    selectedModifiers: modifiers,
                    note: note,
                    lineTotal: (basePrice + modifierTotal) * item.quantity,
                };
            }
            return item;
        }));
        setEditingCartItemId(null);
        notify(translate('mall.product_updated'), { type: 'success' });
    }, [getProductPrice, notify, translate]);
    
    // Edit an existing cart item (opens modifier modal in edit mode)
    const editCartItem = useCallback((uniqueId: string) => {
        const item = cartItems.find(i => i.uniqueId === uniqueId);
        if (item) {
            setSelectedProductForModifier(item.product);
            setEditingCartItemId(uniqueId);
            setIsModifierModalOpen(true);
        }
    }, [cartItems]);
    
    // Get editing cart item data (for modifier modal)
    const getEditingCartItem = useCallback(() => {
        if (!editingCartItemId) return null;
        return cartItems.find(item => item.uniqueId === editingCartItemId) || null;
    }, [editingCartItemId, cartItems]);
    
    // Convert cart items to API format for form submission
    const convertCartToProductItems = useCallback((): IMallProductItem[] => {
        return cartItems.map((item) => {
            const basePrice = getProductPrice(item.product);
            
            // Convert selectedModifiers to API format
            const modifiers: IMallProductItem['modifiers'] = [];
            if (item.product.modifier_groups) {
                item.product.modifier_groups.forEach(group => {
                    const selectedOptions = item.selectedModifiers[group.id] || [];
                    selectedOptions.forEach(optionId => {
                        const option = group.options?.find(o => o.id === optionId);
                        if (option) {
                            modifiers.push({
                                modifier_option_id: optionId,
                                modifier_group_id: group.id,
                                price_adjustment: option.price_adjustment,
                            });
                        }
                    });
                });
            }
            
            return {
                product_id: item.product.id,
                quantity: item.quantity,
                unit_price: String(basePrice),
                product: item.product,
                line_id: item.uniqueId,
                note: item.note,
                modifiers: modifiers.length > 0 ? modifiers : undefined,
            };
        });
    }, [cartItems, getProductPrice]);
    
    // Sync cart items with form whenever cart changes
    useEffect(() => {
        if (!formContext || isUpdatingFormRef.current) return;
        
        isUpdatingFormRef.current = true;
        
        const productItems = convertCartToProductItems();
        
        try {
            formContext.setValue(productsField, productItems, { 
                shouldValidate: false,
                shouldDirty: true,
                shouldTouch: false,
            });
            
            console.log('🛒 Cart synced to form:', productItems.length, 'items');
        } catch (e) {
            console.error('Error syncing cart to form:', e);
        } finally {
            // Use setTimeout to ensure we don't block the current render cycle
            setTimeout(() => {
                isUpdatingFormRef.current = false;
            }, 0);
        }
    }, [cartItems, formContext, productsField, convertCartToProductItems]);
    
    const clearCart = useCallback(() => {
        setCartItems([]);
    }, []);
    
    // Cart totals
    const cartTotal = useMemo(() => {
        return cartItems.reduce((sum, item) => sum + item.lineTotal, 0);
    }, [cartItems]);
    
    const cartItemCount = useMemo(() => {
        return cartItems.reduce((sum, item) => sum + item.quantity, 0);
    }, [cartItems]);
    
    // Modifier modal
    const openModifierModal = useCallback((product: IMallProduct) => {
        setSelectedProductForModifier(product);
        setIsModifierModalOpen(true);
    }, []);
    
    const closeModifierModal = useCallback(() => {
        setSelectedProductForModifier(null);
        setIsModifierModalOpen(false);
    }, []);
    
    // Close assistance dialog
    const closeAssistanceDialog = useCallback(() => {
        setIsAssistanceDialogOpen(false);
        setAssistanceDialogData(null);
    }, []);
    
    // Get remaining cooldown time in seconds for a store
    const getAssistanceCooldownRemaining = useCallback((storeId: number): number => {
        const cooldownEnd = assistanceCooldowns[storeId];
        if (!cooldownEnd) return 0;
        const remaining = Math.max(0, cooldownEnd - Date.now());
        return Math.ceil(remaining / 1000);
    }, [assistanceCooldowns]);
    
    // Format remaining time as MM:SS
    const formatCooldownTime = useCallback((seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }, []);

    // Handle category selection
    const handleSelectCategory = useCallback((category: IMallCategory | null) => {
        setSelectedCategory(category);
        // Reset search field when changing category
        setSearchQuery('');
        
        // Reset pagination to first page
        setCurrentPage(1);
    }, []);
    
    // Request assistance
    const requestAssistance = useCallback(async () => {
        if (!selectedStore) {
            notify(translate('mall.select_store_first'), { type: 'warning' });
            return;
        }
        
        // Check cooldown
        const cooldownRemaining = getAssistanceCooldownRemaining(selectedStore.id);
        if (cooldownRemaining > 0) {
            notify(
                translate('tab.assistance.cooldown_remaining', { 
                    time: formatCooldownTime(cooldownRemaining) 
                }), 
                { type: 'warning' }
            );
            return;
        }
        
        setIsAssistanceLoading(true);
        
        try {
            // Note: dashStorage.getItem already handles JSON.parse internally
            const orderData = dashStorage.getItem('orderData');
            const name = orderData?.name ?? null;
            const tableNumber = orderData?.tableNumber ?? null;
            
            if (!name || !tableNumber) {
                window.dispatchEvent(new CustomEvent('enter-public-order-data', {
                    detail: {
                        onConfirm: () => requestAssistance()
                    }
                }));
                setIsAssistanceLoading(false);
                return;
            }
            
            const sessionHash = dashStorage.getItem(sessionStorageKey);
            
            const { data } = await axios.post(
                `${storesPath}/${selectedStore.id}/assistance`,
                {
                    session_hash: sessionHash,
                    customer_name: name,
                    table_number: tableNumber,
                    store_id: selectedStore.id,
                    timestamp: new Date().toISOString()
                }
            );
            
            // Set cooldown for this store
            const cooldownEnd = Date.now() + (ASSISTANCE_COOLDOWN_MINUTES * 60 * 1000);
            const newCooldowns = {
                ...assistanceCooldowns,
                [selectedStore.id]: cooldownEnd,
            };
            setAssistanceCooldowns(newCooldowns);
            // Persist to storage
            dashStorage.setItem('assistance-cooldowns', JSON.stringify(newCooldowns));
            
            // Calculate remaining requests (max 2 per session per store)
            const remainingRequests = data.data?.assistance_available ? 1 : 0;
            
            // Show success dialog with response data
            setAssistanceDialogData({
                store_name: data.data?.store_name || selectedStore.name,
                customer_name: data.data?.customer_name || name,
                table_number: data.data?.table_number || tableNumber,
                estimated_response_time: data.data?.estimated_response_time || '2-5 minutos',
                assistance_available: data.data?.assistance_available ?? true,
                remaining_requests: remainingRequests,
            });
            setIsAssistanceDialogOpen(true);
            
        } catch (error: any) {
            if (error?.status === 429) {
                notify(translate('tab.assistance.rate_limit'), { type: 'warning' });
            } else if (error?.status === 422) {
                window.dispatchEvent(new CustomEvent('enter-public-order-data', {
                    detail: {
                        onConfirm: () => requestAssistance()
                    }
                }));
            } else {
                notify(error?.message || translate('tab.assistance.error_message'), { type: 'error' });
            }
        } finally {
            setIsAssistanceLoading(false);
        }
    }, [selectedStore, storesPath, axios, notify, translate, assistanceCooldowns, getAssistanceCooldownRemaining, formatCooldownTime]);
    
    const contextValue: MallOrderCreateContextValue = {
        // Stores
        stores,
        isLoadingStores,
        selectedStore,
        setSelectedStore,
        showFeaturedOnly,
        setShowFeaturedOnly,
        
        // Products
        products,
        allProducts: filteredProducts,
        featuredProducts,
        isLoadingProducts,
        currentPage,
        totalPages,
        setCurrentPage,
        ITEMS_PER_PAGE,
        
        // Carousel pagination (horizontal infinite scroll)
        carouselProducts,
        isLoadingCarouselPage,
        hasMoreCarouselPages,
        loadNextCarouselPage,
        loadPrevCarouselPage,
        resetCarouselPagination,
        carouselCurrentPage,
        carouselTotalPages,
        carouselTotalCount,
        
        // Search
        searchQuery,
        setSearchQuery,
        isSearching,

        // Categories
        categories,
        selectedCategory,
        selectCategory: handleSelectCategory,
        isLoadingCategories,
        // UI state
        isLargeScreen,
        
        // Pagination mode
        paginationMode,
        setPaginationMode: handleSetPaginationMode,
        
        // Cart
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateCartItem,
        clearCart,
        cartTotal,
        cartItemCount,
        
        // Drawer
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        
        // Modifier Modal
        selectedProductForModifier,
        isModifierModalOpen,
        openModifierModal,
        closeModifierModal,
        
        // Edit mode for cart items
        editingCartItemId,
        editCartItem,
        getEditingCartItem,
        
        // Assistance
        isAssistanceLoading,
        requestAssistance,
        isAssistanceDialogOpen,
        assistanceDialogData,
        closeAssistanceDialog,
        assistanceCooldowns,
        getAssistanceCooldownRemaining,
        
        // Utils (V1-compatible pricing)
        formatPrice,
        getCurrency,
        getProductPrice,
        getProductCurrency,
        
        // Cache info - now using React Query
        // React Query handles caching automatically based on staleTime/gcTime
        isShowingCached: !isFetchingProducts && queriedProducts.length > 0,
        cacheAge: null, // React Query manages cache age internally
        invalidateProductsCache: () => refetchProducts(),
        invalidateStoresCache: () => refetchStores(),
        invalidateAllCaches: () => {
            refetchStores();
            refetchProducts();
        },
    };
    
    return (
        <MallOrderCreateContext.Provider value={contextValue}>
            {children}
        </MallOrderCreateContext.Provider>
    );
};

export const useMallOrderCreate = () => {
    const context = useContext(MallOrderCreateContext);
    if (!context) {
        throw new Error('useMallOrderCreate must be used within MallOrderCreateProvider');
    }
    return context;
};

export default MallOrderCreateContext;
