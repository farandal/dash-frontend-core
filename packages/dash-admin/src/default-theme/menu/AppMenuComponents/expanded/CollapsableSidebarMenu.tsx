import { ICollapsableSidebarMenu } from '../interfaces';
import { useDispatch } from 'react-redux';
import { memo, useEffect, useState } from 'react';
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
import clickSound from '@app/assets/sounds/click2.mp3?string';
import { IPageState, DASH_REDUX_ACTIONS } from 'dash-admin-state';
import {DASHAppConstants} from 'dash-constants';
import { NavEventManager } from '../../../../utils/navEvents';

const CollapsableSidebarMenu = ({
  item,
  navExpanded,
  navSize,
  level
}: ICollapsableSidebarMenu) => {
  const loc = useLocation();
  const dispatch = useDispatch();

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
      const audio = new Audio(clickSound);
      audio.load();
      audio.play();
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

  // Handle opening submenu - notify others to close
  const handleOpenSubmenu = () => {
    const newState = !localOpen;
    setLocalOpen(newState);
    
    // Notify other submenus to close (accordion behavior)
    if (newState) {
      NavEventManager.notifySubmenuOpened(submenuKey);
    }
  };

  return (
    <>
      <ListItemButton
        selected={localOpen}
        className={'sidebar-list-menu-item'}
        onClick={(e) => {
          // Only handle click if it's not on the expand icon
          if (!(e.target as HTMLElement).closest('.expand-icon')) {
            playClick();
            handleOpenSubmenu();
            
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
            {localOpen ? 
              <ExpandLessOutlinedIcon className='expand-icon less' /> : 
              <ExpandMoreOutlinedIcon className='expand-icon more' />
            }
          </div>
        )}
      </ListItemButton>
      {navExpanded && (
        <Collapse in={localOpen} timeout='auto'>
          <List className={'sidebar-list-sub'} disablePadding>
            {item.children?.map((item, index) =>
              item ? (
                item.children ? (
                  <CollapsableSidebarMenu
                    navExpanded={navExpanded}
                    navSize={navSize}
                    item={item}
                    key={index}
                    level={level + 1}
                  />
                ) : (
                  <SidebarItem
                    level={level}
                    navExpanded={navExpanded}
                    navSize={navSize}
                    showIcon={false}
                    item={item}
                    key={index}
                  />
                )
              ) : null,
            )}
          </List>
        </Collapse>
      )}
    </>
  );
};

const MemoizedCollapsableSidebarMenu = memo(CollapsableSidebarMenu, (prev, next) => {
  return prev === next;
});

export default MemoizedCollapsableSidebarMenu as typeof CollapsableSidebarMenu;
