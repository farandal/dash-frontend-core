import { FC, PropsWithChildren, useEffect, useRef, useState } from 'react';
import { IMenuItem } from '../interfaces';
import ReactDOM from 'react-dom';
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

export interface ICollapsedSidebarItem {
    item: IMenuItem;
    navSize: 'large' | 'small';
    navExpanded: boolean;
    level: number;
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

const SUBMENU_SCROLL_THRESHOLD = 10; // You can change this value as needed

const CollapsedSidebarItem = ({
    item,
    navSize,
    navExpanded,
    level
}: ICollapsedSidebarItem) => {
    const hovering = useRef<boolean>(false);
    const timeoutDuration = 20;
    let timeout;
    const [webView, setWebView] = useState<boolean>(false);
    const [open, setOpen] = useState(false);
    const itemRef = useRef<HTMLDivElement>(null);

    const openMenuOnHover = (event) => {
        setOpen(true);
    };

    const openMenuOnClick = (event) => {
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

    const hasChildren = item.children && item.children.length > 0;

    // Helper to close submenu and optionally handle click
    const handleSubmenuItemClick = (e, childItem) => {
        setOpen(false);
        // Optionally, you can call any navigation logic here if needed
        // But SidebarItem already handles navigation
        // If you want to prevent double navigation, you can stop propagation
        // e.stopPropagation();
    };

    // Calculate submenu position and style based on number of children
    let submenuStyle: React.CSSProperties = {};
    let submenuPosition: { top?: number; left?: number } = {};

    const renderAtTop = item.children && item.children.length > SUBMENU_SCROLL_THRESHOLD;

    if (renderAtTop) {
        submenuStyle = {
            zIndex: 10000,
            position: 'fixed',
            top: 0,
            left: 58, // adjust as needed for your sidebar width
            maxHeight: '100vh',
            overflowY: 'auto',
            width: '260px',
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            borderRadius: 4,
        };
    } else {
        // Position next to the sidebar item
        if (itemRef.current) {
            const rect = itemRef.current.getBoundingClientRect();
            submenuPosition = {
                top: rect.top,
                left: rect.right,
            };
        }
        submenuStyle = {
            zIndex: 10000,
            position: 'fixed',
            top: submenuPosition.top || 0,
            left: submenuPosition.left || 58,
            maxHeight: '80vh',
            overflowY: 'auto',
            width: '260px',
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            borderRadius: 4,
        };
    }

    return hasChildren ? (
        <>
            <div ref={itemRef}>
                <SidebarItem
                    aria-owns={open ? 'menu-' + item.key : undefined}
                    aria-haspopup='true'
                    onMouseEnter={!webView ? openMenuOnHover: null}
                    onMouseLeave={closeMenu}
                    onClick={webView ? openMenuOnClick : null}
                    onTouchStart={closeMenu} 
                    item={item}
                    showText={false}
                    navSize={navSize}
                    navExpanded={navExpanded}
                    level={level}
                    hasChildren={hasChildren}
                >
                    {open && ReactDOM.createPortal(
                        <div
                            className="sidebar-collapsed-menu"
                            style={submenuStyle}
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
                                        />
                                    );
                                })}
                            </ul>
                        </div>,
                        document.body
                    )}
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
        />
    );
};

export default CollapsedSidebarItem;