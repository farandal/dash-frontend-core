import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useTranslate } from 'react-admin';
import { 
    Box, 
    Grid, 
    Typography, 
    IconButton, 
    Skeleton, 
    Paper, 
    Button,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Chip,
    CircularProgress,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
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
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: 6,
                },
                '&:active': {
                    transform: 'scale(0.98)',
                },
            }}
        >
            <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 2, display: 'flex', flexDirection: 'row', gap: 1 }}>
                {product.featured && (
                    <StarIcon sx={{
                        display: 'flex',
                        fontWeight: 600,
                        fontSize: 22,
                    }} />
                )}
                
                {hasModifiers && (
                    <TuneIcon sx={{ 
                        display: 'flex',
                        fontSize: 22,
                        fontWeight: 600,
                    }} />
                )}
            </Box>

            {/* Product image */}
            <Box
                sx={{
                    position: 'relative',
                    paddingTop: '75%', // 4:3 aspect ratio
                    backgroundColor: 'grey.200',
                }}
            >
                {imageUrl ? (
                    <CardMedia
                        component="img"
                        image={imageUrl}
                        alt={product.name}
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                    />
                ) : (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <RestaurantIcon sx={{ fontSize: 48, opacity: 0.3, color: 'grey.500' }} />
                    </Box>
                )}
                
                {/* Gradient overlay */}
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '50%',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
                    }}
                />

               
            </Box>

            {/* Content */}
            <CardContent sx={{ flexGrow: 1, py: 1, px: 1.5 }}>
                 {/* Price overlay */}
                <Typography
                    variant="subtitle1"
                    sx={{
                        fontWeight: 600,
                        lineHeight: 1.3,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        fontSize: 22,
                    }}
                >
                    {formatPrice(price)}
                </Typography>
                <Typography
                    variant="subtitle2"
                    sx={{
                        fontWeight: 600,
                        lineHeight: 1.3,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                    }}
                >
                    {product.name}
                </Typography>
                {product.description && (
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 4,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            mt: 0.5,
                        }}
                    >
                        {product.description}
                    </Typography>
                )}
            </CardContent>

            {/* Add button */}
            <CardActions sx={{ p: 1, pt: 0 }}>
                <Button
                    fullWidth
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleButtonClick}
                    sx={{
                        borderRadius: 1.5,
                        fontWeight: 600,
                        textTransform: 'none',
                    }}
                >
                    {translate('mall.add')}
                </Button>
            </CardActions>
        </Card>
    );
};

/**
 * MallProductGrid - Product grid with horizontal pagination or infinite scroll
 */
