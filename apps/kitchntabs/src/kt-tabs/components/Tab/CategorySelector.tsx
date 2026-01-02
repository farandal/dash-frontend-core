import React, { useRef, useState, useEffect, useCallback, memo } from 'react';
import { Box, Chip, IconButton, Skeleton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import { useDataProvider, useTranslate } from 'react-admin';
import { useTabManagerOptional } from '../contexts/TabManagerContext';

/**
 * Configuration for CategorySelector component
 */
export interface ICategorySelectorConfig {
    /** Category resource endpoint */
    categoryResource?: string;
    /** Cache duration in milliseconds for categories (default: 1 hour) */
    categoryCacheDuration?: number;
    /** Disable caching entirely */
    disableCache?: boolean;
    /** Show "All" category chip */
    showAllCategory?: boolean;
    /** Label for "All" category */
    allCategoryLabel?: string;
    /** Icon for "All" category */
    allCategoryIcon?: string;
}

export interface ICategorySelectorProps extends IDashAutoAdminCustomFieldComponent {
    config?: ICategorySelectorConfig;
}

interface Category {
    id: string | number;
    name: string;
    icon?: string;
}

// Default configuration will use translation
const getDefaultConfig = (translate: any): Required<ICategorySelectorConfig> => ({
    categoryResource: 'ecommerce/category',
    categoryCacheDuration: 60 * 60 * 1000, // 1 hour
    disableCache: false,
    showAllCategory: true,
    allCategoryLabel: translate('category.all'),
    allCategoryIcon: '📋',
});

// Cache key
const CATEGORY_CACHE_KEY = 'category_selector_categories';

// Cache interface
interface CacheEntry<T> {
    data: T;
    timestamp: number;
    resource: string;
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
        console.error(`[CategorySelector] Error reading cache for ${key}:`, error);
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
        console.error(`[CategorySelector] Error writing cache for ${key}:`, error);
    }
};

/**
 * Inner component for displaying the category chips
 */
const CategoryChips = memo(function CategoryChips({
    categories,
    activeCategory,
    onCategoryClick,
    categoryScrollRef,
    canScrollLeft,
    canScrollRight,
    scrollCategoryBy,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    isDragging,
}: {
    categories: Category[];
    activeCategory: string | number;
    onCategoryClick: (categoryId: string | number) => void;
    categoryScrollRef: React.RefObject<HTMLDivElement | null>;
    canScrollLeft: boolean;
    canScrollRight: boolean;
    scrollCategoryBy: (direction: 'left' | 'right') => void;
    handleTouchStart: (e: React.TouchEvent) => void;
    handleTouchMove: (e: React.TouchEvent) => void;
    handleTouchEnd: () => void;
    handleMouseDown: (e: React.MouseEvent) => void;
    handleMouseMove: (e: React.MouseEvent) => void;
    handleMouseUp: () => void;
    handleMouseLeave: () => void;
    isDragging: boolean;
}) {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 10,
            }}
        >
            {/* Left scroll button */}
            <IconButton
                onClick={() => scrollCategoryBy('left')}
                disabled={!canScrollLeft}
                size="small"
                sx={{
                    ml: 0.5,
                    opacity: canScrollLeft ? 1 : 0.3,
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
                    cursor: isDragging ? 'grabbing' : 'grab',
                    userSelect: 'none',
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
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
                        onClick={() => onCategoryClick(category.id)}
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
                disabled={!canScrollRight}
                size="small"
                sx={{
                    mr: 0.5,
                    opacity: canScrollRight ? 1 : 0.3,
                    transition: 'opacity 0.2s',
                }}
            >
                <ChevronRightIcon />
            </IconButton>
        </Box>
    );
});

/**
 * Loading skeleton for category selector
 */
const CategorySelectorSkeleton = memo(function CategorySelectorSkeleton() {
    return (
        <Box sx={{ display: 'flex', gap: 1, p: 1, overflow: 'hidden' }}>
            {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton
                    key={i}
                    variant="rounded"
                    width={80}
                    height={32}
                    sx={{ borderRadius: 4, flexShrink: 0 }}
                />
            ))}
        </Box>
    );
});

/**
 * Category Selector for Create mode
 */
