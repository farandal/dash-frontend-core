import { JSX, PropsWithChildren, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import { Box } from '@mui/material';
import { IDASHAppState } from 'dash-admin-state';
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

	const { navStyle, layoutType, themeType, layoutSettings } = useSelector(
		(state: IDASHAppState<U, A, IDashAutoAdminResourceConfig>) =>
			state.settings,
	);
	const { navExpanded } = useSelector(
		(state: IDASHAppState<U, A, IDashAutoAdminResourceConfig>) =>
			state.common,
	);
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

	const [previousLocationPath,setPreviousLocationPath] = useState(null);
	
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


	// const contentRef = useRef(null)
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
