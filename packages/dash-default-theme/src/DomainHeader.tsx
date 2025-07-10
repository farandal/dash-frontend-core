import { JSX, PropsWithChildren, useEffect, useState } from 'react';
import { Children } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { IPageState } from 'dash-admin-state';
import { DASH_REDUX_ACTIONS } from 'dash-admin-state';
import { IDASHAppState } from 'dash-admin-state';
import MenuOpenIcon from '@mui/icons-material/MenuOpen'
import { Box, IconButton } from '@mui/material';
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import { NavEventManager } from 'dash-admin';

export interface IDomainHeader<U = any, A = any> extends PropsWithChildren {

}

const DomainHeader = <U, A>({
    ...props
}: IDomainHeader<U, A>): JSX.Element => {

    const dispatch = useDispatch();

    // Keep local state in sync with sidebar for UI feedback
    const [localNavExpanded, setLocalNavExpanded] = useState(true);
    const [localNavSize, setLocalNavSize] = useState<'small' | 'large'>('large');

    // Listen to nav state changes from sidebar
    useEffect(() => {
        const unsubscribe = NavEventManager.onStateChange((expanded, size) => {
            setLocalNavExpanded(expanded);
            setLocalNavSize(size);
            // Also sync to Redux store
            //dispatch(DASH_REDUX_ACTIONS.setNavExpanded(expanded));
        });

        return unsubscribe;
    }, [dispatch]);

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
    const squaredLogo = panelSettings?.squaredLogo || <>🖥</>;
    const horizontalLogo = panelSettings?.horizontalLogo || <>🖥</>;

    const onToggleExpandedNav = () => {
        // Use event system to communicate with sidebar
        NavEventManager.toggleExpanded();
    };
  
    const HeaderComponentInline = () => (
        <div className='dash-header-inline'>
            <span className='dash-header-inline-title'>
                {pageSettings.title || ''}
            </span>
            <span className='dash-header-inline-subtitle'>
                {pageSettings.subTitle}
            </span>
        </div>
    );

    return (
        <div className='dash-header'>
            <div className='dash-header-container'>

                <Box className='dash-header-subheader' sx={{ display: { xs: 'block', sm: 'block', md: 'none' } }}>
                    <div className='dash-header-subheader-action'>
                        <IconButton 
                                className='drawer-toggler' 
                                onClick={() => onToggleExpandedNav()}
                        >
                            <MenuOpenIcon />
                        </IconButton>
                    </div>
                    <div className='dash-header-subheader-logo'>
                        <span className='dash-page-header-heading-img'>
                            {typeof horizontalLogo === 'string' ? <img src={horizontalLogo} /> : horizontalLogo}
                        </span>
                    </div>
                </Box>

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
