import * as React from 'react';

import { useSelector } from 'react-redux';
// Remove this import
// import { usePermissions } from 'react-admin';

import { List, IconButton, Box, useMediaQuery, useTheme } from '@mui/material';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import { useEffect } from 'react';
import { IMenuItem, IAppMenu } from './AppMenuComponents/interfaces';
import SidebarItem from './AppMenuComponents/expanded/SidebarItem';
import SidebarItemCollapse from './AppMenuComponents/expanded/CollapsableSidebarMenu';
import CollapsedSidebarItems from './AppMenuComponents/collapsed/CollapsedSidebarItems';
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';

import { IDASHAppState, usePanelSettings } from 'dash-admin-state';
import checkRole from '../../helpers/checkRole';
import { slugify } from '../../utils/slugify';
// Direct imports to avoid circular barrel imports
import AvatarComponent from '../../components/user/AvatarComponent';
import TenantAvatarComponent from '../../components/user/TenantAvatarComponent';

import Scrollbar from '../../components/scrollbar/Scrollbar';
// Add this import
import { AuthPersistenceService } from 'dash-auth';
import { useAuthContext } from '../../contexts/auth/AuthContext';
import DarkToggleMode from '../../components/menu/DarkToggleMode';
// Use I18nBridgeContext exclusively
import { useI18nBridge } from '../../contexts/I18nBridgeContext';
import BridgedLocalesMenuButton from '../../components/i18n/BridgedLocalesMenuButton';

import { dashStorage } from 'dash-utils';
import SidebarActions from './SidebarActions';
import { useNavigate } from 'react-router';

// Update the interface to include new props
interface IAppMenuExtended extends IAppMenu {
    logos?: {
        horizontalLogo: React.ReactNode;
        squaredLogo: React.ReactNode;
    };
    onToggleDrawer?: (e: React.MouseEvent) => void;
}

// Group icons
const GenerateItems: React.FC<{ items: IMenuItem[]; navExpanded: boolean, navSize: "large" | "small", level: number, sidebarPosition?: "left" | "top" | "bottom" | "right", translate: (key: string, options?: any) => string }> = ({
    items,
    navExpanded,
    navSize,
    level,
    sidebarPosition = "left",
    translate
}) => {
    const isHorizontal = sidebarPosition === "top" || sidebarPosition === "bottom";
    
    return items &&
        <>
            {navExpanded && navSize === "large" ? (
                <List 
                    className={'sidebar-list'} 
                    component='nav'
                    sx={isHorizontal ? {
                        display: 'flex',
                        flexDirection: 'row',
                        flexWrap: 'nowrap',
                        alignItems: 'center',
                        padding: 0,
                        margin: 0,
                    } : undefined}
                >
                    {items.map((item, index) => {
                        return item.children && item.children.length ? (
                            <SidebarItemCollapse
                                navExpanded={navExpanded}
                                navSize={navSize}
                                item={item}
                                key={index}
                                level={level + 1}
                                sidebarPosition={sidebarPosition}
                            />
                        ) : (

                            <SidebarItem level={level} navExpanded={navExpanded} navSize={navSize} item={item} key={index} />
                        );
                    })}
                </List>
            ) : (
                <CollapsedSidebarItems level={level} items={items} navExpanded={navExpanded} navSize={navSize} sidebarPosition={sidebarPosition} />
            )}
        </>

};


