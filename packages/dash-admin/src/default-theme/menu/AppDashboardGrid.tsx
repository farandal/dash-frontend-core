import * as React from 'react';

import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { Box, Paper, ButtonBase, Typography, useTheme, SxProps, Theme } from '@mui/material';

import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import { IDASHAppState } from 'dash-admin-state';

import checkRole from '../../helpers/checkRole';
import { useAuthContext } from '../../contexts/auth/AuthContext';
import { useI18nBridge } from '../../contexts/I18nBridgeContext';

export type DashboardGridCardSize = 'small' | 'medium' | 'large' | number;

export interface IDashboardMenuGridColumns {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
}

export interface IDashboardMenuGridProps {
    /** Number of grid columns — a single number, or MUI-style responsive breakpoints. Default: { xs: 2, sm: 3, md: 4, lg: 6 }. */
    columns?: number | IDashboardMenuGridColumns;
    /** Caps the visible grid to this many rows, scrolling internally beyond that. Omit to let the grid grow with its content. */
    rows?: number;
    /** Card/icon preset, or an explicit card size in pixels. Default: 'large'. */
    size?: DashboardGridCardSize;
    /** Gap between cards, in MUI spacing units. Default: 2. */
    gap?: number;
    /** Overrides the resources pulled from the Redux store — mirrors AppMaterialMenu's `menu` prop, mainly for debugging/storybook. */
    menu?: IDashAutoAdminResourceConfig[];
    debug?: boolean;
    sx?: SxProps<Theme>;
    className?: string;
}

interface IDashboardGridItem {
    key: React.Key;
    label: string;
    to: string;
    icon?: IDashAutoAdminResourceConfig['icon'];
}

const SIZE_PRESETS: Record<'small' | 'medium' | 'large', { card: number; icon: number }> = {
    small: { card: 96, icon: 32 },
    medium: { card: 128, icon: 48 },
    large: { card: 160, icon: 64 },
};

const resolveSize = (size: DashboardGridCardSize | undefined) => {
    if (typeof size === 'number') {
        return { card: size, icon: Math.round(size * 0.4) };
    }
    return SIZE_PRESETS[size ?? 'large'];
};

// Same convention AppMaterialMenu uses to turn a resource config into a
// navigable path — kept in sync deliberately, so a resource lands on the
// same URL whether it's clicked from the sidebar or from this grid.
const buildMenuPath = (resource: IDashAutoAdminResourceConfig): string => {
    if (resource.menuOnly) {
        return resource.redirect || resource.path || `/${resource.model}`;
    }
    if (resource?.redirect?.startsWith('/')) {
        return resource.redirect;
    }
    if (resource?.redirect) {
        return `/${resource.model}/${resource.redirect}`.replace(/\/+/g, '/');
    }
    return `/${resource.model}`.replace(/\/+/g, '/');
};

const renderIcon = (icon: IDashAutoAdminResourceConfig['icon'], size: number) => {
    if (!icon) return null;

    if (React.isValidElement(icon)) {
        const existingSx = (icon.props as any)?.sx;
        return React.cloneElement(icon as React.ReactElement<any>, {
            sx: { fontSize: size, color: 'primary.main', ...existingSx },
        });
    }

    const IconComponent = icon as React.ComponentType<any>;
    return <IconComponent sx={{ fontSize: size, color: 'primary.main' }} />;
};

/**
 * Flat, icon-first grid of every resource/menu option the current user can
 * access — a launcher-style alternative to the sidebar, meant to be dropped
 * into an app's Dashboard. Layout (columns/rows/card size) is fully
 * prop-driven; the item list itself always comes from the same role-filtered
 * resource set AppMaterialMenu uses, so the grid never drifts out of sync
 * with what's actually reachable from the sidebar.
 */
const AppDashboardGrid: React.FC<IDashboardMenuGridProps> = ({
    columns = { xs: 2, sm: 3, md: 4, lg: 6 },
    rows,
    size = 'large',
    gap = 2,
    menu,
    debug,
    sx,
    className,
}) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const authContext = useAuthContext();
    const { i18nProvider } = useI18nBridge();

    const translate = React.useCallback((key: string, options?: any) => {
        if (typeof key !== 'string') return key;
        if (i18nProvider?.translate) {
            try {
                return i18nProvider.translate(key, options);
            } catch {
                return key;
            }
        }
        return key;
    }, [i18nProvider]);

    const resources = useSelector(
        (state: IDASHAppState<any, any, IDashAutoAdminResourceConfig>) => {
            if (debug || menu) return menu;
            return state.resources.items;
        },
    );

    const items = React.useMemo<IDashboardGridItem[]>(() => {
        const userRoles = authContext?.user?.roles
            ? authContext.user.roles.flatMap((role) => role.name)
            : ['Public'];

        return (resources || [])
            .filter((resource) => resource.hidden !== true && checkRole(userRoles, resource.roles || []))
            .map((resource) => {
                const label = resource.label || resource.model;
                return {
                    key: label,
                    label: translate(label, { _: label }),
                    to: buildMenuPath(resource),
                    icon: resource.icon,
                };
            });
    }, [resources, authContext?.user, translate]);

    const { card: cardSize, icon: iconSize } = resolveSize(size);

    const columnTemplate = React.useMemo(() => {
        if (typeof columns === 'number') {
            return `repeat(${columns}, minmax(0, 1fr))`;
        }
        return {
            xs: `repeat(${columns.xs ?? 2}, minmax(0, 1fr))`,
            sm: `repeat(${columns.sm ?? columns.xs ?? 3}, minmax(0, 1fr))`,
            md: `repeat(${columns.md ?? columns.sm ?? 4}, minmax(0, 1fr))`,
            lg: `repeat(${columns.lg ?? columns.md ?? 6}, minmax(0, 1fr))`,
            xl: `repeat(${columns.xl ?? columns.lg ?? 6}, minmax(0, 1fr))`,
        };
    }, [columns]);

    if (!items.length) return null;

    const gapPx = theme.spacing(gap);

    return (
        <Box
            className={className}
            sx={{
                display: 'grid',
                gridTemplateColumns: columnTemplate,
                gap,
                ...(rows
                    ? {
                          gridAutoRows: cardSize,
                          maxHeight: `calc(${rows} * ${cardSize}px + ${rows - 1} * ${gapPx})`,
                          overflowY: 'auto',
                          pr: 1,
                      }
                    : {}),
                ...sx,
            }}
        >
            {items.map((item) => (
                <ButtonBase
                    key={item.key}
                    onClick={() => navigate(item.to)}
                    sx={{ display: 'block', borderRadius: 2, textAlign: 'left' }}
                >
                    <Paper
                        variant="outlined"
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                            height: cardSize,
                            width: '100%',
                            p: 2,
                            borderRadius: 2,
                            transition: 'background-color 0.15s ease, border-color 0.15s ease, transform 0.15s ease',
                            '&:hover': {
                                bgcolor: 'action.hover',
                                borderColor: 'primary.main',
                                transform: 'translateY(-2px)',
                            },
                        }}
                    >
                        {renderIcon(item.icon, iconSize)}
                        <Typography
                            variant="body2"
                            align="center"
                            sx={{
                                fontWeight: 500,
                                lineHeight: 1.2,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                            }}
                        >
                            {item.label}
                        </Typography>
                    </Paper>
                </ButtonBase>
            ))}
        </Box>
    );
};

export default AppDashboardGrid;
