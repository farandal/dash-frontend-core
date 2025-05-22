import { JSX, PropsWithChildren, useEffect, useState } from 'react';
import { Children } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { IPageState } from 'dash-admin-state';
import { DASH_REDUX_ACTIONS } from 'dash-admin-state';
import { IDASHAppState } from 'dash-admin-state';
import MenuOpenIcon from '@mui/icons-material/MenuOpen'
import { IconButton } from '@mui/material';
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import { AvatarComponent } from 'dash-components';

export interface IDomainHeader<U = any, A = any> extends PropsWithChildren {

}

const DomainHeader = <U, A>({
    ...props
}: IDomainHeader<U, A>): JSX.Element => {

    const dispatch = useDispatch();

    const navExpanded = useSelector(
        (state: IDASHAppState<U, A, IDashAutoAdminResourceConfig>) =>
            state.menu.navExpanded,
    );
    const headerComponents = useSelector(
        (state: IDASHAppState<U, A, IDashAutoAdminResourceConfig>) =>
            state.common.headerComponents,
    );
    const pageSettings: IPageState = useSelector(
        (state: IDASHAppState<U, A, IDashAutoAdminResourceConfig>) =>
            state.page,
    );

    const panelSettings = useSelector(
        (state: IDASHAppState<U, A, IDashAutoAdminResourceConfig>) =>
            state.common.panelSettings,
    );

    const logo = panelSettings?.logo || <>🖥 DASHAdmin</>;
    const logoSmall = panelSettings?.logoSmall || <>🖥</>;

    const onToggleExpandedNav = () => {
        // Use the toggleNavExpanded action instead
        dispatch(DASH_REDUX_ACTIONS.setNavExpanded(!navExpanded));
        // Save to localStorage directly here as a backup
        //localStorage.setItem('dashNavExpanded', String(!navExpanded));
    };
  
    const HeaderComponentInline = () => (
        <div className='dash-header-inline'>
            <span className='dash-header-inline-title'>
                {pageSettings.title || 'Dashboard'}
            </span>
            <span className='dash-header-inline-subtitle'>
                {pageSettings.subTitle}
            </span>
        </div>
    );

    return (
        <div className='dash-header'>
            <div className='dash-header-container'>

                <div className='dash-header-subheader'>
                    <div className='dash-header-subheader-action'>
                        <IconButton onClick={() => onToggleExpandedNav()}>
                            <MenuOpenIcon sx={{ color: 'white', fontSize: 27 }} />
                        </IconButton>
                    </div>
                    <div className='dash-header-subheader-logo'>
                        <span className='dash-page-header-heading-img'>
                            {typeof logoSmall === 'string' ? <img src={logoSmall} /> : logoSmall}
                        </span>
                    </div>
                    <div className='dash-header-subheader-avatar'>
                        <AvatarComponent />
                    </div>
                </div>

                <div className='dash-header-content'>
                    <HeaderComponentInline />
                    <ul className={`dash-header-items`}>
                        {Children.map(headerComponents, (child, index) => {
                            return (
                                <li key={index} className={`dash-header-item`}>
                                    {child}
                                </li>
                            );
                        })}
                    </ul>
                </div>


            </div>
        </div>
    );
};

export default DomainHeader;