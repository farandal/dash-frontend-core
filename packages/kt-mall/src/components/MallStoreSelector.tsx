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
import StorefrontIcon from '@mui/icons-material/Storefront';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import { useMallOrderCreate } from '../contexts/MallOrderCreateContext';

/**
 * MallStoreSelector - Vertical scrollable store selector
 * 
 * Features:
 * - "All Products" option as first element
 * - Store logos in vertical scrollable list
 * - Touch/mouse drag support for vertical scrolling
 * - Optimized for sidebar layout
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
    
    // Drag state
    const [isDragging, setIsDragging] = useState(false);
    const [startY, setStartY] = useState(0);
    const [scrollTop, setScrollTop] = useState(0);
    const dragDistanceRef = useRef(0);
    const wasDraggingRef = useRef(false);

    // Drag handlers - now for vertical scrolling
    const handleDragStart = useCallback((clientY: number) => {
        if (!scrollContainerRef.current) return;
        setIsDragging(true);
        setStartY(clientY);
        setScrollTop(scrollContainerRef.current.scrollTop);
        dragDistanceRef.current = 0;
        wasDraggingRef.current = false;
    }, []);

    const handleDragMove = useCallback((clientY: number) => {
        if (!isDragging || !scrollContainerRef.current) return;
        const diff = clientY - startY;
        dragDistanceRef.current = Math.abs(diff);
        if (dragDistanceRef.current > 5) {
            wasDraggingRef.current = true;
        }
        scrollContainerRef.current.scrollTop = scrollTop - diff;
    }, [isDragging, startY, scrollTop]);

    const handleDragEnd = useCallback(() => {
        setIsDragging(false);
        setTimeout(() => {
            dragDistanceRef.current = 0;
            wasDraggingRef.current = false;
        }, 50);
    }, []);

    // Touch events
    const handleTouchStart = (e: React.TouchEvent) => handleDragStart(e.touches[0].clientY);
    const handleTouchMove = (e: React.TouchEvent) => handleDragMove(e.touches[0].clientY);
    const handleTouchEnd = () => handleDragEnd();

    // Mouse events
    const handleMouseDown = (e: React.MouseEvent) => handleDragStart(e.clientY);
    const handleMouseMove = (e: React.MouseEvent) => handleDragMove(e.clientY);
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
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    p: 1,
                    overflowY: 'auto',
                    height: '100%',
                }}
            >
                {[...Array(6)].map((_, index) => (
                    <Skeleton
                        key={index}
                        variant="circular"
                        width={56}
                        height={56}
                        sx={{ flexShrink: 0, bgcolor: 'rgba(0,0,0,0.1)' }}
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
                flexDirection: 'column',
                height: '100%',
                position: 'relative',
                backgroundColor: 'transparent'
        
            }}
        >
            
            {/* Scrollable stores container - Vertical */}
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
                    backgroundColor: 'transparent',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    py: 2,
                    px: 1,
                    flexGrow: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    scrollbarWidth: 'thin',
                    '&::-webkit-scrollbar': { 
                        width: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: '3px',
                        '&:hover': {
                            background: 'rgba(0,0,0,0.3)',
                        },
                    },
                    cursor: isDragging ? 'grabbing' : 'grab',
                    userSelect: 'none',
                }}
            >
                {/* All Products option */}
                <Tooltip title={translate('mall.all_products')} placement="right">
                    <Box
                        onClick={() => handleStoreClick(null)}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 0.5,
                            width: '100%',
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
                                width: { xs: 56, sm: 64 },
                                height: { xs: 56, sm: 64 },
                                bgcolor: selectedStore === null ? 'primary.main' : 'grey.200',
                                color: selectedStore === null ? 'primary.contrastText' : 'text.secondary',
                                border: selectedStore === null ? '3px solid' : '2px solid',
                                borderColor: selectedStore === null ? 'primary.dark' : 'transparent',
                                boxShadow: selectedStore === null ? 4 : 1,
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <AllInclusiveIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
                        </Avatar>
                        <Typography
                            variant="caption"
                            sx={{
                                fontSize: '0.65rem',
                                fontWeight: selectedStore === null ? 700 : 500,
                                color: selectedStore === null ? 'primary.main' : 'text.secondary',
                                textAlign: 'center',
                                lineHeight: 1.2,
                                maxWidth: '100%',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                px: 0.5,
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
                        <Tooltip key={store.id} title={store.name} placement="right">
                            <Box
                                onClick={() => handleStoreClick(store)}
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    width: '100%',
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
                                        width: { xs: 56, sm: 64 },
                                        height: { xs: 56, sm: 64 },
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
                                        maxWidth: '100%',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        px: 0.5,
                                    }}
                                >
                                    {store.name}
                                </Typography>
                            </Box>
                        </Tooltip>
                    );
                })}
            </Box>
        </Box>
    );
};

export default MallStoreSelector;
