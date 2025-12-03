/**
 * MinimalLayout Component
 *
 * A minimal layout wrapper that simply renders its children.
 * Useful as a pass-through layout when you want React-Admin
 * to use a different layout than the default.
 */
import React from 'react';

export interface MinimalLayoutProps {
    children?: React.ReactNode;
}

/**
 * MinimalLayout - A pass-through layout component
 * Simply renders children without any wrapper elements
 */
export const MinimalLayout: React.FC<MinimalLayoutProps> = ({ children }) => {
    return <>{children}</>;
};

export default MinimalLayout;
