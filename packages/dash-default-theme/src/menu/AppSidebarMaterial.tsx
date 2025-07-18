import * as React from 'react';
import { styled, Theme, CSSObject } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import { useMediaQuery, useTheme } from '@mui/material';
import { IDASHAppState, DASH_REDUX_ACTIONS } from 'dash-admin-state';
import { useDispatch, useSelector } from 'react-redux';
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import { useState } from 'react';
import { AuthPersistenceService, useWindowSize } from 'dash-admin';
import AppMaterialMenu from './AppMaterialMenu';
import { useLocation } from 'react-router';
import { isEqual } from 'lodash';
import { NavEventManager } from 'dash-admin';

// Only keep layout settings selector - remove nav state selectors
const selectLayoutSettings = (state: IDASHAppState<any, any, IDashAutoAdminResourceConfig>) => ({
    navStyle: state.settings.navStyle,
    layoutType: state.settings.layoutType,
    themeType: state.settings.themeType,
    layoutSettings: state.settings.layoutSettings,
});

const selectPanelSettings = (state: IDASHAppState<any, any, IDashAutoAdminResourceConfig>) => 
    state.common.panelSettings;

const AppSidebarMaterial = (props) => {
    const location = useLocation();
    const dispatch = useDispatch();

    // Only subscribe to layout settings - nav state is handled by AppSidebarMaterial
    const layoutState = useSelector(selectLayoutSettings, isEqual);
    const panelSettings = useSelector(selectPanelSettings);

    const {
        navStyle,
        layoutType,
        themeType,
        layoutSettings
    } = layoutState;

    // Local state for nav - this is the source of truth for UI
    const [localNavExpanded, setLocalNavExpanded] = useState(true);
    const [localNavSize, setLocalNavSize] = useState<"small" | "large">("large");

    // Create refs to track current values for Redux sync
    const localNavExpandedRef = React.useRef(localNavExpanded);
    const localNavSizeRef = React.useRef(localNavSize);

    // Update refs when values change
    React.useEffect(() => {
        localNavExpandedRef.current = localNavExpanded;
        localNavSizeRef.current = localNavSize;
    }, [localNavExpanded, localNavSize]);

    // Listen for nav events from other components
    React.useEffect(() => {
        const unsubscribeToggle = NavEventManager.onToggleExpanded(() => {
            setLocalNavExpanded(prev => !prev);
        });

        const unsubscribeSet = NavEventManager.onSetExpanded((expanded) => {
            setLocalNavExpanded(expanded);
        });

        return () => {
            unsubscribeToggle();
            unsubscribeSet();
        };
    }, []);

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

    // Update parent layout className whenever local nav state changes
    React.useEffect(() => {
        const layoutElement = document.getElementById('dash-app-layout');
        if (layoutElement) {
            // Remove existing nav-related classes
            layoutElement.classList.remove('expanded', 'collapsed', 'small', 'large');
            
            // Add current state classes
            layoutElement.classList.add(localNavExpanded ? 'expanded' : 'collapsed');
            layoutElement.classList.add(localNavSize);
        }
    }, [localNavExpanded, localNavSize]);

    const toggleDrawer = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setLocalNavExpanded(!localNavExpanded);
        // 🎯 NO Redux dispatch here - only local state update
        // Redux will be synced only on location changes
    };

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));

    // Track previous breakpoint states to detect changes
    const [prevIsSmall, setPrevIsSmall] = useState<boolean | null>(null);
    const [prevIsLarge, setPrevIsLarge] = useState<boolean | null>(null);

    React.useEffect(() => {
        // Initial load - set initial values
        if (prevIsSmall === null || prevIsLarge === null) {
            const initialNavSize = isSmallScreen ? "small" : "large";
            setLocalNavSize(initialNavSize);
            
            if (isSmallScreen) {
                setLocalNavExpanded(false);
            } else if (isLargeScreen) {
                setLocalNavExpanded(true);
            }
            
            setPrevIsSmall(isSmallScreen);
            setPrevIsLarge(isLargeScreen);
            return;
        }
        
        // Check if we crossed the small breakpoint
        if (prevIsSmall !== isSmallScreen) {
            setLocalNavSize(isSmallScreen ? "small" : "large");
            
            if (isSmallScreen) {
                // Crossed into small screen - collapse nav
                setLocalNavExpanded(false);
            }
            
            setPrevIsSmall(isSmallScreen);
        }
        
        // Check if we crossed the large breakpoint
        if (prevIsLarge !== isLargeScreen) {
            if (isLargeScreen) {
                // Crossed into large screen - expand nav
                setLocalNavExpanded(true);
            }
            
            setPrevIsLarge(isLargeScreen);
        }
        // 🎯 NO Redux dispatch here - only local state updates
        // Redux will be synced only on location changes
    }, [isSmallScreen, isLargeScreen, prevIsSmall, prevIsLarge]);

    const drawerOpen = localNavSize === "large" || (localNavSize === "small" && localNavExpanded);
    const drawerClassName = `sidebar-drawer`;
    
    return (
        <Box sx={{ display: 'flex' }}>
            <MuiDrawer
                variant={localNavSize === "small" ? 'temporary' : 'permanent'}
                open={drawerOpen}
                className={drawerClassName}
                onClose={() => {
                    if (localNavSize === "small") {
                        setLocalNavExpanded(false);
                        // 🎯 NO Redux dispatch here - only local state update
                    }
                }}
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile
                    disablePortal: true, 
                }}
            >
                <AppMaterialMenu 
                    navSize={localNavSize} 
                    navExpanded={localNavExpanded}
                    logos={logos}
                    onToggleDrawer={toggleDrawer}
                />
            </MuiDrawer>
        </Box>
    );
};

AppSidebarMaterial.whyDidYouRender = true;

export default AppSidebarMaterial;
