/**
 * TenantSwitcher
 *
 * A dropdown component that allows switching between the Tenancy Account and
 * individual Tenants. It reads the available tenants from the persisted
 * systemValues (populated by the tenancyAuth endpoint) and allows the user
 * to select one, triggering a full environment switch:
 *
 * - Persists the selected tenant_id to dashStorage
 * - Dispatches a 'tenant_switch' CustomEvent so the PrivateAppLoader can
 *   reload the correct resources, routes, and auth data
 * - Re-fetches the appropriate getAuth endpoint (tenancyAuth vs getauth)
 * - Updates CSS variables and logos from the new tenant's settings
 *
 * Consolidated 2026-08-03 from four byte-identical app-level copies
 * (kitchntabs-app, kitchntabs-web, vanexa-app, vanexa-web). The only per-app
 * difference was which local brand assets each app fell back to when
 * switching back to the tenancy level — that's now the defaultHorizontalLogo/
 * defaultSquaredLogo/defaultLoginBackground props instead of hardcoded
 * relative imports (a relative image import moved into this package would
 * have resolved against dash-admin's own assets, not each app's brand).
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Avatar,
    Box,
    Typography,
    CircularProgress,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import StoreIcon from '@mui/icons-material/Store';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ReactDOM from 'react-dom';
import { dashStorage } from 'dash-utils';
import { AuthPersistenceService } from 'dash-auth';
import { DASHAdminSystemConstants } from 'dash-constants';
import { useAxios } from 'dash-axios-hook';
import { updateDomCssVariables } from 'dash-utils';
import DASHLayoutSettings from '../../theme/AppLayoutSetting';
import { useDispatch, useSelector } from 'react-redux';
import { setPanelSettings } from 'dash-admin-state/redux/actions/Common';
import { IDASHAppState } from 'dash-admin-state';
import { useWindowSize } from 'dash-utils';
import { setAuthEvent } from '../../contexts/auth';

export interface TenantSwitcherProps {
    /** Fallback horizontal logo used when switching back to the tenancy level */
    defaultHorizontalLogo?: string;
    /** Fallback squared logo used when switching back to the tenancy level */
    defaultSquaredLogo?: string;
    /** Fallback login background used when switching back to the tenancy level */
    defaultLoginBackground?: string;
}

/** Shape of a tenant from systemValues.tenants */
interface TenantOption {
    id: string;
    name: string;
    slug: string | null;
}

/** The value emitted in the tenant_switch CustomEvent */
export interface TenantSwitchEventDetail {
    tenantId: string | null; // null = tenancy account level
    tenantName: string;
    isTenanancyLevel: boolean;
}

/**
 * Dispatch a tenant_switch event so other parts of the app can react.
 */
export const dispatchTenantSwitchEvent = (detail: TenantSwitchEventDetail) => {
    window.dispatchEvent(new CustomEvent('tenant_switch', { detail }));
};

/**
 * Get the currently active tenant_id from storage (null = tenancy level).
 */
export const getActiveTenantId = (): string | null => {
    if (!isTenantImpersonationEnabled()) {
        return null;
    }
    return dashStorage.getItem('active_tenant_id') || null;
};

/**
 * Check whether tenant impersonation is enabled.
 */
export const isTenantImpersonationEnabled = (): boolean => {
    const val = DASHAdminSystemConstants.system.ENABLE_TENANT_IMPERSONATION;
    if (typeof val === 'boolean') return val;
    if (typeof val === 'string') return val === 'true' || val === '1';
    return !!val;
};



