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

import { IDASHAppState } from 'dash-admin-state';
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
import { useLocales, useLocaleState, useI18nProvider, useTranslate } from 'react-admin';

import { useI18nBridge, useBridgedLocales } from '../../contexts/I18nBridgeContext';
import BridgedLocalesMenuButton from '../../components/i18n/BridgedLocalesMenuButton';

import { dashStorage } from 'dash-utils';
// Update the interface to include new props
interface IAppMenuExtended extends IAppMenu {
    logos?: {
        horizontalLogo: React.ReactNode;
        squaredLogo: React.ReactNode;
    };
    onToggleDrawer?: (e: React.MouseEvent) => void;
}

// Group icons
const GenerateItems: React.FC<{ items: IMenuItem[]; navExpanded: boolean, navSize: "large" | "small", level: number }> = ({
    items,
    navExpanded,
    navSize,
    level
}) => {
    return items &&
        <>
            {navExpanded && navSize === "large" ? (
                <List className={'sidebar-list'} component='nav'>
                    {items.map((item, index) => {
                        return item.children && item.children.length ? (
                            <SidebarItemCollapse
                                navExpanded={navExpanded}
                                navSize={navSize}
                                item={item}
                                key={index}
                                level={level + 1}
                            />
                        ) : (

                            <SidebarItem level={level} navExpanded={navExpanded} navSize={navSize} item={item} key={index} />
                        );
                    })}
                </List>
            ) : (
                <CollapsedSidebarItems level={level} items={items} navExpanded={navExpanded} navSize={navSize} />
            )}
        </>

};



