import { useEffect, useState } from 'react';
import { useRedirect } from 'react-admin';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router';
import IAppResourceConfig from '../interfaces/IAppResourceConfig';
import { IPageState, DASH_REDUX_ACTIONS } from 'dash-admin-state';
import useVirtualHash from '../hooks/useVirtualHash';
import { Button } from '@mui/material';
import DashResourceButton from 'dash-auto-admin/src/toolbar/buttons/DashResourceButton';

export interface IResourceMenu {
  resourceConfig: IAppResourceConfig;
}

/**
 * Resource Menu
 *
 * @description Renders the op tabs navigation menu
 *
 * @param {IResourceMenu} props - Functional Component Props
 * @param {IDashAutoAdminResourceConfig} props.resourceConfig - Resource Config
 *
 * @returns {JSX.Element} - JSX element
 */
const ResourceMenu: React.FC<IResourceMenu> = (props) => {
  const { resourceConfig } = props;
  const { resourceMenuDisabled = false, resourceMenuPosition = 'top' } =
    resourceConfig;

  const redirect = useRedirect();
  const { hash, setVirtualHash } = useVirtualHash();
  const location = useLocation();

  const dispatch = useDispatch();
  const updatePageState = (menuItem) => {
    const newPageState: IPageState = {
      title: menuItem?.title,
      //icon: item?.icon,
      //subTitle: item?.group,
    };
    dispatch(DASH_REDUX_ACTIONS.updatePage(newPageState));
  };

  const handleMenuClick = (menuItem, e) => {
    updatePageState(menuItem);

    menuItem.redirect ? redirect(menuItem.redirect) : menuItem?.onClick();
  };


  const [resourceMenu, setResourceMenu] = useState(null);
  const loc = useLocation();

  useEffect(() => {
    const val = Array.isArray(resourceConfig.menu)
      ? resourceConfig.menu
      : typeof resourceConfig.menu === 'function'
        ? resourceConfig.menu()
        : null;
    setResourceMenu(val);
  }, []);

  useEffect(() => {
    const val = Array.isArray(resourceConfig.menu)
      ? resourceConfig.menu
      : typeof resourceConfig.menu === 'function'
        ? resourceConfig.menu()
        : null;
    setResourceMenu(val);
  }, [loc]);

  return (
    <div className={`dash-module-${resourceMenuPosition}`}>
      <div className={`dash-module-${resourceMenuPosition}-content`}>
        <ul className='dash-module-horizontal-nav'>
          {resourceMenu &&
            resourceMenu.map((menuItem, index) => {
              let active: boolean = location.pathname === menuItem?.redirect;
              return (
                <li
                  key={index}
                  onClick={(e) => handleMenuClick(menuItem, e)}
                  className={active ? 'active' : null}
                >
                  <span className={'dash-link'}>
                    <i className={`icon icon-${menuItem?.icon}`} />
                    <span>{menuItem.title}</span>
                  </span>
                </li>
              );
            })}
        </ul>
        {resourceConfig.mainAction && (
          <div className='dash-module-action'>

            <DashResourceButton
              resourceConfig={resourceConfig}
              mode={resourceConfig.mainAction?.mode || 'create'}
            /*navigation={resourceConfig.mainAction?.fn}
            navigate={(_record) => {
                //return 'inline/' + record.id + '/show';
                return resourceConfig.mainAction.redirect
            }}*/
            >
              <Button
                //className='dash-btn-block'
                variant='contained'
              >
                <>{resourceConfig.mainAction.title}</>
              </Button>
            </DashResourceButton>
          </div>
        )}
        {resourceConfig.navActions && (
          <div className='dash-module-action'>
            {resourceConfig.navActions.map((action) => action)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceMenu;
