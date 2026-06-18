import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { useTranslate, useNotify, useDataProvider } from 'react-admin';
import {
    Box,
    Typography,
    IconButton,
    Skeleton,
    Button,
    Chip,
    Card,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    useMediaQuery,
    useTheme,
    Tooltip,
    FormControl,
    FormLabel,
    FormGroup,
    FormControlLabel,
    Radio,
    RadioGroup,
    Checkbox,
    Divider,
    alpha,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddIcon from '@mui/icons-material/Add';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';

import { ITab } from '../interfaces/ITab';
import { useTabManagerOptional } from '../contexts/TabManagerContext';
import { IModifierGroup } from '../interfaces/ITab';
import { Product } from '@kt-ecommerce/interfaces';
import { priceFormatter } from 'dash-utils';

// Configuration interface
export interface ITabOrderProductsSelectorConfig {
    /** Number of items per page on extra small screens (xs) */
    itemsPerPageXs?: number;
    /** Number of items per page on small screens (sm) */
    itemsPerPageSm?: number;
    /** Number of items per page on medium screens (md) */
    itemsPerPageMd?: number;
    /** Number of items per page on large screens (lg) */
    itemsPerPageLg?: number;
    /** @deprecated Use itemsPerPageSm/Md/Lg instead */
    itemsPerPage?: number;
    /** Number of grid columns on extra small screens */
    gridColumnsXs?: number;
    /** Number of grid columns on small screens */
    gridColumnsSm?: number;
    /** Number of grid columns on medium screens */
    gridColumnsMd?: number;
    /** Number of grid columns on large screens */
    gridColumnsLg?: number;
    /** Show product prices */
    showPrice?: boolean;
    /** Category resource endpoint */
    categoryResource?: string;
    /** Products resource endpoint */
    productsResource?: string;
    /** Cache duration in milliseconds for categories (default: 1 hour) */
    categoryCacheDuration?: number;
    /** Cache duration in milliseconds for products by category (default: 1 hour) */
    productsCacheDuration?: number;
    /** Disable caching entirely */
    disableCache?: boolean;
    /** Hide the big navigation arrow buttons on the carousel sides (default: true) */
    hideNavigationButtons?: boolean;
    /** Hide the internal category selector (use external CategorySelector component instead) */
    hideCategorySelector?: boolean;
    /** Use horizontal scroll instead of pagination (better mobile performance, default: true) */
    useHorizontalScroll?: boolean;
    /** Card width for horizontal scroll mode (default: 140) */
    horizontalScrollCardWidth?: number;
    /** Card height for horizontal scroll mode (default: 180) */
    horizontalScrollCardHeight?: number;
    /** Number of rows in horizontal scroll mode (default: 2) */
    horizontalScrollRows?: number;
    /** Number of rows for xs screens (mobile) - overrides horizontalScrollRows */
    horizontalScrollRowsXs?: number;
    /** Number of rows for sm screens (tablet) - overrides horizontalScrollRows */
    horizontalScrollRowsSm?: number;
    /** Number of rows for md+ screens (desktop) - overrides horizontalScrollRows */
    horizontalScrollRowsMd?: number;
}

export interface ITabOrderProductsSelector extends IDashAutoAdminCustomFieldComponent {
    config?: ITabOrderProductsSelectorConfig;
}

// Default configuration
const DEFAULT_CONFIG: Required<ITabOrderProductsSelectorConfig> = {
    itemsPerPageXs: 3,
    itemsPerPageSm: 6,
    itemsPerPageMd: 6,
    itemsPerPageLg: 9,
    itemsPerPage: 6, // fallback
    gridColumnsXs: 3,
    gridColumnsSm: 2,
    gridColumnsMd: 3,
    gridColumnsLg: 3,
    showPrice: true,
    categoryResource: 'ecommerce/category',
    productsResource: 'ecommerce/product',
    categoryCacheDuration: 60 * 60 * 1000, // 1 hour in milliseconds
    productsCacheDuration: 60 * 60 * 1000, // 1 hour in milliseconds
    disableCache: false,
    hideNavigationButtons: true,
    hideCategorySelector: false,
    useHorizontalScroll: true, // Enable horizontal scroll by default for better mobile performance
    horizontalScrollCardWidth: 140,
    horizontalScrollCardHeight: 180,
    horizontalScrollRows: 2,
    horizontalScrollRowsXs: 1, // 1 row on mobile for better UX
    horizontalScrollRowsSm: 2, // 2 rows on tablet
    horizontalScrollRowsMd: 2, // 2 rows on desktop
};

// Cache storage keys
const CATEGORY_CACHE_KEY = 'tab_products_selector_categories';
const CATEGORY_PRODUCTS_CACHE_KEY = 'tab_products_selector_category_products';

// Cache interfaces
interface CacheEntry<T> {
    data: T;
    timestamp: number;
    resource: string;
}

interface CategoryProductsCache {
    [categoryId: string]: CacheEntry<boolean>; // We store a flag that the category was fetched
}

// Cache utility functions
const getCachedData = <T,>(key: string, maxAge: number): T | null => {
    try {
        const cached = localStorage.getItem(key);
        if (!cached) return null;
        
        const entry: CacheEntry<T> = JSON.parse(cached);
        const age = Date.now() - entry.timestamp;
        
        if (age > maxAge) {
            localStorage.removeItem(key);
            return null;
        }
        
        return entry.data;
    } catch (error) {
        console.error(`[Cache] Error reading cache for ${key}:`, error);
        return null;
    }
};

const setCachedData = <T,>(key: string, data: T, resource: string): void => {
    try {
        const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
            resource,
        };
        localStorage.setItem(key, JSON.stringify(entry));
    } catch (error) {
        console.error(`[Cache] Error writing cache for ${key}:`, error);
    }
};

const isCategoryFetched = (categoryId: string | number, maxAge: number): boolean => {
    try {
        const cached = localStorage.getItem(CATEGORY_PRODUCTS_CACHE_KEY);
        if (!cached) return false;
        
        const cacheMap: CategoryProductsCache = JSON.parse(cached);
        const entry = cacheMap[String(categoryId)];
        
        if (!entry) return false;
        
        const age = Date.now() - entry.timestamp;
        return age <= maxAge;
    } catch (error) {
        return false;
    }
};

const markCategoryFetched = (categoryId: string | number): void => {
    try {
        const cached = localStorage.getItem(CATEGORY_PRODUCTS_CACHE_KEY);
        const cacheMap: CategoryProductsCache = cached ? JSON.parse(cached) : {};
        
        cacheMap[String(categoryId)] = {
            data: true,
            timestamp: Date.now(),
            resource: 'category_products',
        };
        
        localStorage.setItem(CATEGORY_PRODUCTS_CACHE_KEY, JSON.stringify(cacheMap));
    } catch (error) {
        console.error('[Cache] Error marking category as fetched:', error);
    }
};

// Helper to calculate total with modifiers
const calculateModifierTotal = (product: Product, modifiers: any[], tab: ITab | null): string => {
    // Get base price
    const priceObj = product.prices?.find(p => p.pricelist_id === tab?.order?.pricelist_id);
    const basePrice = priceObj?.price || product.prices?.[0]?.price || 0;
    const numericBasePrice = typeof basePrice === 'string' ? parseFloat(basePrice) : basePrice;
    
    // Calculate modifier adjustments
    let modifierTotal = 0;
    modifiers.forEach(mod => {
        const adjustment = mod.price_adjustment || mod.modifier_option?.price_adjustment || 0;
        modifierTotal += typeof adjustment === 'string' ? parseFloat(adjustment) : adjustment;
    });
    
    const total = numericBasePrice + modifierTotal;
    return priceFormatter(total, 'CLP');
};