const CategorySelectorCreate: React.FC<ICategorySelectorProps> = ({ resourceConfig, attribute, config: propConfig }) => {
    const translate = useTranslate();
    const DEFAULT_CONFIG = getDefaultConfig(translate);
    const config = { ...DEFAULT_CONFIG, ...propConfig };
    const dataProvider = useDataProvider();
    const tabManager = useTabManagerOptional();

    // State
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeCategory, setActiveCategory] = useState<string | number>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartX, setDragStartX] = useState(0);
    const [scrollStartX, setScrollStartX] = useState(0);

    // Refs
    const categoryScrollRef = useRef<HTMLDivElement>(null);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            setIsLoading(true);

            // Check cache first
            if (!config.disableCache) {
                const cached = getCachedData<Category[]>(CATEGORY_CACHE_KEY, config.categoryCacheDuration);
                if (cached) {
                    const allCategory: Category = { id: 'all', name: config.allCategoryLabel, icon: config.allCategoryIcon };
                    setCategories(config.showAllCategory ? [allCategory, ...cached] : cached);
                    setIsLoading(false);
                    return;
                }
            }

            try {
                const response = await dataProvider.getList(config.categoryResource, {
                    pagination: { page: 1, perPage: 100 },
                    sort: { field: 'id', order: 'ASC' },
                    filter: {},
                });

                const fetchedCategories: Category[] = response.data.map((cat: any) => ({
                    id: cat.id,
                    name: cat.name,
                    icon: cat.icon || '📁',
                }));

                // Cache the fetched categories
                if (!config.disableCache) {
                    setCachedData(CATEGORY_CACHE_KEY, fetchedCategories, config.categoryResource);
                }

                const allCategory: Category = { id: 'all', name: config.allCategoryLabel, icon: config.allCategoryIcon };
                setCategories(config.showAllCategory ? [allCategory, ...fetchedCategories] : fetchedCategories);
            } catch (error) {
                console.error('[CategorySelector] Error fetching categories:', error);
                // Set at least the "All" category on error
                if (config.showAllCategory) {
                    setCategories([{ id: 'all', name: config.allCategoryLabel, icon: config.allCategoryIcon }]);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, [dataProvider, config.categoryResource, config.disableCache, config.categoryCacheDuration, config.showAllCategory, config.allCategoryLabel, config.allCategoryIcon]);

    // Update scroll buttons visibility
    const updateScrollButtons = useCallback(() => {
        if (categoryScrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
        }
    }, []);

    // Set up scroll event listener
    useEffect(() => {
        const container = categoryScrollRef.current;
        if (container) {
            container.addEventListener('scroll', updateScrollButtons);
            updateScrollButtons();
            return () => container.removeEventListener('scroll', updateScrollButtons);
        }
    }, [updateScrollButtons, categories]);

    // Scroll category function
    const scrollCategoryBy = useCallback((direction: 'left' | 'right') => {
        if (categoryScrollRef.current) {
            const scrollAmount = 200;
            categoryScrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    }, []);

    // Handle category click
    const handleCategoryClick = useCallback((categoryId: string | number) => {
        setActiveCategory(categoryId);
        // Notify TabManager if available - use setSearchFilters for category filtering
        if (tabManager?.setSearchFilters) {
            if (categoryId === 'all') {
                // Remove category filter
                tabManager.setSearchFilters({});
            } else {
                // Set category filter
                tabManager.setSearchFilters({ category_id: categoryId });
            }
        }
    }, [tabManager]);

    // Touch handlers
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        setDragStartX(e.touches[0].clientX);
        setScrollStartX(categoryScrollRef.current?.scrollLeft || 0);
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!categoryScrollRef.current) return;
        const deltaX = dragStartX - e.touches[0].clientX;
        categoryScrollRef.current.scrollLeft = scrollStartX + deltaX;
    }, [dragStartX, scrollStartX]);

    const handleTouchEnd = useCallback(() => {
        updateScrollButtons();
    }, [updateScrollButtons]);

    // Mouse handlers
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStartX(e.clientX);
        setScrollStartX(categoryScrollRef.current?.scrollLeft || 0);
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging || !categoryScrollRef.current) return;
        const deltaX = dragStartX - e.clientX;
        categoryScrollRef.current.scrollLeft = scrollStartX + deltaX;
    }, [isDragging, dragStartX, scrollStartX]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        updateScrollButtons();
    }, [updateScrollButtons]);

    const handleMouseLeave = useCallback(() => {
        if (isDragging) {
            setIsDragging(false);
            updateScrollButtons();
        }
    }, [isDragging, updateScrollButtons]);

    if (isLoading) {
        return <CategorySelectorSkeleton />;
    }

    return (
        <CategoryChips
            categories={categories}
            activeCategory={activeCategory}
            onCategoryClick={handleCategoryClick}
            categoryScrollRef={categoryScrollRef}
            canScrollLeft={canScrollLeft}
            canScrollRight={canScrollRight}
            scrollCategoryBy={scrollCategoryBy}
            handleTouchStart={handleTouchStart}
            handleTouchMove={handleTouchMove}
            handleTouchEnd={handleTouchEnd}
            handleMouseDown={handleMouseDown}
            handleMouseMove={handleMouseMove}
            handleMouseUp={handleMouseUp}
            handleMouseLeave={handleMouseLeave}
            isDragging={isDragging}
        />
    );
};

/**
 * Category Selector for Edit mode (same as Create)
 */
const CategorySelectorEdit: React.FC<ICategorySelectorProps> = (props) => {
    return <CategorySelectorCreate {...props} />;
};

/**
 * Category Selector for View mode (display only, no interaction)
 */
const CategorySelectorView: React.FC<ICategorySelectorProps> = (props) => {
   
    return <CategorySelectorCreate {...props} />;
};

/**
 * Category Selector for List mode
 */
const CategorySelectorList: React.FC<ICategorySelectorProps> = () => {
    // In list mode, we don't show the category selector
    return null;
};

/**
 * CategorySelector - Schema-compatible component following ASampleComponent pattern
 *
 * This component provides category filtering chips for product selection.
 * It follows the dash-auto-admin component pattern with method-based rendering.
 *
 * @example
 * // In schema:
 * {
 *   attribute: 'category_filter',
 *   tab: 'Productos',
 *   label: '',
 *   type: String,
 *   inCreate: true,
 *   inEdit: true,
 *   inList: false,
 *   inShow: false,
 *   custom: true,
 *   component: CategorySelector,
 *   componentProps: {
 *     config: {
 *       categoryResource: 'ecommerce/category',
 *       showAllCategory: true,
 *       allCategoryLabel: 'Todos',
 *     }
 *   }
 * }
 */
const CategorySelector: React.FC<ICategorySelectorProps> = (props) => {
    const { method } = props;

    switch (method) {
        case 'create':
            return <CategorySelectorCreate {...props} />;
        case 'edit':
            return <CategorySelectorEdit {...props} />;
        case 'view':
            return <CategorySelectorView {...props} />;
        case 'list':
            return <CategorySelectorList {...props} />;
        default:
            // Default to create mode if method is not specified
            return <CategorySelectorCreate {...props} />;
    }
};

export default CategorySelector;
