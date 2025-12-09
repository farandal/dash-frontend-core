import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useTranslate } from 'react-admin';
import { Box, Grid, Typography, IconButton, Skeleton, Paper, Button } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useKiosk } from '../contexts/KioskContext';
import { KioskProductCard } from './KioskProductCard';

export const KioskProductGrid: React.FC = () => {
    const translate = useTranslate();
    const {
        allProducts,
        isLoadingProducts,
        categories,
        activeCategory,
        ITEMS_PER_PAGE,
    } = useKiosk();

    const categoryName = categories.find(c => c.id === activeCategory)?.name || translate('kiosk.products');

    // Swipe handling state
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [translateX, setTranslateX] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    // Calculate pages for carousel
    const pages = React.useMemo(() => {
        const chunks: typeof allProducts[] = [];
        for (let i = 0; i < allProducts.length; i += ITEMS_PER_PAGE) {
            chunks.push(allProducts.slice(i, i + ITEMS_PER_PAGE));
        }
        return chunks.length > 0 ? chunks : [[]];
    }, [allProducts, ITEMS_PER_PAGE]);

    const totalPages = pages.length;
    const canScrollPrev = currentPage > 0;
    const canScrollNext = currentPage < totalPages - 1;

    // Reset to first page when products change (category switch)
    useEffect(() => {
        setCurrentPage(0);
        setTranslateX(0);
    }, [allProducts]);

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

    const scrollTo = useCallback((index: number) => {
        if (index !== currentPage && !isAnimating && index >= 0 && index < totalPages) {
            setIsAnimating(true);
            setCurrentPage(index);
            setTimeout(() => setIsAnimating(false), 300);
        }
    }, [currentPage, isAnimating, totalPages]);

    // Touch/Mouse event handlers for swipe
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

    // Touch events
    const handleTouchStart = (e: React.TouchEvent) => handleDragStart(e.touches[0].clientX);
    const handleTouchMove = (e: React.TouchEvent) => handleDragMove(e.touches[0].clientX);
    const handleTouchEnd = () => handleDragEnd();

    // Mouse events
    const handleMouseDown = (e: React.MouseEvent) => handleDragStart(e.clientX);
    const handleMouseMove = (e: React.MouseEvent) => handleDragMove(e.clientX);
    const handleMouseUp = () => handleDragEnd();
    const handleMouseLeave = () => { if (isDragging) handleDragEnd(); };

    if (isLoadingProducts) {
        return (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        px: 2,
                        py: 1.5,
                        borderBottom: 1,
                        borderColor: 'divider',
                    }}
                >
                    <Skeleton variant="rectangular" width={100} height={40} sx={{ borderRadius: 5 }} />
                    <Skeleton variant="text" width={150} />
                    <Skeleton variant="rectangular" width={100} height={40} sx={{ borderRadius: 5 }} />
                </Box>
                <Box sx={{ flexGrow: 1, p: 2 }}>
                    <Grid container spacing={2}>
                        {[...Array(6)].map((_, index) => (
                            <Grid size={{ xs: 6, sm: 4 }} key={index}>
                                <Skeleton variant="rectangular" sx={{ width: '100%', minHeight: 320, borderRadius: 1 }} />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Box>
        );
    }

    if (allProducts.length === 0) {
        return (
            <Box
                sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    color: 'text.secondary',
                }}
            >
                <Typography variant="h2" sx={{ mb: 2, opacity: 0.3 }}>🍽️</Typography>
                <Typography variant="h6">{translate('kiosk.no_products_found')}</Typography>
            </Box>
        );
    }

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
                        '&.Mui-disabled': { borderColor: 'divider', color: 'text.disabled' },
                    }}
                >
                    {translate('kiosk.prev')}
                </Button>

                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{categoryName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                        {translate('kiosk.page_of', { current: currentPage + 1, total: totalPages, items: allProducts.length })}
                    </Typography>
                </Box>

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
                        '&.Mui-disabled': { borderColor: 'divider', color: 'text.disabled' },
                    }}
                >
                    {translate('kiosk.next')}
                </Button>
            </Paper>

            {/* Swipeable Products Container */}
            <Box
                ref={containerRef}
                sx={{
                    flexGrow: 1,
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
                        height: '100%',
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
                                height: '100%',
                                px: 2,
                                py: 2,
                                overflow: 'auto',
                            }}
                        >
                            <Grid container spacing={2}>
                                {pageProducts.map((product) => (
                                    <Grid size={{ xs: 6, sm: 4 }} key={product.id}>
                                        <Box sx={{ minHeight: 320, height: '100%' }}>
                                            <KioskProductCard product={product} />
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* Side Navigation Arrows */}
            <IconButton
                onClick={scrollPrev}
                disabled={!canScrollPrev || isAnimating}
                sx={{
                    position: 'absolute',
                    left: 4,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    height: 80,
                    width: 48,
                    borderRadius: '0 16px 16px 0',
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
                <ChevronLeftIcon sx={{ fontSize: 32 }} />
            </IconButton>

            <IconButton
                onClick={scrollNext}
                disabled={!canScrollNext || isAnimating}
                sx={{
                    position: 'absolute',
                    right: 4,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    height: 80,
                    width: 48,
                    borderRadius: '16px 0 0 16px',
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
                <ChevronRightIcon sx={{ fontSize: 32 }} />
            </IconButton>

            {/* Bottom Dots Navigation */}
            {totalPages > 1 && (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        px: 2,
                        py: 1.5,
                        borderTop: 1,
                        borderColor: 'divider',
                        backgroundColor: 'background.paper',
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
                            '&.Mui-disabled': { borderColor: 'divider', color: 'text.disabled' },
                        }}
                    >
                        {translate('kiosk.prev')}
                    </Button>

                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {pages.map((_, index) => (
                            <Box
                                key={index}
                                onClick={() => scrollTo(index)}
                                sx={{
                                    height: 12,
                                    width: index === currentPage ? 32 : 12,
                                    borderRadius: 6,
                                    backgroundColor: index === currentPage ? 'primary.main' : 'action.disabled',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: index === currentPage ? 'primary.main' : 'action.hover',
                                    },
                                }}
                            />
                        ))}
                    </Box>

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
                            '&.Mui-disabled': { borderColor: 'divider', color: 'text.disabled' },
                        }}
                    >
                        {translate('kiosk.next')}
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default KioskProductGrid;
