import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback, ReactNode } from 'react';
import { useProductsCache, useTabCache } from '../hooks/useProductsCache';

import { ITab } from "../interfaces/ITab";
import { toast } from 'react-toastify';
import { useTranslate } from 'react-admin';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { Product } from 'kt-ecommerce/interfaces';
import { VoiceAction } from '../voice/useVoiceAgent';


// Configuration constants
export const SEARCH_CONFIG = {
    SERVER_SEARCH_MIN_LENGTH: 4,
    LOCAL_SEARCH_ENABLED: true,
    DEBOUNCE_DELAY: 300,
};


export const PAGINATION_CONFIG = {
    PER_PAGE: 50,
    INITIAL_DISPLAY: 18,
    LOAD_MORE_INCREMENT: 18,
};

export const INFINITE_SCROLL_CONFIG = {
    THRESHOLD: 500,
    DEBOUNCE_MS: 100,
    PRELOAD_THRESHOLD: 10,
};


// Add pagination modes enum
export enum PaginationMode {
    INFINITE_SCROLL = 'infinite_scroll',
    LOAD_MORE = 'load_more',
    PAGINATION = 'pagination'
}

// Interface for search filters
interface SearchFilters {
    tenant_ids?: number[];
    [key: string]: any;
}

// Product item interface for order
export interface ProductItem {
    id?: number;
    order_id?: number | null;
    product_id: number;
    quantity: number;
    unit_price: string;
    product: Product;
    line_id: string;
    note?: string;
    modifiers?: any[];
}

// Context type definition
export interface TabManagerContextType {
    // Products data (for selection/catalog)
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
    
    // Product interactions (for adding to order)
    handleProductClick: (product: Product) => void;
    addProductToOrder: (product: Product, modifiers: any[]) => void;
    
    // Modal state (for modifiers)
    dialogOpen: boolean;
    setDialogOpen: (open: boolean) => void;
    selectedProduct: Product | null;
    setSelectedProduct: (product: Product | null) => void;
    selectedModifiers: any[];
    setSelectedModifiers: (modifiers: any[]) => void;
    handleModifierChange: (updatedModifiers: any[]) => void;
    handleDialogConfirm: () => void;
    handleDialogCancel: () => void;
    
    // Order management (current order items)
    orderProducts: ProductItem[];
    setOrderProducts: (products: ProductItem[]) => void;
    totalAmount: number;
    updateOrderProducts: (products: ProductItem[], formValues?: any) => void;
    handleOrderQuantityChange: (product: ProductItem, quantity: number) => void;
    handleOrderNoteChange: (products: ProductItem, note: string) => void;
    handleOrderModifierChange: (product: ProductItem, modifiers: any[]) => void;
    removeOrderProduct: (product: ProductItem) => void;
    calculateOrderTotal: (products?: ProductItem[]) => number;
    
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
    
    // Utils
    showMessage: (message: string, type?: 'success' | 'error' | 'info') => void;

    // Pagination modes
    paginationMode: PaginationMode;
    setPaginationMode: (mode: PaginationMode) => void;
    
    // Page navigation (for pagination mode)
    currentDisplayPage: number;
    setCurrentDisplayPage: (page: number) => void;
    totalDisplayPages: number;
    handlePageChange: (page: number) => void;
    
    // Settings popup
    settingsOpen: boolean;
    setSettingsOpen: (open: boolean) => void;

    // Voice integration properties
    isProcessingVoiceActions: boolean;
    handleVoiceActions: (actions: VoiceAction[]) => void;
    handleVoiceError: (error: string) => void;
}

// Context creation
const TabManagerContext = createContext<TabManagerContextType | null>(null);

// Provider props
interface TabManagerProviderProps {
    children: ReactNode;
    tab: ITab;
    productsResource?: string;
    enableInfiniteScroll?: boolean;
    showPrice?: boolean;
    // Field configuration
    productsField?: string;
    method?: 'create' | 'edit' | 'view' | 'list'; // view is added for fallback compatibility
}

