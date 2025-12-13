import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useTranslate } from 'react-admin';
import { 
    Box, 
    Grid, 
    Typography, 
    Skeleton, 
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Button,
    CircularProgress,
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddIcon from '@mui/icons-material/Add';
import StarIcon from '@mui/icons-material/Star';
import TuneIcon from '@mui/icons-material/Tune';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { useMallOrderCreate, IMallProduct } from '../contexts/MallOrderCreateContext';

/**
 * Product card component
 */
interface MallProductCardProps {
    product: IMallProduct;
}

const MallProductCard: React.FC<MallProductCardProps> = ({ product }) => {
    const translate = useTranslate();
    const { addToCart, openModifierModal, formatPrice, getProductPrice } = useMallOrderCreate();
    
    const startPosRef = useRef({ x: 0, y: 0 });
    const wasDraggingRef = useRef(false);

    const handleAddToCart = () => {
        if (product.modifier_groups && product.modifier_groups.length > 0) {
            openModifierModal(product);
        } else {
            addToCart(product, {});
        }
    };

    const handleButtonClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        handleAddToCart();
    };

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
        if (!wasDraggingRef.current) {
            handleAddToCart();
        }
    };

    // Get primary image
    const imageUrl = product.gallery?.primary_image_url || 
                     (product.gallery?.images?.[0]?.url) || 
                     null;

    // Get price using context function
    const price = getProductPrice(product);
    
    // Check if product has modifiers
    const hasModifiers = product.modifier_groups && product.modifier_groups.length > 0;

    return (
        <Card
            className="kt-mall-product-card"
            onClick={handleCardClick}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
        >
            <Box className="kt-mall-product-card-badges">
                {product.featured && (
                    <StarIcon className="kt-mall-product-card-featured-icon" />
                )}
                
                {hasModifiers && (
                    <TuneIcon className="kt-mall-product-card-modifier-icon" />
                )}
            </Box>

            {/* Image Container */}
            <Box className="kt-mall-product-card-image-container">
                {imageUrl ? (
                    <CardMedia
                        component="img"
                        image={imageUrl}
                        alt={product.name}
                        className="kt-mall-product-card-image"
                    />
                ) : (
                    <Box className="kt-mall-product-card-image-placeholder">
                        <RestaurantIcon className="kt-mall-product-card-image-placeholder-icon" />
                    </Box>
                )}
                
                {/* Gradient overlay */}
                <Box className="kt-mall-product-card-gradient" />

               
            </Box>

            {/* Content */}
            <CardContent className="kt-mall-product-card-content">
                 {/* Tenant name */}
                <Typography
                    variant="caption"
                    color="text.secondary"
                    className="kt-mall-product-card-tenant"
                >
                    {product.tenant?.name}
                </Typography>
                {/* Price */}
                <Typography
                    variant="subtitle1"
                    className="kt-mall-product-card-price"
                >
                    {formatPrice(price)}
                </Typography>
                <Typography
                    variant="subtitle2"
                    className="kt-mall-product-card-name"
                >
                    {product.name}
                </Typography>
                {/* Description */}
                {product.description && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        className="kt-mall-product-card-description"
                    >
                        {product.description}
                    </Typography>
                )}
            </CardContent>

            {/* Add button */}
            <CardActions className="kt-mall-product-card-actions">
                <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleButtonClick}
                    className="kt-mall-product-card-add-button"
                >
                    {translate('mall.add')}
                </Button>
            </CardActions>
        </Card>
    );
};

/**
 * MallProductGrid - Product grid with horizontal infinite scroll carousel or vertical infinite scroll
 */
