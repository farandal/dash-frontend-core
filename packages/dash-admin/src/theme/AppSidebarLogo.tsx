import React from 'react';
import { useSelector } from 'react-redux';

import AppLogo from './AppLogo';
export interface IAppSidebarLogo {
	horizontalLogo: JSX.Element;
	squaredLogo?: JSX.Element;
	setSidebarExpanded?: Function;
	sidebarExpanded: boolean;
}
const AppSidebarLogo: React.FC<IAppSidebarLogo> = ({
	logo,
	sidebarExpanded,
	squaredLogo,
	setSidebarExpanded,
	...props
}) => {
	/*const {themeType} =useSelector((state:IDASHAppState) => state.settings);
  const {width} =useSelector((state:IDASHAppState) => state.common);

  let navStyle =useSelector((state:IDASHAppState) => state.settings.navStyle);*/
	/*if (width < TAB_SIZE && navStyle === NAV_STYLE_FIXED) {
    navStyle = NAV_STYLE_DRAWER;
  }*/

	return (
		<div className='dash-layout-sider-header'>
			{!sidebarExpanded ? (
				<AppLogo type='logo' logoBig={logo} squaredLogo={squaredLogo} />
			) : (
				<AppLogo type='iso' logoBig={logo} squaredLogo={squaredLogo} />
			)}

			{/*<Link to="/" className="dash-site-logo">
        {navStyle === NAV_STYLE_NO_HEADER_MINI_SIDEBAR && width >= TAB_SIZE ?
          <img alt="lo" src={("/assets/images/w-logo.png")}/> :
          themeType === THEME_TYPE_LIGHT ?
            <img alt="logo1" src={("/assets/images/logo-white.png")}/> :
            <img alt="logo2" src={("/assets/images/logo.png")}/>}
      </Link>*/}
		</div>
	);
};

export default AppSidebarLogo;
