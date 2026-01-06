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
import { NavEventManager } from '../utils/navEvents';
import { Breadcrumbs } from '../components/navigation';
import { AuthPersistenceService } from 'dash-auth';

export interface IDomainHeader<U = any, A = any> extends PropsWithChildren {
    /** Whether to show breadcrumb navigation */
    showBreadcrumbs?: boolean;
}

const DomainHeader = <U, A>({
    showBreadcrumbs = true,
    ...props
}: IDomainHeader<U, A>): JSX.Element => {

    const dispatch = useDispatch();

    // Keep local state in sync with sidebar for UI feedback
    const [localNavExpanded, setLocalNavExpanded] = useState(true);
    const [localNavSize, setLocalNavSize] = useState<'small' | 'large'>('large');

    // State for tenant logos
    const [tenantLogos, setTenantLogos] = useState<{
        horizontalLogo: string | null;
        squaredLogo: string | null;
    }>({
        horizontalLogo: null,
        squaredLogo: null
    });

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

    // Load tenant logos
    useEffect(() => {
        const tenantImages = AuthPersistenceService.getTenantImages();
        if (tenantImages) {
            setTenantLogos({
                horizontalLogo: tenantImages.horizontal_logo?.original || null,
                squaredLogo: tenantImages.squared_logo?.original || null
            });
        }
    }, []);

    const HeaderToolBar = useSelector(
        (state: IDASHAppState<U, A, IDashAutoAdminResourceConfig>) =>
            state.common.headerToolBar,
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
  
    const HeaderComponentInline = () => { 

        
     
    return (
        <Box
            className={pageSettings.title || HeaderToolBar ? "dash-header-content" : ""}
            sx={{ /*display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%'*/ }}
        >
            {pageSettings.title ? (
                <Box className='dash-header-inline'>
                    <span className='dash-header-inline-title'>
                        {pageSettings.title || ''}
                    </span>
                    {/*<span className='dash-header-inline-subtitle'>
                        {pageSettings.subTitle}
                    </span>*/}
                    {/* Breadcrumb Navigation - inline with title */}
                    {/*showBreadcrumbs && pageSettings.breadcrumbs && pageSettings.breadcrumbs.length > 0 && (
                        <Box className='dash-header-breadcrumbs'>
                            <Breadcrumbs />
                        </Box>
                    )*/}
                </Box>
            ) : null}

            {HeaderToolBar ? (
                <Box
                    className='dash-header-items'
                    sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}
                >
                    <HeaderToolBar />
                </Box>
            ) : null}
        </Box>
    );
       
    }

    return (
        <div className='dash-header'>
            <div className='dash-header-container'>

                <Box className='dash-header-subheader' sx={{ display: { xs: 'flex', sm: 'flex', md: 'none' }, alignItems: 'center', gap: 1 }}>
                    {/* Burger icon - always visible, opens/closes drawer */}
                    <IconButton 
                        className='dash-header-burger-toggler' 
                        onClick={() => onToggleExpandedNav()}
                        sx={{ 
                            padding: '8px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(0,0,0,0.04)',
                            '&:hover': {
                                backgroundColor: 'rgba(0,0,0,0.08)',
                            }
                        }}
                    >
                        <MenuOpenIcon sx={{ fontSize: 28 }} />
                    </IconButton>
                    
                    {/* Logo - separate from burger, doesn't toggle drawer */}
                   <Box className='dash-header-subheader-logo' sx={{ display: 'flex', alignItems: 'center', marginLeft: 1 }}>
                        {(() => {
                            const logoToRender = tenantLogos.squaredLogo || squaredLogo;
                            if (typeof logoToRender === 'string') {
                                return <img height={32} width={32} src={logoToRender} alt="Logo" style={{ borderRadius: '4px', objectFit: 'contain' }} />;
                            }
                            return logoToRender;
                        })()}
                    </Box>
                </Box>

            
                    <HeaderComponentInline />
                   
                

            </div>
        </div>
    );
};

export default DomainHeader;