export const MallProductGrid: React.FC = () => {
    const translate = useTranslate();
    const {
        products,
        allProducts,
        isLoadingProducts,
        paginationMode,
        currentPage,
        totalPages,
        setCurrentPage,
        ITEMS_PER_PAGE,
        selectedStore,
    } = useMallOrderCreate();

    // Swipe handling for horizontal pagination
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [translateX, setTranslateX] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    // Calculate pages for horizontal mode
    const pages = React.useMemo(() => {
        if (paginationMode === 'infinite') return [allProducts];
        
        const chunks: IMallProduct[][] = [];
        for (let i = 0; i < allProducts.length; i += ITEMS_PER_PAGE) {
            chunks.push(allProducts.slice(i, i + ITEMS_PER_PAGE));
        }
        return chunks.length > 0 ? chunks : [[]];
    }, [allProducts, ITEMS_PER_PAGE, paginationMode]);

    const canScrollPrev = currentPage > 1;
    const canScrollNext = currentPage < totalPages;

    // Reset to first page when products change
    useEffect(() => {
        setCurrentPage(1);
        setTranslateX(0);
    }, [selectedStore, setCurrentPage]);

    const scrollPrev = useCallback(() => {
        if (canScrollPrev && !isAnimating) {
            setIsAnimating(true);
            setCurrentPage(currentPage - 1);
            setTimeout(() => setIsAnimating(false), 300);
        }
    }, [canScrollPrev, isAnimating, currentPage, setCurrentPage]);

    const scrollNext = useCallback(() => {
        if (canScrollNext && !isAnimating) {
            setIsAnimating(true);
            setCurrentPage(currentPage + 1);
            setTimeout(() => setIsAnimating(false), 300);
        }
    }, [canScrollNext, isAnimating, currentPage, setCurrentPage]);

    // Touch/Mouse handlers for swipe
    const handleDragStart = useCallback((clientX: number) => {
        if (isAnimating || paginationMode === 'infinite') return;
        setIsDragging(true);
        setStartX(clientX);
        setTranslateX(0);
    }, [isAnimating, paginationMode]);

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

    const handleTouchStart = (e: React.TouchEvent) => handleDragStart(e.touches[0].clientX);
    const handleTouchMove = (e: React.TouchEvent) => handleDragMove(e.touches[0].clientX);
    const handleTouchEnd = () => handleDragEnd();

    const handleMouseDown = (e: React.MouseEvent) => handleDragStart(e.clientX);
    const handleMouseMove = (e: React.MouseEvent) => handleDragMove(e.clientX);
    const handleMouseUp = () => handleDragEnd();
    const handleMouseLeave = () => { if (isDragging) handleDragEnd(); };

    // Loading state
    if (isLoadingProducts) {
        return (
            <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                    {[...Array(6)].map((_, index) => (
                        <Grid size={{ xs: 4, sm: 4, md: 4, lg: 3 }} key={index}>
                            <Skeleton 
                                variant="rectangular" 
                                sx={{ 
                                    width: '100%', 
                                    paddingTop: '100%', 
                                    borderRadius: 2 
                                }} 
                            />
                        </Grid>
                    ))}
                </Grid>
            </Box>
        );
    }

    // Empty state
    if (allProducts.length === 0) {
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
    if (paginationMode === 'horizontal') {
        return (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {/* Navigation Header */}
                <Paper
                    elevation={0}
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        px: 2,
                        py: 1,
                        borderBottom: 1,
                        borderColor: 'divider',
                        backgroundColor: 'background.default',
                    }}
                >
                    <Button
                        onClick={scrollPrev}
                        disabled={!canScrollPrev || isAnimating}
                        variant="outlined"
                        startIcon={<ChevronLeftIcon />}
                        sx={{
                            borderRadius: 5,
                            px: 2,
                            borderWidth: 2,
                            borderColor: canScrollPrev ? 'primary.main' : 'divider',
                            color: canScrollPrev ? 'primary.main' : 'text.disabled',
                            fontWeight: 700,
                            '&:hover': {
                                borderWidth: 2,
                                backgroundColor: canScrollPrev ? 'primary.main' : 'transparent',
                                color: canScrollPrev ? 'primary.contrastText' : 'text.disabled',
                            },
                        }}
                    >
                        {translate('mall.prev')}
                    </Button>

                    <Typography variant="body2" fontWeight={600}>
                        {currentPage} / {totalPages}
                    </Typography>

                    <Button
                        onClick={scrollNext}
                        disabled={!canScrollNext || isAnimating}
                        variant="outlined"
                        endIcon={<ChevronRightIcon />}
                        sx={{
                            borderRadius: 5,
                            px: 2,
                            borderWidth: 2,
                            borderColor: canScrollNext ? 'primary.main' : 'divider',
                            color: canScrollNext ? 'primary.main' : 'text.disabled',
                            fontWeight: 700,
                            '&:hover': {
                                borderWidth: 2,
                                backgroundColor: canScrollNext ? 'primary.main' : 'transparent',
                                color: canScrollNext ? 'primary.contrastText' : 'text.disabled',
                            },
                        }}
                    >
                        {translate('mall.next')}
                    </Button>
                </Paper>

                {/* Products grid */}
                <Box
                    ref={containerRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    sx={{
                        flexGrow: 1,
                        overflow: 'hidden',
                        p: 2,
                        transform: `translateX(${translateX}px)`,
                        transition: isDragging ? 'none' : 'transform 0.3s ease-out',
                    }}
                >
                    <Grid container spacing={2}>
                        {products.map((product) => (
                            <Grid size={{ xs: 4, sm: 4, md: 4, lg: 3 }} key={product.id}>
                                <MallProductCard product={product} />
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Pagination dots */}
                {totalPages > 1 && (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: 1,
                            py: 1,
                            borderTop: 1,
                            borderColor: 'divider',
                        }}
                    >
                        {Array.from({ length: totalPages }, (_, i) => (
                            <Box
                                key={i}
                                onClick={() => !isAnimating && setCurrentPage(i + 1)}
                                sx={{
                                    width: currentPage === i + 1 ? 24 : 8,
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: currentPage === i + 1 ? 'primary.main' : 'grey.300',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                }}
                            />
                        ))}
                    </Box>
                )}
            </Box>
        );
    }

    // Infinite scroll mode - shows all products with scrolling
    return (
        <Box
            className="kt-mall-product-grid"
            sx={{
                flexGrow: 1,
                overflow: 'auto',
                p: 2,
            }}
        >
            <Grid container spacing={2}>
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