// Category interface
interface Category {
    id: number | string;
    name: string;
    icon?: string;
    image?: string | null;
    position?: number;
}

// Modifier Groups Renderer Component (Kiosk-style)
interface ModifierGroupsRendererProps {
    product: Product;
    selectedModifiers: any[];
    onModifierChange: (modifiers: any[]) => void;
    getProductPrice: (product: Product) => string | null;
    tab: ITab | null;
    translate: (key: string, options?: any) => string;
}

const ModifierGroupsRenderer: React.FC<ModifierGroupsRendererProps> = ({
    product,
    selectedModifiers,
    onModifierChange,
    getProductPrice,
    tab,
    translate,
}) => {
    // Product may have modifier_groups from API but not in the interface type
    const modifierGroups: IModifierGroup[] = (product as any)?.modifier_groups || [];
    
    if (!modifierGroups.length) {
        return (
            <Box sx={{ py: 2, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                    {translate('tab.products.no_modifiers', { _: 'Este producto no tiene modificadores' })}
                </Typography>
                <Typography variant="h5" color="primary" fontWeight={700} sx={{ mt: 2 }}>
                    {getProductPrice(product)}
                </Typography>
            </Box>
        );
    }

    const handleToggleOption = (groupId: number, optionId: number, type: string, option: any, group: IModifierGroup) => {
        let updatedModifiers = [...selectedModifiers];
        
        if (type === 'SINGLE') {
            // Remove existing modifiers for this group
            updatedModifiers = updatedModifiers.filter(mod => mod.modifier_group_id !== groupId);
            
            // Add the new selection
            updatedModifiers.push({
                modifier_option_id: option.id,
                modifier_group_id: groupId,
                price_adjustment: option.price_adjustment,
                modifier_option: {
                    id: option.id,
                    name: option.name,
                    price_adjustment: option.price_adjustment,
                    modifierGroup: {
                        id: groupId,
                        name: group.name,
                        type: group.type
                    }
                }
            });
        } else {
            // MULTIPLE type
            const existingIndex = updatedModifiers.findIndex(
                mod => mod.modifier_option_id === optionId && mod.modifier_group_id === groupId
            );
            
            if (existingIndex >= 0) {
                // Remove if already selected
                updatedModifiers.splice(existingIndex, 1);
            } else {
                // Add new selection
                updatedModifiers.push({
                    modifier_option_id: option.id,
                    modifier_group_id: groupId,
                    price_adjustment: option.price_adjustment,
                    modifier_option: {
                        id: option.id,
                        name: option.name,
                        price_adjustment: option.price_adjustment,
                        modifierGroup: {
                            id: groupId,
                            name: group.name,
                            type: group.type
                        }
                    }
                });
            }
        }
        
        onModifierChange(updatedModifiers);
    };

    const formatPriceAdjustment = (adjustment: string | number): string => {
        const numericValue = typeof adjustment === 'string' ? parseFloat(adjustment) : adjustment;
        if (numericValue === 0) return '';
        const sign = numericValue > 0 ? '+' : '';
        const formatted = priceFormatter(Math.abs(numericValue), 'CLP');
        // priceFormatter returns with $ symbol, strip it to add sign
        const valueOnly = formatted.startsWith('$') ? formatted.slice(1) : formatted;
        return `${sign}$${valueOnly}`;
    };

    const isOptionSelected = (groupId: number, optionId: number): boolean => {
        return selectedModifiers.some(
            mod => mod.modifier_group_id === groupId && mod.modifier_option_id === optionId
        );
    };

    const getSelectedValueForGroup = (groupId: number): number | '' => {
        const selected = selectedModifiers.find(mod => mod.modifier_group_id === groupId);
        return selected ? selected.modifier_option_id : '';
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {modifierGroups.map((group, index) => (
                <React.Fragment key={group.id}>
                    <FormControl component="fieldset" fullWidth sx={{ mb: 2 }}>
                        <FormLabel
                            component="legend"
                            sx={{
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                mb: 1.5,
                                color: 'text.primary',
                                '&.Mui-focused': {
                                    color: 'text.primary',
                                },
                            }}
                        >
                            {group.name}
                            {group.type === 'MULTIPLE' && (
                                <Typography
                                    component="span"
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ ml: 1, fontWeight: 400 }}
                                >
                                    ({translate('tab.products.select_multiple', { _: 'Selecciona varias opciones' })})
                                </Typography>
                            )}
                            {group.is_required && (
                                <Typography
                                    component="span"
                                    variant="caption"
                                    color="error"
                                    sx={{ ml: 1, fontWeight: 500 }}
                                >
                                    *{translate('tab.products.required', { _: 'Requerido' })}
                                </Typography>
                            )}
                        </FormLabel>

                        {group.type === 'SINGLE' ? (
                            <RadioGroup
                                value={getSelectedValueForGroup(group.id)}
                                onChange={(e) => {
                                    const optionId = Number(e.target.value);
                                    const option = group.options.find(o => o.id === optionId);
                                    if (option) {
                                        handleToggleOption(group.id, optionId, 'SINGLE', option, group);
                                    }
                                }}
                            >
                                {group.options?.map((option) => (
                                    <FormControlLabel
                                        key={option.id}
                                        value={option.id}
                                        control={<Radio color="primary" />}
                                        label={
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    width: '100%',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <Typography>{option.name}</Typography>
                                                {parseFloat(String(option.price_adjustment)) !== 0 && (
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{ ml: 2, fontWeight: 500 }}
                                                    >
                                                        {formatPriceAdjustment(option.price_adjustment)}
                                                    </Typography>
                                                )}
                                            </Box>
                                        }
                                        sx={{
                                            mx: 0,
                                            py: 1,
                                            px: 2,
                                            borderRadius: 2,
                                            border: 2,
                                            borderColor: isOptionSelected(group.id, option.id)
                                                ? 'primary.main'
                                                : 'divider',
                                            backgroundColor: isOptionSelected(group.id, option.id)
                                                ? 'primary.lighter'
                                                : 'transparent',
                                            mb: 1,
                                            transition: 'all 0.2s ease',
                                            cursor: 'pointer',
                                            '&:hover': {
                                                borderColor: 'primary.main',
                                                backgroundColor: 'action.hover',
                                            },
                                            '& .MuiFormControlLabel-label': {
                                                flexGrow: 1,
                                            },
                                        }}
                                    />
                                ))}
                            </RadioGroup>
                        ) : (
                            <FormGroup>
                                {group.options?.map((option) => (
                                    <FormControlLabel
                                        key={option.id}
                                        control={
                                            <Checkbox
                                                checked={isOptionSelected(group.id, option.id)}
                                                onChange={() =>
                                                    handleToggleOption(group.id, option.id, 'MULTIPLE', option, group)
                                                }
                                                color="primary"
                                            />
                                        }
                                        label={
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    width: '100%',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <Typography>{option.name}</Typography>
                                                {parseFloat(String(option.price_adjustment)) !== 0 && (
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{ ml: 2, fontWeight: 500 }}
                                                    >
                                                        {formatPriceAdjustment(option.price_adjustment)}
                                                    </Typography>
                                                )}
                                            </Box>
                                        }
                                        sx={{
                                            mx: 0,
                                            py: 1,
                                            px: 2,
                                            borderRadius: 2,
                                            border: 2,
                                            borderColor: isOptionSelected(group.id, option.id)
                                                ? 'primary.main'
                                                : 'divider',
                                            backgroundColor: isOptionSelected(group.id, option.id)
                                                ? 'primary.lighter'
                                                : 'transparent',
                                            mb: 1,
                                            transition: 'all 0.2s ease',
                                            cursor: 'pointer',
                                            '&:hover': {
                                                borderColor: 'primary.main',
                                                backgroundColor: 'action.hover',
                                            },
                                            '& .MuiFormControlLabel-label': {
                                                flexGrow: 1,
                                            },
                                        }}
                                    />
                                ))}
                            </FormGroup>
                        )}
                    </FormControl>
                    {index < modifierGroups.length - 1 && (
                        <Divider sx={{ my: 1.5 }} />
                    )}
                </React.Fragment>
            ))}
        </Box>
    );
};

