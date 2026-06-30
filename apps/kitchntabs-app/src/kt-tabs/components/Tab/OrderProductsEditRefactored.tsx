
import { Typography, Box, TextField, Chip, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, InputAdornment, Grid, Pagination, Popover, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Divider } from "@mui/material";
import { Clear as ClearIcon, Search as SearchIcon, Settings as SettingsIcon } from "@mui/icons-material";
import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { toast } from 'react-toastify';
import { ITab } from "../interfaces/ITab";
import ProductModifiers from './ProductModifiers';
import { SEARCH_CONFIG, useTabManager, PaginationMode, PAGINATION_CONFIG, INFINITE_SCROLL_CONFIG } from '../contexts/TabManagerContext';
import { useNotify, useRedirect, useTranslate } from 'react-admin';
import useWindowSize from 'dash-admin/hooks/window/useWindowSize';
import { useEffect, useState, useMemo } from "react";
import { Product } from "kt-ecommerce/interfaces";
import { ImagePlaceHolder } from "kt-utils";
import { priceFormatter } from "dash-utils";

const placeholder = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="

// Updated Grid configuration constants using MUI breakpoints
const GRID_COLUMNS_SM = 3;
const GRID_COLUMNS_MD = 4;
const GRID_COLUMNS_LG = 9;

const INITIAL_DISPLAY_RESULTS = 18;
const LOAD_MORE_INCREMENT = 18;

// Updated Item size constants for MUI breakpoints
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

// Add configuration types to interface
export interface IOrderProducts extends IDashAutoAdminCustomFieldComponent {
    productsResource?: string;
    paginationMode?: PaginationMode;
    showPrice?: boolean;
    searchConfig?: Partial<typeof SEARCH_CONFIG>;
    paginationConfig?: Partial<typeof PAGINATION_CONFIG>;
    infiniteScrollConfig?: Partial<typeof INFINITE_SCROLL_CONFIG>;
}

