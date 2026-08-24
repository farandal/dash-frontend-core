import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, IconButton, SxProps, Theme } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export interface IHorizontalScrollerProps {
    children: React.ReactNode;
    /** Pixels moved per arrow press. Default 240. */
    step?: number;
    /** Hide the arrows and rely on swipe/wheel alone. */
    hideArrows?: boolean;
    /** Width of the soft fade at each scrollable edge, in px. 0 disables it. */
    fade?: number;
    /** sx applied to the scrolling track (not the outer wrapper). */
    trackSx?: SxProps<Theme>;
    sx?: SxProps<Theme>;
    className?: string;
    ariaLabel?: string;
}

/**
 * A horizontally scrollable strip with end-aware arrows, swipe and drag.
 *
 * Extracted from the pattern kt-tabs' CategorySelector already proved on the
 * create-tab screen, so the dashboard shortcut strip behaves identically to the
 * category carousel rather than inventing a second set of scrolling manners.
 *
 * Three input methods, deliberately, because they cover different users on the
 * same screen: arrows for mouse users who expect affordances, touch drag for a
 * tablet on the counter, and mouse drag for a trackpad. Native wheel/trackpad
 * scrolling keeps working because the track is a real overflow container rather
 * than a transform.
 *
 * The arrows disable at each end instead of disappearing: a control that
 * vanishes shifts the layout under the pointer mid-interaction.
 */
export const HorizontalScroller: React.FC<IHorizontalScrollerProps> = ({
    children,
    step = 240,
    hideArrows = false,
    fade = 56,
    trackSx,
    sx,
    className,
    ariaLabel,
}) => {
    const trackRef = useRef<HTMLDivElement>(null);

    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const [isDragging, setIsDragging] = useState(false);
    const dragStartX = useRef(0);
    const scrollStartX = useRef(0);

    const updateArrows = useCallback(() => {
        const el = trackRef.current;
        if (!el) return;

        const { scrollLeft, scrollWidth, clientWidth } = el;
        setCanScrollLeft(scrollLeft > 1);
        // -1 for sub-pixel rounding: at the exact end these can differ by a
        // fraction and leave the right arrow enabled forever.
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
    }, []);

    useEffect(() => {
        const el = trackRef.current;
        if (!el) return undefined;

        el.addEventListener('scroll', updateArrows, { passive: true });
        updateArrows();

        // Content and container both change after mount — resources load, the
        // panel is resized, the window changes. Without observing, the arrows
        // report the state at first paint forever.
        const observer = new ResizeObserver(updateArrows);
        observer.observe(el);
        Array.from(el.children).forEach((child) => observer.observe(child));

        return () => {
            el.removeEventListener('scroll', updateArrows);
            observer.disconnect();
        };
    }, [updateArrows, children]);

    const scrollBy = useCallback((direction: 'left' | 'right') => {
        trackRef.current?.scrollBy({
            left: direction === 'left' ? -step : step,
            behavior: 'smooth',
        });
    }, [step]);

    const onTouchStart = useCallback((e: React.TouchEvent) => {
        dragStartX.current = e.touches[0].clientX;
        scrollStartX.current = trackRef.current?.scrollLeft ?? 0;
    }, []);

    const onTouchMove = useCallback((e: React.TouchEvent) => {
        const el = trackRef.current;
        if (!el) return;
        el.scrollLeft = scrollStartX.current + (dragStartX.current - e.touches[0].clientX);
    }, []);

    const onMouseDown = useCallback((e: React.MouseEvent) => {
        setIsDragging(true);
        dragStartX.current = e.clientX;
        scrollStartX.current = trackRef.current?.scrollLeft ?? 0;
    }, []);

    const onMouseMove = useCallback((e: React.MouseEvent) => {
        const el = trackRef.current;
        if (!isDragging || !el) return;
        // Without this, dragging across cards selects their labels instead.
        e.preventDefault();
        el.scrollLeft = scrollStartX.current + (dragStartX.current - e.clientX);
    }, [isDragging]);

    const endDrag = useCallback(() => {
        setIsDragging(false);
        updateArrows();
    }, [updateArrows]);

    /**
     * Arrows sit ON the strip rather than beside it.
     *
     * As flex siblings they stole ~80px of width from the track on every
     * screen, including the ones with nothing to scroll. Overlaying them means
     * the cards use the full width, and the arrow only appears where there is
     * something in that direction — so it reads as an affordance rather than
     * permanent chrome.
     */
    const arrowSx = (side: 'left' | 'right', enabled: boolean) => ({
        position: 'absolute' as const,
        top: '50%',
        transform: 'translateY(-50%)',
        [side]: 4,
        zIndex: 2,
        // Hidden, not just dimmed, at the end of its travel — an overlay
        // control that cannot do anything is only covering a card.
        opacity: enabled ? 1 : 0,
        pointerEvents: enabled ? ('auto' as const) : ('none' as const),
        transition: 'opacity 0.2s ease',
        bgcolor: 'background.paper',
        boxShadow: 2,
        '&:hover': { bgcolor: 'background.paper' },
    });

    /**
     * Fade the content itself at any edge that can still scroll.
     *
     * A mask rather than a gradient overlay: an overlay has to match whatever
     * is behind the strip, and this sits on a themed gradient background where
     * no single colour would. Masking makes the cards themselves go
     * transparent, so it is correct on any backdrop and in either theme.
     */
    const maskImage = fade > 0 && (canScrollLeft || canScrollRight)
        ? `linear-gradient(to right, ${
              canScrollLeft ? `transparent 0, #000 ${fade}px` : '#000 0'
          }, ${
              canScrollRight ? `#000 calc(100% - ${fade}px), transparent 100%` : '#000 100%'
          })`
        : undefined;

    return (
        <Box className={className} sx={{ position: 'relative', minWidth: 0, ...sx }}>
            {!hideArrows && (
                <IconButton
                    size="small"
                    aria-label="scroll left"
                    disabled={!canScrollLeft}
                    onClick={() => scrollBy('left')}
                    sx={arrowSx('left', canScrollLeft)}
                >
                    <ChevronLeftIcon />
                </IconButton>
            )}

            <Box
                ref={trackRef}
                role="group"
                aria-label={ariaLabel}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={endDrag}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={endDrag}
                onMouseLeave={endDrag}
                sx={{
                    minWidth: 0,
                    overflowX: 'auto',
                    ...(maskImage ? { maskImage, WebkitMaskImage: maskImage } : {}),
                    overflowY: 'hidden',
                    scrollBehavior: 'smooth',
                    WebkitOverflowScrolling: 'touch',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    userSelect: isDragging ? 'none' : 'auto',
                    // Hidden: the fade and the arrows already say "there is
                    // more", and a bar under a masked edge looks like a
                    // rendering artefact.
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': { display: 'none' },
                    ...trackSx,
                }}
            >
                {children}
            </Box>

            {!hideArrows && (
                <IconButton
                    size="small"
                    aria-label="scroll right"
                    disabled={!canScrollRight}
                    onClick={() => scrollBy('right')}
                    sx={arrowSx('right', canScrollRight)}
                >
                    <ChevronRightIcon />
                </IconButton>
            )}
        </Box>
    );
};

export default HorizontalScroller;
