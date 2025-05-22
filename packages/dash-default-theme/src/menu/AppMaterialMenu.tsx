import * as React from 'react';

import { useSelector } from 'react-redux';
import { usePermissions } from 'react-admin';
import { LoadingIndicator } from 'react-admin';
import { List } from '@mui/material';
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

import Scrollbar from 'dash-admin/src/components/scrollbar/Scrollbar';

// Group icons
const GenerateItems: React.FC<{ items: IMenuItem[]; navExpanded: boolean, navSize: "small" | "large", level: number }> = ({
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

  const { menu, debug, navSize } = props;
  //const resources = useResourceDefinitions()
  const { permissions } = usePermissions();
  const { navExpanded } = useSelector(
    (state: IDASHAppState<any, any, IDashAutoAdminResourceConfig>) =>
      state.menu,
  );

  const [items, setItems] = React.useState<IMenuItem[]>(null);

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
          resource.group === group && checkRole(permissions, resource.roles)
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
  }, [resources]);

  //if (!items) return <LoadingIndicator />;

  return (
    <>

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

export default React.memo(
  AppMaterialMenu,
  (props, nextProps) =>
    props === nextProps
) as typeof AppMaterialMenu;

//export default AppMaterialMenu;
