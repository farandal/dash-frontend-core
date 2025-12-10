import React, { useEffect, useState } from 'react';
import { Button, useRedirect, useStore } from 'react-admin';
import useVirtualHash from '../hooks/useVirtualHash';
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';

export interface IApplicationLayoutMenuItem {
    title: string;
    onClick?: () => void;
    redirect?: string;
    icon?: string;
}

export interface IApplicationLayoutMainAction {
    title: string;
    type?: 'link' | 'text' | 'ghost' | 'default' | 'primary' | 'dashed';
    icon?: string;
    onClick?: () => void;
    redirect?: string;
    fn?: 'redirect' | 'virtualhash';
}

export interface IApplicationLayout {
    resourceConfig: IDashAutoAdminResourceConfig;
    children?: React.ReactNode;
}

const ApplicationLayout: React.FC<IApplicationLayout> = ({
    resourceConfig,
    children,
}) => {
    const [drawerState, setDrawerState] = useState<boolean>(false);
    const redirect = useRedirect();
    const { setVirtualHash } = useVirtualHash();
    const [, setResourceConfig] = useStore('resourceConfig', resourceConfig);

    useEffect(() => {
        setResourceConfig(resourceConfig);
    }, [resourceConfig, setResourceConfig]);

    const toggleDrawer = () => setDrawerState(!drawerState);

    const handleMenuClick = (menuItem: IApplicationLayoutMenuItem) => {
        if (menuItem.redirect) {
            // @deprecated - removed currentAppPath logic that caused path duplication
            const _redirect = menuItem.redirect?.startsWith('/')
                    ? menuItem.redirect
                    : `/${menuItem.redirect}`.replace(/\/+/g, '/')
        
            redirect(_redirect);

        } else if (menuItem.onClick) {
            menuItem.onClick();
        }
    };

    const handleMainAction = (e: React.MouseEvent) => {
        e.preventDefault();
        
        if (!resourceConfig.mainAction) return;

        const fn = resourceConfig.mainAction.fn === 'virtualhash' ? setVirtualHash : redirect;
        
        if (resourceConfig.mainAction.redirect) {


              const fn = resourceConfig.mainAction.fn === 'virtualhash' ? setVirtualHash : redirect;
        
        let _redirect = resourceConfig.mainAction.redirect;

        // @deprecated - removed currentAppPath logic that caused path duplication
        if (resourceConfig.mainAction.fn !== 'virtualhash') {

            _redirect = resourceConfig.mainAction.redirect?.startsWith('/')
                    ? resourceConfig.mainAction.redirect
                    : `/${resourceConfig.mainAction.redirect}`.replace(/\/+/g, '/');
        }
        
            fn(_redirect);
            
           
        } else if (resourceConfig.mainAction.onClick) {
            //debugger;
            resourceConfig.mainAction.onClick();
        }
    };

    const getMenu = () => {
        if (!resourceConfig.menu) return [];
        return Array.isArray(resourceConfig.menu) ? resourceConfig.menu : resourceConfig.menu();
    };


    const TopResourceMenu: React.FC = () => {
        const menu = getMenu();

        return (
            <div className="dash-module-top">
                <div className="dash-module-top-content">
                    {menu.length > 0 && (
                        <ul className="dash-module-horizontal-nav">
                            {menu.map((menuItem, index) => (
                                <li
                                    key={index}
                                    /* @ts-ignore */
                                    onClick={() => handleMenuClick(menuItem)}
                                >
                                    <span className="dash-link">
                                        {menuItem.icon && (
                                            <i className={`icon icon-${menuItem.icon}`} />
                                        )}
                                        <span>{menuItem.title}</span>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}

                    {resourceConfig.mainAction && (
                        <>
                      
                        <div className="dash-module-action">
                            <Button
                             /* @ts-ignore */
                                type={resourceConfig.mainAction.type}
                                className="dash-btn-block"
                                onClick={handleMainAction}
                            >
                                {resourceConfig.mainAction.title}
                            </Button>
                        </div>
                        </>
                    )}
                </div>
            </div>
        );
    };

    const hasNavigation = resourceConfig.mainAction || resourceConfig.menu;

    return (
        <div className="dash-app-module">
      
            <div
                className="dash-module-horizontal-box"
                style={!resourceConfig.menu ? { maxWidth: '100%' } : {}}
            >
                {hasNavigation && (
                    <div className="dash-module-box-header">
                        {/* Top navigation for desktop */}
                 
                        <div className="dash-module-sidenav dash-d-none dash-d-lg-flex">
                            <TopResourceMenu />
                        </div>

                        {/* Mobile menu button */}
                        <span className="dash-drawer-btn dash-d-flex dash-d-lg-none">
                            <i
                                className="icon icon-menu dash-icon-btn"
                                aria-label="Menu"
                                onClick={toggleDrawer}
                            />
                        </span>
                    </div>
                )}

                <div className="dash-module-box-content">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default ApplicationLayout;
