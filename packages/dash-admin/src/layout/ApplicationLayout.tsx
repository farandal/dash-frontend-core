import React, { useEffect, useState } from 'react';


import { Button, useRedirect } from 'react-admin';
import { useStore } from 'react-admin';

import useVirtualHash from '../hooks/useVirtualHash';
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import Scrollbar from '../components/scrollbar/Scrollbar';
import { Drawer } from '@mui/material';
export interface IApplicationLayoutMenuItem {
    title: string;
    onClick?: Function;
    redirect?: string;
    icon?: string;
}

export interface IApplicationLayoutMainAction {
    title: string;
    type?: 'link' | 'text' | 'ghost' | 'default' | 'primary' | 'dashed';
    icon?: string;
    onClick?: Function;
    redirect?: string;
    fn?: 'redirect' | 'virtualhash';
}
export interface IApplicationLayout {
    resourceConfig: IDashAutoAdminResourceConfig;
    position?: 'side' | 'top';
    children?: any;
}

export interface IResourceMenu {
    //children?: React.ReactNode
    position: 'side' | 'top';
}

const ApplicationLayout: React.FC<IApplicationLayout> = ({
    resourceConfig,
	/*title, icon, mainAction, menu, list, record, */ position = 'top',
    children,
}) => {
    const [drawerState, setDrawerState] = useState<boolean>(false);
    const onToggleDrawer = () => setDrawerState(!drawerState);
    const redirect = useRedirect();
    const { hash, setVirtualHash } = useVirtualHash();
    const [, setResourceConfig] = useStore('resourceConfig', resourceConfig);

    useEffect(() => {
        setResourceConfig(resourceConfig);
    }, []);

    const handleMenuClick = (menuItem, e) => {
        debugger;
        menuItem.redirect
            ? () => {
                redirect(menuItem.redirect);
            }
            : () => menuItem?.onClick();
    };
    const handleMainAction = (e) => {
        e.preventDefault();
        debugger;

        const fn =
            resourceConfig.mainAction.fn === 'virtualhash'
                ? setVirtualHash
                : redirect;
        resourceConfig.mainAction.redirect
            ? fn(resourceConfig.mainAction.redirect)
            : resourceConfig.mainAction?.onClick();
    };

    const ResourceMenu: React.FC<IResourceMenu> = ({
		/*children,*/ ...props
    }) => {
        const menu = Array.isArray(resourceConfig.menu)
            ? resourceConfig.menu
            : resourceConfig.menu();
        return (
            <div className={`dash-module-${position}`}>
                {position === 'side' && (
                    <div className={`dash-module-${position}-header`}>
                        <div className='dash-module-logo'>
                            {resourceConfig.icon ? (
                                resourceConfig.icon
                            ) : (
                                <i className='icon icon-check-circle-o dash-mr-4' />
                            )}
                            {resourceConfig.label}
                        </div>
                    </div>
                )}

                <div className={`dash-module-${position}-content`}>
                    {position === 'side' && (
                        <Scrollbar className='dash-module-side-scroll'>
                            {resourceConfig.mainAction && (
                                <div className='dash-module-action'>
                                    <Button
                                        type={resourceConfig.mainAction?.type}
                                        className='dash-btn-block'
                                        onClick={(e) => handleMainAction(e)}
                                    >
                                        {resourceConfig.mainAction.title}
                                    </Button>
                                </div>
                            )}

                            {
                                <ul className='dash-module-nav'>
                                    {resourceConfig.menu &&
                                        menu.map((menuItem, index) => (
                                            <li
                                                key={index}
                                                onClick={(e) => handleMenuClick(menuItem, e)}
                                            >
                                                {/*<span className={filter.id === this.state.selectedSectionId ? 'dash-link active' : 'dash-link'}>*/}
                                                <span className={'dash-link'}>
                                                    <i className={`icon icon-${menuItem?.icon}`} />
                                                    <span>{menuItem.title}</span>
                                                </span>
                                            </li>
                                        ))}
                                </ul>
                            }
                        </Scrollbar>
                    )}

                    {position === 'top' && (
                        <>
                            <ul className='dash-module-horizontal-nav'>
                                {resourceConfig.menu &&
                                    menu.map((menuItem, index) => (
                                        <li
                                            key={index}
                                            onClick={
                                                menuItem.redirect
                                                    ? () => {
                                                        redirect(menuItem.redirect);
                                                    }
                                                    : () => menuItem?.onClick()
                                            }
                                        >
                                            <span className={'dash-link'}>
                                                <i className={`icon icon-${menuItem?.icon}`} />
                                                <span>{menuItem.title}</span>
                                            </span>
                                        </li>
                                    ))}
                            </ul>

                            {resourceConfig.mainAction && (
                                <div className='dash-module-action'>
                                    <Button
                                        type={resourceConfig.mainAction?.type}
                                        className='dash-btn-block'
                                        onClick={
                                            resourceConfig.mainAction.redirect
                                                ? () => {
                                                    redirect(resourceConfig.mainAction.redirect);
                                                }
                                                : () => resourceConfig.mainAction?.onClick()
                                        }
                                    >
                                        {resourceConfig.mainAction.title}
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className='dash-app-module'>
            {position === 'side' &&
                (resourceConfig.mainAction || resourceConfig.menu) && (
                    <>
                        <div className='dash-d-block dash-d-lg-none'>
                            <Drawer
                                placement='left'
                                closable={false}
                                visible={drawerState}
                                onClose={() => onToggleDrawer()}
                            >
                                <ResourceMenu position={position} />
                            </Drawer>
                        </div>
                        <div className='dash-module-sidenav dash-d-none dash-d-lg-flex'>
                            <ResourceMenu position={position} />
                        </div>
                    </>
                )}

            <div
                className='dash-module-horizontal-box'
                style={!resourceConfig.menu ? { maxWidth: '100%' } : {}}
            >
                {(resourceConfig.mainAction || resourceConfig.menu) && (
                    <div className='dash-module-box-header'>
                        {position === 'top' && (
                            <div className='dash-module-sidenav dash-d-none dash-d-lg-flex'>
                                <ResourceMenu position={position} />
                            </div>
                        )}

                        {position === 'side' && (
                            <span className='dash-drawer-btn dash-d-flex dash-d-lg-none'>
                                <i
                                    className='icon icon-menu dash-icon-btn'
                                    aria-label='Menu'
                                    onClick={() => onToggleDrawer()}
                                />
                            </span>
                        )}
                    </div>
                )}

                {/*<DASHScrollbars horizontal={true}  >*/}
                <div className='dash-module-box-content'>{children}</div>
                {/*</DASHScrollbars>*/}
            </div>
        </div>
    );
};

export default ApplicationLayout;