/**
 * TabOrderProductsSelector Component
 * 
 * A horizontal carousel-style product selector with category navigation.
 * Similar to the KioskResource but integrated with TabManagerContext.
 */
const TabOrderProductsSelector: React.FC<ITabOrderProductsSelector> = (props) => {
    const { record, method, config: userConfig } = props;
    const tab: ITab = record as ITab;
    
    // 🐛 DEBUG: Track component mounting
    const componentMountCountRef = React.useRef(0);
    React.useEffect(() => {
        componentMountCountRef.current += 1;
        console.log(`🟠 [ISSUE01] [TabOrderProductsSelector] MOUNTED (count: ${componentMountCountRef.current})`, {
            method,
            tabId: tab?.id,
            hasRecord: !!record,
            timestamp: new Date().toISOString()
        });
        return () => {
            console.log(`🔴 [ISSUE01] [TabOrderProductsSelector] UNMOUNTING (count: ${componentMountCountRef.current})`, {
                method,
                tabId: tab?.id
            });
        };
    }, []);
    
    // Theme and breakpoints
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.only('xs'));
    const isSm = useMediaQuery(theme.breakpoints.only('sm'));
    const isMd = useMediaQuery(theme.breakpoints.only('md'));
    const isLg = useMediaQuery(theme.breakpoints.up('lg'));
    
    // Merge user config with defaults
    const config = useMemo(() => ({
        ...DEFAULT_CONFIG,
        ...(userConfig || {}),
    }), [userConfig]);

    // Calculate current items per page based on breakpoint
    const currentItemsPerPage = useMemo(() => {
        if (isXs) return config.itemsPerPageXs;
        if (isSm) return config.itemsPerPageSm;
        if (isMd) return config.itemsPerPageMd;
        if (isLg) return config.itemsPerPageLg;
        return config.itemsPerPage; // fallback
    }, [isXs, isSm, isMd, isLg, config]);

    // Calculate current grid columns based on breakpoint
    const currentGridColumns = useMemo(() => {
        if (isXs) return config.gridColumnsXs;
        if (isSm) return config.gridColumnsSm;
        if (isMd) return config.gridColumnsMd;
        if (isLg) return config.gridColumnsLg;
        return config.gridColumnsSm; // fallback
    }, [isXs, isSm, isMd, isLg, config]);

    const translate = useTranslate();
    const notify = useNotify();
    const dataProvider = useDataProvider();

    // Get TabManager context - returns null if not inside TabManagerProvider (e.g., Show mode)
    const tabManager = useTabManagerOptional();
    
    // If we're not in a TabManagerProvider (e.g., Show mode), render a read-only message
    // If we're not in a TabManagerProvider (e.g., Show mode), render the ordered products as chips
    if (!tabManager) {
        const items = tab?.order?.items || [];
        
       
            return (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, p: 2 }}>
                    {items.length > 0 && items.map((item, index) => (
                        <Chip
                            key={item.id || index}
                            label={`${item.product_name} (${item.quantity})`}
                            size="small"
                            variant="outlined"
                        />
                    ))}
                </Box>
            );
      

    }

    // Destructure from context - use 'products' (all products) instead of 'displayProductsList' (paginated)
    // This component handles its own pagination via the carousel
    const {
        products: allProducts,
        isLoading: isLoadingProducts,
        isLoadingMore,
        isShowingCached,
        handleProductClick,
        dialogOpen,
        selectedProduct,
        selectedModifiers,
        handleModifierChange,
        handleDialogConfirm,
        handleDialogCancel,
        showPrice,
        loadMore,
        hasMorePages,
        totalItems,
        filter,
        setFilter,
        searchFilters,
        setSearchFilters,
    } = tabManager;

    // Category state
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeCategory, setActiveCategory] = useState<string | number>('all');
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);

    // Sync activeCategory with searchFilters.category_id from context (for external CategorySelector)
    useEffect(() => {
        if (searchFilters?.category_id !== undefined) {
            setActiveCategory(searchFilters.category_id);
        } else if (Object.keys(searchFilters || {}).length === 0) {
            // If searchFilters is empty, reset to 'all'
            setActiveCategory('all');
        }
    }, [searchFilters]);

    // Carousel state
    const [currentPage, setCurrentPage] = useState(0);
    const [translateX, setTranslateX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    // Category scroll refs and state
    const categoryScrollRef = useRef<HTMLDivElement>(null);
    const [canScrollCategoryLeft, setCanScrollCategoryLeft] = useState(false);
    const [canScrollCategoryRight, setCanScrollCategoryRight] = useState(false);
    const [isCategoryDragging, setIsCategoryDragging] = useState(false);
    const [categoryStartX, setCategoryStartX] = useState(0);
    const [categoryScrollLeft, setCategoryScrollLeft] = useState(0);
    const categoryDragDistanceRef = useRef(0);
    const wasCategoryDraggingRef = useRef(false);

    // Container ref for products carousel
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Horizontal scroll container ref and state
    const horizontalScrollRef = useRef<HTMLDivElement>(null);
    const [canScrollHorizontalLeft, setCanScrollHorizontalLeft] = useState(false);
    const [canScrollHorizontalRight, setCanScrollHorizontalRight] = useState(true);
    
    // Check horizontal scroll position and update arrow visibility
    const updateHorizontalScrollArrows = useCallback(() => {
        const container = horizontalScrollRef.current;
        if (!container) return;
        
        const { scrollLeft, scrollWidth, clientWidth } = container;
        setCanScrollHorizontalLeft(scrollLeft > 10);
        setCanScrollHorizontalRight(scrollLeft < scrollWidth - clientWidth - 10);
    }, []);
    
    // Scroll horizontal container by a significant amount (4 cards worth)
    const scrollHorizontalLeft = useCallback(() => {
        const container = horizontalScrollRef.current;
        if (!container) return;
        
        const cardWidth = config.horizontalScrollCardWidth || 140;
        const scrollAmount = cardWidth * 4; // Scroll 4 cards at a time
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }, [config.horizontalScrollCardWidth]);
    
    const scrollHorizontalRight = useCallback(() => {
        const container = horizontalScrollRef.current;
        if (!container) return;
        
        const cardWidth = config.horizontalScrollCardWidth || 140;
        const scrollAmount = cardWidth * 4; // Scroll 4 cards at a time
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }, [config.horizontalScrollCardWidth]);

    // Load categories on mount (with caching)
    useEffect(() => {
        const loadCategories = async () => {
            // Check cache first (unless disabled)
            if (!config.disableCache) {
                const cachedCategories = getCachedData<Category[]>(
                    `${CATEGORY_CACHE_KEY}_${config.categoryResource}`,
                    config.categoryCacheDuration
                );
                
                if (cachedCategories && cachedCategories.length > 0) {
                    console.log('[Cache] Using cached categories:', cachedCategories.length);
                    setCategories(cachedCategories);
                    setIsLoadingCategories(false);
                    return;
                }
            }

            try {
                console.log('[Cache] Fetching categories from server...');
                const response = await dataProvider.getList(config.categoryResource, {
                    pagination: { page: 1, perPage: 50 },
                    sort: { field: 'name', order: 'ASC' },
                    filter: {},
                });

             
                const mappedCategories: Category[] = [
                    { id: 'all', name: translate('tab.common.todos'), icon: '📋', position: -1 },
                    ...response.data.map((cat: any) => ({
                        id: cat.id,
                        name: cat.name,
                        icon: cat.icon || '🍽️',
                        image: cat.image_url,
                        position: cat.tree_index || 0,
                    })),
                ];
                
                // Cache the categories
                if (!config.disableCache) {
                    setCachedData(
                        `${CATEGORY_CACHE_KEY}_${config.categoryResource}`,
                        mappedCategories,
                        config.categoryResource
                    );
                    console.log('[Cache] Categories cached for', config.categoryCacheDuration / 1000 / 60, 'minutes');
                }
                
                setCategories(mappedCategories);
            } catch (error) {
                console.error('Error loading categories:', error);
                setCategories([{ id: 'all', name: translate('tab.common.todos'), icon: '📋', position: -1 }]);
            } finally {
                setIsLoadingCategories(false);
            }
        };

        loadCategories();
    }, [dataProvider, config.categoryResource, config.categoryCacheDuration, config.disableCache]);

    // Filter products by category and search term
    const filteredProducts = useMemo(() => {
        if (!allProducts || !Array.isArray(allProducts)) return [];
        
        let filtered = allProducts;
        
        // Filter by search term
        if (filter && filter.trim().length > 0) {
            const searchTerm = filter.toLowerCase().trim();
            filtered = filtered.filter((product: Product) => {
                const nameMatch = product.name?.toLowerCase().includes(searchTerm);
                const skuMatch = product.sku?.toLowerCase().includes(searchTerm);
                const descMatch = product.description?.toLowerCase().includes(searchTerm);
                return nameMatch || skuMatch || descMatch;
            });
        }
        
        // Filter by category
        if (activeCategory !== 'all') {
            filtered = filtered.filter((product: Product) => {
                // Check if product has category object
                if (product.category && product.category.id === activeCategory) {
                    return true;
                }
                // Check if product has category_id
                if (product.category_id) {
                    return product.category_id === activeCategory;
                }
                return false;
            });
        }
        
        return filtered;
    }, [allProducts, activeCategory, filter]);
    
    // Update horizontal scroll arrows when products change or on mount
    useEffect(() => {
        // Small delay to ensure DOM is updated
        const timer = setTimeout(() => {
            updateHorizontalScrollArrows();
        }, 100);
        return () => clearTimeout(timer);
    }, [filteredProducts.length, updateHorizontalScrollArrows]);

    // Calculate pages for carousel based on responsive items per page
    const pages = useMemo(() => {
        const chunks: Product[][] = [];
        for (let i = 0; i < filteredProducts.length; i += currentItemsPerPage) {
            chunks.push(filteredProducts.slice(i, i + currentItemsPerPage));
        }
        return chunks.length > 0 ? chunks : [[]];
    }, [filteredProducts, currentItemsPerPage]);

    const totalPages = pages.length;
    const canScrollPrev = currentPage > 0;
    const canScrollNext = currentPage < totalPages - 1;

    // Reset to first page when category or breakpoint changes
    useEffect(() => {
        setCurrentPage(0);
        setTranslateX(0);
    }, [activeCategory, currentItemsPerPage]);

    // Ensure current page is valid when total pages changes
    useEffect(() => {
        if (currentPage >= totalPages && totalPages > 0) {
            setCurrentPage(totalPages - 1);
        }
    }, [currentPage, totalPages]);

    // Debug: Log products count
    useEffect(() => {
        console.log('🛒 TabOrderProductsSelector products:', {
            allProductsCount: allProducts?.length || 0,
            filteredProductsCount: filteredProducts.length,
            totalItems,
            hasMorePages,
            pagesCount: pages.length,
            isLoadingProducts,
            sampleProduct: allProducts?.[0] ? {
                id: allProducts[0].id,
                name: allProducts[0].name,
                hasGallery: !!allProducts[0].gallery,
                galleryKeys: allProducts[0].gallery ? Object.keys(allProducts[0].gallery) : [],
                gallery: allProducts[0].gallery,
            } : null,
        });
    }, [allProducts, filteredProducts, totalItems, hasMorePages, pages, isLoadingProducts]);

    // Auto-load more products if available (with debounce to avoid multiple calls)
    const autoLoadCallCountRef = useRef(0);
    useEffect(() => {
        autoLoadCallCountRef.current += 1;
        const callNumber = autoLoadCallCountRef.current;
        
        console.log(`🔶 [ISSUE01] [TabOrderProductsSelector] Auto-load effect triggered (call #${callNumber})`, {
            hasMorePages,
            isLoadingProducts,
            allProductsCount: allProducts?.length || 0,
            totalItems,
            shouldAutoLoad: hasMorePages && loadMore && !isLoadingProducts && (allProducts?.length || 0) < totalItems
        });
        
        if (hasMorePages && loadMore && !isLoadingProducts) {
            const currentCount = allProducts?.length || 0;
            if (currentCount < totalItems) {
                console.log(`📦 [ISSUE01] [TabOrderProductsSelector] Auto-loading more products... (${currentCount}/${totalItems}) - call #${callNumber}`);
                // Add a small delay to avoid rapid fire calls
                const timer = setTimeout(() => {
                    console.log(`⏰ [ISSUE01] [TabOrderProductsSelector] Timer fired, calling loadMore() - call #${callNumber}`);
                    loadMore();
                }, 200);
                return () => {
                    console.log(`🚫 [ISSUE01] [TabOrderProductsSelector] Timer cancelled - call #${callNumber}`);
                    clearTimeout(timer);
                };
            }
        }
    }, [hasMorePages, loadMore, allProducts?.length, totalItems, isLoadingProducts]);

    // Category scroll button visibility
    const updateCategoryScrollButtons = useCallback(() => {
        if (categoryScrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
            setCanScrollCategoryLeft(scrollLeft > 0);
            setCanScrollCategoryRight(scrollLeft + clientWidth < scrollWidth - 1);
        }
    }, []);

    useEffect(() => {
        updateCategoryScrollButtons();
        const container = categoryScrollRef.current;
        if (container) {
            container.addEventListener('scroll', updateCategoryScrollButtons);
            window.addEventListener('resize', updateCategoryScrollButtons);
            return () => {
                container.removeEventListener('scroll', updateCategoryScrollButtons);
                window.removeEventListener('resize', updateCategoryScrollButtons);
            };
        }
    }, [categories, updateCategoryScrollButtons]);

    // Category scroll by button
    const scrollCategoryBy = (direction: 'left' | 'right') => {
        if (categoryScrollRef.current) {
            const scrollAmount = 200;
            categoryScrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    // Category drag handlers
    const handleCategoryDragStart = useCallback((clientX: number) => {
        if (!categoryScrollRef.current) return;
        setIsCategoryDragging(true);
        setCategoryStartX(clientX);
        setCategoryScrollLeft(categoryScrollRef.current.scrollLeft);
        categoryDragDistanceRef.current = 0;
        wasCategoryDraggingRef.current = false;
    }, []);

    const handleCategoryDragMove = useCallback((clientX: number) => {
        if (!isCategoryDragging || !categoryScrollRef.current) return;
        const diff = clientX - categoryStartX;
        categoryDragDistanceRef.current = Math.abs(diff);
        if (categoryDragDistanceRef.current > 5) {
            wasCategoryDraggingRef.current = true;
        }
        categoryScrollRef.current.scrollLeft = categoryScrollLeft - diff;
    }, [isCategoryDragging, categoryStartX, categoryScrollLeft]);

    const handleCategoryDragEnd = useCallback(() => {
        setIsCategoryDragging(false);
        setTimeout(() => {
            categoryDragDistanceRef.current = 0;
            wasCategoryDraggingRef.current = false;
        }, 50);
    }, []);

    // Category touch/mouse events
    const handleCategoryTouchStart = (e: React.TouchEvent) => handleCategoryDragStart(e.touches[0].clientX);
    const handleCategoryTouchMove = (e: React.TouchEvent) => handleCategoryDragMove(e.touches[0].clientX);
    const handleCategoryTouchEnd = () => handleCategoryDragEnd();
    const handleCategoryMouseDown = (e: React.MouseEvent) => handleCategoryDragStart(e.clientX);
    const handleCategoryMouseMove = (e: React.MouseEvent) => handleCategoryDragMove(e.clientX);
    const handleCategoryMouseUp = () => handleCategoryDragEnd();
    const handleCategoryMouseLeave = () => { if (isCategoryDragging) handleCategoryDragEnd(); };

    const handleCategoryClick = (categoryId: string | number) => {
        if (!wasCategoryDraggingRef.current) {
            setActiveCategory(categoryId);
            
            // Check if caching is enabled and if this category was already fetched recently
            const shouldSkipServerQuery = !config.disableCache && 
                isCategoryFetched(categoryId, config.productsCacheDuration);
            
            if (shouldSkipServerQuery) {
                console.log(`[Cache] Category ${categoryId} was fetched recently, skipping server query`);
                // Just update the active category, client-side filtering will handle the rest
                return;
            }
            
            // Update searchFilters to trigger a background server query for this category
            console.log(`[Cache] Category ${categoryId} needs fresh data, triggering server query`);
            
            if (categoryId === 'all') {
                // Remove category filter for "All"
                const { category_id, ...restFilters } = searchFilters || {};
                setSearchFilters(restFilters);
                // Mark 'all' as fetched
                if (!config.disableCache) {
                    markCategoryFetched('all');
                }
            } else {
                // Add category filter
                setSearchFilters({
                    ...searchFilters,
                    category_id: categoryId,
                });
                // Mark this category as fetched
                if (!config.disableCache) {
                    markCategoryFetched(categoryId);
                }
            }
        }
    };

    // Products carousel navigation
    const scrollPrev = useCallback(() => {
        if (canScrollPrev && !isAnimating) {
            setIsAnimating(true);
            setCurrentPage(prev => prev - 1);
            setTimeout(() => setIsAnimating(false), 300);
        }
    }, [canScrollPrev, isAnimating]);

    const scrollNext = useCallback(() => {
        if (canScrollNext && !isAnimating) {
            setIsAnimating(true);
            setCurrentPage(prev => prev + 1);
            setTimeout(() => setIsAnimating(false), 300);
        }
    }, [canScrollNext, isAnimating]);

    // Products carousel drag handlers
    const handleDragStart = useCallback((clientX: number) => {
        if (isAnimating) return;
        setIsDragging(true);
        setStartX(clientX);
        setTranslateX(0);
    }, [isAnimating]);

    const handleDragMove = useCallback((clientX: number) => {
        if (!isDragging) return;
        const diff = clientX - startX;
        const maxDrag = 150;
        const resistance = 0.3;

        if ((diff > 0 && !canScrollPrev) || (diff < 0 && !canScrollNext)) {
            setTranslateX(diff * resistance);
        } else {
            setTranslateX(Math.max(-maxDrag, Math.min(maxDrag, diff)));
        }
    }, [isDragging, startX, canScrollPrev, canScrollNext]);

    const handleDragEnd = useCallback(() => {
        if (!isDragging) return;
        setIsDragging(false);

        const threshold = 50;

        if (translateX > threshold && canScrollPrev) {
            scrollPrev();
        } else if (translateX < -threshold && canScrollNext) {
            scrollNext();
        }

        setTranslateX(0);
    }, [isDragging, translateX, canScrollPrev, canScrollNext, scrollPrev, scrollNext]);

    // Products carousel touch/mouse events
    const handleTouchStart = (e: React.TouchEvent) => handleDragStart(e.touches[0].clientX);
    const handleTouchMove = (e: React.TouchEvent) => handleDragMove(e.touches[0].clientX);
    const handleTouchEnd = () => handleDragEnd();
    const handleMouseDown = (e: React.MouseEvent) => handleDragStart(e.clientX);
    const handleMouseMove = (e: React.MouseEvent) => handleDragMove(e.clientX);
    const handleMouseUp = () => handleDragEnd();
    const handleMouseLeave = () => { if (isDragging) handleDragEnd(); };

    // Helper function to get product price
    const getProductPrice = (product: Product): string | null => {
        if (!showPrice && !config.showPrice) return null;

        const price = product.prices?.find(p => p.pricelist_id === tab?.order?.pricelist_id)?.price;
        const fallbackPrice = price || product.prices?.[0]?.price;

        if (fallbackPrice) {
            const numericPrice = typeof fallbackPrice === 'string' 
                ? parseFloat(fallbackPrice) 
                : fallbackPrice;
            if (!isNaN(numericPrice)) {
                return priceFormatter(numericPrice, 'CLP');
            }
            return String(fallbackPrice);
        }

        return null;
    };

    // Get product image - check multiple sources like KioskContext
    const getProductImage = (product: any): string | null => {
        // 1. Check gallery.primary_image_url (from GalleryResource accessor)
        if ((product.gallery as any)?.primary_image_url) {
            return (product.gallery as any).primary_image_url;
        }
        
        // 2. Try gallery images with specific sizes
        const primaryImageId = product.gallery?.primary_image_id;
        const primaryImage = product.gallery?.images?.find((img: any) => img.id === primaryImageId);
        if (primaryImage) {
            return primaryImage.medium || primaryImage.preview || primaryImage.original || (primaryImage as any).url;
        }
        
        // 3. Fallback to first gallery image
        const firstImage = product.gallery?.images?.[0];
        if (firstImage) {
            return firstImage.medium || firstImage.preview || firstImage.original || (firstImage as any).url;
        }
        
        // 4. Check product's own images (Spatie Media Library)
        if ((product as any).primary_product_image_url) {
            return (product as any).primary_product_image_url;
        }
        
        // 5. Check product images array
        if ((product as any).images?.[0]?.url) {
            return (product as any).images[0].url;
        }
        
        return null;
    };

    // Product card click handler
    const handleProductCardClick = (product: Product, wasDragging: boolean) => {
        if (!wasDragging) {
            handleProductClick(product);
        }
    };

    // Render loading state
    if (isLoadingCategories || isLoadingProducts) {
        return (
            <Box sx={{ width: '100%' }}>
                {/* Category skeleton - only show if hideCategorySelector is false */}
                {!config.hideCategorySelector && (
                    <Box sx={{ display: 'flex', gap: 1, p: 1, mb: 2 }}>
                        {[...Array(6)].map((_, index) => (
                            <Skeleton key={index} variant="rectangular" width={80} height={40} sx={{ borderRadius: 2 }} />
                        ))}
                    </Box>
                )}
                {/* Products skeleton - adapt to horizontal scroll or grid mode */}
                {config.useHorizontalScroll ? (
                    // Horizontal scroll skeleton
                    <Box sx={{ display: 'flex', gap: 1.5, p: 1, overflow: 'hidden' }}>
                        {[...Array(6)].map((_, index) => (
                            <Skeleton 
                                key={index} 
                                variant="rectangular" 
                                width={config.horizontalScrollCardWidth} 
                                height={config.horizontalScrollCardHeight} 
                                sx={{ borderRadius: 2, flexShrink: 0 }} 
                            />
                        ))}
                    </Box>
                ) : (
                    // Grid skeleton for pagination mode
                    <Box sx={{ p: 2 }}>
                        <Grid container spacing={2}>
                            {[...Array(currentItemsPerPage)].map((_, index) => (
                                <Grid 
                                    size={{ 
                                        xs: 12 / config.gridColumnsXs,
                                        sm: 12 / config.gridColumnsSm, 
                                        md: 12 / config.gridColumnsMd, 
                                        lg: 12 / config.gridColumnsLg 
                                    }} 
                                    key={index}
                                >
                                    <Skeleton variant="rectangular" sx={{ width: '100%', minHeight: 200, borderRadius: 2 }} />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
           
            {/* Search Box - Now handled by separate ProductSearchBox component in schema */}

            {/* Category Navigation - hidden when using external CategorySelector */}
            {!config.hideCategorySelector && (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    //borderBottom: 1,
                    borderColor: 'divider',
                    //backgroundColor: 'background.paper',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                }}
            >
                {/* Left scroll button */}
                <IconButton
                    onClick={() => scrollCategoryBy('left')}
                    disabled={!canScrollCategoryLeft}
                    size="small"
                    sx={{
                        ml: 0.5,
                        opacity: canScrollCategoryLeft ? 1 : 0.3,
                        transition: 'opacity 0.2s',
                    }}
                >
                    <ChevronLeftIcon />
                </IconButton>

                {/* Swipeable categories container */}
                <Box
                    ref={categoryScrollRef}
                    sx={{
                        display: 'flex',
                        gap: 1,
                        p: 1,
                        overflowX: 'auto',
                        scrollbarWidth: 'none',
                        '&::-webkit-scrollbar': { display: 'none' },
                        flexGrow: 1,
                        cursor: isCategoryDragging ? 'grabbing' : 'grab',
                        userSelect: 'none',
                    }}
                    onTouchStart={handleCategoryTouchStart}
                    onTouchMove={handleCategoryTouchMove}
                    onTouchEnd={handleCategoryTouchEnd}
                    onMouseDown={handleCategoryMouseDown}
                    onMouseMove={handleCategoryMouseMove}
                    onMouseUp={handleCategoryMouseUp}
                    onMouseLeave={handleCategoryMouseLeave}
                >
                    {categories.map((category) => (
                        <Chip
                            key={category.id}
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <span>{category.icon}</span>
                                    <span>{category.name}</span>
                                </Box>
                            }
                            onClick={() => handleCategoryClick(category.id)}
                            variant={activeCategory === category.id ? 'filled' : 'outlined'}
                            color={activeCategory === category.id ? 'primary' : 'default'}
                            sx={{
                                py: 2,
                                px: 1,
                                fontSize: '0.875rem',
                                fontWeight: activeCategory === category.id ? 600 : 400,
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    transform: 'scale(1.05)',
                                },
                                flexShrink: 0,
                            }}
                        />
                    ))}
                </Box>

                {/* Right scroll button */}
                <IconButton
                    onClick={() => scrollCategoryBy('right')}
                    disabled={!canScrollCategoryRight}
                    size="small"
                    sx={{
                        mr: 0.5,
                        opacity: canScrollCategoryRight ? 1 : 0.3,
                        transition: 'opacity 0.2s',
                    }}
                >
                    <ChevronRightIcon />
                </IconButton>
            </Box>
            )}

            {/* Background Loading Indicator */}
            {isLoadingMore && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 2,
                        boxShadow: 1,
                        zIndex: 20,
                    }}
                >
                    <Box
                        sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            border: '2px solid',
                            borderColor: 'primary.main',
                            borderTopColor: 'transparent',
                            animation: 'spin 1s linear infinite',
                            '@keyframes spin': {
                                '0%': { transform: 'rotate(0deg)' },
                                '100%': { transform: 'rotate(360deg)' },
                            },
                        }}
                    />
                    <Typography variant="caption" color="text.secondary">
                        {translate('tab.products.updating')}
                    </Typography>
                </Box>
            )}

            {/* Products Display - Horizontal Scroll or Carousel */}
            {filteredProducts.length === 0 ? (
                <Box
                    sx={{
                        minHeight: 300,
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        color: 'text.secondary',
                    }}
                >
                    <Typography variant="h2" sx={{ mb: 2, opacity: 0.3 }}>🍽️</Typography>
                    <Typography variant="h6" sx={{ textAlign: 'center' }}>
                        {isLoadingMore ? translate('tab.products.loading') : translate('tab.products.no_products_category')}
                    </Typography>
                </Box>
            ) : config.useHorizontalScroll ? (
                /* ========== HORIZONTAL SCROLL MODE ========== */
                <Box sx={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    {/* Left Navigation Arrow - Only on md+ screens */}
                    {(isMd || isLg) && canScrollHorizontalLeft && (
                        <IconButton
                            onClick={scrollHorizontalLeft}
                            sx={{
                                position: 'absolute',
                                left: 0,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                height: 48,
                                width: 48,
                                borderRadius: '50%',
                                backgroundColor: 'primary.main',
                                color: 'primary.contrastText',
                                opacity: 0.9,
                                transition: 'opacity 0.2s, transform 0.2s',
                                '&:hover': { 
                                    backgroundColor: 'primary.dark', 
                                    opacity: 1,
                                    transform: 'translateY(-50%) scale(1.1)',
                                },
                                boxShadow: 3,
                                zIndex: 10,
                            }}
                        >
                            <ChevronLeftIcon sx={{ fontSize: 28 }} />
                        </IconButton>
                    )}
                    
                    {/* Right Navigation Arrow - Only on md+ screens */}
                    {(isMd || isLg) && canScrollHorizontalRight && (
                        <IconButton
                            onClick={scrollHorizontalRight}
                            sx={{
                                position: 'absolute',
                                right: 0,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                height: 48,
                                width: 48,
                                borderRadius: '50%',
                                backgroundColor: 'primary.main',
                                color: 'primary.contrastText',
                                opacity: 0.9,
                                transition: 'opacity 0.2s, transform 0.2s',
                                '&:hover': { 
                                    backgroundColor: 'primary.dark', 
                                    opacity: 1,
                                    transform: 'translateY(-50%) scale(1.1)',
                                },
                                boxShadow: 3,
                                zIndex: 10,
                            }}
                        >
                            <ChevronRightIcon sx={{ fontSize: 28 }} />
                        </IconButton>
                    )}
                    
                    {/* Horizontal scrolling products container */}
                    <Box
                        ref={horizontalScrollRef}
                        onScroll={updateHorizontalScrollArrows}
                        sx={{
                            display: 'flex',
                            overflowX: 'auto',
                            overflowY: 'hidden',
                            gap: 1.5,
                            px: 1,
                            py: 1,
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'rgba(0,0,0,0.2) transparent',
                            '&::-webkit-scrollbar': {
                                height: 6,
                            },
                            '&::-webkit-scrollbar-track': {
                                backgroundColor: 'transparent',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: 'rgba(0,0,0,0.2)',
                                borderRadius: 3,
                            },
                            // Use CSS scroll snap for better UX
                            scrollSnapType: 'x mandatory',
                            WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
                        }}
                    >
                        {/* Group products into rows - responsive based on screen size */}
                        {(() => {
                            // Determine rows based on screen size
                            let rows: number;
                            if (isXs) {
                                rows = config.horizontalScrollRowsXs ?? config.horizontalScrollRows ?? 1;
                            } else if (isSm) {
                                rows = config.horizontalScrollRowsSm ?? config.horizontalScrollRows ?? 2;
                            } else {
                                rows = config.horizontalScrollRowsMd ?? config.horizontalScrollRows ?? 2;
                            }
                            const cardWidth = config.horizontalScrollCardWidth || 140;
                            const cardHeight = config.horizontalScrollCardHeight || 180;
                            
                            if (rows === 1) {
                                // Single row - just render products inline
                                return filteredProducts.map((product, index) => (
                                    <Box
                                        key={`product-${product.id}-${index}`}
                                        sx={{
                                            flexShrink: 0,
                                            width: cardWidth,
                                            scrollSnapAlign: 'start',
                                        }}
                                    >
                                        <ProductCard
                                            product={product}
                                            onProductClick={handleProductCardClick}
                                            getProductPrice={getProductPrice}
                                            getProductImage={getProductImage}
                                            showPrice={config.showPrice}
                                        />
                                    </Box>
                                ));
                            }
                            
                            // Multiple rows - group products into columns
                            const columns: Product[][] = [];
                            for (let i = 0; i < filteredProducts.length; i += rows) {
                                columns.push(filteredProducts.slice(i, i + rows));
                            }
                            
                            return columns.map((column, colIndex) => (
                                <Box
                                    key={`col-${colIndex}`}
                                    sx={{
                                        flexShrink: 0,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 1,
                                        scrollSnapAlign: 'start',
                                    }}
                                >
                                    {column.map((product, rowIndex) => (
                                        <Box
                                            key={`product-${product.id}-${colIndex}-${rowIndex}`}
                                            sx={{
                                                width: cardWidth,
                                                height: cardHeight,
                                            }}
                                        >
                                            <ProductCard
                                                product={product}
                                                onProductClick={handleProductCardClick}
                                                getProductPrice={getProductPrice}
                                                getProductImage={getProductImage}
                                                showPrice={config.showPrice}
                                            />
                                        </Box>
                                    ))}
                                </Box>
                            ));
                        })()}
                    </Box>
                    
                    {/* Products count indicator */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            py: 0.5,
                        }}
                    >
                        <Typography variant="caption" color="text.secondary">
                            {filteredProducts.length} productos
                        </Typography>
                    </Box>
                </Box>
            ) : (
                /* ========== PAGINATION/CAROUSEL MODE (Original) ========== */
                <Box sx={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    {/* Swipeable Products Container with Side Arrows */}
                    <Box sx={{ position: 'relative' }}>
                        {/* Left Side Arrow - conditionally rendered based on hideNavigationButtons */}
                        {!config.hideNavigationButtons && (
                            <IconButton
                                onClick={scrollPrev}
                                disabled={!canScrollPrev || isAnimating}
                                sx={{
                                    position: 'absolute',
                                    left: 4,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    height: 48,
                                    width: 48,
                                    borderRadius: '50%',
                                    backgroundColor: 'primary.main',
                                    color: 'primary.contrastText',
                                    opacity: canScrollPrev ? 0.9 : 0,
                                    pointerEvents: canScrollPrev ? 'auto' : 'none',
                                    transition: 'opacity 0.2s',
                                    '&:hover': { backgroundColor: 'primary.dark', opacity: 1 },
                                    boxShadow: 3,
                                    zIndex: 10,
                                }}
                            >
                                <ChevronLeftIcon sx={{ fontSize: 28 }} />
                            </IconButton>
                        )}

                        {/* Right Side Arrow - conditionally rendered based on hideNavigationButtons */}
                        {!config.hideNavigationButtons && (
                            <IconButton
                                onClick={scrollNext}
                                disabled={!canScrollNext || isAnimating}
                                sx={{
                                    position: 'absolute',
                                    right: 4,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    height: 48,
                                    width: 48,
                                    borderRadius: '50%',
                                    backgroundColor: 'primary.main',
                                    color: 'primary.contrastText',
                                    opacity: canScrollNext ? 0.9 : 0,
                                    pointerEvents: canScrollNext ? 'auto' : 'none',
                                    transition: 'opacity 0.2s',
                                    '&:hover': { backgroundColor: 'primary.dark', opacity: 1 },
                                    boxShadow: 3,
                                    zIndex: 10,
                                }}
                            >
                                <ChevronRightIcon sx={{ fontSize: 28 }} />
                            </IconButton>
                        )}

                        {/* Products Carousel Inner */}
                        <Box
                            ref={containerRef}
                            sx={{
                                overflow: 'hidden',
                                position: 'relative',
                                cursor: isDragging ? 'grabbing' : 'grab',
                                userSelect: 'none',
                                touchAction: 'pan-y pinch-zoom',
                            }}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseLeave}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    transform: `translateX(calc(-${currentPage * 100}% + ${translateX}px))`,
                                    transition: isDragging ? 'none' : 'transform 0.3s ease-out',
                                }}
                            >
                                {pages.map((pageProducts, pageIndex) => (
                                    <Box
                                        key={pageIndex}
                                        sx={{
                                            flex: '0 0 100%',
                                            minWidth: 0,
                                            px: 2,
                                            py: 2,
                                        }}
                                    >
                                        <Grid container spacing={2}>
                                            {pageProducts.map((product, productIndex) => (
                                                <Grid 
                                                    size={{ 
                                                        xs: 12 / config.gridColumnsXs,
                                                        sm: 12 / config.gridColumnsSm, 
                                                        md: 12 / config.gridColumnsMd, 
                                                        lg: 12 / config.gridColumnsLg 
                                                    }} 
                                                    key={`page-${pageIndex}-product-${product.id}-${productIndex}`}
                                                >
                                                    <ProductCard
                                                        product={product}
                                                        onProductClick={handleProductCardClick}
                                                        getProductPrice={getProductPrice}
                                                        getProductImage={getProductImage}
                                                        showPrice={config.showPrice}
                                                    />
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </Box>

                    {/* Bottom Pagination with Dots */}
                    {totalPages > 1 && (
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: 1,
                                px: 2,
                                py: 1.5,
                                //borderTop: 1,
                                //borderColor: 'divider',
                               // backgroundColor: 'background.paper',
                            }}
                        >
                            <IconButton
                                onClick={scrollPrev}
                                disabled={!canScrollPrev || isAnimating}
                                size="small"
                                sx={{
                                    backgroundColor: canScrollPrev ? 'primary.main' : 'action.disabledBackground',
                                    color: canScrollPrev ? 'primary.contrastText' : 'text.disabled',
                                    '&:hover': {
                                        backgroundColor: canScrollPrev ? 'primary.dark' : 'action.disabledBackground',
                                    },
                                    '&.Mui-disabled': {
                                        backgroundColor: 'action.disabledBackground',
                                        color: 'text.disabled',
                                    },
                                }}
                            >
                                <ChevronLeftIcon fontSize="small" />
                            </IconButton>

                            {/* Page number display */}
                            <Typography variant="caption" sx={{ color: 'text.secondary', minWidth: 60, textAlign: 'center' }}>
                                {currentPage + 1} / {totalPages}
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
                                {(() => {
                                    // Calculate visible page range (5 pages centered on current)
                                    const maxVisible = 5;
                                    let startPage = Math.max(0, currentPage - Math.floor(maxVisible / 2));
                                    let endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);
                                    
                                    // Adjust start if we're near the end
                                    if (endPage - startPage < maxVisible - 1) {
                                        startPage = Math.max(0, endPage - maxVisible + 1);
                                    }
                                    
                                    const visiblePages: number[] = [];
                                    for (let i = startPage; i <= endPage; i++) {
                                        visiblePages.push(i);
                                    }
                                    
                                    return visiblePages.map((index) => (
                                        <Tooltip key={index} title={`Página ${index + 1}`} arrow>
                                            <Box
                                                onClick={() => !isAnimating && setCurrentPage(index)}
                                                sx={{
                                                    width: currentPage === index ? 24 : 10,
                                                    height: 10,
                                                    borderRadius: 5,
                                                    backgroundColor: currentPage === index ? 'primary.main' : 'action.disabled',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': {
                                                        backgroundColor: currentPage === index ? 'primary.main' : 'action.hover',
                                                        transform: 'scale(1.2)',
                                                    },
                                                }}
                                            />
                                        </Tooltip>
                                    ));
                                })()}
                            </Box>

                            <IconButton
                                onClick={scrollNext}
                                disabled={!canScrollNext || isAnimating}
                                size="small"
                                sx={{
                                    backgroundColor: canScrollNext ? 'primary.main' : 'action.disabledBackground',
                                    color: canScrollNext ? 'primary.contrastText' : 'text.disabled',
                                    '&:hover': {
                                        backgroundColor: canScrollNext ? 'primary.dark' : 'action.disabledBackground',
                                    },
                                    '&.Mui-disabled': {
                                        backgroundColor: 'action.disabledBackground',
                                        color: 'text.disabled',
                                    },
                                }}
                            >
                                <ChevronRightIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    )}
                </Box>
            )}

            {/* Improved Modifier Selection Dialog (Kiosk-style) */}
            <Dialog
                open={dialogOpen}
                onClose={handleDialogCancel}
                fullWidth
                maxWidth="sm"
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        maxHeight: '90vh',
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        pb: 1,
                        borderBottom: 1,
                        borderColor: 'divider',
                        bgcolor: alpha(theme.palette.primary.main, 0.03),
                    }}
                >
                    <Typography variant="h5" component="span" fontWeight={700} color="primary">
                        {selectedProduct?.name}
                    </Typography>
                    {selectedProduct?.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {selectedProduct.description}
                        </Typography>
                    )}
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    {selectedProduct && (
                        <ModifierGroupsRenderer
                            product={selectedProduct}
                            selectedModifiers={selectedModifiers}
                            onModifierChange={handleModifierChange}
                            getProductPrice={getProductPrice}
                            tab={tab}
                            translate={translate}
                        />
                    )}
                </DialogContent>
                <DialogActions
                    sx={{
                        p: 2,
                        pt: 1.5,
                        borderTop: 1,
                        borderColor: 'divider',
                        bgcolor: 'background.default',
                    }}
                >
                    <Button 
                        onClick={handleDialogCancel} 
                        color="inherit" 
                        size="large"
                        sx={{ px: 3 }}
                    >
                        {translate('ra.action.cancel', { _: 'Cancelar' })}
                    </Button>
                    <Button 
                        onClick={handleDialogConfirm} 
                        variant="contained" 
                        color="primary"
                        size="large"
                        sx={{
                            minWidth: 180,
                            py: 1.5,
                            fontWeight: 700,
                            fontSize: '1rem',
                            borderRadius: 2,
                        }}
                    >
                        {translate('ra.action.add', { _: 'Agregar' })} — {selectedProduct ? calculateModifierTotal(selectedProduct, selectedModifiers, tab) : ''}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