export const MallProductGrid: React.FC = () => {
    const translate = useTranslate();
    const {
        products,
        allProducts,
        isLoadingProducts,
        paginationMode,
        selectedStore,
        // Carousel pagination
        carouselProducts,
        isLoadingCarouselPage,
        hasMoreCarouselPages,
        loadNextCarouselPage,
        carouselCurrentPage,
        carouselTotalPages,
    } = useMallOrderCreate();

    // Horizontal scroll container ref
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const loadMoreTriggerRef = useRef<HTMLDivElement>(null);
    const [isNearEnd, setIsNearEnd] = useState(false);

    // Detect when scrolling near the end to load more
    const handleScroll = useCallback(() => {
        const container = scrollContainerRef.current;
        if (!container) return;
        
        const { scrollLeft, scrollWidth, clientWidth } = container;
        const scrollEnd = scrollWidth - clientWidth;
        const threshold = 200; // Load more when within 200px of end
        
        const nearEnd = scrollLeft >= scrollEnd - threshold;
        setIsNearEnd(nearEnd);
        
        // Trigger load when near end
        if (nearEnd && hasMoreCarouselPages && !isLoadingCarouselPage) {
            console.log('🔄 Near end of scroll, loading next page...');
            loadNextCarouselPage();
        }
    }, [hasMoreCarouselPages, isLoadingCarouselPage, loadNextCarouselPage]);

    // Attach scroll listener
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;
        
        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => container.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    // Loading state (initial load)
    if (isLoadingProducts && carouselProducts.length === 0) {
        return (
            <Box sx={{ p: { xs: 0.5, sm: 2 } }}>
                <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, overflowX: 'hidden' }}>
                    {[...Array(4)].map((_, index) => (
                        <Box key={index} sx={{ width: { xs: 120, sm: 160, md: 180 }, flexShrink: 0 }}>
                            <Skeleton 
                                variant="rectangular" 
                                sx={{ 
                                    width: '100%', 
                                    height: 180, 
                                    borderRadius: 2 
                                }} 
                            />
                            <Skeleton variant="text" sx={{ mt: 1 }} />
                            <Skeleton variant="text" width="60%" />
                        </Box>
                    ))}
                </Box>
            </Box>
        );
    }

    // Empty state - check both allProducts (for infinite mode) and carouselProducts (for horizontal mode)
    const productsToCheck = paginationMode === 'horizontal' ? carouselProducts : allProducts;
    if (productsToCheck.length === 0 && !isLoadingCarouselPage) {
        return (
            <Box
                sx={{
                    height: '100%',
                    minHeight: 300,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    color: 'text.secondary',
                    p: 4,
                }}
            >
                <Typography variant="h2" sx={{ mb: 2, opacity: 0.3 }}>🍽️</Typography>
                <Typography variant="h6">{translate('mall.no_products_found')}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {translate('mall.try_different_store_or_search')}
                </Typography>
            </Box>
        );
    }

    // Horizontal pagination mode
    // Horizontal infinite scroll carousel mode
    if (paginationMode === 'horizontal') {
        return (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {/* Page indicator */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        px: 2,
                        py: 0.5,
                        borderBottom: 1,
                        borderColor: 'divider',
                        backgroundColor: 'transparent',
                    }}
                >
                    <Typography variant="caption" color="text.secondary">
                        {carouselProducts.length} productos
                    </Typography>
                    {hasMoreCarouselPages && (
                        <Typography variant="caption" color="primary">
                            Desliza →
                        </Typography>
                    )}
                </Box>

                {/* Products horizontal scroll row - single row, infinite scroll */}
                <Box
                    ref={scrollContainerRef}
                    sx={{
                        flexGrow: 1,
                        overflowX: 'auto',
                        overflowY: 'hidden',
                        p: { xs: 0.5, sm: 2 },
                        scrollbarWidth: 'thin',
                        '&::-webkit-scrollbar': { 
                            height: 6,
                        },
                        '&::-webkit-scrollbar-track': {
                            backgroundColor: 'grey.100',
                            borderRadius: 3,
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: 'grey.400',
                            borderRadius: 3,
                            '&:hover': {
                                backgroundColor: 'grey.500',
                            },
                        },
                        WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: { xs: 1, sm: 2 },
                            minWidth: 'max-content',
                            alignItems: 'stretch',
                        }}
                    >
                        {/* Product cards */}
                        {carouselProducts.map((product) => (
                            <Box
                                key={product.id}
                                sx={{
                                    // Show ~3 cards on mobile (xs), more on larger screens
                                    width: { 
                                        xs: 'calc((100vw - 32px) / 3 - 8px)', // 3 visible on mobile
                                        sm: 160, 
                                        md: 180,
                                        lg: 200,
                                    },
                                    minWidth: { xs: 100, sm: 160, md: 180, lg: 200 },
                                    maxWidth: { xs: 140, sm: 180, md: 200, lg: 220 },
                                    flexShrink: 0,
                                }}
                            >
                                <MallProductCard product={product} />
                            </Box>
                        ))}
                        
                        {/* Loading indicator at end */}
                        {isLoadingCarouselPage && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: { xs: 100, sm: 160 },
                                    flexShrink: 0,
                                }}
                            >
                                <CircularProgress size={32} />
                            </Box>
                        )}
                        
                        {/* Load more trigger (invisible sentinel) */}
                        {hasMoreCarouselPages && !isLoadingCarouselPage && (
                            <Box
                                ref={loadMoreTriggerRef}
                                sx={{
                                    width: 50,
                                    flexShrink: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <ChevronRightIcon sx={{ color: 'grey.400' }} />
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>
        );
    }

    // Infinite scroll mode (vertical) - shows all products with scrolling
    return (
        <Box
            className="kt-mall-product-grid"
            sx={{
                flexGrow: 1,
                overflow: 'auto',
                p: { xs: 0.5, sm: 0 },
            }}
        >
            <Grid container spacing={{ xs: 1, sm: 2 }}>
                {allProducts.map((product) => (
                    <Grid size={{ xs: 4, sm: 4, md: 4, lg: 3 }} key={product.id}>
                        <MallProductCard product={product} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default MallProductGrid;
