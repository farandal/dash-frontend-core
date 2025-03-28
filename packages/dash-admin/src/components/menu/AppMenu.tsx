import * as React from 'react';

import CustomMenuItemLink from './CustomMenuItemLink';
//import resources from '../resources';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';

import { Menu, usePermissions } from 'react-admin';

import { LoadingIndicator } from 'react-admin';

import { IDASHAppState } from 'dash-admin-state';
import Scrollbar from '../scrollbar/Scrollbar';
import IAppResourceConfig from '../../interfaces/IAppResourceConfig';
import { slugify } from '../../utils/slugify';
import DASHStorageClass from '../../classes/DASHStorageClass';
import checkRole from '../../helpers/checkRole';

export interface IAppMenu {
  //hasDashboard: boolean;
  children?: React.ReactNode;
  autoHideScroll?: boolean;
  [key: string]: any;
}

// Group icons
export const AppMenu: React.FC<IAppMenu> = ({
  hasDashboard,
  autoHideScroll = false,
  children,
}) => {
  //const resources = useResourceDefinitions()
  const { permissions } = usePermissions();

  const { navExpanded } = useSelector(
    (state: IDASHAppState<any, any, any>) => state.common,
  );
  const menuRef = React.useRef();

  const [openKeys, setOpenKeys] = React.useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = React.useState<string[]>([]);
  const [items, setItems] = React.useState(null);

  interface MenuItem {
    label: React.ReactNode;
    key: React.Key;
    icon?: React.ReactNode;
    children?: MenuItem[];
    type?: 'group';
  }

  const getItem = (item: MenuItem): MenuItem => {
    return {
      key: item.key,
      icon: item.icon,
      children: item.children,
      label: item.label,
      type: item.type,
    };
  };

  //const resources:IAppResourceConfig[] =useSelector((state:IDASHAppState) => state.settings.resources);

  useEffect(() => {
    //find groups}
    const groups = [
      ...new Set(
        DASHStorageClass.resources.map((resource) => resource.group as string),
      ),
    ];
    //group resources belonging to the group
    const groupedResources = new Object();

    groups.forEach((group) => {
      groupedResources[group as string] = DASHStorageClass.resources.filter(
        (resource) => {
          console.log(
            resource.group + ' | ',
            resource.label + ' | ',
            permissions,
            resource.roles,
            checkRole(permissions, resource.roles),
          );

          return (
            resource.group === group && checkRole(permissions, resource.roles)
          );
        },
      );
    });
    const _items: MenuItem[] = [];

    Object.keys(groupedResources).map((groupKey) => {
      const group: IAppResourceConfig[] = groupedResources[groupKey];

      if (!group.length) return;

      const _item: MenuItem = {
        label: group[0].group,
        key: slugify(group[0].group),
        icon: group[0].icon,
        children: group.map((resource) =>
          getItem({
            label: (
              <CustomMenuItemLink
                key={resource.label}
                to={`/${resource.model}`}
                primaryText={
                  <>
                    <span>{resource.label}</span>
                  </>
                }
              />
            ),
            key: resource.label,
            icon: resource.icon,
          }),
        ),
      };

      _items.push(_item);
    });
    setItems(_items);
  }, [DASHStorageClass.resources]);

  if (!items) return <LoadingIndicator />;
  return (
    <>
      <Scrollbar
        autoHide={true}
        autoHideTimeout={1000}
        autoHideDuration={200}
        className={'dash-layout-sider-scrollbar'}
      >

        <Menu
          ref={menuRef}
          subMenuOpenDelay={0.3}
          subMenuCloseDelay={1}
          openKeys={openKeys}
          selectedKeys={selectedKeys}
          onOpenChange={(opens: any[]) => {
            setSelectedKeys([]);
            setOpenKeys([opens[opens.length - 1]]);
          }}
          onSelect={(e) => {
            setSelectedKeys(e.selectedKeys);
            if (e.keyPath.length === 1) { setOpenKeys([]); }
          }}
          mode='inline'
          items={items}
        />
      </Scrollbar>
    </>
  );
};
