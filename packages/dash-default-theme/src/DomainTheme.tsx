import { JSX, PropsWithChildren, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import { Box } from '@mui/material';
import { DASH_REDUX_ACTIONS, IDASHAppState } from 'dash-admin-state';
import { useLocation } from 'react-router';
import AppSidebarMaterial from './menu/AppSidebarMaterial';

export interface IDomainTheme<U = any, A = any> extends PropsWithChildren {
    menuComponent?: JSX.Element;
    headerComponent: JSX.Element;
    footerComponent?: JSX.Element;
}

const DomainTheme = <U, A>({
    children,
    menuComponent,
    headerComponent,
    footerComponent,
    ...props
  }: IDomainTheme<U, A>): JSX.Element => {

    const location = useLocation();
    const dispatch = useDispatch();

    const { navStyle, layoutType, themeType, layoutSettings } = useSelector(
        (state: IDASHAppState<U, A, IDashAutoAdminResourceConfig>) =>
            state.settings,
    );
    
    // Get the current navigation state from Redux
    const navExpanded = useSelector((state: IDASHAppState<any, any, any>) => 
        state.menu.navExpanded
    );
    
    // Load the navigation state from localStorage on component mount
    useEffect(() => {
        try {
            const savedNavState = localStorage.getItem('dashNavExpanded');
            if (savedNavState !== null) {
                const isExpanded = savedNavState === 'true';
                // Only dispatch if different from current state to avoid loops
                if (isExpanded !== navExpanded) {
                    dispatch(DASH_REDUX_ACTIONS.setNavExpanded(isExpanded));
                }
            }
        } catch (e) {
            console.error('Error accessing localStorage:', e);
        }
    }, []);  // Empty dependency array - only run once on mount
    

    const panelSettings = useSelector(
        (state: IDASHAppState<U, A, IDashAutoAdminResourceConfig>) =>
            state.common.panelSettings,
    );

    const logo = panelSettings?.logo || <>🖥 DASH</>;
    const logoSmall = panelSettings?.logoSmall || <>🖥</>;

    const getContainerClass = (navStyle) => {
        switch (navStyle) {
            case layoutSettings.NAV_STYLE_DARK_HORIZONTAL:
                return 'dash-container-wrap';
            case layoutSettings.NAV_STYLE_DEFAULT_HORIZONTAL:
                return 'dash-container-wrap';
            case layoutSettings.NAV_STYLE_INSIDE_HEADER_HORIZONTAL:
                return 'dash-container-wrap';
            case layoutSettings.NAV_STYLE_BELOW_HEADER:
                return 'dash-container-wrap';
            case layoutSettings.NAV_STYLE_ABOVE_HEADER:
                return 'dash-container-wrap';
            default:
                return '';
        }
    };
    
    const setBodyClasses = (layoutType, themeType) => {
        document.body.classList.remove(layoutSettings.LAYOUT_TYPE_FULL);
        document.body.classList.remove(layoutSettings.LAYOUT_TYPE_BOXED);
        document.body.classList.remove(layoutSettings.LAYOUT_TYPE_FRAMED);
        document.body.classList.add(layoutType);
    
        document.body.classList.remove(layoutSettings.THEME_TYPE_DARK);
        document.body.classList.remove(layoutSettings.THEME_TYPE_LIGHT);
        document.body.classList.remove(layoutSettings.THEME_TYPE_LIGHT);
        document.body.classList.add(themeType);
    };
    
    const setNavStyle = (navStyle) => {
        if (
            navStyle === layoutSettings.NAV_STYLE_DEFAULT_HORIZONTAL ||
            navStyle === layoutSettings.NAV_STYLE_DARK_HORIZONTAL ||
            navStyle === layoutSettings.NAV_STYLE_INSIDE_HEADER_HORIZONTAL ||
            navStyle === layoutSettings.NAV_STYLE_ABOVE_HEADER ||
            navStyle === layoutSettings.NAV_STYLE_BELOW_HEADER
        ) {
            document.body.classList.add('full-scroll');
            document.body.classList.add('horizontal-layout');
        } else {
            document.body.classList.remove('full-scroll');
            document.body.classList.remove('horizontal-layout');
        }
    };
    
    useEffect(() => {
        setBodyClasses(layoutType, themeType);
        setNavStyle(navStyle);
    }, [layoutType, navStyle, themeType]);

    const [previousLocationPath, setPreviousLocationPath] = useState(null);
    
    function formatSlashes(str) {
        // Remove the first and last slash
        str = str.replace(/^\/|\/$/g, '');
        // Replace the rest of the slashes for a dash
        str = str.replace(/\//g, '-');
        return str;
    }

    useEffect(() => {
        if(previousLocationPath) {
            document.body.classList.remove(previousLocationPath);
        }
        if(formatSlashes(location.pathname)) {
            setPreviousLocationPath(formatSlashes(location.pathname));
            document.body.classList.add(formatSlashes(location.pathname));
        }
    }, [location]);

    const [currentNavStyle, setCurrentNavStyle] = useState(navStyle);

    return (
        <div className={themeType}>
            <AppSidebarMaterial logo={logo} logoSmall={logoSmall} />
            <Box
                className={`dash-app-layout ${
                    navExpanded
                        ? 'dash-app-layout-sidebar-expanded'
                        : 'dash-app-layout-sidebar-collapsed'
                } `}
            >
                {headerComponent}
                {children}
                {footerComponent && footerComponent}
            </Box>
        </div>
    );
};

export default DomainTheme;