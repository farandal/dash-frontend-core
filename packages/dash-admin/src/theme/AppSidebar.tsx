import React, { ReactNode, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Drawer, Layout } from 'antd';

import SidebarContent from './AppSidebarContent';

import AppLayoutSettings from './AppLayoutSetting';
import { toggleExpandedSideNav } from './redux/actions';
import { ISettingsState, IDASHAppState } from './redux';

const { Sider } = Layout;
export interface IAppSidebar {
	//themeType:any,
	navStyle: any;
	children?: ReactNode;
	logo: JSX.Element;
	logoSmall?: JSX.Element;
	//sidebarExpandedWidth?: number,
	//sidebarCollapsedWidth?: number,
}
const AppSidebar: React.FC<IAppSidebar> = ({
	children,
	navStyle,
	logo,
	logoSmall,
	...props
}) => {
	const { themeType } = useSelector((state: IDASHAppState) => state.settings);
	//let [sidebarExpanded, setSidebarExpanded] = useState(navStyle === NAV_STYLE_COLLAPSABLE ? true : false);
	const navExpanded = useSelector(
		(state: IDASHAppState) => state.common.navExpanded,
	);
	const settings: ISettingsState = useSelector(
		(state: IDASHAppState) => state.settings,
	);
	//const width =useSelector((state:IDASHAppState) => state.common.width);
	const dispatch = useDispatch();

	const onToggleExpandedNav = (navOpen) => {
		dispatch(toggleExpandedSideNav(navOpen));
	};

	/*useEffect(() => {
    dispatch(toggleExpandedSideNav(navExpanded));
  },[navExpanded])
*/
	useEffect(() => {
		if (navStyle === AppLayoutSettings.NAV_STYLE_COLLAPSABLE)
			dispatch(toggleExpandedSideNav(false));
		//eslint-disable-next-line
	}, []);

	let drawerStyle = 'dash-drawer-sidebar';

	if (
		navStyle === AppLayoutSettings.NAV_STYLE_FIXED ||
		navStyle === AppLayoutSettings.NAV_STYLE_COLLAPSABLE
	) {
		drawerStyle = '';
	} else if (navStyle === AppLayoutSettings.NAV_STYLE_NO_HEADER_MINI_SIDEBAR) {
		drawerStyle = 'dash-mini-sidebar dash-mini-custom-sidebar';
	} else if (
		navStyle === AppLayoutSettings.NAV_STYLE_NO_HEADER_EXPANDED_SIDEBAR
	) {
		drawerStyle = 'dash-custom-sidebar';
		/*} else if (navStyle === NAV_STYLE_MINI_SIDEBAR) {
    drawerStyle = "dash-mini-sidebar";
  } else if (navStyle === NAV_STYLE_DRAWER) {
    drawerStyle = "dash-expanded-sidebar"
  }*/
	}
	if (
		navStyle === AppLayoutSettings.NAV_STYLE_FIXED ||
		navStyle === AppLayoutSettings.NAV_STYLE_MINI_SIDEBAR ||
		navStyle ===
			AppLayoutSettings.NAV_STYLE_NO_HEADER_EXPANDED_SIDEBAR /*&& width < TAB_SIZE*/
	) {
		drawerStyle = 'dash-drawer-sidebar';
	}

	return (
		<>
			<Sider
				className={`dash-app-sidebar ${drawerStyle} ${themeType}`}
				trigger={null}
				collapsed={!navExpanded}
				theme={themeType}
				width={settings.sidebarExpandedWidth}
				collapsedWidth={settings.sidebarCollapsedWidth}
				collapsible
			>
				{navStyle ===
				AppLayoutSettings.NAV_STYLE_DRAWER /*|| width < TAB_SIZE*/ ? (
					<Drawer
						//className={`dash-drawer-sidebar ${themeType !== THEME_TYPE_LITE ? 'dash-drawer-sidebar-dark' : null}`}
						className={themeType}
						placement='left'
						closable={false}
						onClose={onToggleExpandedNav}
						open={!navExpanded}
					>
						<SidebarContent
							logo={logo}
							logoSmall={logoSmall}
							navStyle={navStyle}
							sidebarExpanded={navExpanded}
							setSidebarExpanded={onToggleExpandedNav}
							themeType={themeType}
						>
							{children}
						</SidebarContent>
					</Drawer>
				) : (
					<>
						<SidebarContent
							logo={logo}
							logoSmall={logoSmall}
							navStyle={navStyle}
							sidebarExpanded={navExpanded}
							setSidebarExpanded={onToggleExpandedNav}
							themeType={themeType}
						>
							{children}
						</SidebarContent>
					</>
				)}
			</Sider>
		</>
	);
};
export default AppSidebar;
