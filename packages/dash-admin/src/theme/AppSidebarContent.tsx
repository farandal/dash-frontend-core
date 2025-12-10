import React, { JSX, ReactNode } from 'react';
import AppSidebarLogo from './AppSidebarLogo';
import { useSelector } from 'react-redux';

import AppLayoutSettings from './AppLayoutSetting';

import MenuOpenIcon from '@mui/icons-material/MenuOpen'	
import MenuIcon from '@mui/icons-material/Menu'	
import { IDASHAppState } from 'dash-admin-state';



export interface IAppSidebarContent {
	sidebarExpanded: any;
	setSidebarExpanded: any;
	navStyle: any;
	themeType: any;
	horizontalLogo: JSX.Element;
	squaredLogo?: JSX.Element;
	children?: ReactNode;
}

const SidebarContent: React.FC<IAppSidebarContent> = ({
	sidebarExpanded,
	setSidebarExpanded,
	navStyle,
	themeType,
	// @ts-ignore - logo prop not in interface
	logo,
	squaredLogo,
	children,
	...props
}) => {
	const pathname = useSelector((state: IDASHAppState<any, any, any>) => state.common.pathname);

	const getNoHeaderClass = (navStyle) => {
		if (
			navStyle === AppLayoutSettings.NAV_STYLE_NO_HEADER_MINI_SIDEBAR ||
			navStyle === AppLayoutSettings.NAV_STYLE_NO_HEADER_EXPANDED_SIDEBAR
		) {
			return 'dash-no-header-notifications';
		}
		return '';
	};

	const selectedKeys = pathname.substr(1);
	//const defaultOpenKeys = selectedKeys.split('/')[1];

	return (
		<>
			
			<AppSidebarLogo
				sidebarExpanded={sidebarExpanded}
				setSidebarExpanded={setSidebarExpanded}
                /* @ts-ignore - logo prop not in interface */
				logo={logo}
				squaredLogo={squaredLogo}
			/>

			<div className='sidebar-content'>
				{navStyle != AppLayoutSettings.NAV_STYLE_COLLAPSABLE &&
				navStyle ===
					AppLayoutSettings.NAV_STYLE_FIXED /*|| navStyle === NAV_STYLE_MINI_SIDEBAR*/ ? (
					<div className='dash-linebar'>
						<div className='sidebar-icon'>
							<i
								// className={`dash-icon-btn icon icon-${!sidebarExpanded ? 'menu-unfold' : 'menu-fold'} ${themeType !== THEME_TYPE_LIGHT ? 'dash-text-white' : ''}`}
								// className={`sidebar-menu ${themeType !== THEME_TYPE_LIGHT ? 'dash-text-white' : ''}`}
								className={`sidebar-menu`}
								onClick={() => {
									setSidebarExpanded(!sidebarExpanded);
								}}
							>
								{sidebarExpanded ? (
									<MenuOpenIcon sx={{ fontSize: 24 }} />
								) : (
									<MenuIcon sx={{ fontSize: 24 }} />
								)}

					</i>
						</div>
					</div>
				) : null}

				{navStyle === AppLayoutSettings.NAV_STYLE_COLLAPSABLE ? (
					<div
						onMouseEnter={() => setSidebarExpanded(true)}
						onMouseLeave={() => setSidebarExpanded(false)}
					>
						{children}
					</div>
				) : (
					children
				)}

				{/*<Auxiliary>
            <UserProfile/>
          </Auxiliary>*/}
			</div>
		</>
	);
};

//export default React.memo(SidebarContent);
export default SidebarContent;
