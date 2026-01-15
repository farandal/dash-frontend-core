import React, { RefObject } from 'react';
import ReactDOM from 'react-dom';
import { SidebarPosition } from '../AppSidebarMaterial';
import { getSubmenuStyle, SUBMENU_SCROLL_THRESHOLD } from './submenuConstants';

export interface SubmenuPortalProps {
    /** Whether the submenu is open */
    open: boolean;
    /** Reference to the parent menu item element for position calculation */
    itemRef: RefObject<HTMLElement | null>;
    /** Sidebar position affects where submenu opens relative to item */
    sidebarPosition: SidebarPosition;
    /** Submenu content to render */
    children: React.ReactNode;
    /** Mouse enter handler for hover behavior */
    onMouseEnter?: () => void;
    /** Mouse leave handler for hover behavior */
    onMouseLeave?: () => void;
    /** Number of children items (affects renderAtTop behavior) */
    childrenCount?: number;
    /** Additional CSS class */
    className?: string;
}

/**
 * Shared portal component for rendering submenus.
 * Renders content in a portal attached to document.body with calculated position.
 */
const SubmenuPortal: React.FC<SubmenuPortalProps> = ({
    open,
    itemRef,
    sidebarPosition,
    children,
    onMouseEnter,
    onMouseLeave,
    childrenCount = 0,
    className = 'sidebar-submenu-portal',
}) => {
    if (!open) return null;

    const renderAtTop = childrenCount > SUBMENU_SCROLL_THRESHOLD;

    return ReactDOM.createPortal(
        <div
            className={className}
            style={getSubmenuStyle(itemRef, sidebarPosition, renderAtTop)}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {children}
        </div>,
        document.body
    );
};

export default SubmenuPortal;
