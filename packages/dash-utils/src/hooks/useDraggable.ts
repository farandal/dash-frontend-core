import { useState, useCallback, useEffect } from 'react';

export interface DraggablePosition {
    x: number;
    y: number;
}

export interface UseDraggableOptions {
    /** Initial position */
    initialPosition?: DraggablePosition;
    /** Minimum X position (default: 0) */
    minX?: number;
    /** Minimum Y position (default: 0) */
    minY?: number;
    /** Maximum X position (default: window.innerWidth - elementWidth) */
    maxX?: number;
    /** Maximum Y position (default: window.innerHeight - elementHeight) */
    maxY?: number;
    /** Element width for boundary calculation */
    elementWidth?: number;
    /** Element height for boundary calculation */
    elementHeight?: number;
    /** Callback when position changes */
    onPositionChange?: (position: DraggablePosition) => void;
    /** Callback when drag starts */
    onDragStart?: () => void;
    /** Callback when drag ends */
    onDragEnd?: () => void;
}

export interface UseDraggableReturn {
    position: DraggablePosition;
    isDragging: boolean;
    handleMouseDown: (e: React.MouseEvent) => void;
    setPosition: (position: DraggablePosition) => void;
}

/**
 * Hook for making elements draggable
 * Handles mouse events and position calculations
 */
export const useDraggable = (options: UseDraggableOptions = {}): UseDraggableReturn => {
    const {
        initialPosition = { x: 0, y: 0 },
        minX = 0,
        minY = 0,
        maxX,
        maxY,
        elementWidth = 400,
        elementHeight = 200,
        onPositionChange,
        onDragStart,
        onDragEnd,
    } = options;

    const [position, setPosition] = useState<DraggablePosition>(initialPosition);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    // Calculate boundaries
    const getMaxX = useCallback(() => {
        if (maxX !== undefined) return maxX;
        return typeof window !== 'undefined' ? window.innerWidth - elementWidth : 1000;
    }, [maxX, elementWidth]);

    const getMaxY = useCallback(() => {
        if (maxY !== undefined) return maxY;
        return typeof window !== 'undefined' ? window.innerHeight - elementHeight : 800;
    }, [maxY, elementHeight]);

    // Handle mouse down - start dragging
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        // Only start drag if clicking on an element with .drag-handle class
        if ((e.target as HTMLElement).closest('.drag-handle')) {
            e.preventDefault();
            setIsDragging(true);
            setDragOffset({
                x: e.clientX - position.x,
                y: e.clientY - position.y,
            });
            onDragStart?.();
        }
    }, [position, onDragStart]);

    // Handle mouse move
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging) {
            e.preventDefault();
            const newX = Math.max(minX, Math.min(getMaxX(), e.clientX - dragOffset.x));
            const newY = Math.max(minY, Math.min(getMaxY(), e.clientY - dragOffset.y));
            const newPosition = { x: newX, y: newY };
            setPosition(newPosition);
            onPositionChange?.(newPosition);
        }
    }, [isDragging, dragOffset, minX, minY, getMaxX, getMaxY, onPositionChange]);

    // Handle mouse up - stop dragging
    const handleMouseUp = useCallback(() => {
        if (isDragging) {
            setIsDragging(false);
            onDragEnd?.();
        }
    }, [isDragging, onDragEnd]);

    // Add/remove event listeners
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.userSelect = 'none';

            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                document.body.style.userSelect = '';
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    // Update position when initialPosition changes
    useEffect(() => {
        setPosition(initialPosition);
    }, [initialPosition.x, initialPosition.y]);

    return {
        position,
        isDragging,
        handleMouseDown,
        setPosition,
    };
};

export default useDraggable;
