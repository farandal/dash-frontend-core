import React, { useRef, useState, useCallback } from 'react';
import { useTranslate, useResourceContext } from 'react-admin';
import { 
    Box, 
    Avatar, 
    Typography, 
    Skeleton, 
    Tooltip,
} from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import StarIcon from '@mui/icons-material/Star';
import { useMallOrderCreate } from '../contexts/MallOrderCreateContext';
import { IMallCategory } from '../hooks/useMallDataQueries';

/**
 * MallCategorySelector - Vertical scrollable category selector
 * 
 * Features:
 * - "Featured" option as first element (star icon)
 * - Category icons/images in vertical scrollable list
 * - "All Products" option as last element
 * - Touch/mouse drag support for vertical scrolling
 * - Optimized for sidebar layout
 */
export const MallCategorySelector: React.FC = () => {
    const translate = useTranslate();
    const { 
        categories, 
        isLoadingCategories, 
        selectedCategory, 
        selectCategory,
        showFeaturedOnly,
        toggleFeaturedOnly,
    } = useMallOrderCreate();
    
    // If showFeaturedOnly is passed as boolean, use it, otherwise check if toggleFeaturedOnly sets it
    // Wait, toggleFeaturedOnly is a function. I need to use setShowFeaturedOnly if available or emulate it.
    // In Context it is: showFeaturedOnly (boolean), toggleFeaturedOnly (void)
    // To SET specific value I might need to check current state
    
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

    const handleCategoryClick = (category: IMallCategory | null) => {
        if (!wasDraggingRef.current) {
            // Turn off featured if it was on
            if (showFeaturedOnly) {
                toggleFeaturedOnly();
            }
            selectCategory(category);
        }
    };
    
    const handleFeaturedClick = () => {
        if (!wasDraggingRef.current) {
            selectCategory(null);
            if (!showFeaturedOnly) {
                toggleFeaturedOnly();
            }
        }
    };

    if (isLoadingCategories) {
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
            className="kt-mall-category-selector"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                position: 'relative',
                backgroundColor: 'transparent'
            }}
        >
            
            {/* Scrollable categories container - Vertical */}
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
                {/* Featured Products option - FIRST */}
                <Tooltip title={translate('mall.featured')} placement="right">
                    <Box
                        onClick={handleFeaturedClick}
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
                                bgcolor: showFeaturedOnly ? 'warning.main' : 'grey.200',
                                color: showFeaturedOnly ? 'warning.contrastText' : 'text.secondary',
                                border: showFeaturedOnly ? '3px solid' : '2px solid',
                                borderColor: showFeaturedOnly ? 'warning.dark' : 'transparent',
                                boxShadow: showFeaturedOnly ? 4 : 1,
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <StarIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
                        </Avatar>
                        <Typography
                            variant="caption"
                            sx={{
                                fontSize: '0.65rem',
                                fontWeight: showFeaturedOnly ? 700 : 500,
                                color: showFeaturedOnly ? 'warning.main' : 'text.secondary',
                                textAlign: 'center',
                                lineHeight: 1.2,
                                maxWidth: '100%',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                px: 0.5,
                            }}
                        >
                            {translate('mall.featured')}
                        </Typography>
                    </Box>
                </Tooltip>

                {/* Category items - MIDDLE */}
                {categories.map((category) => {
                    const isSelected = selectedCategory?.id === category.id && !showFeaturedOnly;
                    // Prefer image_url (from API), fall back to image, then default icon
                    const logoUrl = category.image_url || category.image;
                    
                    return (
                        <Tooltip key={category.id} title={category.name} placement="right">
                            <Box
                                onClick={() => handleCategoryClick(category)}
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
                                    <CategoryIcon sx={{ color: 'grey.400' }} />
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
                                    {category.name}
                                </Typography>
                            </Box>
                        </Tooltip>
                    );
                })}

                {/* All Products option - LAST */}
                <Tooltip title={translate('mall.all_products')} placement="right">
                    <Box
                        onClick={() => handleCategoryClick(null)}
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
                                bgcolor: selectedCategory === null && !showFeaturedOnly ? 'primary.main' : 'grey.200',
                                color: selectedCategory === null && !showFeaturedOnly ? 'primary.contrastText' : 'text.secondary',
                                border: selectedCategory === null && !showFeaturedOnly ? '3px solid' : '2px solid',
                                borderColor: selectedCategory === null && !showFeaturedOnly ? 'primary.dark' : 'transparent',
                                boxShadow: selectedCategory === null && !showFeaturedOnly ? 4 : 1,
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <AllInclusiveIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
                        </Avatar>
                        <Typography
                            variant="caption"
                            sx={{
                                fontSize: '0.65rem',
                                fontWeight: selectedCategory === null && !showFeaturedOnly ? 700 : 500,
                                color: selectedCategory === null && !showFeaturedOnly ? 'primary.main' : 'text.secondary',
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
            </Box>
        </Box>
    );
};

export default MallCategorySelector;
