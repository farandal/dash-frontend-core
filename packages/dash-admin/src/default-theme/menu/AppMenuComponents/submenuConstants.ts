import { CSSProperties, RefObject } from 'react';
import { SidebarPosition } from '../AppSidebarMaterial';

// Toggle this to force click behavior instead of hover (for debugging/testing)
export const FORCE_CLICK_OPEN = false; // Set to true for click behavior

// Threshold for when submenu should render at fixed top/bottom instead of relative to item
export const SUBMENU_SCROLL_THRESHOLD = 10;

/**
 * Base styles for submenu portal container
 */
export const getSubmenuBaseStyle = (
    sidebarPosition: SidebarPosition,
    renderAtTop: boolean = false
): CSSProperties => ({
    zIndex: 10000,
    position: 'fixed',
    maxHeight: sidebarPosition === "top" || sidebarPosition === "bottom" ? '60vh' : (renderAtTop ? '100vh' : '80vh'),
    overflowY: 'auto',
    width: sidebarPosition === "top" || sidebarPosition === "bottom" ? 'auto' : '260px',
    minWidth: '200px',
    background: 'var(--module-bg, #252526)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
    borderRadius: 8,
});

/**
 * Calculate submenu position based on sidebar position and item rect
 */
export const calculateSubmenuPosition = (
    rect: DOMRect,
    sidebarPosition: SidebarPosition,
    renderAtTop: boolean = false
): CSSProperties => {
    switch (sidebarPosition) {
        case "right":
            // Submenu opens to the LEFT of the sidebar item
            return { 
                top: rect.top, 
                right: window.innerWidth - rect.left - 4,
                left: 'auto'
            };
        case "top":
            return { 
                top: renderAtTop ? 120 : rect.bottom - 4, 
                left: rect.left,
                right: 'auto'
            };
        case "bottom":
            return { 
                bottom: renderAtTop ? 120 : (window.innerHeight - rect.top) - 4, 
                left: rect.left,
                right: 'auto'
            };
        case "left":
        default:
            // Submenu opens to the RIGHT of the sidebar item
            return { 
                top: rect.top, 
                left: rect.right - 4,
                right: 'auto'
            };
    }
};

/**
 * Get complete submenu style by combining base style and position
 */
export const getSubmenuStyle = (
    itemRef: RefObject<HTMLElement | null>,
    sidebarPosition: SidebarPosition,
    renderAtTop: boolean = false
): CSSProperties => {
    const rect = itemRef.current?.getBoundingClientRect();
    const baseStyle = getSubmenuBaseStyle(sidebarPosition, renderAtTop);

    if (!rect) {
        // Fallback if rect not available
        return { ...baseStyle, top: 0, left: 0 };
    }

    const positionStyle = calculateSubmenuPosition(rect, sidebarPosition, renderAtTop);
    return { ...baseStyle, ...positionStyle };
};