const AppMaterialMenu: React.FC<IAppMenuExtended> = props => {

    const DEBUG = true;
    const { menu, debug, navExpanded, navSize, logos, onToggleDrawer, sidebarPosition: propSidebarPosition } = props;
    const navigate = useNavigate();
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const isMediumScreen = useMediaQuery(theme.breakpoints.down('md')); // For logo switching

    // Get panel settings from Redux (includes dimensions, padding, but NOT sidebarPosition - that comes from prop)
    const { sidebarLargeWidth, sidebarSmallWidth, sidebarHorizontalHeight, logoVerticalMaxWidth, logoVerticalMaxHeight, logoHorizontalMaxWidth, logoHorizontalMaxHeight } = usePanelSettings();
    
    // Use sidebarPosition from prop (which is responsive from AppSidebarMaterial) with fallback to 'left'
    const sidebarPosition = propSidebarPosition || 'left';

    // Get i18n from Bridge context exclusively
    const { i18nProvider, locale: currentLocale } = useI18nBridge();
    
    // Use bridged translate
    const translate = React.useCallback((key: string, options?: any) => {
        // Safety check for non-string keys
        if (typeof key !== 'string') {
            return key;
        }
        // Use bridged provider
        if (i18nProvider?.translate) {
            try {
                return i18nProvider.translate(key, options);
            } catch (e) {
                console.warn('Translation error:', e);
                return key;
            }
        }
        return key;
    }, [i18nProvider]);

    useEffect(() => {
        DEBUG && console.log('🌐 AppMaterialMenu: Bridged i18nProvider:', i18nProvider);
        DEBUG && console.log('🌐 AppMaterialMenu: currentLocale:', currentLocale);

        // Enhanced debug: test translate with various keys
        DEBUG && console.log('🧪 Translation test:', {
            // Test react-admin built-in keys
            'ra.action.delete': translate('ra.action.delete'),
            'ra.action.save': translate('ra.action.save'),
            // Test top-level custom keys
            'kiosk.total': translate('kiosk.total'),
            // Test nested resource keys
            'resource.groups.products': translate('resource.groups.products'),
            'resource.system.tenants.label': translate('resource.system.tenants.label'),
        });
    }, [i18nProvider, currentLocale, translate]);

    //const resources = useResourceDefinitions()

    // Replace usePermissions with useAuthContext - add null check
    // const { permissions } = usePermissions();
    const authContext = useAuthContext();

    const [items, setItems] = React.useState<IMenuItem[]>(null);


    // State for tenant logos
   /* const [tenantLogos, setTenantLogos] = React.useState<{
        horizontalLogo: string | null;
        squaredLogo: string | null;
    }>({
        horizontalLogo: null,
        squaredLogo: null
    });*/

    const resources = useSelector(
        (
            state: IDASHAppState<any, any, IDashAutoAdminResourceConfig>,
        ) => {
            if (debug || menu) {
                return menu;
            }
            return state.resources.items;
        },
    );

    // Track resource changes for debugging
    const prevResourcesRef = React.useRef<any[]>(null);
    React.useEffect(() => {
        const prevResources = prevResourcesRef.current;
        const prevModels = Array.isArray(prevResources) ? prevResources.map((r: any) => r.model) : [];
        const newModels = Array.isArray(resources) ? resources.map((r: any) => r.model) : [];
        const added = newModels.filter(m => !prevModels.includes(m));
        const removed = prevModels.filter(m => !newModels.includes(m));
        console.log('📊 AppMaterialMenu: Resources from Redux', {
            isSameRef: prevResources === resources,
            prevCount: prevResources?.length || 0,
            newCount: resources?.length || 0,
            added: added.length > 0 ? added : 'none',
            removed: removed.length > 0 ? removed : 'none',
            allModels: newModels,
        });
        prevResourcesRef.current = resources;
    }, [resources]);

    const panelSettings = useSelector((state: any) => state.common.panelSettings);
    const horizontalLogo = panelSettings?.horizontalLogo;
     const squaredLogo = panelSettings?.squaredLogo;

    const groupIcons = useSelector(
        (state: IDASHAppState<any, any, IDashAutoAdminResourceConfig>) =>
            state.settings.groupIcons
    );

    // Load tenant logos from AuthPersistenceService
    /*useEffect(() => {
        const tenantImages = AuthPersistenceService.getTenantImages();
        DEBUG && console.log('AppMaterialMenu Loaded: loading tenant images:', tenantImages);
        if (tenantImages) {
            //console.log('AppMaterialMenu: Loading tenant logos:', tenantImages);



            setTenantLogos({
                horizontalLogo: tenantImages.horizontal_logo?.original || null,
                squaredLogo: tenantImages.squared_logo?.original || null
            });
        } else {
            DEBUG && console.log('AppMaterialMenu: No tenant images found');
            setTenantLogos({
                horizontalLogo: null,
                squaredLogo: null
            });
        }



        //console.log('DASHTRefreshTheme');
        window.dispatchEvent(new CustomEvent("DASHTRefreshTheme", {}));




    }, []);*/

    useEffect(() => {
        // Don't process resources if permissions haven't been loaded yet and not in debug mode

        // Get user roles, defaulting to ["Public"] for unauthenticated users
        const userRoles = authContext?.user?.roles 
            ? authContext.user.roles.flatMap(role => role.name) 
            : ["Public"];

        const groups = [
            ...new Set(
                resources
                    .map((resource) => resource.group)
                    .filter((x) => x !== null && x !== undefined && x !== ''),
            ),
        ];
        //group resources belonging to the group
        const groupedResources = new Object();
        groups.forEach((group) => {
            groupedResources[group as string] = resources.filter((resource) => {
               
                //console.log(resource.group + " | ", resource.label + " | ", permissions, resource.roles, checkRole(permissions, resource.roles));
                /* @ts-ignore */
                return (resource.group === group && checkRole(userRoles, resource.roles));
            });
        });
        const _items: IMenuItem[] = [];



        Object.keys(groupedResources).map((groupKey) => {
            const group: IDashAutoAdminResourceConfig[] = groupedResources[groupKey];
            if (!group.length) return;
            const hidden = group[0] && group[0].hidden === true ? true : false;
            if (hidden) return;

            const _childrens = group
                .filter((resource) => resource.hidden !== true);

            // Generate paths relative to BrowserRouter basename (don't prepend currentAppPath)
            // React Router's Link components will automatically prepend the basename
            const _children = _childrens
                .map((resource) => {

                    /*  debugger;
                      const translation =  translate(resource.label)
                     console.log( translation);
                    
                       debugger;
 */

                    console.log('translating resource label:', resource.label, translate(resource.label));

                    // Add more debug info
                    // Use optional chaining carefully since i18nProvider might be null
                    const currentLocale = i18nProvider?.getLocale?.() || 'unknown';
                    const messages = i18nProvider?.getMessages?.(currentLocale) || {};
                    const hasKey = messages[resource.label] !== undefined;

                    console.log('🌐 Translation debug:', {
                        key: resource.label,
                        currentLocale,
                        hasKey,
                        translation: messages[resource.label],
                        allMessagesKeys: Object.keys(messages).filter(k => k.includes('resource.system')),
                        translateResult: translate(resource.label)
                    });

                    // For menuOnly resources, use redirect or path directly as the navigation target
                    // For regular resources, build the path from model + optional redirect
                    const buildMenuPath = () => {
                        if (resource.menuOnly) {
                            // menuOnly: use redirect, path, or fallback to model
                            return resource.redirect || resource.path || `/${resource.model}`;
                        }
                        // Regular resource: existing logic
                        if (resource?.redirect?.startsWith('/')) {
                            return resource.redirect;
                        }
                        if (resource?.redirect) {
                            return `/${resource.model}/${resource.redirect}`.replace(/\/+/g, '/');
                        }
                        return `/${resource.model}`.replace(/\/+/g, '/');
                    };

                    return {
                        label: translate(resource.label, { _: resource.label }),
                        key: resource.label,
                        to: buildMenuPath(),
                        icon: resource.icon,
                        group: slugify(group[0].group),
                        model: resource.model,
                        menuOnly: resource.menuOnly,
                        txtLabel: translate(resource.label, { _: resource.label }),
                    };
                });

            // Generate path relative to BrowserRouter basename (don't prepend currentAppPath)
            // React Router's Link components will automatically prepend the basename
            const _item: IMenuItem = {
                label: translate(group[0].group, { _: group[0].group }),
                key: slugify(group[0].group),
                icon: group[0].icon || groupIcons[group[0].group],
                group: slugify(group[0].group),
                model: group[0].model,
                to: group[0].redirect?.startsWith('/')
                    ? group[0].redirect
                    : group[0].redirect
                        ? `/${group[0].model}/${group[0].redirect}`.replace(/\/+/g, '/')
                        : `/${group[0].model}`.replace(/\/+/g, '/'),
                txtLabel: translate(group[0].group, { _: group[0].group }),
                ...(_childrens && _childrens.length > 1 && { children: _children }) as any
            };

            _items.push(_item);

        });
        
        // Add ungrouped resources as top-level items
        const ungroupedResources = resources.filter((resource) => {
            const hasGroup = resource.group !== null && resource.group !== undefined && resource.group !== '';
            return !hasGroup && checkRole(userRoles, resource.roles) && resource.hidden !== true;
        });

        ungroupedResources.forEach((resource) => {
            const buildMenuPath = () => {
                if (resource.menuOnly) {
                    return resource.redirect || resource.path || `/${resource.model}`;
                }
                if (resource?.redirect?.startsWith('/')) {
                    return resource.redirect;
                }
                if (resource?.redirect) {
                    return `/${resource.model}/${resource.redirect}`.replace(/\/+/g, '/');
                }
                return `/${resource.model}`.replace(/\/+/g, '/');
            };

            _items.push({
                label: translate(resource.label, { _: resource.label }),
                key: resource.label || resource.model,
                to: buildMenuPath(),
                icon: resource.icon,
                group: null,
                model: resource.model,
                menuOnly: resource.menuOnly,
                txtLabel: translate(resource.label, { _: resource.label }),
            });
        });
        DEBUG && console.log("MENU ITEMS", _items);
        setItems(_items);
    }, [resources, debug, authContext?.user, translate, i18nProvider, currentLocale]); // Include translate, i18nProvider and currentLocale to rebuild menu when translations change

    const isHorizontal = sidebarPosition === "top" || sidebarPosition === "bottom";

    return <>

        <Box className='sidebar-header'

            sx={{
                display: 'flex',
                flexDirection: isHorizontal ? 'row' : (navExpanded && navSize === 'large' ? 'row' : 'column'),
                alignItems: isHorizontal ? 'center' : undefined,
            }

            }>

            <Box sx={{
                paddingRight: '5px',
                //borderRight: navExpanded && navSize === 'large' ? '1px solid rgba(0, 0, 0, 0.12)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1
            }}>

                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        //gap: 1,
                        flexDirection: 'column',

                    }}>
                    {/* Toggle icon - burger for mobile, arrows for desktop */}
                    {onToggleDrawer && (
                        <IconButton
                            className='dash-icon-button-color dash-icon-button-bg'
                            onClick={onToggleDrawer}
                            sx={{
                                m:1
                            }}
                            /*sx={{
                                m:1,
                                padding: '8px',
                                borderRadius: '8px',
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                '&:hover': {
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                }
                            }}*/
                            
                        >
                            {navSize === 'small' ? (
                                <MenuOpenIcon sx={{ fontSize: 28, transform: 'scaleX(-1)' }} />
                            ) : navExpanded ? (
                                <KeyboardDoubleArrowLeftIcon sx={{ fontSize: 28 }} />
                            ) : (
                                <KeyboardDoubleArrowRightIcon sx={{ fontSize: 28 }} />
                            )}
                        </IconButton>
                    )}
                    {!(navExpanded && navSize === 'large') && !isSmallScreen && <TenantAvatarComponent
                        navExpanded={navExpanded}
                        navSize={navSize}
                        imageUrl={isMediumScreen || sidebarPosition === "left" || sidebarPosition === "right" ? squaredLogo : horizontalLogo}
                        maxWidth={isHorizontal ? logoHorizontalMaxWidth : logoVerticalMaxWidth}
                        maxHeight={isHorizontal ? logoHorizontalMaxHeight : logoVerticalMaxHeight}
                        sidebarSmallWidth={sidebarSmallWidth}
                        alt="Tenant Logo"
                        sidebarPosition={sidebarPosition}
                        onClick={() => navigate('/')}
                    />}
                </Box>


                {(sidebarPosition === "left" || sidebarPosition === "right") && (
                    <SidebarActions sidebarPosition={sidebarPosition} navExpanded={navExpanded} />
                )}


            </Box>

            {navExpanded && navSize === 'large' && <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',

                    flexDirection: 'column',

                }}

            >

                <TenantAvatarComponent
                navExpanded={navExpanded}
                navSize={navSize}

                    imageUrl={isMediumScreen || sidebarPosition === "left" || sidebarPosition === "right" ? squaredLogo : horizontalLogo}
                    maxWidth={isHorizontal ? logoHorizontalMaxWidth : logoVerticalMaxWidth}
                    maxHeight={isHorizontal ? logoHorizontalMaxHeight : logoVerticalMaxHeight}
                     sidebarSmallWidth={sidebarSmallWidth}
                    alt="Tenant Logo"
                    sidebarPosition={sidebarPosition}
                    onClick={() => navigate('/')}
                />



            </Box>}


        </Box>

        {/* For horizontal mode (top/bottom), use a simple Box instead of Scrollbar 
            since react-custom-scrollbars creates nested divs that break flex layout */}
        {(sidebarPosition === "top" || sidebarPosition === "bottom") ? (
            <Box
                className="dash-layout-sider-scrollbar horizontal-mode"
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    flex: 1,
                    height: '100%',
                    alignItems: 'center',
                }}
            >
                <GenerateItems items={items} navExpanded={navExpanded} navSize={navSize} level={0} sidebarPosition={sidebarPosition} translate={translate} />
            </Box>
        ) : (
            <Scrollbar
                //autoHide={true}
                //autoHideTimeout={1000}
                //autoHideDuration={200}
                className={'dash-layout-sider-scrollbar'}
            >
                <GenerateItems items={items} navExpanded={navExpanded} navSize={navSize} level={0} sidebarPosition={sidebarPosition} translate={translate} />
            </Scrollbar>
        )}

         {(sidebarPosition === "top" || sidebarPosition === "bottom") && (
            <SidebarActions sidebarPosition={sidebarPosition} navExpanded={navExpanded} />
         )}


    </>


};

/*export default React.memo(
  AppMaterialMenu,
  (props, nextProps) =>
    props === nextProps
) as typeof AppMaterialMenu;
*/

export default AppMaterialMenu;
