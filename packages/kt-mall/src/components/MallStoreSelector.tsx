import React, { useRef, useState, useCallback } from 'react';
import { useTranslate } from 'react-admin';
import { 
    Box, 
    Avatar, 
    Typography, 
    Skeleton, 
    IconButton,
    Chip,
    Tooltip,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import { useMallOrderCreate } from '../contexts/MallOrderCreateContext';

/**
 * MallStoreSelector - Horizontal scrollable store selector
 * 
 * Features:
 * - "All Products" option as first element
 * - Store logos in horizontal scrollable list
 * - Touch/mouse drag support
 * - Scroll arrows for navigation
 */
export const MallStoreSelector: React.FC = () => {
    const translate = useTranslate();
    const { 
        stores, 
        isLoadingStores, 
        selectedStore, 
        setSelectedStore 
    } = useMallOrderCreate();
    
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    
    // Drag state
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const dragDistanceRef = useRef(0);
    const wasDraggingRef = useRef(false);

    const updateScrollButtons = useCallback(() => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
        }
    }, []);

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
    }, [stores, updateScrollButtons]);

    const scrollBy = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 200;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    // Drag handlers
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

    const handleStoreClick = (store: typeof stores[0] | null) => {
        if (!wasDraggingRef.current) {
            setSelectedStore(store);
        }
    };

    if (isLoadingStores) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1.5,
                    borderBottom: 1,
                    borderColor: 'divider',
                    backgroundColor: 'background.paper',
                }}
            >
                {[...Array(6)].map((_, index) => (
                    <Skeleton
                        key={index}
                        variant="circular"
                        width={56}
                        height={56}
                        sx={{ flexShrink: 0 }}
                    />
                ))}
            </Box>
        );
    }

    return (
        <Box
            className="kt-mall-store-selector"
            sx={{
                display: 'flex',
                alignItems: 'center',
                borderBottom: 1,
                borderColor: 'divider',
                //backgroundColor: 'background.paper',
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

            {/* Scrollable stores container */}
            <Box
                ref={scrollContainerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                sx={{
                    display: 'flex',
                    gap: 1,
                    py: 1.5,
                    px: 0.5,
                    flexGrow: 1,
                    overflowX: 'auto',
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': { display: 'none' },
                    cursor: isDragging ? 'grabbing' : 'grab',
                    userSelect: 'none',
                }}
            >
                {/* All Products option */}
                <Tooltip title={translate('mall.all_products')}>
                    <Box
                        onClick={() => handleStoreClick(null)}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 0.5,
                            minWidth: 72,
                            cursor: 'pointer',
                            transition: 'transform 0.15s ease',
                            '&:hover': {
                                transform: 'scale(1.05)',
                            },
                            '&:active': {
                                transform: 'scale(0.95)',
                            },
                        }}
                    >
                        <Avatar
                            sx={{
                                width: 56,
                                height: 56,
                                bgcolor: selectedStore === null ? 'primary.main' : 'grey.200',
                                color: selectedStore === null ? 'primary.contrastText' : 'text.secondary',
                                border: selectedStore === null ? '3px solid' : '2px solid',
                                borderColor: selectedStore === null ? 'primary.dark' : 'transparent',
                                boxShadow: selectedStore === null ? 4 : 1,
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <AllInclusiveIcon />
                        </Avatar>
                        <Typography
                            variant="caption"
                            sx={{
                                fontSize: '0.65rem',
                                fontWeight: selectedStore === null ? 700 : 500,
                                color: selectedStore === null ? 'primary.main' : 'text.secondary',
                                textAlign: 'center',
                                lineHeight: 1.2,
                                maxWidth: 72,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {translate('mall.all')}
                        </Typography>
                    </Box>
                </Tooltip>

                {/* Store items */}
                {stores.map((store) => {
                    const isSelected = selectedStore?.id === store.id;
                    const logoUrl = store.squared_logo_url || store.horizontal_logo_url;
                    
                    return (
                        <Tooltip key={store.id} title={store.name}>
                            <Box
                                onClick={() => handleStoreClick(store)}
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    minWidth: 72,
                                    cursor: 'pointer',
                                    transition: 'transform 0.15s ease',
                                    '&:hover': {
                                        transform: 'scale(1.05)',
                                    },
                                    '&:active': {
                                        transform: 'scale(0.95)',
                                    },
                                }}
                            >
                                <Avatar
                                    src={logoUrl}
                                    sx={{
                                        width: 56,
                                        height: 56,
                                        bgcolor: 'grey.100',
                                        border: isSelected ? '3px solid' : '2px solid',
                                        borderColor: isSelected ? 'primary.main' : 'transparent',
                                        boxShadow: isSelected ? 4 : 1,
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    <StorefrontIcon sx={{ color: 'grey.400' }} />
                                </Avatar>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontSize: '0.65rem',
                                        fontWeight: isSelected ? 700 : 500,
                                        color: isSelected ? 'primary.main' : 'text.secondary',
                                        textAlign: 'center',
                                        lineHeight: 1.2,
                                        maxWidth: 72,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {store.name}
                                </Typography>
                            </Box>
                        </Tooltip>
                    );
                })}
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

export default MallStoreSelector;
