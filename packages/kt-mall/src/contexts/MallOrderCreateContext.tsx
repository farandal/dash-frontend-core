import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, PropsWithChildren, useRef } from 'react';
import { useDataProvider, useNotify, useTranslate } from 'react-admin';
import { useFormContext } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useAxios } from 'dash-axios-hook';
import { dashStorage } from 'dash-utils';
import { DASH_REDUX_ACTIONS, IDASHAppState } from 'dash-admin-state';
import { formatCurrency, ICurrency } from 'kt-ecommerce';
import { IStore } from '../interfaces/IStore';

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
 * Convert mall currency to kt-ecommerce ICurrency format
 */
const toKtCurrency = (currency: IMallCurrency | undefined): ICurrency | undefined => {
    if (!currency) return undefined;
    return {
        id: currency.id || 0,
        code: currency.code,
        symbol: currency.symbol,
        decimals: currency.decimals ?? 0, // Default to 0 decimals if not provided
    };
};

/**
 * Product item format for API submission (matching kt-tabs ProductItem interface)
 */
export interface IMallProductItem {
    id?: number;
    order_id?: number | null;
    product_id: number;
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
    id: number;
    tenant_id: number;
    sku: string;
    name: string;
    description: string;
    category_id: number;
    brand_id: number;
    is_pack: boolean;
    is_enabled: boolean;
    featured: boolean;
    mall_listed: boolean;
    infinite_stock: boolean;
    prices: Array<{
        id: number;
        price: string;
        product_id: number;
        pricelist_id: number;
        pricelist: {
            id: number;
            tenant_id: number;
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
        tenant_id: number;
        images: Array<{
            id: number;
            url: string;
        }>;
        primary_image_url: string;
        images_count: number;
        has_images: boolean;
    };
    modifier_groups?: Array<{
        id: number;
        tenant_id: number;
        name: string;
        type: string;
        is_required: boolean;
        min_selections: number;
        max_selections: number | null;
        options?: Array<{
            id: number;
            name: string;
            price_adjustment: string;
        }>;
    }>;
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
    
    // Products
    products: IMallProduct[];
    allProducts: IMallProduct[];
    featuredProducts: IMallProduct[];
    isLoadingProducts: boolean;
    currentPage: number;
    totalPages: number;
    setCurrentPage: (page: number) => void;
    ITEMS_PER_PAGE: number;
    
    // Search
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    
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
    
    // Utils (V1-compatible pricing)
    formatPrice: (amount: number | string | undefined | null, currency?: IMallCurrency) => string;
    getCurrency: () => IMallCurrency | null;
    getProductPrice: (product: IMallProduct) => number;
    getProductCurrency: (product: IMallProduct) => IMallCurrency | undefined;
    
    // Cache info (V1 pattern)
    isShowingCached: boolean;
    cacheAge: number | null;
    clearProductsCache: () => void;
    clearStoresCache: () => void;
    clearAllCaches: () => void;
}

const MallOrderCreateContext = createContext<MallOrderCreateContextValue | null>(null);

const ITEMS_PER_PAGE = 6;
const STORES_PATH = 'public/mall/stores';
const PRODUCTS_PATH = 'public/mall/products';

// Cache configuration (matching V1 useProductsCache)
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const PRODUCTS_CACHE_KEY = 'mall.products.cache';
const STORES_CACHE_KEY = 'mall.stores.cache';

// Cached data interface
interface CachedProductsData {
    products: IMallProduct[];
    lastFetch: number;
    searchHistory: string[];
    filters: any;
}

interface CachedStoresData {
    stores: IStore[];
    lastFetch: number;
}

interface MallOrderCreateProviderProps extends PropsWithChildren {
    storesPath?: string;
    productsPath?: string;
    productsField?: string;
}

export const MallOrderCreateProvider: React.FC<MallOrderCreateProviderProps> = ({
    children,
    storesPath = STORES_PATH,
    productsPath = PRODUCTS_PATH,
    productsField = 'products',
}) => {
    const dataProvider = useDataProvider();
    const dispatch = useDispatch();
    const axios = useAxios();
    const notify = useNotify();
    const translate = useTranslate();
    
    // Redux cached data selectors (V1 caching pattern)
    const cachedProducts = useSelector((state: IDASHAppState<any, any, any>) =>
        state.componentData?.[PRODUCTS_CACHE_KEY] as CachedProductsData | undefined
    );
    const cachedStores = useSelector((state: IDASHAppState<any, any, any>) =>
        state.componentData?.[STORES_CACHE_KEY] as CachedStoresData | undefined
    );
    
    // Check if caches are valid
    const isProductsCacheValid = cachedProducts?.lastFetch && 
        (Date.now() - cachedProducts.lastFetch) < CACHE_DURATION;
    const isStoresCacheValid = cachedStores?.lastFetch && 
        (Date.now() - cachedStores.lastFetch) < CACHE_DURATION;
    
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
    
    // Store state
    const [stores, setStores] = useState<IStore[]>([]);
    const [isLoadingStores, setIsLoadingStores] = useState(true);
    const [selectedStore, setSelectedStore] = useState<IStore | null>(null);
    
    // Products state
    const [allProducts, setAllProducts] = useState<IMallProduct[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    
    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    
    // Pagination mode state
    const [paginationMode, setPaginationMode] = useState<PaginationMode>('infinite');
    
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
    
    // Load stores on mount - with caching
    useEffect(() => {
        const loadStores = async () => {
            // Check cache first
            if (isStoresCacheValid && cachedStores?.stores?.length) {
                console.log('📦 Using cached stores:', cachedStores.stores.length);
                setStores(cachedStores.stores);
                setIsLoadingStores(false);
                return;
            }
            
            try {
                const response = await dataProvider.getList(storesPath, {
                    pagination: { page: 1, perPage: 100 },
                    sort: { field: 'name', order: 'ASC' },
                    filter: {},
                });
                const storesData = response.data as IStore[];
                setStores(storesData);
                
                // Update cache
                dispatch(DASH_REDUX_ACTIONS.setComponentData(STORES_CACHE_KEY, {
                    stores: storesData,
                    lastFetch: Date.now(),
                } as CachedStoresData));
                console.log('💾 Stores cached:', storesData.length);
            } catch (error) {
                console.error('Error loading stores:', error);
                notify('Error loading stores', { type: 'error' });
            } finally {
                setIsLoadingStores(false);
            }
        };
        
        loadStores();
    }, [dataProvider, storesPath, notify, isStoresCacheValid, cachedStores, dispatch]);
    
    // Load products when store selection changes - with caching (V1 pattern)
    useEffect(() => {
        const loadProducts = async () => {
            const filter: any = {
                is_enabled: true,
                mall_listed: true,
                load_gallery: true,
                load_modifier_groups: true,
                load_prices: true,
            };
            
            if (selectedStore) {
                filter.tenant_ids = [selectedStore.id];
            }
            
            // Create a cache key based on filter
            const filterKey = JSON.stringify(filter);
            
            // Check if we have valid cached data for this filter
            const isSameFilter = cachedProducts?.filters && 
                JSON.stringify(cachedProducts.filters) === filterKey;
            
            if (isProductsCacheValid && cachedProducts?.products?.length && isSameFilter) {
                console.log('📦 Using cached products:', cachedProducts.products.length);
                setAllProducts(cachedProducts.products);
                setIsLoadingProducts(false);
                return;
            }
            
            setIsLoadingProducts(true);
            setCurrentPage(1);
            
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
                });
                
                setAllProducts(sortedProducts as IMallProduct[]);
                
                // Update cache (V1 pattern)
                dispatch(DASH_REDUX_ACTIONS.setComponentData(PRODUCTS_CACHE_KEY, {
                    products: sortedProducts,
                    lastFetch: Date.now(),
                    searchHistory: cachedProducts?.searchHistory || [],
                    filters: filter,
                } as CachedProductsData));
                console.log('💾 Products cached:', sortedProducts.length);
            } catch (error) {
                console.error('Error loading products:', error);
                notify('Error loading products', { type: 'error' });
            } finally {
                setIsLoadingProducts(false);
            }
        };
        
        loadProducts();
    }, [dataProvider, productsPath, selectedStore, notify, isProductsCacheValid, cachedProducts, dispatch]);
    
    // Filter products by search query
    const filteredProducts = useMemo(() => {
        if (!searchQuery.trim()) return allProducts;
        
        const query = searchQuery.toLowerCase();
        return allProducts.filter(product => 
            product.name.toLowerCase().includes(query) ||
            product.description?.toLowerCase().includes(query) ||
            product.sku?.toLowerCase().includes(query)
        );
    }, [allProducts, searchQuery]);
    
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
    
    // Format price using kt-ecommerce formatCurrency (V1 pattern)
    const formatPrice = useCallback((amount: number | string | undefined | null, currency?: IMallCurrency): string => {
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : (amount || 0);
        
        if (isNaN(numAmount)) {
            const fallbackCurrency = getCurrency();
            return `${fallbackCurrency?.symbol || '$'}0`;
        }
        
        // Use kt-ecommerce formatCurrency for V1-compatible formatting
        const currencyToUse = currency || getCurrency();
        return formatCurrency(numAmount, toKtCurrency(currencyToUse || undefined));
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
        notify(translate('mall.product_added'), { type: 'success' });
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
    
    // Request assistance
    const requestAssistance = useCallback(async () => {
        if (!selectedStore) {
            notify(translate('mall.select_store_first'), { type: 'warning' });
            return;
        }
        
        setIsAssistanceLoading(true);
        
        try {
            const orderData = dashStorage.getItem('orderData');
            const { name, tableNumber } = orderData ? JSON.parse(orderData) : { name: null, tableNumber: null };
            
            if (!name || !tableNumber) {
                window.dispatchEvent(new CustomEvent('enter-public-order-data', {
                    detail: {
                        onConfirm: () => requestAssistance()
                    }
                }));
                setIsAssistanceLoading(false);
                return;
            }
            
            const sessionHash = dashStorage.getItem('mall-session-hash');
            
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
            
            notify(data.message || translate('mall.assistance_requested'), { type: 'success' });
        } catch (error: any) {
            if (error?.status === 429) {
                notify(translate('mall.assistance_rate_limit'), { type: 'warning' });
            } else if (error?.status === 422) {
                window.dispatchEvent(new CustomEvent('enter-public-order-data', {
                    detail: {
                        onConfirm: () => requestAssistance()
                    }
                }));
            } else {
                notify(error?.message || translate('mall.assistance_error'), { type: 'error' });
            }
        } finally {
            setIsAssistanceLoading(false);
        }
    }, [selectedStore, storesPath, axios, notify, translate]);
    
    const contextValue: MallOrderCreateContextValue = {
        // Stores
        stores,
        isLoadingStores,
        selectedStore,
        setSelectedStore,
        
        // Products
        products,
        allProducts: filteredProducts,
        featuredProducts,
        isLoadingProducts,
        currentPage,
        totalPages,
        setCurrentPage,
        ITEMS_PER_PAGE,
        
        // Search
        searchQuery,
        setSearchQuery,
        
        // Pagination mode
        paginationMode,
        setPaginationMode,
        
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
        
        // Utils (V1-compatible pricing)
        formatPrice,
        getCurrency,
        getProductPrice,
        getProductCurrency,
        
        // Cache info (V1 pattern)
        isShowingCached: isProductsCacheValid && !isLoadingProducts,
        cacheAge: cachedProducts?.lastFetch ? Date.now() - cachedProducts.lastFetch : null,
        clearProductsCache: () => dispatch(DASH_REDUX_ACTIONS.setComponentData(PRODUCTS_CACHE_KEY, undefined)),
        clearStoresCache: () => dispatch(DASH_REDUX_ACTIONS.setComponentData(STORES_CACHE_KEY, undefined)),
        clearAllCaches: () => {
            dispatch(DASH_REDUX_ACTIONS.setComponentData(PRODUCTS_CACHE_KEY, undefined));
            dispatch(DASH_REDUX_ACTIONS.setComponentData(STORES_CACHE_KEY, undefined));
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
