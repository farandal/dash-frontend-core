import * as React from 'react';

import { useSelector } from 'react-redux';
// Remove this import
// import { usePermissions } from 'react-admin';

import { CircularProgress, Divider, List } from '@mui/material';
import { useEffect } from 'react';
import { IMenuItem, IAppMenu } from './AppMenuComponents/interfaces';
import SidebarItem from './AppMenuComponents/expanded/SidebarItem';
import SidebarItemCollapse from './AppMenuComponents/expanded/CollapsableSidebarMenu';
import CollapsedSidebarItems from './AppMenuComponents/collapsed/CollapsedSidebarItems';
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
//import { IDomainAuth, IDomainUser } from '@app/DASHApp';
import { IDASHAppState } from 'dash-admin-state';
import checkRole from 'dash-admin/src/helpers/checkRole';
import { slugify } from 'dash-admin/src/utils/slugify';
import { AvatarComponent, DarkModeSwitcher, LanguageSwitcher } from 'dash-components';

import Scrollbar from 'dash-admin/src/components/scrollbar/Scrollbar';
// Add this import
import { AuthPersistenceService, useAuthContext } from 'dash-admin/src/contexts/auth/AuthContext';

// Group icons
const GenerateItems: React.FC<{ items: IMenuItem[]; navExpanded: boolean, navSize: string, level: number }> = ({
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

const AppMaterialMenu: React.FC<IAppMenu> = (props) => {

  const { menu, debug } = props;
  //const resources = useResourceDefinitions()
  
  // Replace usePermissions with useAuthContext - add null check
  // const { permissions } = usePermissions();
  const authContext = useAuthContext();
  
  /*const { navExpanded,navSize } = useSelector(
    (state: IDASHAppState<any, any, IDashAutoAdminResourceConfig>) =>
      state.common,
  );*/
const { navExpanded,navSize } = props; 
  const [items, setItems] = React.useState<IMenuItem[]>(null);
  // Add state for permissions
  //const [permissions, setPermissions] = React.useState<any>(null);

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
        return (
          resource.group === group && checkRole(authContext.user?.roles?.flatMap(role => role.name) || [], resource.roles)
        );
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

      const _children = _childrens
        .map((resource) => {
          return {
            label: resource.label,
            key: resource.label,
            to: resource?.redirect
              ? `/${resource.redirect}`
              : `/${resource.model}`,
            icon: resource.icon,
            group: slugify(group[0].group),
            model: resource.model,
            txtLabel: resource.label,
          };
        });

      const _item: IMenuItem = {
        label: group[0].group,
        key: slugify(group[0].group),
        icon: group[0].icon || groupIcons[group[0].group],
        group: slugify(group[0].group),
        model: group[0].model,
        to: group[0].redirect ? `/${group[0].redirect}` : `/${group[0].model}`,
        txtLabel: group[0].group,
        ...(_childrens && _childrens.length > 1 && { children: _children }) as any
      };

      _items.push(_item);

    });

    setItems(_items);
  }, [resources, debug, authContext?.user]); // Add authContext.user as dependency


  return (
    <>
      <div className='dash-menu-user'>
        <AvatarComponent />
        <div className='dash-menu-actions'>
            {/* TODO: Languahe switcher that do not rely on react-admin*/}
            {/*<LanguageSwitcher />*/}
           
            <DarkModeSwitcher/>
        </div>
      </div>

      <Divider sx={{ mb:1,mt:4 }} />
     
      <Scrollbar
        //autoHide={true}
        //autoHideTimeout={1000}
        //autoHideDuration={200}
        className={'dash-layout-sider-scrollbar'}
      >
        <GenerateItems items={items} navExpanded={navExpanded} navSize={navSize} level={0} />
      </Scrollbar>
    </>
  );
};

/*export default React.memo(
  AppMaterialMenu,
  (props, nextProps) =>
    props === nextProps
) as typeof AppMaterialMenu;
*/


export default AppMaterialMenu;
