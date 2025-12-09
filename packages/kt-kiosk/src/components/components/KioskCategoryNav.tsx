import React, { useRef, useState, useCallback } from 'react';
import { Box, Chip, Skeleton, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useKiosk } from '../contexts/KioskContext';

export const KioskCategoryNav: React.FC = () => {
    const { categories, activeCategory, setActiveCategory, isLoadingCategories } = useKiosk();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    
    // Drag state for swipeable categories
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const dragDistanceRef = useRef(0);
    const wasDraggingRef = useRef(false);

    const updateScrollButtons = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
        }
    };

    React.useEffect(() => {
        updateScrollButtons();
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', updateScrollButtons);
            window.addEventListener('resize', updateScrollButtons);
            return () => {
                container.removeEventListener('scroll', updateScrollButtons);
                window.removeEventListener('resize', updateScrollButtons);
            };
        }
    }, [categories]);

    const scrollBy = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 200;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    // Drag handlers for swipeable categories
    const handleDragStart = useCallback((clientX: number) => {
        if (!scrollContainerRef.current) return;
        setIsDragging(true);
        setStartX(clientX);
        setScrollLeft(scrollContainerRef.current.scrollLeft);
        dragDistanceRef.current = 0;
        wasDraggingRef.current = false;
    }, []);

    const handleDragMove = useCallback((clientX: number) => {
        if (!isDragging || !scrollContainerRef.current) return;
        const diff = clientX - startX;
        dragDistanceRef.current = Math.abs(diff);
        if (dragDistanceRef.current > 5) {
            wasDraggingRef.current = true;
        }
        scrollContainerRef.current.scrollLeft = scrollLeft - diff;
    }, [isDragging, startX, scrollLeft]);

    const handleDragEnd = useCallback(() => {
        setIsDragging(false);
        // Don't reset dragDistanceRef here - let click handler check it first
        setTimeout(() => {
            dragDistanceRef.current = 0;
            wasDraggingRef.current = false;
        }, 50);
    }, []);

    // Touch events
    const handleTouchStart = (e: React.TouchEvent) => handleDragStart(e.touches[0].clientX);
    const handleTouchMove = (e: React.TouchEvent) => handleDragMove(e.touches[0].clientX);
    const handleTouchEnd = () => handleDragEnd();

    // Mouse events
    const handleMouseDown = (e: React.MouseEvent) => handleDragStart(e.clientX);
    const handleMouseMove = (e: React.MouseEvent) => handleDragMove(e.clientX);
    const handleMouseUp = () => handleDragEnd();
    const handleMouseLeave = () => { if (isDragging) handleDragEnd(); };

    // Prevent click if was dragging
    const handleCategoryClick = (categoryId: string | number) => {
        if (!wasDraggingRef.current) {
            setActiveCategory(categoryId);
        }
    };

    if (isLoadingCategories) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    gap: 1,
                    p: 1,
                    borderBottom: 1,
                    borderColor: 'divider',
                    backgroundColor: 'background.paper',
                }}
            >
                {[...Array(6)].map((_, index) => (
                    <Skeleton
                        key={index}
                        variant="rectangular"
                        width={80}
                        height={48}
                        sx={{ borderRadius: 2 }}
                    />
                ))}
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                borderBottom: 1,
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                position: 'sticky',
                top: 0,
                zIndex: 10,
            }}
        >
            {/* Left scroll button */}
            <IconButton
                onClick={() => scrollBy('left')}
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
                ref={scrollContainerRef}
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
                        onClick={() => handleCategoryClick(category.id)}
                        variant={activeCategory === category.id ? 'filled' : 'outlined'}
                        color={activeCategory === category.id ? 'primary' : 'default'}
                        sx={{
                            py: 2.5,
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
                onClick={() => scrollBy('right')}
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
};

export default KioskCategoryNav;