const TenantSwitcher: React.FC<TenantSwitcherProps> = ({
    defaultHorizontalLogo,
    defaultSquaredLogo,
    defaultLoginBackground,
}) => {
    const axios = useAxios();
    const dispatch = useDispatch();
    const windowSize = useWindowSize();



    const [open, setOpen] = useState(false);
    const [switching, setSwitching] = useState(false);
    const avatarRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [webView, setWebView] = useState(false);

    // Current active tenant id
    const [activeTenantId, setActiveTenantId] = useState<string | null>(
        getActiveTenantId()
    );

    // Read panel settings for logos
    const panelSettings = useSelector(
        (state: IDASHAppState<any, any, any>) => state.common?.panelSettings
    );

    // Get primary and secondary sidebar positions from Redux panelSettings
    const sidebarPosition = panelSettings?.sidebarPosition || 'left';

    // Get tenants from persisted systemValues
    const systemValues = AuthPersistenceService.getSystemValues();
    const tenants: TenantOption[] = systemValues?.tenants || [];
    const tenancy = systemValues?.tenancy;

    // Get current tenant auth data for display
    const auth = AuthPersistenceService.getAuth();
    const currentTenantName = activeTenantId
        ? tenants.find(t => t.id === activeTenantId)?.name || 'Tenant'
        : tenancy?.public_name || auth?.tenant?.name || 'Tenancy Account';

    useEffect(() => {
        if (document.body.classList.contains('webview')) {
            setWebView(true);
        }
    }, []);

    // Don't render if impersonation is disabled or no tenants available
    if (!isTenantImpersonationEnabled() || tenants.length === 0) {
        return null;
    }

     const calculateMenuPosition = () => {
        if (avatarRef.current && windowSize.width && windowSize.height) {
            const rect = avatarRef.current.getBoundingClientRect();
            const menuWidth = 230; // minWidth from styles
            const menuHeight = 120; // approximate menu height

            let left = rect.left + window.scrollX;
            let top = rect.top + window.scrollY;

            // Ensure menu doesn't go off-screen horizontally
            if (left + menuWidth > windowSize.width) {
                left = windowSize.width - menuWidth - 10; // 10px margin
            }
            if (left < 10) {
                left = 10; // 10px margin
            }

            // For bottom sidebar position, open menu above the avatar
            if (sidebarPosition === 'bottom') {
                top = rect.top + window.scrollY - menuHeight - 10; // Open above
            }

            setMenuPosition({
                top: top,
                left: left + 40
            });
        }
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setOpen(true);
        calculateMenuPosition();
    };

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        setOpen(prev => !prev);
        calculateMenuPosition();
    };

    const handleMouseLeave = () => {
        if (!webView) {
            timeoutRef.current = setTimeout(() => setOpen(false), 150);
        }
    };

    const handleMenuMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    const handleMenuMouseLeave = () => {
        if (!webView) {
            setOpen(false);
        }
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    useEffect(() => {
        if (open) calculateMenuPosition();
    }, [open, windowSize.width]);

    /**
     * Core switching logic.
     * - Always uses tenancyAuth endpoint (preserves tenancy/tenants in response)
     * - Passes X-Tenant-Id header when switching to a specific tenant
     * - Persists auth data
     * - Updates CSS variables, logos
     * - Dispatches tenant_switch event for PrivateAppLoader
     */
    const handleSwitch = useCallback(async (tenantId: string | null) => {
        if (switching) return;
        if (tenantId === activeTenantId) {
            setOpen(false);
            return;
        }

        setSwitching(true);
        setOpen(false);

        try {
            const isTenancyLevel = tenantId === null;
            // Always use tenancyAuth - it returns tenancy/tenants list + respects
            // X-Tenant-Id header. Deliberately NOT reading APP_GETAUTH_ENDPOINT
            // here (every app's env has it set to 'auth/getauth') — that
            // endpoint ignores X-Tenant-Id entirely and always resolves off the
            // user's raw tenant_id FK, so every switch silently kept returning
            // the same tenant's data regardless of which one was picked. This
            // component only ever renders once TenancyContextService has
            // already put at least one tenant in scope (see the render guard
            // below), so hitting the TenancyAdmin-only endpoint unconditionally
            // is always correct here.
            const authEndpoint = 'auth/tenancyAuth';

            // If switching to a specific tenant, set the header so backend knows
            const headers: Record<string, string> = {};
            if (!isTenancyLevel && tenantId) {
                headers['X-Tenant-Id'] = tenantId;
            }

            // Persist active_tenant_id BEFORE the request so the axios interceptor picks it up
            if (tenantId) {
                dashStorage.setItem('active_tenant_id', tenantId);
                dashStorage.setItem('tenant_id', tenantId);
            } else {
                dashStorage.removeItem('active_tenant_id');
                dashStorage.removeItem('tenant_id');
            }

            // Persist the choice server-side so it survives a reload and
            // shows up on another device — not just in this browser's
            // storage. Best-effort: a failed write here still leaves the
            // switch working for the rest of this session via the local
            // storage above, it just won't be remembered next time.
            try {
                await axios.put('auth/active-tenant', { tenant_id: tenantId });
            } catch (err) {
                console.error('[TenantSwitcher] Failed to persist active tenant:', err);
            }

            // Fetch new auth data from the correct endpoint
            const { data: authData } = await axios.get(authEndpoint, { headers });

            // Persist auth data using the standard service
            AuthPersistenceService.saveAuth(authData);

            // Update basic localStorage for react-admin compatibility
            dashStorage.setItem('authenticated', 'true');
            dashStorage.setItem('user', JSON.stringify(authData.user));
            if (authData.user?.roles) {
                dashStorage.setItem('roles', JSON.stringify(authData.user.roles));
            }

            // Trigger auth context update
            setAuthEvent({
                authenticated: true,
                user: authData.user,
                auth: authData.auth,
                token: dashStorage.getItem('token'),
                roles: authData.user?.roles,
            });

            // Update CSS variables from new tenant settings
            const tenantSettings = authData.auth?.tenantSettings;
            try {

                // Read current theme mode instead of hardcoding 'dark'
                const currentThemeMode = document.documentElement.getAttribute('data-theme') || DASHLayoutSettings.THEME_TYPE_DARK;
                // Always call updateDomCssVariables — when colors is undefined,
                // it correctly resets to compiled LESS defaults for tenants without custom colors.
                updateDomCssVariables(currentThemeMode, tenantSettings?.colors, tenantSettings?.values);
            } catch (err) {
                console.error('[TenantSwitcher] Error updating CSS variables:', err);
            }

            // Update logos in Redux panel settings
            const tenantImages = authData.auth?.tenantImages;
            if (tenantImages) {
                AuthPersistenceService.setTenantImages(tenantImages);
                dispatch(setPanelSettings({
                    ...(panelSettings || {}),
                    horizontalLogo: tenantImages.horizontal_logo?.original || panelSettings?.horizontalLogo,
                    squaredLogo: tenantImages.squared_logo?.original || panelSettings?.squaredLogo,
                    loginBackground: tenantImages.banner?.original || panelSettings?.loginBackground,
                }));
            } else {
                // Switching to tenancy level — clear stale tenant images
                // and reset Redux logos to system defaults
                AuthPersistenceService.clearTenantImages();
                dispatch(setPanelSettings({
                    ...(panelSettings || {}),
                    horizontalLogo: defaultHorizontalLogo,
                    squaredLogo: defaultSquaredLogo,
                    loginBackground: defaultLoginBackground,
                }));
            }

            // Update tenant settings in persistence
            if (tenantSettings) {
                AuthPersistenceService.setTenantSettings(tenantSettings);
            } else {
                // Switching to tenancy level — clear stale tenant settings
                // so DashThemeProvider reads null on remount and uses defaults
                AuthPersistenceService.clearTenantSettings();
            }

            setActiveTenantId(tenantId);

            // Find tenant name for event
            const tenantName = isTenancyLevel
                ? (tenancy?.public_name || 'Tenancy Account')
                : (tenants.find(t => t.id === tenantId)?.name || 'Tenant');

            // Dispatch switch event so PrivateAppLoader can reload resources
            dispatchTenantSwitchEvent({
                tenantId,
                tenantName,
                isTenanancyLevel: isTenancyLevel,
            });

            console.log(`[TenantSwitcher] Switched to ${isTenancyLevel ? 'Tenancy Account' : tenantName} (${tenantId})`);

        } catch (error) {
            console.error('[TenantSwitcher] Switch failed:', error);
            // Revert storage on failure
            if (activeTenantId) {
                dashStorage.setItem('active_tenant_id', activeTenantId);
                dashStorage.setItem('tenant_id', activeTenantId);
            } else {
                dashStorage.removeItem('active_tenant_id');
                dashStorage.removeItem('tenant_id');
            }
        } finally {
            setSwitching(false);
        }
    }, [activeTenantId, switching, axios, dispatch, panelSettings, tenants, tenancy, defaultHorizontalLogo, defaultSquaredLogo, defaultLoginBackground]);

    const isSelected = (id: string | null) => id === activeTenantId;

    return (
        <>
            <div
                ref={avatarRef}
                className="dash-tenant-switcher-trigger"
                {...(!webView
                    ? { onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave }
                    : { onClick: handleClick }
                )}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
                {switching ? (
                    <CircularProgress
                     className='dash-icon-button-color dash-icon-button-bg'
                    size={30} />
                ) : (
                    <Avatar
                        className='dash-icon-button-color dash-icon-button-bg'
                        sx={{
                            width: 30,
                            height: 30,
                            fontSize: '0.8rem',
                        }}
                    >
                        {activeTenantId ? <StoreIcon sx={{ fontSize: 18 }} /> : <BusinessIcon sx={{ fontSize: 18 }} />}
                    </Avatar>
                )}
            </div>

            {open && ReactDOM.createPortal(
                <div
                    ref={menuRef}
                    className="dash-tenant-switcher-portal"
                    onMouseEnter={!webView ? handleMenuMouseEnter : undefined}
                    onMouseLeave={!webView ? handleMenuMouseLeave : undefined}
                >
                    <div
                        className="dash-tenant-switcher-menu"
                        style={{
                            top: menuPosition.top,
                            left: menuPosition.left,
                            zIndex: 10000,
                            position: 'absolute',
                        }}
                    >
                        {/* Header */}
                        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                <SwapHorizIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                                Switch Environment
                            </Typography>
                        </Box>

                        {/* Tenancy Account option */}
                        <div
                            onClick={() => handleSwitch(null)}
                            style={{
                                padding: '10px 16px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                backgroundColor: isSelected(null) ? 'rgba(var(--dash-primary-rgb, 25, 118, 210), 0.15)' : 'transparent',
                                borderLeft: isSelected(null) ? '3px solid var(--dash-primary, #1976d2)' : '3px solid transparent',
                                transition: 'background-color 0.15s ease',
                            }}
                            onMouseOver={(e) => { if (!isSelected(null)) (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'); }}
                            onMouseOut={(e) => { if (!isSelected(null)) (e.currentTarget.style.backgroundColor = 'transparent'); }}
                        >
                            <BusinessIcon sx={{ fontSize: 20, color: isSelected(null) ? 'primary.main' : 'text.secondary' }} />
                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: isSelected(null) ? 600 : 400, color: isSelected(null) ? 'primary.main' : 'text.primary' }}>
                                    {tenancy?.public_name || 'Tenancy Account'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    Manager Account
                                </Typography>
                            </Box>
                        </div>

                        {/* Divider */}
                        <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.06)', mx: 1 }} />

                        {/* Tenant options */}
                        {tenants.map((tenant) => (
                            <div
                                key={tenant.id}
                                onClick={() => handleSwitch(tenant.id)}
                                style={{
                                    padding: '10px 16px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    backgroundColor: isSelected(tenant.id) ? 'rgba(var(--dash-primary-rgb, 25, 118, 210), 0.15)' : 'transparent',
                                    borderLeft: isSelected(tenant.id) ? '3px solid var(--dash-primary, #1976d2)' : '3px solid transparent',
                                    transition: 'background-color 0.15s ease',
                                }}
                                onMouseOver={(e) => { if (!isSelected(tenant.id)) (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'); }}
                                onMouseOut={(e) => { if (!isSelected(tenant.id)) (e.currentTarget.style.backgroundColor = 'transparent'); }}
                            >
                                <StoreIcon sx={{ fontSize: 20, color: isSelected(tenant.id) ? 'primary.main' : 'text.secondary' }} />
                                <Box>
                                    <Typography variant="body2" sx={{ fontWeight: isSelected(tenant.id) ? 600 : 400, color: isSelected(tenant.id) ? 'primary.main' : 'text.primary' }}>
                                        {tenant.name}
                                    </Typography>
                                    {tenant.slug && (
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                            {tenant.slug}
                                        </Typography>
                                    )}
                                </Box>
                            </div>
                        ))}
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default TenantSwitcher;
