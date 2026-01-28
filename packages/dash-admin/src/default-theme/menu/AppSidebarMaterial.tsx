import * as React from 'react';
import { styled, Theme, CSSObject } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import { useMediaQuery, useTheme } from '@mui/material';
import { IDASHAppState, DASH_REDUX_ACTIONS } from 'dash-admin-state';
import { useDispatch, useSelector } from 'react-redux';
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import { useState } from 'react';

import { useWindowSize, dashStorage } from 'dash-utils';
import AppMaterialMenu from './AppMaterialMenu';
import { useLocation } from 'react-router';
import { isEqual } from 'lodash';
import { NavEventManager } from '../../utils/navEvents';

// Only keep layout settings selector - remove nav state selectors
const selectLayoutSettings = (state: IDASHAppState<any, any, IDashAutoAdminResourceConfig>) => ({
    navStyle: state.settings.navStyle,
    layoutType: state.settings.layoutType,
    themeType: state.settings.themeType,
    layoutSettings: state.settings.layoutSettings,
});

const selectPanelSettings = (state: IDASHAppState<any, any, IDashAutoAdminResourceConfig>) => 
    state.common.panelSettings;

// Sidebar position type
export type SidebarPosition = "left" | "top" | "bottom" | "right";

// Component props interface
export interface AppSidebarMaterialProps {
    className?: string;
    sidebarPosition?: SidebarPosition;
   
}

