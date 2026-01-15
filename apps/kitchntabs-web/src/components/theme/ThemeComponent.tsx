import React from "react";
import Footer from "./components/layout/footer/Footer";
import Navbar from "./components/layout/header/Navbar";
import Layout from "./components/layout/Layout";
import { IDomainTheme } from "dash-admin/src/default-theme/DomainTheme";
import { Box } from "@mui/material";
import AppSidebarMaterial from "dash-admin/src/default-theme/menu/AppSidebarMaterial";
import DomainHeader from "dash-admin/src/default-theme/DomainHeader";

//import HeroThree from "./themes/index-3/HeroThree";

/*
  <Navbar classOption="header-nav" />
        {children}
        <Footer space />
*/

const ThemeComponent: React.FC<IDomainTheme<any, any>> = (props) => {
    const { menuComponent, headerToolBar, footerComponent, children } = props;
  
    return  <div id={'dash-app-layout'} className={'dash-app-layout'}>
        <AppSidebarMaterial 
                    className={'dash-app-layout-sidebar'}
                   
                />
            <Box
                className={'dash-app-layout-content'}
            >
                {/* DomainHeader provides the burger menu toggle on mobile */}
                <DomainHeader />
                {/*headerToolBar*/}
                    {children}
                <Footer space />
            </Box>
    </div>
}

export default ThemeComponent;

