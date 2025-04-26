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
  hasChildren?: boolean; // Add this prop to indicate if the item has children
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
    hasChildren = false, // Default to false
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
        e.stopPropagation();
       
        if ((e.target as any)?.localName === 'svg') return;

        // Only navigate if this is not a parent item with children when sidebar is collapsed
        // or if the sidebar is expanded
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

  const [open, setOpen] = useState(false);

  const openMenu = () => {
    setOpen(true);
  };
  const closeMenu = () => {
    setOpen(false);
  };

  const [webView,setWebView] = useState<boolean>(false);

  useEffect(() => {
    if(document.body.classList.contains('webview')) {
        setWebView(true)
    } else {
        setWebView(false)
    }

  }, []);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
   console.log("handleClick")
        setOpen(true);
    
  };

  // Check if the item has children
  const hasChildren = item.children && item.children.length > 0;

  return hasChildren ? (
    <>
      <SidebarItem
        aria-owns={open ? 'menu-' + item.key : undefined}
        aria-haspopup='true'
        {... !webView ? { onClick:handleClick} : { onMouseEnter:openMenu, onMouseLeave:closeMenu }}
        item={item}
        showText={false}
        navSize={navSize}
        navExpanded={navExpanded}
        level={level}
        hasChildren={hasChildren} // Pass the hasChildren prop
      >
        <ul
          id={'menu-' + item.key}
          key={'menu-' + item.key}
          className={`dropdown ${open ? 'show' : ''}`}
          style={{ zIndex: 1300 }}
        >
          {item.children?.map((item, index) => {
            return (
              <SidebarItem
                navSize={navSize}
                navExpanded={navExpanded}
                level={level + 1}
                item={item}
                key={index}
                hasChildren={item.children && item.children.length > 0} // Pass hasChildren for nested items too
              />
            );
          })}
        </ul>
      </SidebarItem>
    </>
  ) : (
    <SidebarItem 
      item={item} 
      navSize={navSize} 
      navExpanded={navExpanded} 
      level={level} 
      hasChildren={false} // Explicitly set to false for leaf items
    />
  );
};

export default CollapsedSidebarItem;
