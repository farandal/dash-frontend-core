import { Product } from "kt-ecommerce";
import { Typography, Box, TextField, Chip, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, InputAdornment, Grid } from "@mui/material";
import { Clear as ClearIcon, Search as SearchIcon } from "@mui/icons-material";
import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import ImagePlaceHolder from 'kt-utils/src/components/ImagePlaceHolder/ImagePlaceHolder';
import { toast } from 'react-toastify';
import { ITab } from "../interfaces/ITab";
import ProductModifiers from './ProductModifiers';
import { useProductsCache, useTabCache } from '../hooks/useProductsCache';
import { SaveButton, useNotify, useRedirect, useTranslate } from 'react-admin';
import useWindowSize from 'dash-admin/src/hooks/window/useWindowSize';
import { priceFormatter } from "dash-utils";

const placeholder = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="

// 🆕 Search configuration constants
const SEARCH_CONFIG = {
    SERVER_SEARCH_MIN_LENGTH: 3,
    LOCAL_SEARCH_ENABLED: true,
    DEBOUNCE_DELAY: 300,
};

// 🆕 Updated Grid configuration constants using MUI breakpoints
const GRID_COLUMNS_SM = 3;
const GRID_COLUMNS_MD = 4;
const GRID_COLUMNS_LG = 9;

const INITIAL_DISPLAY_RESULTS = 18;
const LOAD_MORE_INCREMENT = 18;

// 🆕 Backend pagination configuration
const BACKEND_PAGINATION_CONFIG = {
    PER_PAGE: 50,              // Items per API call
    INITIAL_DISPLAY: 18,       // Items shown initially on frontend
    LOAD_MORE_INCREMENT: 18,   // Items added per "load more" click
};

// 🆕 Infinite scroll configuration for window/document scroll
const INFINITE_SCROLL_CONFIG = {
    THRESHOLD: 500, // Pixels from bottom of page to trigger load
    DEBOUNCE_MS: 100, // Debounce scroll events
    PRELOAD_THRESHOLD: 10, // Load more pages when this many items remain
};

// 🆕 Updated Item size constants for MUI breakpoints
const ITEM_SIZE = {
    SM: {
        MIN_HEIGHT: 80,
        ASPECT_RATIO: '1',
        NAME_FONT_SIZE: '0.75rem',
        SKU_FONT_SIZE: '0.625rem',
        PRICE_FONT_SIZE: '0.625rem',
    },
    MD: {
        MIN_HEIGHT: 90,
        ASPECT_RATIO: '1',
        NAME_FONT_SIZE: '0.8125rem',
        SKU_FONT_SIZE: '0.6875rem',
        PRICE_FONT_SIZE: '0.6875rem',
    },
    LG: {
        MIN_HEIGHT: 100,
        ASPECT_RATIO: '1',
        NAME_FONT_SIZE: '0.875rem',
        SKU_FONT_SIZE: '0.75rem',
        PRICE_FONT_SIZE: '0.75rem',
    }
};

export interface IOrderProducts extends IDashAutoAdminCustomFieldComponent {
    productsResource?: string;
    useInfiniteScroll?: boolean;
    showPrice?: boolean;
}

// 🆕 Custom hook for window/document infinite scrolling
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

        // Get scroll position relative to document
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        // Alternative: Check if trigger element is near viewport bottom
        if (triggerElementRef?.current) {
            const triggerRect = triggerElementRef.current.getBoundingClientRect();
            const distanceFromViewportBottom = triggerRect.bottom - windowHeight;
            
            if (distanceFromViewportBottom <= INFINITE_SCROLL_CONFIG.THRESHOLD) {
                console.log('🔄 Infinite scroll triggered by element position, loading more...');
                onLoadMore();
                return;
            }
        }

        // Fallback: Check distance from document bottom
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

        // Listen to window scroll events
        window.addEventListener('scroll', debouncedHandleScroll, { passive: true });
        // Also listen to resize events in case content height changes
        window.addEventListener('resize', debouncedHandleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', debouncedHandleScroll);
            window.removeEventListener('resize', debouncedHandleScroll);
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, [enabled, debouncedHandleScroll]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, []);
};

