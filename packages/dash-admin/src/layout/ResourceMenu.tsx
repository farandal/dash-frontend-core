import { useEffect, useState } from 'react';
import { useRedirect, useRefresh, useTranslate } from 'react-admin';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router';
import IAppResourceConfig from '../interfaces/IAppResourceConfig';
import { IPageState, DASH_REDUX_ACTIONS } from 'dash-admin-state';
import useVirtualHash from '../hooks/useVirtualHash';
import { Button, ButtonGroup } from '@mui/material';
import DashResourceButton from 'dash-auto-admin/src/toolbar/buttons/DashResourceButton';
import RefreshIcon from '@mui/icons-material/Refresh';

/**
 * Check if a string looks like a translation key
 */
const isTranslationKey = (value: string): boolean => {
    if (!value || typeof value !== 'string') return false;
    // Translation keys typically contain dots and are lowercase
    return value.includes('.') && value === value.toLowerCase();
};

export interface IResourceMenu {
    resourceConfig: IAppResourceConfig;
    locale?: string;
}

/**
 * Resource Menu
 *
 * @description Renders the op tabs navigation menu
 *
 * @param {IResourceMenu} props - Functional Component Props
 * @param {IDashAutoAdminResourceConfig} props.resourceConfig - Resource Config
 *
 * @returns {JSX.Element} - JSX element
 */
const ResourceMenu: React.FC<IResourceMenu> = (props) => {
    const { resourceConfig, locale } = props;
    const { resourceMenuDisabled = false, resourceMenuPosition = 'top' } =
        resourceConfig;

    const redirect = useRedirect();
    const translate = useTranslate();
    const { hash, setVirtualHash } = useVirtualHash();
    const location = useLocation();

    /**
     * Translate a label if it's a translation key, otherwise return as-is
     */
    const translateLabel = (label: string): string => {
        if (!label) return '';
        if (isTranslationKey(label)) {
            const translated = translate(label, { _: label });
            // If translation returns the key itself, use the label as-is
            return translated === label ? label : translated;
        }
        return label;
    };

    const dispatch = useDispatch();
    const updatePageState = (menuItem) => {
        const newPageState: IPageState = {
            title: translateLabel(menuItem?.title),
            //icon: item?.icon,
            //subTitle: item?.group,
        };
        dispatch(DASH_REDUX_ACTIONS.updatePage(newPageState));
    };

    const handleMenuClick = (menuItem, e) => {
        updatePageState(menuItem);
       
        // @deprecated - removed currentAppPath logic that caused path duplication
        let _redirect =  menuItem.redirect?.startsWith('/')
                    ? menuItem.redirect
                    : `/${menuItem.redirect}`.replace(/\/+/g, '/');
        
        

        menuItem.redirect ? redirect(_redirect) : menuItem?.onClick();
    };


    const [resourceMenu, setResourceMenu] = useState(null);
    const loc = useLocation();

    useEffect(() => {
        const val = Array.isArray(resourceConfig.menu)
            ? resourceConfig.menu
            : typeof resourceConfig.menu === 'function'
                ? resourceConfig.menu()
                : null;
        setResourceMenu(val);
    }, [resourceConfig.menu, locale]);

    useEffect(() => {
        const val = Array.isArray(resourceConfig.menu)
            ? resourceConfig.menu
            : typeof resourceConfig.menu === 'function'
                ? resourceConfig.menu()
                : null;
        setResourceMenu(val);
    }, [loc, resourceConfig.menu, locale]);

    //const refresh = useRefresh();

    return (
        <div className={`dash-module-${resourceMenuPosition}`}>
           
                
                
            
            {resourceConfig.mainAction && (
                <div className='dash-module-action'>

                        
                        
                           {/* <DashResourceButton
                                resourceConfig={resourceConfig}
                                label={"Refrescar"}
                                mode={resourceConfig.mainAction?.mode || 'custom'}  >
                                 <Button
                                onClick={() => refresh()}
                            >
                                <RefreshIcon />
                            </Button>
                            </DashResourceButton>*/}


                            {(resourceConfig.create !== false) && !location.pathname.endsWith('/create') && <DashResourceButton
                                size='small'    
                                resourceConfig={resourceConfig}
                                label={translateLabel(resourceConfig.mainAction.title)}
                                mode={resourceConfig.mainAction?.mode || 'create'}  />
                            }
                            {resourceConfig.navActions && resourceConfig.navActions.map((action) => action)}
                      
                </div>
            )}
            <div className={`dash-module-${resourceMenuPosition}-content`}>
                <ul className='dash-module-horizontal-nav'>
                    {resourceMenu &&
                        resourceMenu.map((menuItem, index) => {
                            let active: boolean = location.pathname === menuItem?.redirect;
                            return (
                                <li
                                    key={index}
                                    onClick={(e) => handleMenuClick(menuItem, e)}
                                    className={active ? 'active' : null}
                                >
                                    <span className={'dash-link'}>
                                        <i className={`icon icon-${menuItem?.icon}`} />
                                        <span>{translateLabel(menuItem.title)}</span>
                                    </span>
                                </li>
                            );
                        })}
                </ul>

            </div>
        </div>
    );
};

export default ResourceMenu;