const OrderProductsEditRefactored: React.FC<IOrderProducts> = (props) => {
    const { 
        record, 
        method, 
        productsResource = null, 
        paginationMode: initialPaginationMode = PaginationMode.INFINITE_SCROLL,
        showPrice = false,
        searchConfig,
        paginationConfig,
        infiniteScrollConfig
    } = props;
    
    const tab: ITab = record as ITab;
    const notify = useNotify();
    const redirect = useRedirect();
    const windowSize = useWindowSize();
    const translate = useTranslate();

    // Merge configuration objects with defaults
    const mergedSearchConfig = useMemo(() => ({
        ...SEARCH_CONFIG,
        ...(searchConfig || {})
    }), [searchConfig]);

    const mergedPaginationConfig = useMemo(() => ({
        ...PAGINATION_CONFIG,
        INITIAL_DISPLAY: INITIAL_DISPLAY_RESULTS,
        LOAD_MORE_INCREMENT: LOAD_MORE_INCREMENT,
        ...(paginationConfig || {})
    }), [paginationConfig]);

    const mergedInfiniteScrollConfig = useMemo(() => ({
        ...INFINITE_SCROLL_CONFIG,
        ...(infiniteScrollConfig || {})
    }), [infiniteScrollConfig]);

    //const debug = process.env.NODE_ENV === 'development';
    const debug = false;
    
    // Use the context with custom configurations
    const {
        // Products data
        displayProductsList,
        isLoading,
        isLoadingMore,
        isShowingCached,
        error,
        
        // Search and filters
        filter,
        setFilter,
        shouldUseServerSearch,
        isUsingLocalSearch,
        
        // Pagination and infinite scroll
        totalResults,
        hasMoreResults,
        remainingCount,
        handleLoadMoreButton,
        handleShowLess,
        
        // Pagination modes
        paginationMode,
        setPaginationMode,
        currentDisplayPage,
        totalDisplayPages,
        handlePageChange,
        
        // Settings popup
        settingsOpen,
        setSettingsOpen,
        
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
        
        // Modal state
        dialogOpen,
        selectedProduct,
        selectedModifiers,
        handleModifierChange,
        handleDialogConfirm,
        handleDialogCancel,
        
        // Configuration
        currentPage,
        totalPages,
        totalItems,
        hasMorePages,
        
        // Refs
        productsGridRef,
    } = useTabManager({
        searchConfig: mergedSearchConfig,
        paginationConfig: mergedPaginationConfig,
        infiniteScrollConfig: mergedInfiniteScrollConfig
    });
    
    // Initialize pagination mode from props
    useEffect(() => {
        if (initialPaginationMode !== paginationMode) {
            setPaginationMode(initialPaginationMode);
        }
    }, [initialPaginationMode, paginationMode, setPaginationMode]);
    
    // Settings popup anchor
    const [settingsAnchorEl, setSettingsAnchorEl] = useState<HTMLButtonElement | null>(null);
    
    const handleSettingsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setSettingsAnchorEl(event.currentTarget);
        setSettingsOpen(true);
    };
    
    const handleSettingsClose = () => {
        setSettingsAnchorEl(null);
        setSettingsOpen(false);
    };
    
    const handlePaginationModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newMode = event.target.value as PaginationMode;
        setPaginationMode(newMode);
        handleSettingsClose();
    };
    
    // Determine current breakpoint and item config
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
    
    // Helper function to get product price
    const getProductPrice = (product: Product) => {
        if (!showPrice) return null;
        
        // Try to find price for current pricelist
        const price = product.prices?.find(p => p.pricelist_id === tab?.order?.pricelist_id)?.price;
        
        // Fallback to first available price
        const fallbackPrice = price || product.prices?.[0]?.price;
        
        if (fallbackPrice) {
            const numericPrice = parseFloat(fallbackPrice.toString());
            if (!isNaN(numericPrice)) {
                return priceFormatter(numericPrice, 'CLP');
            }
            return fallbackPrice;
        }
        
        return null;
    };
    
    // Handle clear search
    const handleClearSearch = () => {
        setFilter("");
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

    // Add more detailed logging
    useEffect(() => {
        console.log(`🛒 OrderProductsEditRefactored render`, {
            productsLoaded: displayProductsList?.length || 0,
            isLoading,
            totalResults,
            serverProductsList: Array.isArray(displayProductsList) ? 
                displayProductsList.slice(0, 2).map(p => p.name) : 'Not an array'
        });
    }, [displayProductsList, isLoading, totalResults]);

    return (
        <Box sx={{ display: 'flex', gap: 0 }}>
            
            <Box sx={{ flex: 1 }}>
                {/* Enhanced search field with settings */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                        fullWidth
                        label={translate('tab.products.search.label')}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
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
                    
                    {/* Settings Button */}
                    <IconButton
                        onClick={handleSettingsClick}
                        size="small"
                        sx={{ 
                            mt: 1,
                           
                            border: 1,
                            borderColor: 'divider',
                           
                        }}
                        aria-label="Pagination settings"
                    >
                        <SettingsIcon />
                    </IconButton>
                </Box>
               

                {/* Cache Status Indicators */}
                {debug && (
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
                                    count: displayProductsList?.length || 0 
                                })}
                                size="small" 
                                color="default" 
                            />
                        )}
                    </Box>
                )}
           
                {/* Display status indicator with pagination mode */}
                {debug && totalResults > 0 && (
                    <Box sx={{ mb: 1, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Chip 
                            label={isUsingLocalSearch 
                                ? `🔍 Local: ${displayProductsList.length}/${totalResults}`
                                : paginationMode === PaginationMode.INFINITE_SCROLL
                                ? `📜 Infinite: ${displayProductsList.length}/${totalItems} (Page ${currentPage}/${totalPages})`
                                : paginationMode === PaginationMode.PAGINATION
                                ? `📄 Pagination: Page ${currentDisplayPage}/${totalDisplayPages} (${displayProductsList.length}/${totalResults})`
                                : `📄 Load More: ${displayProductsList.length}/${totalResults}`
                            }
                            size="small" 
                            color="info"
                            variant="outlined"
                        />
                        
                        {/* Show current mode indicator */}
                        <Chip 
                            label={paginationMode === PaginationMode.INFINITE_SCROLL ? "📜 Infinite Scroll" 
                                  : paginationMode === PaginationMode.PAGINATION ? "📑 Pagination"
                                  : "📤 Load More"}
                            size="small" 
                            color="secondary"
                            variant="outlined"
                        />
                        
                        {/* Show scroll mode indicator */}
                        {debug && paginationMode === PaginationMode.INFINITE_SCROLL && hasMoreResults && (
                            <Chip 
                                label="📜 Infinite Scroll Active"
                                size="small" 
                                color="secondary"
                                variant="outlined"
                            />
                        )}
                        
                        {/* Show price indicator */}
                        {debug && showPrice && (
                            <Chip 
                                label="💰 Prices Shown"
                                size="small" 
                                color="warning"
                                variant="outlined"
                            />
                        )}
                        
                        {/* Show data source */}
                        {debug && paginationMode !== PaginationMode.INFINITE_SCROLL && (
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
                
                {/* Debug info about product list state */}
                {debug && (
                    <Box sx={{ mb: 1, p: 1, bgcolor: 'background.paper', border: '1px dashed grey' }}>
                        <Typography variant="caption" component="div">
                            <strong>Products Data Debug:</strong><br />
                            displayProductsList length: {displayProductsList?.length || 0}<br />
                            isLoading: {isLoading ? 'Yes' : 'No'}<br />
                            isArray: {Array.isArray(displayProductsList) ? 'Yes' : 'No'}<br />
                            totalResults: {totalResults}<br />
                            Products data sample: {displayProductsList && displayProductsList.length > 0 
                                ? JSON.stringify(displayProductsList[0]?.name || 'empty') 
                                : 'No products'
                            }
                        </Typography>
                    </Box>
                )}

                 {/* Pagination Controls - New pagination mode */}
                {paginationMode === PaginationMode.PAGINATION && totalDisplayPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, p: 2 }}>
                        <Pagination
                            count={totalDisplayPages}
                            page={currentDisplayPage}
                            onChange={(event, page) => handlePageChange(page)}
                            //color="primary"
                            size="large"
                            showFirstButton
                            showLastButton
                            sx={{
                                '& .MuiPaginationItem-root': {
                                    fontSize: '0.875rem'
                                }
                            }}
                        />
                    </Box>
                )}
                

                {/* Products Grid with Enhanced Price Support - FIXED GRID PROPERTIES */}
                <Box ref={productsGridRef}>
                    <Grid container spacing={1}>
                        {!isLoading && displayProductsList && displayProductsList.length > 0 ? displayProductsList.map((product, index) => {
                            const productPrice = getProductPrice(product);
                            
                            return (
                                <Grid 
                                    key={`product-${product.id || index}`}
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
                        }) : (
                            // Add a fallback message when no products are found but data has loaded
                            !isLoading && (
                                <Grid item xs={12}>
                                    <Box sx={{ p: 3, textAlign: 'center' }}>
                                        <Typography variant="body1" color="text.secondary">
                                            {filter ? 
                                                translate('tab.products.no_results', { term: filter }) :
                                                "No products available" /* Use direct string instead of missing translation */
                                            }
                                        </Typography>
                                    </Box>
                                </Grid>
                            )
                        )}
                    </Grid>
                </Box>
                
               
                {/* Infinite scroll loading indicator - appears below the grid */}
                {paginationMode === PaginationMode.INFINITE_SCROLL && isLoadingMore && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3, mt: 2 }}>
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1,
                            p: 2,
                        }}>
                            <CircularProgress size={80} />
                        </Box>
                    </Box>
                )}
                
                {/* End of results indicator for infinite scroll */}
                {paginationMode === PaginationMode.INFINITE_SCROLL && !hasMoreResults && totalResults > 0 && (
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
                
                {/* Show More button (only for load more mode) */}
                {paginationMode === PaginationMode.LOAD_MORE && hasMoreResults && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3, p: 2 }}>
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
                    </Box>
                )}

                {/* Manual Load More button for infinite scroll (optional - for debugging) */}
                {/*enableInfiniteScroll && hasMoreResults && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2, p: 2 }}>
                        <Button 
                            variant="outlined" 
                            onClick={handleLoadMoreButton}
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
                )*/}
                
                {/* Show loading state */}
                {isLoading && !isShowingCached && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2,
                            flexDirection: 'column'
                        }}>
                            <CircularProgress size={80} />
                           
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

                {/* Error state */}
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

                {/* Debug info (only in development) */}
                {debug && paginationMode === PaginationMode.INFINITE_SCROLL && (
                    <Box sx={{ mt: 2, p: 2, border: 1 }}>
                        <Typography variant="caption" component="div">
                            <strong>Debug Info:</strong><br />
                            Displayed: {displayProductsList.length} / Total: {totalItems}<br />
                            Page: {currentPage} / {totalPages}<br />
                            Has More: {hasMorePages ? 'Yes' : 'No'}<br />
                            Loading: {isLoadingMore ? 'Yes' : 'No'}<br />
                            Search: {filter || 'None'} ({shouldUseServerSearch ? 'Server' : 'Local'})<br />
                            Mode: {paginationMode}
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
            
            {/* Settings Popup */}
            <Popover
                open={settingsOpen}
                anchorEl={settingsAnchorEl}
                onClose={handleSettingsClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                PaperProps={{
                    sx: { p: 2, minWidth: 200 }
                }}
            >
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Pagination Mode
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <FormControl component="fieldset">
                    <RadioGroup
                        value={paginationMode}
                        onChange={handlePaginationModeChange}
                    >
                        <FormControlLabel
                            value={PaginationMode.INFINITE_SCROLL}
                            control={<Radio size="small" />}
                            label={
                                <Box>
                                    <Typography variant="body2" fontWeight="medium">
                                        📜 Infinite Scroll
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Auto-load as you scroll
                                    </Typography>
                                </Box>
                            }
                        />
                        <FormControlLabel
                            value={PaginationMode.LOAD_MORE}
                            control={<Radio size="small" />}
                            label={
                                <Box>
                                    <Typography variant="body2" fontWeight="medium">
                                        📤 Load More
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Click button to load more
                                    </Typography>
                                </Box>
                            }
                        />
                        <FormControlLabel
                            value={PaginationMode.PAGINATION}
                            control={<Radio size="small" />}
                            label={
                                <Box>
                                    <Typography variant="body2" fontWeight="medium">
                                        📑 Page Navigation
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Navigate by page numbers
                                    </Typography>
                                </Box>
                            }
                        />
                    </RadioGroup>
                </FormControl>
            </Popover>
            
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

export default OrderProductsEditRefactored;
