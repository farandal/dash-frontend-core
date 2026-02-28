import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';

export interface UseDraggableCarouselOptions {
    /** Items per page for extra small screens (xs) */
    itemsPerPageXs?: number;
    /** Items per page for small screens (sm) */
    itemsPerPageSm?: number;
    /** Items per page for medium screens (md) */
    itemsPerPageMd?: number;
    /** Items per page for large screens (lg) */
    itemsPerPageLg?: number;
    /** Items per page for extra large screens (xl) */
    itemsPerPageXl?: number;
    /** Gap between items in pixels */
    gap?: number;
}

export interface UseDraggableCarouselReturn<T> {
    // Pagination
    currentPage: number;
    totalPages: number;
    pages: T[][];
    itemsPerPage: number;
    canScrollPrev: boolean;
    canScrollNext: boolean;
    
    // Navigation
    scrollPrev: () => void;
    scrollNext: () => void;
    scrollTo: (index: number) => void;
    
    // Drag state
    isDragging: boolean;
    isAnimating: boolean;
    translateX: number;
    containerRef: React.RefObject<HTMLDivElement | null>;
    
    // Event handlers
    handleTouchStart: (e: React.TouchEvent) => void;
    handleTouchMove: (e: React.TouchEvent) => void;
    handleTouchEnd: () => void;
    handleMouseDown: (e: React.MouseEvent) => void;
    handleMouseMove: (e: React.MouseEvent) => void;
    handleMouseUp: () => void;
    handleMouseLeave: () => void;
    
    // Reset
    resetToFirstPage: () => void;
    
    // Config
    options: UseDraggableCarouselOptions;
    gap: number;
}

/** Default carousel configuration */
export const DEFAULT_CAROUSEL_OPTIONS: UseDraggableCarouselOptions = {
    itemsPerPageXs: 2,
    itemsPerPageSm: 4,
    itemsPerPageMd: 4,
    itemsPerPageLg: 6,
    itemsPerPageXl: 8,
    gap: 8,
};

export function useDraggableCarousel<T>(
    items: T[],
    options: UseDraggableCarouselOptions = {}
): UseDraggableCarouselReturn<T> {
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.only('xs'));
    const isSm = useMediaQuery(theme.breakpoints.only('sm'));
    const isMd = useMediaQuery(theme.breakpoints.only('md'));
    const isLg = useMediaQuery(theme.breakpoints.only('lg'));
    
    const mergedOptions = { ...DEFAULT_CAROUSEL_OPTIONS, ...options };
    const gap = mergedOptions.gap!;
    
    // Determine items per page based on screen size
    const itemsPerPage = useMemo(() => {
        if (isXs) return mergedOptions.itemsPerPageXs!;
        if (isSm) return mergedOptions.itemsPerPageSm!;
        if (isMd) return mergedOptions.itemsPerPageMd!;
        if (isLg) return mergedOptions.itemsPerPageLg!;
        return mergedOptions.itemsPerPageXl!;
    }, [isXs, isSm, isMd, isLg, mergedOptions]);
    
    // State
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [translateX, setTranslateX] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    
    // Calculate pages
    const pages = useMemo(() => {
        const chunks: T[][] = [];
        for (let i = 0; i < items.length; i += itemsPerPage) {
            chunks.push(items.slice(i, i + itemsPerPage));
        }
        return chunks.length > 0 ? chunks : [[]];
    }, [items, itemsPerPage]);
    
    const totalPages = pages.length;
    const canScrollPrev = currentPage > 0;
    const canScrollNext = currentPage < totalPages - 1;
    
    // Reset to first page when items change or screen size changes
    useEffect(() => {
        setCurrentPage(0);
        setTranslateX(0);
    }, [items, itemsPerPage]);
    
    // Navigation functions
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
    
    const resetToFirstPage = useCallback(() => {
        setCurrentPage(0);
        setTranslateX(0);
    }, []);
    
    // Drag handlers
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
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        handleDragStart(e.touches[0].clientX);
    }, [handleDragStart]);
    
    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        handleDragMove(e.touches[0].clientX);
    }, [handleDragMove]);
    
    const handleTouchEnd = useCallback(() => {
        handleDragEnd();
    }, [handleDragEnd]);
    
    // Mouse events
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        handleDragStart(e.clientX);
    }, [handleDragStart]);
    
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        handleDragMove(e.clientX);
    }, [handleDragMove]);
    
    const handleMouseUp = useCallback(() => {
        handleDragEnd();
    }, [handleDragEnd]);
    
    const handleMouseLeave = useCallback(() => {
        if (isDragging) handleDragEnd();
    }, [isDragging, handleDragEnd]);
    
    return {
        // Pagination
        currentPage,
        totalPages,
        pages,
        itemsPerPage,
        canScrollPrev,
        canScrollNext,
        
        // Navigation
        scrollPrev,
        scrollNext,
        scrollTo,
        
        // Drag state
        isDragging,
        isAnimating,
        translateX,
        containerRef,
        
        // Event handlers
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleMouseLeave,
        
        // Reset
        resetToFirstPage,
        
        // Config
        options: mergedOptions,
        gap,
    };
}

export default useDraggableCarousel;
