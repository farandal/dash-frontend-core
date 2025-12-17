import React, { JSX, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import { IBreadcrumbItem, IDASHAppState, IPageState } from 'dash-admin-state';
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface BreadcrumbsProps {
    /** Override the breadcrumbs from Redux state */
    items?: IBreadcrumbItem[];
    /** Custom separator between breadcrumb items */
    separator?: React.ReactNode;
    /** Maximum number of items to show (others will be collapsed) */
    maxItems?: number;
    /** Custom class name */
    className?: string;
    /** Show home icon as first item */
    showHomeIcon?: boolean;
    /** Home path (default: '/') */
    homePath?: string;
    /** Home label (default: 'Home') */
    homeLabel?: string;
    /** Custom styles */
    sx?: Record<string, any>;
}

// ============================================================================
// BREADCRUMB ITEM COMPONENT
// ============================================================================

interface BreadcrumbItemProps {
    item: IBreadcrumbItem;
    isLast: boolean;
}

const BreadcrumbItem: React.FC<BreadcrumbItemProps> = ({ item, isLast }) => {
    const content = (
        <Box
            component="span"
            className={`dash-breadcrumb-item ${isLast ? 'dash-breadcrumb-item--active' : ''}`}
            sx={{
                display: 'inline-flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '2px',
                flexShrink: 0,
            }}
        >
            {item.icon && (
                <Box
                    component="span"
                    className="dash-breadcrumb-icon"
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        flexShrink: 0,
                        '& svg': {
                            fontSize: '12px',
                        },
                    }}
                >
                    {item.icon}
                </Box>
            )}
            <Typography
                component="span"
                className="dash-breadcrumb-label"
                sx={{
                    fontSize: '11px',
                    fontWeight: isLast ? 500 : 400,
                    lineHeight: 1.2,
                    color: isLast 
                        ? 'var(--text-header, #ffffff)' 
                        : 'var(--text-header-muted, rgba(255, 255, 255, 0.7))',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '120px',
                }}
            >
                {item.label}
            </Typography>
        </Box>
    );

    // If it's the last item or no path, don't make it a link
    if (isLast || !item.path) {
        return content;
    }

    // Ensure path starts with / to avoid relative navigation issues
    const path = !item.path.startsWith('/') ? `/${item.path}` : item.path;

    // Use React Router's Link for client-side navigation
    return (
        <Link
            to={path}
            className="dash-breadcrumb-link"
            style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
            }}
        >
            {content}
        </Link>
    );
};

// ============================================================================
// MAIN BREADCRUMBS COMPONENT
// ============================================================================

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
    items: propItems,
    separator,
    maxItems,
    className = '',
    showHomeIcon = false,
    homePath = '/',
    homeLabel = 'Home',
    sx = {},
}): JSX.Element | null => {
    // Create default separator inside component to avoid hook issues
    const defaultSeparator = <NavigateNextIcon sx={{ fontSize: '12px', color: 'var(--text-header-muted, rgba(255, 255, 255, 0.5))' }} />;
    const actualSeparator = separator ?? defaultSeparator;
    // Get breadcrumbs from Redux state if not provided via props
    const pageState: IPageState = useSelector(
        (state: IDASHAppState<any, any, IDashAutoAdminResourceConfig>) => state.page
    );

    const breadcrumbs = propItems || pageState.breadcrumbs;

    // Build final items list
    const displayItems = useMemo(() => {
        if (!breadcrumbs || breadcrumbs.length === 0) {
            return [];
        }

        let items = [...breadcrumbs];

        // Add home item if requested
        if (showHomeIcon) {
            const homeItem: IBreadcrumbItem = {
                label: homeLabel,
                path: homePath,
                icon: <HomeIcon />,
            };
            items = [homeItem, ...items];
        }

        // Apply maxItems limit if specified
        if (maxItems && items.length > maxItems) {
            const start = items.slice(0, 1);
            const end = items.slice(-(maxItems - 2));
            const ellipsis: IBreadcrumbItem = {
                label: '...',
                path: undefined,
            };
            items = [...start, ellipsis, ...end];
        }

        return items;
    }, [breadcrumbs, showHomeIcon, homeLabel, homePath, maxItems]);

    // Don't render if no items
    if (displayItems.length === 0) {
        return null;
    }

    return (
        <Box
            component="nav"
            aria-label="breadcrumb"
            className={`dash-breadcrumbs ${className}`}
            sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                flexWrap: 'nowrap',
                gap: '2px',
                padding: 0,
                margin: 0,
                ...sx,
            }}
        >
            {displayItems.map((item, index) => {
                const isLast = index === displayItems.length - 1;
                
                return (
                    <React.Fragment key={`breadcrumb-${index}-${item.label}`}>
                        <BreadcrumbItem item={item} isLast={isLast} />
                        {!isLast && (
                            <Box
                                component="span"
                                className="dash-breadcrumb-separator"
                                sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    mx: '1px',
                                    flexShrink: 0,
                                }}
                            >
                                {actualSeparator}
                            </Box>
                        )}
                    </React.Fragment>
                );
            })}
        </Box>
    );
};

export default Breadcrumbs;