const AppMaterialMenu: React.FC<IAppMenuExtended> = (props) => {

    const DEBUG = true;
    const { menu, debug, navExpanded, navSize, logos, onToggleDrawer } = props;
    const theme = useTheme();
    const raTranslate = useTranslate();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    // Get i18n from both React Admin context and Bridge context
    // The bridge context has the real i18nProvider from AdminContext
    const i18nProviderFromRA = useI18nProvider();
    const { i18nProvider: bridgedI18nProvider, locale: bridgedLocale } = useI18nBridge();
    const bridgedLocales = useBridgedLocales();
    const raLocales = useLocales();
    const [raLocale] = useLocaleState();
    
    // Default to bridged locale if available, effectively overriding RA's state which might be stale/disconnected
    const currentLocale = bridgedLocale || raLocale;

    // Use bridged locales if available, otherwise fall back to React Admin's
    const availableLocales = bridgedLocales.length > 0 ? bridgedLocales : raLocales;

    // CRITICAL FIX: Use bridged translate if available, since AppMaterialMenu 
    // is outside AdminContext and useTranslate() returns a default provider
    const translate = React.useCallback((key: string, options?: any) => {
        // Try bridged provider first (has the real translations)
        if (bridgedI18nProvider?.translate) {
            const result = bridgedI18nProvider.translate(key, options);
            return result;
        }
        // Fall back to react-admin's translate (may not work if outside context)
        return raTranslate(key, options);
    }, [bridgedI18nProvider, raTranslate]);

    useEffect(() => {
        DEBUG && console.log('🌐 AppMaterialMenu: React Admin i18nProvider:', i18nProviderFromRA);
        DEBUG && console.log('🌐 AppMaterialMenu: Bridged i18nProvider:', bridgedI18nProvider);
        DEBUG && console.log('🌐 AppMaterialMenu: bridgedLocales:', bridgedLocales);
        DEBUG && console.log('🌐 AppMaterialMenu: raLocales (useLocales):', raLocales);
        DEBUG && console.log('🌐 AppMaterialMenu: Final availableLocales:', availableLocales);
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
            // Direct provider test
            'bridgedProvider.resource.groups.products': bridgedI18nProvider?.translate?.('resource.groups.products') || 'N/A (not bridged yet)',
        });
    }, [i18nProviderFromRA, bridgedI18nProvider, bridgedLocales, raLocales, availableLocales, currentLocale, translate]);

    //const resources = useResourceDefinitions()

    // Replace usePermissions with useAuthContext - add null check
    // const { permissions } = usePermissions();
    const authContext = useAuthContext();

    const [items, setItems] = React.useState<IMenuItem[]>(null);


    // State for tenant logos
    const [tenantLogos, setTenantLogos] = React.useState<{
        horizontalLogo: string | null;
        squaredLogo: string | null;
    }>({
        horizontalLogo: null,
        squaredLogo: null
    });

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

    const groupIcons = useSelector(
        (state: IDASHAppState<any, any, IDashAutoAdminResourceConfig>) =>
            state.settings.groupIcons
    );

    // Load tenant logos from AuthPersistenceService
    useEffect(() => {
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




    }, []);

    useEffect(() => {
        // Don't process resources if permissions haven't been loaded yet and not in debug mode



        const groups = [
            ...new Set(
                resources.map((resource) => resource.group).filter((x) => x !== null),
            ),
        ];
        //group resources belonging to the group
        const groupedResources = new Object();
        groups.forEach((group) => {
            groupedResources[group as string] = resources.filter((resource) => {
                if (debug === true) {
                    return resource.group === group;
                }

                //console.log(resource.group + " | ", resource.label + " | ", permissions, resource.roles, checkRole(permissions, resource.roles));
                /* @ts-ignore */
                return (resource.group === group && checkRole(authContext.user?.roles ? authContext.user?.roles?.flatMap(role => role.name) : ["Public"] || [], resource.roles));
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
                    const currentLocale = i18nProviderFromRA?.getLocale?.() || 'unknown';
                    const messages = i18nProviderFromRA?.getMessages?.(currentLocale) || {};
                    const hasKey = messages[resource.label] !== undefined;

                    console.log('🌐 Translation debug:', {
                        key: resource.label,
                        currentLocale,
                        hasKey,
                        translation: messages[resource.label],
                        allMessagesKeys: Object.keys(messages).filter(k => k.includes('resource.system')),
                        translateResult: translate(resource.label)
                    });


                    return {
                        label: translate(resource.label),
                        key: resource.label,
                        to: resource?.redirect?.startsWith('/')
                            ? resource.redirect
                            : resource?.redirect
                                ? `/${resource.model}/${resource.redirect}`.replace(/\/+/g, '/')
                                : `/${resource.model}`.replace(/\/+/g, '/'),
                        icon: resource.icon,
                        group: slugify(group[0].group),
                        model: resource.model,
                        txtLabel: translate(resource.label),
                    };
                });

            // Generate path relative to BrowserRouter basename (don't prepend currentAppPath)
            // React Router's Link components will automatically prepend the basename
            const _item: IMenuItem = {
                label: translate(group[0].group),
                key: slugify(group[0].group),
                icon: group[0].icon || groupIcons[group[0].group],
                group: slugify(group[0].group),
                model: group[0].model,
                to: group[0].redirect?.startsWith('/')
                    ? group[0].redirect
                    : group[0].redirect
                        ? `/${group[0].model}/${group[0].redirect}`.replace(/\/+/g, '/')
                        : `/${group[0].model}`.replace(/\/+/g, '/'),
                txtLabel: translate(group[0].group),
                ...(_childrens && _childrens.length > 1 && { children: _children }) as any
            };

            _items.push(_item);

        });
        DEBUG && console.log("MENU ITEMS", _items);
        setItems(_items);
    }, [resources, debug, authContext?.user, translate, bridgedI18nProvider, currentLocale]); // Include translate, bridgedI18nProvider and currentLocale to rebuild menu when translations change

    return <>
        <Box className='sidebar-header'

            sx={{
                display: 'flex',
                flexDirection: navExpanded && navSize === 'large' ? 'row' : 'column',
                //alignItems: navExpanded && navSize === 'large' ? 'center' : 'flex-start'
            }

            }>

            <Box sx={{
                paddingRight: '5px',
                borderRight: navExpanded && navSize === 'large' ? '1px solid rgba(0, 0, 0, 0.12)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1
            }}>

                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        flexDirection: 'column',

                    }}>
                    {/* Toggle icon - burger for mobile, arrows for desktop */}
                    {onToggleDrawer && (
                        <IconButton
                            className='dash-sidebar-burger-toggler'
                            onClick={onToggleDrawer}
                            sx={{
                                padding: '8px',
                                borderRadius: '8px',
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                '&:hover': {
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                }
                            }}
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
                        imageUrl={tenantLogos.squaredLogo}
                        size={60}
                        alt="Tenant Logo"
                    />}
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        flexDirection: navExpanded ? 'column-reverse' : 'column',

                    }}>

                    {authContext?.authenticated && <AvatarComponent />}
                </Box>
                <BridgedLocalesMenuButton />
                <DarkToggleMode />
            </Box>

            {navExpanded && navSize === 'large' && <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',

                    flexDirection: 'column',

                }}

            >

                <TenantAvatarComponent
                    imageUrl={tenantLogos.squaredLogo}
                    size={200}
                    alt="Tenant Logo"
                />



            </Box>}


        </Box>




        <Scrollbar
            //autoHide={true}
            //autoHideTimeout={1000}
            //autoHideDuration={200}
            className={'dash-layout-sider-scrollbar'}
        >
            <GenerateItems items={items} navExpanded={navExpanded} navSize={navSize} level={0} />
        </Scrollbar>

    </>


};

/*export default React.memo(
  AppMaterialMenu,
  (props, nextProps) =>
    props === nextProps
) as typeof AppMaterialMenu;
*/

export default AppMaterialMenu;