const OrderProductsEdit: React.FC<IOrderProducts> = (props) => {

    const { 
        record, 
        method, 
        productsResource = null, 
        useInfiniteScroll: enableInfiniteScroll = false,
        showPrice = false
    } = props;
    
    const tab: ITab = record as ITab;
    const notify = useNotify();
    const redirect = useRedirect();
    const windowSize = useWindowSize();
    const translate = useTranslate();

    // 🆕 Ref for the products grid (used as trigger element for infinite scroll)
    const productsGridRef = useRef<HTMLDivElement>(null);

    const { control, setValue, getValues } = useFormContext();
    const { append } = useFieldArray({
        control,
        name: "products"
    });

    const products = useWatch({
        control,
        name: "products"
    });

    const [filter, setFilter] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedModifiers, setSelectedModifiers] = useState<any[]>([]);
    const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_RESULTS);
    
    // 🆕 Determine if we should use server search or local search
    const shouldUseServerSearch = filter.length >= SEARCH_CONFIG.SERVER_SEARCH_MIN_LENGTH;
    const serverSearchQuery = shouldUseServerSearch ? filter : "";
    
    // 🚀 Use the enhanced caching hook with infinite scroll support
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
    {}, // Filters, pending to implement
    serverSearchQuery, 
    productsResource,
    BACKEND_PAGINATION_CONFIG.PER_PAGE,
    enableInfiniteScroll,
    tab.id// tabId not available here, will use common throttle key
);
    
    // 🆕 Local search in cached results
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
    
    // 🆕 Final products list
    const productsList = shouldUseServerSearch ? serverProductsList : localFilteredProducts;
    const isUsingLocalSearch = !shouldUseServerSearch && filter.length > 0;
    
    // 🆕 Use tab caching
    const { cacheTab } = useTabCache();
    
    // 🆕 Reset display count when filter changes (only for non-infinite scroll)
    useEffect(() => {
        if (!enableInfiniteScroll) {
            setDisplayCount(INITIAL_DISPLAY_RESULTS);
        }
    }, [filter, enableInfiniteScroll]);
    
    // 🆕 Update the display logic for infinite scroll vs regular pagination
   // 🆕 Update the display logic for infinite scroll vs regular pagination
const displayProductsList = useMemo(() => {
    const products = productsList;
    
    if (enableInfiniteScroll) {
        // For infinite scroll, show all loaded products
        return products || [];
    } else {
        // For regular pagination, slice to display count from ALL available products
        return products && Array.isArray(products) 
            ? products.slice(0, displayCount) 
            : [];
    }
}, [productsList, enableInfiniteScroll, displayCount]);

// 🆕 Update the results calculation
const totalResults = useMemo(() => {
    if (enableInfiniteScroll) {
        // For infinite scroll, use the total from API
        return shouldUseServerSearch ? totalItems : (serverProductsList?.length || 0);
    } else {
        // For regular pagination, use ALL products length (not just first page)
        return productsList?.length || 0;
    }
}, [enableInfiniteScroll, shouldUseServerSearch, totalItems, serverProductsList?.length, productsList?.length]);

const hasMoreResults = useMemo(() => {
    if (enableInfiniteScroll) {
        return hasMorePages;
    } else {
        // For regular mode, check if there are more products to display
        return totalResults > displayCount;
    }
}, [enableInfiniteScroll, hasMorePages, totalResults, displayCount]);

