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
import isCurrentPath from 'dash-admin/src/hooks/isCurrentPath';

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

                e.preventDefault();
                if ((e.target as any)?.localName === 'svg') return;

                if (!hasChildren) {
                    if (!isCurrentPath(loc.pathname, item)) {
                        updatePageState();
                        navigate(item.to);
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
    level
}: ICollapsedSidebarItem) => {
    const hovering = useRef<boolean>(false);
    const timeoutDuration = 20;
    let timeout;
    const [webView, setWebView] = useState<boolean>(false);
    const [open, setOpen] = useState(false);
    const itemRef = useRef<HTMLDivElement>(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0 });

    const openMenuOnHover = (event) => {
    
        
            setOpen(true);
           

        if (itemRef.current) {
            const rect = itemRef.current.getBoundingClientRect();
            setMenuPosition({ top: rect.top });
        }
    };

    const openMenuOnClick = (event) => {
      
              
               //event.preventDefault();
               //event.stopPropagation();
               setOpen(prevOpen => !prevOpen);
          
           if (itemRef.current) {
               const rect = itemRef.current.getBoundingClientRect();
               setMenuPosition({ top: rect.top });
           }
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

    return hasChildren ? (
        <>
            <div ref={itemRef}>
                <SidebarItem
                    aria-owns={open ? 'menu-' + item.key : undefined}
                    aria-haspopup='true'
                    onMouseEnter={!webView ? openMenuOnHover: null}
                    onMouseLeave={closeMenu}
                    onClick={webView ? openMenuOnClick : null}
                    item={item}
                    showText={false}
                    navSize={navSize}
                    navExpanded={navExpanded}
                    level={level}
                    hasChildren={hasChildren}
                >
                    {open && ReactDOM.createPortal(
                        <div className="sidebar-collapsed-menu ">
                            <ul
                                id={'menu-' + item.key}
                                key={'menu-' + item.key}
                                className={`dropdown ${open ? 'show' : ''}`}
                                style={{
                                    zIndex: 10000,
                                    position: 'absolute',
                                    top: menuPosition.top,
                                    //left: navSize === 'small' ? '64px' : '240px'
                                    left: 58
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
                                        />
                                    );
                                })}
                            </ul></div>,
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