const AppSidebarMaterial: React.FC<AppSidebarMaterialProps> = (props) => {
    const { sidebarPosition: propSidebarPosition} = props;
    const location = useLocation();
    const dispatch = useDispatch();
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const isMediumOrSmaller = useMediaQuery(theme.breakpoints.down('md')); // For sidebar position switching

    // Only subscribe to layout settings - nav state is handled by AppSidebarMaterial
    const layoutState = useSelector(selectLayoutSettings, isEqual);
    const panelSettings = useSelector(selectPanelSettings);

    // Get primary and secondary sidebar positions from Redux panelSettings
    const primarySidebarPosition: SidebarPosition = propSidebarPosition || panelSettings?.sidebarPosition || 'left';
    const secondarySidebarPosition: SidebarPosition = panelSettings?.secondarySidebarPosition || 'left';

    // Use secondary position on medium or smaller screens (for burger menu behavior)
    const sidebarPosition: SidebarPosition = isMediumOrSmaller ? secondarySidebarPosition : primarySidebarPosition;

    // Check if position is horizontal (top/bottom) - these don't expand/collapse
    const isHorizontalPosition = sidebarPosition === "top" || sidebarPosition === "bottom";

    const {
        navStyle,
        layoutType,
        themeType,
        layoutSettings
    } = layoutState;

    // Local state for nav - initialize from localStorage for persistence
    const [localNavExpanded, setLocalNavExpanded] = useState(() => {
        const stored = dashStorage.getItem('dashNavExpanded');
        return stored !== null ? stored === 'true' : false;
    });
    const [localNavSize, setLocalNavSize] = useState<"small" | "large">(() => {
        const stored = dashStorage.getItem('dashNavSize');
        return (stored === 'small' || stored === 'large') ? stored : 'large';
    });

    // Create refs to track current values for Redux sync
    const localNavExpandedRef = React.useRef(localNavExpanded);
    const localNavSizeRef = React.useRef(localNavSize);

    // Update refs when values change
    React.useEffect(() => {
        localNavExpandedRef.current = localNavExpanded;
        localNavSizeRef.current = localNavSize;
    }, [localNavExpanded, localNavSize]);

    // Persist nav state to localStorage when it changes
    React.useEffect(() => {
        dashStorage.setItem('dashNavExpanded', String(localNavExpanded));
    }, [localNavExpanded]);

    React.useEffect(() => {
        dashStorage.setItem('dashNavSize', localNavSize);
    }, [localNavSize]);

    // Listen for nav events from other components
    React.useEffect(() => {
        const unsubscribeToggle = NavEventManager.onToggleExpanded(() => {
            setLocalNavExpanded(prev => !prev);
        });

        const unsubscribeSet = NavEventManager.onSetExpanded((expanded) => {
            setLocalNavExpanded(expanded);
        });

        // Listen for close drawer events (triggered when navigating on mobile)
        const unsubscribeClose = NavEventManager.onCloseDrawer(() => {
            if (localNavSize === 'small') {
                setLocalNavExpanded(false);
            }
        });

        return () => {
            unsubscribeToggle();
            unsubscribeSet();
            unsubscribeClose();
        };
    }, [localNavSize]);

    // Memoize logo extraction to prevent unnecessary re-renders
    const logos = React.useMemo(() => ({
        horizontalLogo: panelSettings?.horizontalLogo || <>🖥</>,
        squaredLogo: panelSettings?.squaredLogo || <>🖥</>,
    }), [panelSettings?.horizontalLogo, panelSettings?.squaredLogo]);

    // Body class management - keep it simple
    React.useEffect(() => {
        if (!layoutSettings || !layoutType || !themeType) return;
        
        const body = document.body;
        
        // Remove old classes
        body.classList.remove(
            layoutSettings.LAYOUT_TYPE_FULL,
            layoutSettings.LAYOUT_TYPE_BOXED,
            layoutSettings.LAYOUT_TYPE_FRAMED,
            layoutSettings.THEME_TYPE_DARK,
            layoutSettings.THEME_TYPE_LIGHT
        );
        
        // Add new classes
        body.classList.add(layoutType, themeType);
    }, [layoutType, themeType, layoutSettings]);

    // Nav style management
    React.useEffect(() => {
        if (!layoutSettings || !navStyle) return;
        
        const body = document.body;
        const horizontalStyles = [
            layoutSettings.NAV_STYLE_DEFAULT_HORIZONTAL,
            layoutSettings.NAV_STYLE_DARK_HORIZONTAL,
            layoutSettings.NAV_STYLE_INSIDE_HEADER_HORIZONTAL,
            layoutSettings.NAV_STYLE_ABOVE_HEADER,
            layoutSettings.NAV_STYLE_BELOW_HEADER
        ];
        
        const isHorizontal = horizontalStyles.includes(navStyle);
        body.classList.toggle('full-scroll', isHorizontal);
        body.classList.toggle('horizontal-layout', isHorizontal);
    }, [navStyle, layoutSettings]);

    // Location-based classes - ONLY dispatch to Redux on location changes
    const previousLocationClassRef = React.useRef<string>('');
    
    React.useEffect(() => {
        const body = document.body;
        let formattedPath = '';
        
        if (location.pathname && location.pathname !== '/') {
            formattedPath = location.pathname.replace(/^\/|\/$/g, '').replace(/\//g, '-');
        }
        
        const currentLocationClass = formattedPath ? `location-${formattedPath}` : '';
        
        // Remove previous class
        if (previousLocationClassRef.current) {
            body.classList.remove(previousLocationClassRef.current);
        }
        
        // Add new class
        if (currentLocationClass) {
            body.classList.add(currentLocationClass);
            previousLocationClassRef.current = currentLocationClass;
        } else {
            previousLocationClassRef.current = '';
        }

        // 🎯 ONLY sync local nav state to Redux on location changes (not on every nav toggle)
        return () => {
            if (previousLocationClassRef.current) {
                body.classList.remove(previousLocationClassRef.current);
            }
            
            // Use ref values to avoid stale closures and prevent infinite loops
            dispatch(DASH_REDUX_ACTIONS.setNavExpanded(localNavExpandedRef.current));
            dispatch(DASH_REDUX_ACTIONS.setNavSize(localNavSizeRef.current));
        };
    }, [location.pathname, dispatch]); // ✅ Removed localNavExpanded and localNavSize from deps

    const windowSize = useWindowSize();

    // Update parent layout className whenever local nav state or position changes
    React.useEffect(() => {
        const layoutElement = document.getElementById('dash-app-layout');
        if (layoutElement) {
            // Remove existing nav-related classes
            layoutElement.classList.remove('expanded', 'collapsed', 'small', 'large');
            layoutElement.classList.remove('sidebar-position-left', 'sidebar-position-right', 'sidebar-position-top', 'sidebar-position-bottom');
            
            // Add current state classes
            layoutElement.classList.add(localNavExpanded ? 'expanded' : 'collapsed');
            layoutElement.classList.add(localNavSize);
            layoutElement.classList.add(`sidebar-position-${sidebarPosition}`);
        }
    }, [localNavExpanded, localNavSize, sidebarPosition]);

    const toggleDrawer = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setLocalNavExpanded(!localNavExpanded);
        // 🎯 NO Redux dispatch here - only local state update
        // Redux will be synced only on location changes
    };

    // isSmallScreen and theme are already declared at the top of the component
    const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));

    // Track previous breakpoint states to detect changes
    const [prevIsSmall, setPrevIsSmall] = useState<boolean | null>(null);
    const [prevIsLarge, setPrevIsLarge] = useState<boolean | null>(null);
    const [prevIsMediumOrSmaller, setPrevIsMediumOrSmaller] = useState<boolean | null>(null);

    React.useEffect(() => {
        // Initial load - set initial values
        if (prevIsSmall === null || prevIsLarge === null || prevIsMediumOrSmaller === null) {
            // On small/medium screens, ALWAYS force small+collapsed regardless of stored prefs.
            // This ensures the sidebar never appears as a permanent drawer on mobile.
            if (isMediumOrSmaller) {
                setLocalNavSize("small");
                setLocalNavExpanded(false);
            } else {
                // Large screen: respect stored preferences or apply defaults
                const hasStoredNavSize = dashStorage.getItem('dashNavSize') !== null;
                const hasStoredNavExpanded = dashStorage.getItem('dashNavExpanded') !== null;

                if (!hasStoredNavSize) {
                    setLocalNavSize("large");
                }
                if (!hasStoredNavExpanded) {
                    setLocalNavExpanded(isLargeScreen);
                }
            }
            
            setPrevIsSmall(isSmallScreen);
            setPrevIsLarge(isLargeScreen);
            setPrevIsMediumOrSmaller(isMediumOrSmaller);
            return;
        }
        
        // Check if we crossed the medium breakpoint (sidebar position switch)
        if (prevIsMediumOrSmaller !== isMediumOrSmaller) {
            setLocalNavSize(isMediumOrSmaller ? "small" : "large");
            
            if (isMediumOrSmaller) {
                // Crossed into medium or smaller screen - collapse nav
                setLocalNavExpanded(false);
            } else {
                // Crossed into larger screen - expand nav
                setLocalNavExpanded(true);
            }
            
            setPrevIsMediumOrSmaller(isMediumOrSmaller);
        }
        
        // Check if we crossed the small breakpoint
        if (prevIsSmall !== isSmallScreen) {
            if (isSmallScreen) {
                // Crossed into small screen - collapse nav
                setLocalNavExpanded(false);
            }
            
            setPrevIsSmall(isSmallScreen);
        }
        
        // Check if we crossed the large breakpoint
        if (prevIsLarge !== isLargeScreen) {
            if (isLargeScreen && !isMediumOrSmaller) {
                // Only expand when crossing into large AND not in secondary mode
                setLocalNavExpanded(true);
            }
            
            setPrevIsLarge(isLargeScreen);
        }
        // 🎯 NO Redux dispatch here - only local state updates
        // Redux will be synced only on location changes
    }, [isSmallScreen, isLargeScreen, isMediumOrSmaller, prevIsSmall, prevIsLarge, prevIsMediumOrSmaller]);

    // For horizontal positions (top/bottom), always use expanded/large. For vertical (left/right), use local state.
    const effectiveNavExpanded = isHorizontalPosition ? true : localNavExpanded;
    const effectiveNavSize = isHorizontalPosition ? "large" : localNavSize;

    const drawerOpen = effectiveNavSize === "large" || (effectiveNavSize === "small" && effectiveNavExpanded);
    const drawerClassName = `sidebar-drawer`;
    
    return (
        <Box sx={{ display: 'flex' }}>
          
            <MuiDrawer
                variant={localNavSize === "small" ? 'temporary' : 'permanent'}
                anchor={sidebarPosition}
                open={drawerOpen}
                className={drawerClassName}
                data-sidebar-position={sidebarPosition}
                onClose={() => {
                    if (localNavSize === "small") {
                        setLocalNavExpanded(false);
                        // 🎯 NO Redux dispatch here - only local state update
                    }
                }}
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile
                }}
            >
                <AppMaterialMenu 
                    navSize={effectiveNavSize} 
                    navExpanded={effectiveNavExpanded}
                    logos={logos}
                    onToggleDrawer={isHorizontalPosition ? undefined : toggleDrawer}
                    sidebarPosition={sidebarPosition}
                />
            </MuiDrawer>
        </Box>
    );
};

//AppSidebarMaterial.whyDidYouRender = true;

export default AppSidebarMaterial;