const remainingCount = useMemo(() => {
    if (enableInfiniteScroll) {
        return totalItems - displayProductsList.length;
    } else {
        // For regular mode, show how many more can be displayed
        return totalResults - displayCount;
    }
}, [enableInfiniteScroll, totalItems, displayProductsList.length, totalResults, displayCount]);

    // 🆕 Determine current breakpoint and item config
    const getCurrentBreakpointConfig = () => {
        const width = windowSize.width || window.innerWidth;
        
        if (width >= 1200) {
            return ITEM_SIZE.LG;
        } else if (width >= 900) {
            return ITEM_SIZE.MD;
        } else {
            return ITEM_SIZE.SM;
        }
    };
    
    const currentItemConfig = getCurrentBreakpointConfig();
    
    // 🆕 Helper function to get product price
    const getProductPrice = useCallback((product: Product) => {
        if (!showPrice) return null;
        
        // Try to find price for current pricelist
        const price = product.prices?.find(p => p.pricelist_id === tab?.order?.pricelist_id)?.price;
        
        // Fallback to first available price
        const fallbackPrice = price || product.prices?.[0]?.price;
        
        if (fallbackPrice) {
            const numericPrice = parseFloat(fallbackPrice);
            if (!isNaN(numericPrice)) {
                return priceFormatter(numericPrice, 'CLP');
            }
            return fallbackPrice;
        }
        
        return null;
    }, [showPrice, tab?.order?.pricelist_id]);
    
    // 🆕 Handle clear search
    const handleClearSearch = () => {
        setFilter("");
    };
    
    // 🆕 Handle load more (for button mode)
    const handleLoadMoreButton = useCallback(() => {
        if (enableInfiniteScroll) {
            // For infinite scroll, use the hook's loadMore function
            loadMore();
        } else {
            // For button mode, increase display count
            setDisplayCount(prev => Math.min(prev + LOAD_MORE_INCREMENT, totalResults));
        }
    }, [enableInfiniteScroll, loadMore, totalResults]);
    
    // 🆕 Handle show less (only for button mode)
    const handleShowLess = () => {
        setDisplayCount(INITIAL_DISPLAY_RESULTS);
        // Scroll back to top of products grid
        if (productsGridRef.current) {
            productsGridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // 🆕 Setup window infinite scroll
    useWindowInfiniteScroll(
        enableInfiniteScroll && !isLoading,
        hasMoreResults,
        isLoadingMore,
        loadMore, // Use the loadMore function from the hook
        productsGridRef
    );

    // 🆕 Enhanced debug info display
    useEffect(() => {
        if (enableInfiniteScroll) {
            console.log('🔍 Infinite Scroll Debug:', {
                'Displayed Products': displayProductsList.length,
                'Total Available': totalItems,
                'Current Page': currentPage,
                'Total Pages': totalPages,
                'Has More Pages': hasMorePages,
                'Is Loading More': isLoadingMore,
                'Search Filter': filter,
                'Server Search': shouldUseServerSearch,
                'Products List Length': productsList?.length || 0
            });
        }
    }, [enableInfiniteScroll, displayProductsList.length, totalItems, currentPage, totalPages, hasMorePages, isLoadingMore, filter, shouldUseServerSearch, productsList?.length]);
    
    const handleProductClick = (product: Product) => {
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
    };
    
    const handleModifierChange = (updatedModifiers: any[]) => {
        setSelectedModifiers(updatedModifiers);
    };

    const handleDialogConfirm = () => {
        if (selectedProduct) {
            addProductToOrder(selectedProduct, selectedModifiers);
            setDialogOpen(false);
            setSelectedProduct(null);
            setSelectedModifiers([]);
        }
    };
    
    const handleDialogCancel = () => {
        setDialogOpen(false);
        setSelectedProduct(null);
        setSelectedModifiers([]);
    };

    const addProductToOrder = (product: Product, modifiers: any[]) => {
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
    
            const currentProducts = (getValues("products") || method === "create" ? products : tab.order.items) || [];
            setValue("products", [...currentProducts, appendProduct]);
    
            showMessage(translate('tab.products.message.added'));
        } catch (error) {
            console.error("Error adding product:", error);
        }
    };

    const showMessage = (info: string) => {
        toast.info(<>{info}</>, {
            position: 'top-center',
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: false,
            draggable: false,
        });
    };

    // Listen for form submission success to cache the response
    useEffect(() => {
        const handleFormSuccess = (event: CustomEvent) => {
            const { response } = event.detail;
            
            if (response && response.id) {
                console.log('🎯 Tab created successfully, caching response:', response);
                cacheTab(response);
                notify(translate('tab.products.message.created_success'), { type: 'success' });
                redirect('edit', 'tab', response.id);
            }
        };

        window.addEventListener('tabCreated', handleFormSuccess as EventListener);
        
        return () => {
            window.removeEventListener('tabCreated', handleFormSuccess as EventListener);
        };
    }, [cacheTab, notify, redirect, translate]);

    return (
        <Box sx={{ display: 'flex', gap: 0 }}>
            <Box sx={{ flex: 1 }}>
                {/* Enhanced search field */}
                <TextField
                    fullWidth
                    label={translate('tab.products.search.label')}
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    sx={{ mb: 2 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                        endAdornment: filter && (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label={translate('tab.products.search.clear')}
                                    onClick={handleClearSearch}
                                    edge="end"
                                    size="small"
                                >
                                    <ClearIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    helperText={
                        filter.length > 0 && filter.length < SEARCH_CONFIG.SERVER_SEARCH_MIN_LENGTH
                            ? translate('tab.products.search.local_active', { 
                                count: SEARCH_CONFIG.SERVER_SEARCH_MIN_LENGTH - filter.length 
                            })
                            : filter.length >= SEARCH_CONFIG.SERVER_SEARCH_MIN_LENGTH
                            ? translate('tab.products.search.server_active')
                            : ""
                    }
                />

                {/* Cache Status Indicators */}
                {(isShowingCached || hasCache || isUsingLocalSearch) && (
                    <Box sx={{ mb: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {isUsingLocalSearch && (
                            <Chip 
                                label={translate('tab.products.search.local_search', { term: filter })}
                                size="small" 
                                color="primary" 
                            />
                        )}
                        {isShowingCached && !isUsingLocalSearch && (
                            <Chip 
                                label={translate('tab.products.cache.cached_results', { 
                                    seconds: Math.round((cacheAge || 0) / 1000) 
                                })}
                                size="small" 
                                color="success" 
                            />
                        )}
                        {isLoading && (
                            <Chip 
                                label={translate('tab.products.cache.loading_fresh')}
                                size="small" 
                                color="info" 
                            />
                        )}
                        {hasCache && !filter && (
                            <Chip 
                                label={translate('tab.products.cache.products_cached', { 
                                    count: serverProductsList?.length || 0 
                                })}
                                size="small" 
                                color="default" 
                            />
                        )}
                    </Box>
                )}

                {/* Display status indicator */}
                {totalResults > 0 && (
                    <Box sx={{ mb: 1, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                           <Chip 
            label={isUsingLocalSearch 
                ? `🔍 Local: ${displayProductsList.length}/${totalResults}`
                : enableInfiniteScroll
                ? `📜 Infinite: ${displayProductsList.length}/${totalItems} (Page ${currentPage}/${totalPages})`
                : `📄 Regular: ${displayProductsList.length}/${totalResults}`
            }
            size="small" 
            color="info"
            variant="outlined"
        />
        
        {/* Show scroll mode indicator */}
        {enableInfiniteScroll && hasMoreResults && (
            <Chip 
                label="📜 Infinite Scroll Active"
                size="small" 
                color="secondary"
                variant="outlined"
            />
        )}
        
        {/* Show price indicator */}
        {showPrice && (
            <Chip 
                label="💰 Prices Shown"
                size="small" 
                color="warning"
                variant="outlined"
            />
        )}
        
        {/* 🆕 Show data source */}
        {!enableInfiniteScroll && (
            <Chip 
                label={`📊 All ${totalResults} loaded`}
                size="small" 
                color="success"
                variant="outlined"
            />
        )}
                    </Box>
                )}

                {/* Recent searches */}
                {searchHistory && searchHistory.length > 0 && filter === '' && (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                            {translate('tab.products.search.recent_searches')}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                            {searchHistory.slice(0, 5).map((term, index) => (
                                <Chip
                                    key={index}
                                    label={term}
                                    size="small"
                                    variant="outlined"
                                    onClick={() => setFilter(term)}
                                    sx={{ cursor: 'pointer' }}
                                />
                            ))}
                        </Box>
                    </Box>
                )}
                
                {/* 🆕 Products Grid with Enhanced Price Support */}
                <Box ref={productsGridRef}>
                    <Grid container spacing={1}>
                        {!isLoading && displayProductsList.map((product) => {
                            const productPrice = getProductPrice(product);
                            
                            return (
                                <Grid 
                                    key={product.id}
                                    size={{ 
                                        xs: 12 / GRID_COLUMNS_SM,  // 4 columns on xs/sm
                                        md: 12 / GRID_COLUMNS_MD,  // 6 columns on md  
                                        xl: 12 / GRID_COLUMNS_LG   // 12 columns on lg+
                                    }}
                                >
                                    <Box 
                                        className="dash-tab-item" 
                                        sx={{ 
                                            position: 'relative', 
                                            width: '100%',
                                            aspectRatio: currentItemConfig.ASPECT_RATIO,
                                            backgroundColor: 'black',
                                            minHeight: currentItemConfig.MIN_HEIGHT,
                                            cursor: 'pointer',
                                            '&:hover': {
                                                transform: 'scale(1.02)',
                                                transition: 'transform 0.2s ease-in-out',
                                                zIndex: 2,
                                                boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                                            }
                                        }}
                                        onClick={() => handleProductClick(product)}
                                    >
                                        {/* Product Name */}
                                        <Typography
                                            variant="subtitle2"
                                            fontWeight="bold"
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                zIndex: 1,
                                                padding: '4px 8px',
                                                color: 'white',
                                                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                                                fontSize: currentItemConfig.NAME_FONT_SIZE,
                                                lineHeight: 1.2,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                wordBreak: 'break-word',
                                                hyphens: 'auto',
                                                pointerEvents: 'none',
                                                background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, transparent 100%)'
                                            }}
                                        >
                                            {product.name}
                                        </Typography>

                                        {/* Bottom Right Container for SKU and Price */}
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                bottom: 8,
                                                right: 8,
                                                zIndex: 1,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'flex-end',
                                                gap: 0.5,
                                                pointerEvents: 'none'
                                            }}
                                        >
                                            {/* SKU Chip */}
                                            <Chip
                                                label={product.sku}
                                                size="small"
                                                sx={{
                                                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                                    color: 'white',
                                                    fontSize: currentItemConfig.SKU_FONT_SIZE,
                                                    height: 'auto',
                                                    '& .MuiChip-label': {
                                                        fontSize: currentItemConfig.SKU_FONT_SIZE,
                                                        padding: '2px 6px',
                                                        fontWeight: 'bold'
                                                    },
                                                    border: '1px solid rgba(255, 255, 255, 0.3)'
                                                }}
                                            />

                                            {/* Price Chip - Only show if showPrice is true and price exists */}
                                            {showPrice && productPrice && (
                                                <Chip
                                                    label={productPrice}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: 'rgba(255, 193, 7, 0.95)', // Enhanced visibility
                                                        color: 'rgba(0, 0, 0, 0.87)',
                                                        fontWeight: 'bold',
                                                        fontSize: currentItemConfig.PRICE_FONT_SIZE,
                                                        height: 'auto',
                                                        '& .MuiChip-label': {
                                                            fontSize: currentItemConfig.PRICE_FONT_SIZE,
                                                            padding: '3px 8px',
                                                            fontWeight: 'bold'
                                                        },
                                                        border: '2px solid rgba(255, 193, 7, 1)',
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                                    }}
                                                />
                                            )}
                                        </Box>
                                       
                                        {/* Product Image */}
                                        <ImagePlaceHolder 
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                cursor: 'pointer',
                                                objectFit: 'cover'
                                            }}
                                            loading={<CircularProgress />} 
                                            placeHolder={placeholder} 
                                            src={product?.gallery?.primary_image_url} 
                                        />
                                    </Box>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Box>
                
                {/* 🆕 Infinite scroll loading indicator - appears below the grid */}
                {enableInfiniteScroll && isLoadingMore && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3, mt: 2 }}>
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1,
                            p: 2,
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                            boxShadow: 1
                        }}>
                            <CircularProgress size={20} />
                            <Typography variant="body2" color="text.secondary">
                                {translate('tab.products.infinite_scroll.loading_more')}
                            </Typography>
                        </Box>
                    </Box>
                )}
                
                {/* 🆕 End of results indicator for infinite scroll */}
                {enableInfiniteScroll && !hasMoreResults && totalResults > INITIAL_DISPLAY_RESULTS && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3, mt: 2 }}>
                        <Chip 
                            label={translate('tab.products.infinite_scroll.end_of_results')}
                            size="medium" 
                            color="success"
                            variant="outlined"
                            sx={{ 
                                fontSize: '0.875rem',
                                height: 'auto',
                                '& .MuiChip-label': {
                                    padding: '8px 16px'
                                }
                            }}
                        />
                    </Box>
                )}
                
                {/* 🆕 Show More / Show Less buttons (only when NOT using infinite scroll) */}
                {!enableInfiniteScroll && totalResults > INITIAL_DISPLAY_RESULTS && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3, p: 2 }}>
                        {hasMoreResults && (
                            <Button 
                                variant="outlined" 
                                onClick={handleLoadMoreButton}
                                size="medium"
                                disabled={isLoadingMore}
                                startIcon={isLoadingMore ? <CircularProgress size={16} /> : undefined}
                                sx={{ minWidth: 150 }}
                            >
                                {isLoadingMore 
                                    ? translate('tab.products.buttons.loading')
                                    : translate('tab.products.buttons.show_more', { count: remainingCount })
                                }
                            </Button>
                        )}
                        {displayCount > INITIAL_DISPLAY_RESULTS && (
                            <Button 
                                variant="text" 
                                onClick={handleShowLess}
                                size="medium"
                                color="secondary"
                            >
                                {translate('tab.products.buttons.show_less')}
                            </Button>
                        )}
                    </Box>
                )}

                {/* 🆕 Manual Load More button for infinite scroll (optional - for debugging) */}
                {enableInfiniteScroll && hasMoreResults && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2, p: 2 }}>
                        <Button 
                            variant="outlined" 
                            onClick={loadMore}
                            size="small"
                            disabled={isLoadingMore}
                            startIcon={isLoadingMore ? <CircularProgress size={16} /> : undefined}
                            color="secondary"
                        >
                            {isLoadingMore 
                                ? 'Loading...'
                                : `Load More (${remainingCount} remaining)`
                            }
                        </Button>
                    </Box>
                )}
                
                {/* Show loading state */}
                {isLoading && !isShowingCached && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2,
                            flexDirection: 'column'
                        }}>
                            <CircularProgress />
                            <Typography variant="body2" color="text.secondary">
                                {translate('tab.products.loading')}
                            </Typography>
                        </Box>
                    </Box>
                )}

                {/* No results message */}
                {!isLoading && totalResults === 0 && filter && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                            {translate('tab.products.no_results', { term: filter })}
                            {isUsingLocalSearch && (
                                <>
                                    <br />
                                    <Typography variant="caption" color="text.secondary">
                                        {translate('tab.products.no_results_hint', { 
                                            count: SEARCH_CONFIG.SERVER_SEARCH_MIN_LENGTH - filter.length 
                                        })}
                                    </Typography>
                                </>
                            )}
                        </Typography>
                    </Box>
                )}

                {/* 🆕 Error state */}
                {error && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="error">
                            {translate('tab.products.error.loading_failed')}
                        </Typography>
                        <Button 
                            variant="outlined" 
                            onClick={() => window.location.reload()}
                            size="small"
                            sx={{ mt: 1 }}
                        >
                            {translate('tab.products.error.retry')}
                        </Button>
                    </Box>
                )}

                {/* 🆕 Debug info (only in development) */}
                {process.env.NODE_ENV === 'development' && enableInfiniteScroll && (
                    <Box sx={{ mt: 2, p: 2, border: 1 }}>
                        <Typography variant="caption" component="div">
                            <strong>Debug Info:</strong><br />
                            Displayed: {displayProductsList.length} / Total: {totalItems}<br />
                            Page: {currentPage} / {totalPages}<br />
                            Has More: {hasMorePages ? 'Yes' : 'No'}<br />
                            Loading: {isLoadingMore ? 'Yes' : 'No'}<br />
                            Search: {filter || 'None'} ({shouldUseServerSearch ? 'Server' : 'Local'})
                        </Typography>
                        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button 
            size="small" 
            variant="outlined" 
            color="secondary"
            onClick={() => clearSearchCache(filter)}
            disabled={!filter}
        >
            Clear Current Search Cache
        </Button>
        <Button 
            size="small" 
            variant="outlined" 
            color="warning"
            onClick={clearMainCache}
        >
            Clear Main Cache
        </Button>
        <Button 
            size="small" 
            variant="outlined" 
            color="error"
            onClick={clearAllCaches}
        >
            Clear All Caches
        </Button>
    </Box>
                    </Box>
                )}


            </Box>
            
            {/* Modifier Selection Dialog */}
            <Dialog 
                open={dialogOpen} 
                onClose={handleDialogCancel}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    {translate('tab.products.modifier.dialog.title', { 
                        productName: selectedProduct?.name || '' 
                    })}
                </DialogTitle>
                <DialogContent>
                    {selectedProduct && (
                        <ProductModifiers
                            product={{ product: selectedProduct }}
                            productIndex={0}
                            modifiers={selectedModifiers}
                            onModifierChange={handleModifierChange}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogCancel} color="primary">
                        {translate('tab.products.modifier.dialog.cancel')}
                    </Button>
                    <Button onClick={handleDialogConfirm} color="primary" variant="contained">
                        {translate('tab.products.modifier.dialog.add')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default OrderProductsEdit;