// Custom hook for window/document infinite scrolling
const useWindowInfiniteScroll = (
    enabled: boolean,
    hasMoreResults: boolean,
    isLoading: boolean,
    onLoadMore: () => void,
    triggerElementRef?: React.RefObject<HTMLElement>
) => {
    //const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const scrollTimeoutRef = useRef<number | null>(null);
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
export const TabManagerProvider: React.FC<TabManagerProviderProps> = ({
    children,
    tab,
    productsResource = "ecommerce/product",
    enableInfiniteScroll = false,
    showPrice = false,
    productsField = "products",
    method = 'edit'
}) => {
    const translate = useTranslate();
    
    // 🐛 DEBUG: Track mounting and key props changes
    const mountCountRef = useRef(0);
    useEffect(() => {
        mountCountRef.current += 1;
        console.log(`🔵 [ISSUE01] [TabManagerProvider] MOUNTED (count: ${mountCountRef.current})`, {
            tabId: tab?.id,
            method,
            productsResource,
            enableInfiniteScroll,
            timestamp: new Date().toISOString()
        });
        return () => {
            console.log(`🔴 [ISSUE01] [TabManagerProvider] UNMOUNTING (count: ${mountCountRef.current})`, {
                tabId: tab?.id,
                method
            });
        };
    }, []);
    
    // 🐛 DEBUG: Track tab changes
    useEffect(() => {
        console.log(`🟡 [ISSUE01] [TabManagerProvider] Tab changed`, {
            tabId: tab?.id,
            hasOrder: !!tab?.order,
            orderItemsCount: tab?.order?.items?.length || 0,
            method
        });
    }, [tab?.id, method]);
    
    // Get form context and field array hooks internally
    const { control, setValue, getValues } = useFormContext();
    const { append } = useFieldArray({
        control,
        name: productsField
    });

    const formProducts = useWatch({
        control,
        name: productsField
    }) || [];
    
    // Product selection/catalog state
    const [filter, setFilter] = useState("");
    const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedModifiers, setSelectedModifiers] = useState<any[]>([]);
    const [displayCount, setDisplayCount] = useState(PAGINATION_CONFIG.INITIAL_DISPLAY);
    
    // Order management state
    const [orderProducts, setOrderProducts] = useState<ProductItem[]>([]);
    const [totalAmount, setTotalAmount] = useState(0);
    
    // Pagination mode state
    const [paginationMode, setPaginationMode] = useState<PaginationMode>(
        enableInfiniteScroll ? PaginationMode.INFINITE_SCROLL : PaginationMode.PAGINATION
    );
    const [currentDisplayPage, setCurrentDisplayPage] = useState(1);
    const [settingsOpen, setSettingsOpen] = useState(false);
    
    // Voice-related state
    const [isProcessingVoiceActions, setIsProcessingVoiceActions] = useState(false);
    
    // Refs
    const productsGridRef = useRef<HTMLDivElement>(null);
    const isInitializingRef = useRef(false);
    const isUpdatingFormRef = useRef(false);
    
    // Determine search mode
    const shouldUseServerSearch = filter.length >= SEARCH_CONFIG.SERVER_SEARCH_MIN_LENGTH;
    const serverSearchQuery = shouldUseServerSearch ? filter : "";
    
    // Calculate effective infinite scroll mode based on pagination mode
    const effectiveInfiniteScroll = paginationMode === PaginationMode.INFINITE_SCROLL;
    
    // Use the enhanced caching hook for products catalog
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
        PAGINATION_CONFIG.PER_PAGE,
        effectiveInfiniteScroll,
        tab?.id
    );
    
    // Tab caching
    const { cacheTab } = useTabCache();
    
    // Utility function for showing messages
    const showMessage = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
        toast[type](<>{message}</>, {
            position: 'top-center',
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: false,
            draggable: false,
        });
    }, []);
    
    // Initialize order products only from tab data
    useEffect(() => {
        console.log(`🔷 [ISSUE01] [TabManagerProvider] Initialize effect triggered`, {
            isInitializing: isInitializingRef.current,
            hasOrderItems: !!tab?.order?.items,
            orderItemsCount: tab?.order?.items?.length || 0,
            currentOrderProductsCount: orderProducts.length,
            tabId: tab?.id,
            method
        });
        
        const shouldInitialize = !isInitializingRef.current && 
                           tab?.order?.items && 
                           tab.order.items.length > 0 && 
                           orderProducts.length === 0;

        if (shouldInitialize) {
            console.log(`✅ [ISSUE01] [TabManagerProvider] Will initialize order products from tab`);
            isInitializingRef.current = true;
            const initialProducts: ProductItem[] = tab.order.items.map(item => {
                // Process modifiers to include all required fields
                const processedModifiers = (item.modifiers?.map(mod => {
                    // Find the corresponding modifier group and option
                    const group = item.product?.modifier_groups?.find(g => 
                        g.options.some(opt => opt.id === mod.modifier_option_id)
                    );
                    const option = group?.options?.find(opt => opt.id === mod.modifier_option_id);

                    return {
                        id: mod.id,
                        modifier_option_id: mod.modifier_option_id,
                        modifier_group_id: group?.id,
                        price_adjustment: mod.price_adjustment,
                        modifier_option: {
                            id: mod.modifier_option_id,
                            name: mod.modifier_option.name,
                            price_adjustment: mod.price_adjustment,
                            modifierGroup: {
                                id: group?.id,
                                name: group?.name,
                                type: group?.type
                            }
                        }
                    };
                }) || []).flat(); // <-- Ensure flat array

                return {
                    id: item.id,
                    order_id: item.order_id || tab.order_id,
                    product_id: item.product_id,
                    quantity: item.quantity || 1,
                    unit_price: String(item.unit_price || "0"),
                    product: item.product,
                    line_id: item.line_id || `line_${item.id}_${Date.now()}`,
                    note: item.note || "",
                    modifiers: processedModifiers
                };
            });
            
            console.log('🔄 Initializing order products from tab:', initialProducts);
            setOrderProducts(initialProducts);
            calculateOrderTotal(initialProducts);
        }
    }, [tab?.id]); // Only depend on tab.id to run once when tab changes
    
    // Sync orderProducts with form when they change (but not during initialization)
    useEffect(() => {
        if (!isInitializingRef.current && orderProducts.length >= 0) {
            isUpdatingFormRef.current = true;
            setValue("products", orderProducts);
            console.log('📝 Synced order products to form:', orderProducts);
            // Reset the flag after a brief delay to allow form processing
            setTimeout(() => {
                isUpdatingFormRef.current = false;
            }, 10);
        }
    }, [orderProducts]);
    
    // Calculate order total
    const calculateOrderTotal = useCallback((products?: ProductItem[]) => {
        const productsToCalculate = products || orderProducts;
        
        const total = productsToCalculate.reduce((sum, item) => {
            const basePrice = parseFloat(item.unit_price) || 0;
            const modifierAdjustments = (item.modifiers || []).reduce((modSum, modifier) => {
                return modSum + (parseFloat(modifier.price_adjustment) || 0);
            }, 0);
            
            const itemTotal = (basePrice + modifierAdjustments) * item.quantity;
            return sum + itemTotal;
        }, 0);
        
        setTotalAmount(total);
        return total;
    }, [orderProducts]);
    
    // Update order products
    const updateOrderProducts = useCallback((products: ProductItem[], formValues?: any) => {
        const productsWithFlatModifiers = products.map(p => ({
            ...p,
            modifiers: Array.isArray(p.modifiers) ? p.modifiers.flat() : p.modifiers
        }));
        console.log('🔄 Updating order products:', productsWithFlatModifiers);
        isUpdatingFormRef.current = true;
        
        setOrderProducts(currentProducts => {
            console.log('🔄 Previous products count:', currentProducts.length);
            console.log('🔄 New products count:', productsWithFlatModifiers.length);
            
            calculateOrderTotal(productsWithFlatModifiers);
            setValue("products", productsWithFlatModifiers);
            
            if (formValues) {
                Object.entries(formValues).forEach(([key, value]) => {
                    setValue(key, value);
                });
            }
            
            return productsWithFlatModifiers;
        });
        
        // Reset the flag after a brief delay
        setTimeout(() => {
            isUpdatingFormRef.current = false;
        }, 10);
    }, [setValue, calculateOrderTotal]);
    
    // Handle order item quantity change
    const handleOrderQuantityChange = useCallback((product: ProductItem, quantity: number) => {
      
        const updatedProducts = orderProducts.map(item =>
            item.line_id === product.line_id ? { ...item, quantity: Math.max(0, quantity) } : item
        ).filter(item => item.quantity > 0); 

        updateOrderProducts(updatedProducts);
       
        //showMessage(translate('tab.order.quantity_updated'), 'success');
    }, [orderProducts, updateOrderProducts, showMessage, translate]);
    
    // Handle order item note change
    const handleOrderNoteChange = useCallback((product: ProductItem, note: string) => {
       
        const updatedProducts = orderProducts.map(item =>
            item.line_id === product.line_id ? { ...item, note } : item
        );
        
        updateOrderProducts(updatedProducts);
    }, [orderProducts, updateOrderProducts]);
    
    // Handle order item modifier change
    const handleOrderModifierChange = useCallback((product: ProductItem, modifiers: any[]) => {
        const updatedProducts = orderProducts.map(item =>
            item.line_id === product.line_id ? { ...item, modifiers } : item
        );
        
        updateOrderProducts(updatedProducts);
        //showMessage(translate('tab.order.modifiers_updated'), 'success');
    }, [orderProducts, updateOrderProducts, showMessage, translate]);
    
    // Remove order product
    const removeOrderProduct = useCallback((product: ProductItem) => {
        const updatedProducts = orderProducts.filter(item => item.line_id !== product.line_id);
       
        updateOrderProducts(updatedProducts);
     
        //showMessage(translate('tab.products.message.removed'), 'success');
    }, [orderProducts, updateOrderProducts, showMessage, translate]);
    
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
    
    // Final products list for catalog
    const productsList = shouldUseServerSearch ? serverProductsList : localFilteredProducts;
    const isUsingLocalSearch = !shouldUseServerSearch && filter.length > 0;
    
    // Reset display page when filter changes or pagination mode changes
    useEffect(() => {
        setCurrentDisplayPage(1);
    }, [filter, paginationMode]);
    
    // Reset display count when pagination mode changes
    useEffect(() => {
        if (paginationMode !== PaginationMode.INFINITE_SCROLL) {
            setDisplayCount(PAGINATION_CONFIG.INITIAL_DISPLAY);
        }
    }, [paginationMode]);
    
    // Display products list based on pagination mode
    const displayProductsList = useMemo(() => {
        const products = productsList;
        
        if (paginationMode === PaginationMode.INFINITE_SCROLL) {
            return products || [];
        } else if (paginationMode === PaginationMode.PAGINATION) {
            // Page-based navigation
            const startIndex = (currentDisplayPage - 1) * PAGINATION_CONFIG.INITIAL_DISPLAY;
            const endIndex = startIndex + PAGINATION_CONFIG.INITIAL_DISPLAY;
            return products && Array.isArray(products) 
                ? products.slice(startIndex, endIndex) 
                : [];
        } else {
            // Load more mode
            return products && Array.isArray(products) 
                ? products.slice(0, displayCount) 
                : [];
        }
    }, [productsList, paginationMode, currentDisplayPage, displayCount]);

    // Results calculation
    const totalResults = useMemo(() => {
        return productsList?.length || 0;
    }, [productsList]);

    const hasMoreResults = useMemo(() => {
        if (paginationMode === PaginationMode.INFINITE_SCROLL) {
            return hasMorePages;
        } else if (paginationMode === PaginationMode.PAGINATION) {
            return false; // Page navigation doesn't use "hasMore" concept
        } else {
            return totalResults > displayCount;
        }
    }, [paginationMode, hasMorePages, totalResults, displayCount]);

    const remainingCount = useMemo(() => {
        if (paginationMode === PaginationMode.INFINITE_SCROLL) {
            return totalItems - displayProductsList.length;
        } else if (paginationMode === PaginationMode.PAGINATION) {
            return 0; // Not applicable for pagination
        } else {
            return totalResults - displayCount;
        }
    }, [paginationMode, totalItems, displayProductsList.length, totalResults, displayCount]);
    
    // Calculate total display pages for pagination mode
    const totalDisplayPages = useMemo(() => {
        return Math.ceil(totalResults / PAGINATION_CONFIG.INITIAL_DISPLAY);
    }, [totalResults]);
    
    // Handle page change for pagination mode
    const handlePageChange = useCallback((page: number) => {
        setCurrentDisplayPage(page);
        if (productsGridRef.current) {
            productsGridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, []);
    
    // Handle load more (for button mode)
    const handleLoadMoreButton = useCallback(() => {
        if (paginationMode === PaginationMode.INFINITE_SCROLL) {
            loadMore();
        } else if (paginationMode === PaginationMode.LOAD_MORE) {
            setDisplayCount(prev => Math.min(prev + PAGINATION_CONFIG.LOAD_MORE_INCREMENT, totalResults));
        }
        // Pagination mode doesn't use load more
    }, [paginationMode, loadMore, totalResults]);
    
    // Handle show less (only for button mode)
    const handleShowLess = useCallback(() => {
        setDisplayCount(PAGINATION_CONFIG.INITIAL_DISPLAY);
        if (productsGridRef.current) {
            productsGridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, []);

    // Product interaction handlers (for adding to order)
    const handleProductClick = useCallback((product: Product) => {
        if (product.modifier_groups && product.modifier_groups.length > 0) {
            setSelectedProduct(product);
            // Use flatMap to avoid nested arrays
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

    // Add product to order
    const addProductToOrder = useCallback((product: Product, modifiers: any[], additionalProps: any = {}) => {
        try {
            const price = product.prices?.find(p => p.pricelist_id === tab?.order?.pricelist_id)?.price;
            
            if (!price) {
                console.warn(`No price found for product ${product.id} with pricelist ${tab?.order?.pricelist_id}`);
                console.log("Available prices:", product.prices);
            }
            
            const newProductItem: ProductItem = {
                id: undefined,
                order_id: tab?.order_id || null,
                product_id: product.id,
                quantity: additionalProps.quantity || 1,
                unit_price: String(price || product.prices?.[0]?.price || "0"),
                product: product,
                line_id: `line_${Date.now()}_${Math.random()}`,
                note: additionalProps.note || "",
                modifiers: modifiers,
                // Add any additional properties
                ...additionalProps
            };

            console.log('➕ Adding product to order:', newProductItem);
            
            // Use functional update to ensure we get the latest orderProducts state
            setOrderProducts(currentProducts => {
                const updatedProducts = [...currentProducts, newProductItem];
                console.log('🔄 Current products before update:', currentProducts.length);
                console.log('🔄 Updated products after adding:', updatedProducts.length);
                
                // Update form and calculate total
                calculateOrderTotal(updatedProducts);
                setValue("products", updatedProducts);
                
                return updatedProducts;
            });
            
            showMessage(translate('tab.products.message.added'), 'success');

        } catch (error) {
            console.error("Error adding product:", error);
            showMessage(translate('tab.products.message.error'), 'error');
        }
    }, [tab, setValue, calculateOrderTotal, showMessage, translate]);

    /**
     * Try to resolve raw modifier strings (e.g., ["con arroz"]) to actual product modifier options
     * This is a fallback when the backend AI enhancement doesn't find matches
     * Returns both resolved modifiers and unresolved ones (to be added as notes)
     */
    const resolveRawModifiersToProductWithUnresolved = (rawModifiers: string[], product: any): { resolved: any[], unresolved: string[] } => {
        if (!rawModifiers?.length || !product) return { resolved: [], unresolved: rawModifiers || [] };
        
        const productData = product.product_data || product;
        const modifierGroups = productData?.modifier_groups || [];
        
        if (!modifierGroups.length) {
            console.log('⚠️ Product has no modifier_groups:', product.name);
            // Return all modifiers as unresolved since product has no modifier groups
            return { resolved: [], unresolved: rawModifiers };
        }
        
        const resolvedModifiers: any[] = [];
        const unresolvedModifiers: string[] = [];
        
        for (const rawMod of rawModifiers) {
            const normalizedRaw = rawMod.toLowerCase().trim();
            console.log(`🔍 Trying to match raw modifier: "${rawMod}"`);
            
            let found = false;
            
            // Search through all modifier groups and options
            for (const group of modifierGroups) {
                if (!group.options?.length) continue;
                
                for (const option of group.options) {
                    const optionName = (option.name || '').toLowerCase();
                    
                    // Check if the raw modifier matches the option name (fuzzy match)
                    if (optionName.includes(normalizedRaw) || normalizedRaw.includes(optionName) ||
                        // Also check without common prefixes like "con ", "sin ", "extra "
                        optionName.includes(normalizedRaw.replace(/^(con|sin|extra)\s+/i, '')) ||
                        normalizedRaw.replace(/^(con|sin|extra)\s+/i, '').includes(optionName)) {
                        
                        console.log(`✅ Matched "${rawMod}" to option:`, option.name, 'in group:', group.name);
                        
                        resolvedModifiers.push({
                            modifier_option_id: option.id,
                            modifier_group_id: group.id,
                            price_adjustment: option.price_adjustment || 0,
                            modifier_option: {
                                id: option.id,
                                name: option.name,
                                price_adjustment: option.price_adjustment || 0,
                                modifierGroup: {
                                    id: group.id,
                                    name: group.name,
                                    type: group.type
                                }
                            }
                        });
                        found = true;
                        break; // Found a match for this raw modifier
                    }
                }
                if (found) break;
            }
            
            // If no match found, add to unresolved list
            if (!found) {
                console.log(`❌ No match found for modifier: "${rawMod}" - will be added as note`);
                unresolvedModifiers.push(rawMod);
            }
        }
        
        console.log(`🎯 Resolved ${resolvedModifiers.length} modifiers, ${unresolvedModifiers.length} unresolved from ${rawModifiers.length} raw modifiers`);
        return { resolved: resolvedModifiers, unresolved: unresolvedModifiers };
    };

    // Handle voice actions detected by VoiceTabAgent
    const handleVoiceActions = useCallback((actions: VoiceAction[]) => {
        if (!actions || actions.length === 0) {
            console.log('No voice actions to process');
            return;
        }
        
        console.log('🎤 Processing voice actions:', actions);
        setIsProcessingVoiceActions(true);
        
        try {
            // Process each action
            actions.forEach(action => {
                console.log('🎤 Processing action:', {
                    action: action.action,
                    product_names: action.product_names,
                    quantity: action.quantity,
                    modifiers: action.modifiers,  // Raw modifiers from action extraction (e.g., ["con arroz"])
                    suggested_modifiers: action.suggested_modifiers,  // AI-resolved modifiers with IDs
                    resolved_products_count: action.resolved_products?.length
                });
                
                // Handle add product action
                if (action.action === 'add' && action.resolved_products?.length) {
                    action.resolved_products.forEach(product => {
                        // Add each product with its quantity and modifiers
                        const quantity = action.quantity || 1;
                        
                        // Get modifiers - prefer suggested_modifiers (with IDs), fallback to raw modifiers
                        let modifiers = action.suggested_modifiers || [];
                        let unresolvedModifiers: string[] = [];
                        
                        // Enrich AI-suggested modifiers with price_adjustment from product's modifier_groups
                        if (modifiers.length > 0) {
                            const productData = product.product_data || product;
                            const modifierGroups = productData?.modifier_groups || [];
                            
                            modifiers = modifiers.map(mod => {
                                // If already has price_adjustment, keep it
                                if (mod.price_adjustment !== undefined) {
                                    return mod;
                                }
                                
                                // Find the modifier option in product's modifier_groups to get price_adjustment
                                for (const group of modifierGroups) {
                                    if (group.id === mod.modifier_group_id) {
                                        const option = group.options?.find(opt => opt.id === mod.modifier_option_id);
                                        if (option) {
                                            console.log(`💰 Enriching modifier ${mod.modifier_option_name || mod.modifier_option_id} with price_adjustment: ${option.price_adjustment}`);
                                            return {
                                                ...mod,
                                                price_adjustment: option.price_adjustment || '0.00',
                                                modifier_option: mod.modifier_option || {
                                                    id: option.id,
                                                    name: option.name,
                                                    price_adjustment: option.price_adjustment || '0.00',
                                                    modifierGroup: {
                                                        id: group.id,
                                                        name: group.name,
                                                        type: group.type
                                                    }
                                                }
                                            };
                                        }
                                    }
                                }
                                
                                // Fallback: set price_adjustment to 0 if not found
                                console.log(`⚠️ Could not find price_adjustment for modifier ${mod.modifier_option_name || mod.modifier_option_id}, defaulting to 0`);
                                return {
                                    ...mod,
                                    price_adjustment: mod.price_adjustment || '0.00'
                                };
                            });
                        }
                        
                        // If no suggested_modifiers but we have raw modifiers, try to resolve them
                        if (modifiers.length === 0 && action.modifiers?.length > 0) {
                            console.log('🔍 No suggested_modifiers, trying to resolve raw modifiers:', action.modifiers);
                            const resolution = resolveRawModifiersToProductWithUnresolved(action.modifiers, product);
                            modifiers = resolution.resolved;
                            unresolvedModifiers = resolution.unresolved;
                            
                            if (unresolvedModifiers.length > 0) {
                                console.log('⚠️ Unresolved modifiers will be added as notes:', unresolvedModifiers);
                            }
                        }
                        
                        console.log('📦 Product modifiers to apply:', modifiers);
                        
                        // Combine action note with unresolved modifiers
                        let note = action.note || '';
                        if (unresolvedModifiers.length > 0) {
                            const unresolvedText = unresolvedModifiers.join(', ');
                            note = note ? `${note} | ${unresolvedText}` : unresolvedText;
                            console.log('📝 Final note with unresolved modifiers:', note);
                        }
                        
                        // Make sure to include the auto_added flag
                        const isAutoAdded = !!action.auto_added;
                        
                        // Create a complete product object with price information
                        const enhancedProduct = {
                            ...product,
                            // Make sure price information is correctly passed
                            prices: product.prices || (product.product_data?.prices || []).map(price => ({
                                id: price.id,
                                price: price.price,
                                product_id: price.product_id,
                                pricelist_id: price.pricelist_id
                            })),
                            // Add any missing fields that might be in product_data
                            ...(product.product_data || {})
                        };
                        
                        console.log('Enhanced product from voice:', enhancedProduct);
                        
                        // Use the product multiple times based on quantity or add with quantity
                        addProductToOrder(enhancedProduct, modifiers, {
                            quantity: quantity,
                            note: note,
                            auto_added: isAutoAdded
                        });
                        
                        showMessage(translate('tab.voice.product_added', {
                            product: product.name,
                            quantity
                        }), 'success');
                    });
                }
                
                // Handle remove product action
                else if (action.action === 'remove' && action.resolved_products?.length) {
                    // Find product in current order
                    const productToRemove = orderProducts.find(item => 
                        action.resolved_products.some(p => p.id === item.product_id)
                    );
                    
                    if (productToRemove) {
                        removeOrderProduct(productToRemove);
                        showMessage(translate('tab.voice.product_removed', {
                            product: productToRemove.product.name
                        }), 'success');
                    }
                }
                
                // Handle change quantity action
                else if (action.action === 'change_quantity' && action.resolved_products?.length) {
                    // Find product in current order
                    const productToUpdate = orderProducts.find(item => 
                        action.resolved_products.some(p => p.id === item.product_id)
                    );
                    
                    if (productToUpdate && action.quantity) {
                        handleOrderQuantityChange(productToUpdate, action.quantity);
                        showMessage(translate('tab.voice.quantity_changed', {
                            product: productToUpdate.product.name,
                            quantity: action.quantity
                        }), 'success');
                    }
                }
                
                // Handle add note action
                else if (action.action === 'add_note' && action.resolved_products?.length) {
                    // Find product in current order
                    const productToUpdate = orderProducts.find(item => 
                        action.resolved_products.some(p => p.id === item.product_id)
                    );
                    
                    if (productToUpdate && action.note) {
                        handleOrderNoteChange(productToUpdate, action.note);
                        showMessage(translate('tab.voice.note_added', {
                            product: productToUpdate.product.name
                        }), 'success');
                    }
                }
            });
        } catch (error) {
            console.error('Error processing voice actions:', error);
            showMessage(translate('tab.voice.processing_error'), 'error');
        } finally {
            setIsProcessingVoiceActions(false);
        }
    }, [orderProducts, addProductToOrder, removeOrderProduct, handleOrderQuantityChange, handleOrderNoteChange, translate, showMessage]);
    
    // Handle voice errors
    const handleVoiceError = useCallback((error: string) => {
        console.error('Voice agent error:', error);
        showMessage(translate('tab.voice.error', { error }), 'error');
    }, [translate, showMessage]);
    
    // Setup window infinite scroll (only for infinite scroll mode)
    useWindowInfiniteScroll(
        paginationMode === PaginationMode.INFINITE_SCROLL && !isLoading,
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
    const contextValue: TabManagerContextType = {
        // Products data (catalog)
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
        
        // Product interactions (for adding to order)
        handleProductClick,
        addProductToOrder,
        
        // Modal state (for modifiers)
        dialogOpen,
        setDialogOpen,
        selectedProduct,
        setSelectedProduct,
        selectedModifiers,
        setSelectedModifiers,
        handleModifierChange,
        handleDialogConfirm,
        handleDialogCancel,
        
        // Order management (current order items)
        orderProducts,
        setOrderProducts,
        totalAmount,
        updateOrderProducts,
        handleOrderQuantityChange,
        handleOrderNoteChange,
        handleOrderModifierChange,
        removeOrderProduct,
        calculateOrderTotal,
        
        // Configuration
        enableInfiniteScroll: paginationMode === PaginationMode.INFINITE_SCROLL,
        showPrice,
        productsResource,
        
        // Pagination info for infinite scroll
        currentPage,
        totalPages,
        totalItems,
        hasMorePages,
        
        // Refs
        productsGridRef,
        
        // Utils
        showMessage,

        // Pagination modes
        paginationMode,
        setPaginationMode,
        
        // Page navigation (for pagination mode)
        currentDisplayPage,
        setCurrentDisplayPage,
        totalDisplayPages,
        handlePageChange,
        
        // Settings popup
        settingsOpen,
        setSettingsOpen,

        // Voice integration
        isProcessingVoiceActions,
        handleVoiceActions,
        handleVoiceError,
    };

    return (
        <TabManagerContext.Provider value={contextValue}>
            {children}
        </TabManagerContext.Provider>
    );
};

// Custom hook to use the context
export const useTabManager = (configOverrides?: {
    searchConfig?: Partial<typeof SEARCH_CONFIG>;
    paginationConfig?: Partial<typeof PAGINATION_CONFIG>;
    infiniteScrollConfig?: Partial<typeof INFINITE_SCROLL_CONFIG>;
}): TabManagerContextType => {
    const context = useContext(TabManagerContext);
    if (!context) {
        throw new Error('useTabManager must be used within a TabManagerProvider');
    }
    
    // Apply configuration overrides if provided
    if (configOverrides) {
        // These values will be used by the context methods
        if (configOverrides.searchConfig) {
            Object.assign(SEARCH_CONFIG, configOverrides.searchConfig);
        }
        if (configOverrides.paginationConfig) {
            Object.assign(PAGINATION_CONFIG, configOverrides.paginationConfig);
        }
        if (configOverrides.infiniteScrollConfig) {
            Object.assign(INFINITE_SCROLL_CONFIG, configOverrides.infiniteScrollConfig);
        }
    }
    
    return context;
};

/**
 * Optional version of useTabManager that returns null instead of throwing
 * when not inside a TabManagerProvider. Useful for components that need to
 * render in Show mode where the provider may not be available.
 */
export const useTabManagerOptional = (): TabManagerContextType | null => {
    return useContext(TabManagerContext);
};

/**
 * Check if we're inside a TabManagerProvider
 */
export const useIsInTabManager = (): boolean => {
    const context = useContext(TabManagerContext);
    return context !== null;
};


export default TabManagerContext;
