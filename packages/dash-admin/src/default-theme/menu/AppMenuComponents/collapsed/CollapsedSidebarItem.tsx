import { FC, PropsWithChildren, useEffect, useRef, useState } from 'react';
import { IMenuItem } from '../interfaces';
import {
    ListItemButton,
    ListItemButtonProps,
    ListItemIcon,
    ListItemText,
    Menu,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router';
import { IPageState, DASH_REDUX_ACTIONS } from 'dash-admin-state';
import { useDispatch } from 'react-redux';
import isCurrentPath from '../../../../hooks/isCurrentPath';
import { NavEventManager } from '../../../../utils/navEvents';
import { SidebarPosition } from '../../AppSidebarMaterial';
import { FORCE_CLICK_OPEN, SUBMENU_SCROLL_THRESHOLD } from '../submenuConstants';
import SubmenuPortal from '../SubmenuPortal';

export interface ICollapsedSidebarItem {
    item: IMenuItem;
    navSize: 'large' | 'small';
    navExpanded: boolean;
    level: number;
    sidebarPosition?: SidebarPosition;
}

export interface ISidebarItem extends ListItemButtonProps, PropsWithChildren {
    item: IMenuItem;
    showIcon?: boolean;
    showText?: boolean;
    navExpanded?: boolean;
    navSize: 'large' | 'small';
    level: number,
    hasChildren?: boolean;
}

const SidebarItem: FC<ISidebarItem> = (props) => {
    const {
        item,
        showIcon = true,
        showText = true,
        children,
        navExpanded,
        navSize,
        level,
        hasChildren = false,
        onClick,
        ...rest
    } = props;

    const loc = useLocation();

    const [isCurrent, setCurrent] = useState(isCurrentPath(loc.pathname, item));

    useEffect(() => {
        setCurrent(isCurrentPath(loc.pathname, item));
    }, [loc]);

    const navigate = useNavigate();

    const dispatch = useDispatch();

    const updatePageState = () => {
        const newPageState: IPageState = {
            title: item?.label,
            icon: item?.icon,
            subTitle: item?.group,
        };
        dispatch(DASH_REDUX_ACTIONS.updatePage(newPageState));
    };

    return (
        <ListItemButton
            {...rest}
            selected={isCurrent}
            onClick={(e) => {
               
                if(onClick) {
                   
                    onClick(e);
                }

                //e.preventDefault();
                e.stopPropagation();
                //if ((e.target as any)?.localName === 'svg') return;

                if (!hasChildren) {
                    if (!isCurrentPath(loc.pathname, item)) {
                        updatePageState();
                        navigate(item.to);
                        return;
                    }
                }

              
            }}
        >
            {showIcon && <ListItemIcon>{item.icon && item.icon}</ListItemIcon>}
            {(showText && level > 0) && (
                <ListItemText>{item.label}</ListItemText>
            )}
            {children}
        </ListItemButton>
    );
};

const CollapsedSidebarItem = ({
    item,
    navSize,
    navExpanded,
    level,
    sidebarPosition = "left"
}: ICollapsedSidebarItem) => {
    const hovering = useRef<boolean>(false);
    const timeoutDuration = 20;
    let timeout;
    const [webView, setWebView] = useState<boolean>(false);
    const [open, setOpen] = useState(false);
    const itemRef = useRef<HTMLDivElement>(null);
    
    // Unique key for this submenu to identify it in accordion behavior
    const submenuKey = `collapsed-${item.key || item.label}`;

    const openMenuOnHover = (event) => {
        // Notify other submenus to close (accordion behavior)
        NavEventManager.notifySubmenuOpened(submenuKey);
        setOpen(true);
    };

    const openMenuOnClick = (event) => {
        if (!open) {
            // Notify other submenus to close (accordion behavior)
            NavEventManager.notifySubmenuOpened(submenuKey);
        }
        setOpen(prevOpen => !prevOpen);
    };

    const closeMenu = (event) => {
        if (!webView) {
            setOpen(false);
        }
    };

    useEffect(() => {
        if (document.body.classList.contains('webview')) {
            setWebView(true)
        } else {
            setWebView(false)
        }
    }, []);
    
    // Listen for other submenus opening and close this one (accordion behavior)
    useEffect(() => {
        const unsubscribeSubmenuOpened = NavEventManager.onSubmenuOpened((openedKey) => {
            // Close this submenu if a different one was opened
            if (openedKey !== submenuKey && open) {
                setOpen(false);
            }
        });
        
        const unsubscribeCloseAll = NavEventManager.onCloseAllSubmenus(() => {
            setOpen(false);
        });
        
        return () => {
            unsubscribeSubmenuOpened();
            unsubscribeCloseAll();
        };
    }, [submenuKey, open]);

    const hasChildren = item.children && item.children.length > 0;

    // Helper to close submenu after item click - navigation is handled by SidebarItem
    const handleSubmenuItemClick = (e, childItem) => {
        // Close the dropdown menu after a short delay to allow navigation to complete
        setTimeout(() => {
            setOpen(false);
            // Close the drawer on mobile
            NavEventManager.closeDrawer();
        }, 100);
    };

    return hasChildren ? (
        <>
            <div ref={itemRef}>
                <SidebarItem
                    aria-owns={open ? 'menu-' + item.key : undefined}
                    aria-haspopup='true'
                    onMouseEnter={!webView && !FORCE_CLICK_OPEN ? openMenuOnHover : null}
                    onMouseLeave={!FORCE_CLICK_OPEN ? closeMenu : null}
                    onClick={webView || FORCE_CLICK_OPEN ? openMenuOnClick : null}
                    item={item}
                    showText={false}
                    navSize={navSize}
                    navExpanded={navExpanded}
                    level={level}
                    hasChildren={hasChildren}
                >
                    <SubmenuPortal
                        open={open}
                        itemRef={itemRef}
                        sidebarPosition={sidebarPosition}
                        childrenCount={item.children?.length || 0}
                        className="sidebar-collapsed-menu"
                    >
                        <ul
                            id={'menu-' + item.key}
                            key={'menu-' + item.key}
                            className={`dropdown ${open ? 'show' : ''}`}
                            style={{
                                margin: 0,
                                padding: 0,
                                listStyle: 'none',
                            }}
                        >
                            {item.children?.map((item, index) => {
                                return (
                                    <SidebarItem
                                        navSize={navSize}
                                        navExpanded={navExpanded}
                                        level={level + 1}
                                        item={item}
                                        key={index}
                                        hasChildren={item.children && item.children.length > 0}
                                        onClick={(e) => handleSubmenuItemClick(e, item)}
                                        onTouchStart={(e) => e.stopPropagation()}
                                    />
                                );
                            })}
                        </ul>
                    </SubmenuPortal>
                </SidebarItem>
            </div>
        </>
    ) : (
        <SidebarItem
            item={item}
            navSize={navSize}
            navExpanded={navExpanded}
            level={level}
            hasChildren={false}
            onClick={() => {
                // Close all other submenus first
                NavEventManager.closeAllSubmenus();
                // Close drawer when clicking primary level item without children
                setTimeout(() => {
                    NavEventManager.closeDrawer();
                }, 100);
            }}
        />
    );
};

export default CollapsedSidebarItem;