// ProductCard subcomponent
interface ProductCardProps {
    product: Product;
    onProductClick: (product: Product, wasDragging: boolean) => void;
    getProductPrice: (product: Product) => string | null;
    getProductImage: (product: Product) => string | null;
    showPrice: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
    product,
    onProductClick,
    getProductPrice,
    getProductImage,
    showPrice,
}) => {
    const startPosRef = useRef({ x: 0, y: 0 });
    const wasDraggingRef = useRef(false);

    const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        startPosRef.current = { x: clientX, y: clientY };
        wasDraggingRef.current = false;
    };

    const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const dx = Math.abs(clientX - startPosRef.current.x);
        const dy = Math.abs(clientY - startPosRef.current.y);
        if (dx > 10 || dy > 10) {
            wasDraggingRef.current = true;
        }
    };

    const handleCardClick = () => {
        onProductClick(product, wasDraggingRef.current);
    };

    const image = getProductImage(product);
    const price = getProductPrice(product);

    return (
        <Card
            onClick={handleCardClick}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            sx={{
                height: 180,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: 4,
                },
                '&:active': {
                    transform: 'scale(0.98)',
                },
            }}
        >
            {/* Background Image */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'grey.200',
                }}
            >
                {image ? (
                    <img
                        src={image}
                        alt={product.name}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                ) : (
                    <Box
                        sx={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <RestaurantIcon sx={{ fontSize: 48, opacity: 0.2, color: 'grey.500' }} />
                    </Box>
                )}
            </Box>

            {/* Gradient Overlay */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.7) 100%)',
                }}
            />

            {/* Content Overlay */}
            <Box
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    p: 1.5,
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                }}
            >
                {/* Product Name */}
                <Typography
                    variant="subtitle2"
                    sx={{
                        color: 'white',
                        fontWeight: 600,
                        textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                    }}
                >
                    {product.name}
                </Typography>

                {/* Bottom Section - Price and Add Button */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    {showPrice && price && (
                        <Typography
                            variant="subtitle1"
                            sx={{
                                color: 'white',
                                fontWeight: 700,
                                textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                            }}
                        >
                            {price}
                        </Typography>
                    )}
                    <IconButton
                        size="small"
                        sx={{
                            backgroundColor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'primary.dark',
                            },
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onProductClick(product, false);
                        }}
                    >
                        <AddIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Box>
        </Card>
    );
};

export default TabOrderProductsSelector;
