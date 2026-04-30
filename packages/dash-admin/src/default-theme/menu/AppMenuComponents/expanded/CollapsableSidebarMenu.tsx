import { ICollapsableSidebarMenu } from '../interfaces';
import { useDispatch } from 'react-redux';
import { memo, useEffect, useState, useRef } from 'react';
import isCurrentPath from '../../../../hooks/isCurrentPath';
import { useLocation, useNavigate } from 'react-router';
import {
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import ExpandLessOutlinedIcon from '@mui/icons-material/ExpandLessOutlined';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import SidebarItem from './SidebarItem';

/** @ts-ignore */
//import clickSound from '@app/assets/sounds/click2.mp3?string';
import { IPageState, DASH_REDUX_ACTIONS } from 'dash-admin-state';
import {DASHAppConstants} from 'dash-constants';
import { NavEventManager } from '../../../../utils/navEvents';
import { FORCE_CLICK_OPEN } from '../submenuConstants';
import SubmenuPortal from '../SubmenuPortal';

const CollapsableSidebarMenu = ({
  item,
  navExpanded,
  navSize,
  level,
  sidebarPosition = "left"
}: ICollapsableSidebarMenu) => {
  const loc = useLocation();
  const dispatch = useDispatch();
  const itemRef = useRef<HTMLDivElement>(null);
  const isHorizontal = sidebarPosition === "top" || sidebarPosition === "bottom";
  
  // Detect if running in mobile webview or android
  const [webView, setWebView] = useState<boolean>(false);
  
  useEffect(() => {
    if (document.body.classList.contains('webview') || document.body.classList.contains('android')) {
      setWebView(true);
    } else {
      setWebView(false);
    }
  }, []);

  const [isCurrent, setCurrent] = useState(isCurrentPath(loc.pathname, item));

  const [localOpen, setLocalOpen] = useState<boolean>(
    isCurrentPath(loc.pathname, item),
  );

  // Generate a unique key for this submenu
  const submenuKey = `${item.group}-${item.key}`;

  /* This hook is to open the menu on load only, memo state will not rerender this twice */
  useEffect(() => {
    setLocalOpen(isCurrentPath(loc.pathname, item));
  }, []);

  // Listen for other submenus opening (accordion behavior)
  useEffect(() => {
    const unsubscribe = NavEventManager.onSubmenuOpened((openedKey: string) => {
      // If another submenu opened (not this one), close this one
      if (openedKey !== submenuKey) {
        setLocalOpen(false);
      }
    });

    // Also listen for close all submenus event
    const unsubscribeCloseAll = NavEventManager.onCloseAllSubmenus(() => {
      setLocalOpen(false);
    });

    return () => {
      unsubscribe();
      unsubscribeCloseAll();
    };
  }, [submenuKey, navSize]);

  const navigate = useNavigate();

  const playClick = () => {
    if (!!DASHAppConstants.system.UI_SOUNDS) {
      // const audio = new Audio(clickSound);
      // audio.load();
      // audio.play();
    }
  };

  const updatePageState = () => {
    const newPageState: IPageState = {
      title: item?.label,
      icon: item?.icon,
      subTitle: item?.group,
    };
    dispatch(DASH_REDUX_ACTIONS.updatePage(newPageState));
  };

  // Handle expand/collapse icon click
  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClick();
    const newState = !localOpen;
    setLocalOpen(newState);
    
    // Notify other submenus to close (accordion behavior)
    if (newState) {
      NavEventManager.notifySubmenuOpened(submenuKey);
    }
  };

  // Handle opening submenu - notify others to close (for click mode)
  const handleOpenSubmenu = () => {
    const newState = !localOpen;
    setLocalOpen(newState);
    
    // Notify other submenus to close (accordion behavior)
    if (newState) {
      NavEventManager.notifySubmenuOpened(submenuKey);
    }
  };

  // Hover handlers for horizontal mode (desktop only)
  const handleMouseEnter = () => {
    if (isHorizontal && !webView && !FORCE_CLICK_OPEN) {
      NavEventManager.notifySubmenuOpened(submenuKey);
      setLocalOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (isHorizontal && !webView && !FORCE_CLICK_OPEN) {
      setLocalOpen(false);
    }
  };

  // Calculate dropdown position based on sidebar position
  const getDropdownPosition = () => {
    if (!itemRef.current) return {};
    const rect = itemRef.current.getBoundingClientRect();
    
    switch (sidebarPosition) {
      case "top":
        return { top: rect.bottom + 10, left: rect.left };
      case "bottom":
        return { bottom: window.innerHeight - rect.top + 4, left: rect.left };
      case "right":
        // For right sidebar, submenu opens to the left of the menu item
        return { top: rect.top, right: window.innerWidth - rect.left + 4 };
      case "left":
      default:
        // For left sidebar, submenu opens to the right of the menu item
        return { top: rect.top, left: rect.right + 4 };
    }
  };

  // Submenu content - shared between portal and inline rendering
  const submenuContent = (
    <List className={'sidebar-list-sub'} disablePadding>
      {item.children?.map((childItem, index) =>
        childItem ? (
          childItem.children ? (
            <CollapsableSidebarMenu
              navExpanded={navExpanded}
              navSize={navSize}
              item={childItem}
              key={index}
              level={level + 1}
              sidebarPosition={sidebarPosition}
            />
          ) : (
            <SidebarItem
              level={level}
              navExpanded={navExpanded}
              navSize={navSize}
              showIcon={false}
              item={childItem}
              key={index}
            />
          )
        ) : null,
      )}
    </List>
  );

  return (
    <>
      <div 
        ref={itemRef} 
        style={{ display: isHorizontal ? 'inline-flex' : 'block' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <ListItemButton
          selected={localOpen}
          className={'sidebar-list-menu-item'}
          sx={isHorizontal ? { 
            flexShrink: 0, 
            whiteSpace: 'nowrap',
            paddingX: 2,
          } : undefined}
          onClick={(e) => {
            // Only handle click if it's not on the expand icon
            if (!(e.target as HTMLElement).closest('.expand-icon')) {
              playClick();
              // For horizontal mode, only handle click on mobile/webview/FORCE_CLICK_OPEN (desktop uses hover)
              if (!isHorizontal || webView || FORCE_CLICK_OPEN) {
                handleOpenSubmenu();
              }
              
              if (!isCurrentPath(loc.pathname, item)) {
                updatePageState();
                navigate(item.to || item.model);
              }
            }
          }}
        >
          <ListItemIcon>{item.icon && item.icon}</ListItemIcon>
          {/* Este es el submenu con la barra lateral expandida */}
          {navExpanded && (
            <ListItemText
              disableTypography
              primary={<Typography>{item.label}</Typography>}
            />
          )}
          {navExpanded && (
            <div onClick={handleExpandClick}>
              {/* For bottom position, invert icons since submenu opens upward */}
              {sidebarPosition === "bottom" ? (
                localOpen ? 
                  <ExpandMoreOutlinedIcon className='expand-icon more' /> : 
                  <ExpandLessOutlinedIcon className='expand-icon less' />
              ) : (
                localOpen ? 
                  <ExpandLessOutlinedIcon className='expand-icon less' /> : 
                  <ExpandMoreOutlinedIcon className='expand-icon more' />
              )}
            </div>
          )}
        </ListItemButton>
      </div>
      
      {/* Portal submenu for all positions */}
      {/* Vertical mode (Left/Right) - Inline Expansion using Collapse */}
      {!isHorizontal && (
        <Collapse in={localOpen} timeout="auto" unmountOnExit>
          {submenuContent}
        </Collapse>
      )}

      {/* Horizontal mode (Top/Bottom) - Portal Dropdown */}
      {isHorizontal && (
        <SubmenuPortal
          open={navExpanded && localOpen}
          itemRef={itemRef}
          sidebarPosition={sidebarPosition}
          childrenCount={item.children?.length || 0}
          className="sidebar-submenu-portal"
          onMouseEnter={() => !webView && !FORCE_CLICK_OPEN && setLocalOpen(true)}
          onMouseLeave={() => !webView && !FORCE_CLICK_OPEN && setLocalOpen(false)}
        >
          {submenuContent}
        </SubmenuPortal>
      )}
    </>
  );
};

const MemoizedCollapsableSidebarMenu = memo(CollapsableSidebarMenu, (prev, next) => {
  return prev === next;
});

export default MemoizedCollapsableSidebarMenu as typeof CollapsableSidebarMenu;
