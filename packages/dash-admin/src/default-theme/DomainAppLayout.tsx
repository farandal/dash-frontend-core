import * as React from 'react';
import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useStore } from 'react-admin';
import { Box } from '@mui/material';

import { IAppLayout } from '../layout/AppLayout';
import { DASH_REDUX_ACTIONS, IDASHAppState } from 'dash-admin-state';

import DomainTheme from './DomainTheme';
import DomainHeader from './DomainHeader';

import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';

export interface IDomainAppLayout<U = any, A = any> extends IAppLayout {
  themeComponent?: React.JSX.Element;
}

const DomainAppLayout = <U, A>(props: IDomainAppLayout<U, A>): React.JSX.Element => {
  const { themeComponent, children } = props;

  const dispatch = useDispatch();
  const contentRef = useRef(null);
  const [resourceConfig] = useStore('resourceConfig');
  
  // Simple selectors - don't over-optimize
  const authenticated = useSelector(
    (state: IDASHAppState<U, A, IDashAutoAdminResourceConfig>) => state.auth.authenticated
  );
  
  const groupIcons = useSelector(
    (state: IDASHAppState<U, A, IDashAutoAdminResourceConfig>) => state.settings.groupIcons
  );

  // Update page info when resource changes
  useEffect(() => {
    if (resourceConfig && groupIcons) {
      
      dispatch(
        DASH_REDUX_ACTIONS.updatePage({
          title: resourceConfig.label,
          icon: resourceConfig.group && groupIcons[resourceConfig.group],
          subTitle: resourceConfig.group,
        }),
      );
    }
  }, [resourceConfig, groupIcons, dispatch]);

  if (themeComponent) {
    return <>{themeComponent}</>;
  }

    return <DomainTheme headerToolBar={<DomainHeader />}>
        {children}
        <Box sx={{ mb: 3 }}>
            <div className='dash-layout-footer-content'></div>
        </Box>
        </DomainTheme>;
    };

// Simple memo comparison
/*export default React.memo(DomainAppLayout, (prevProps, nextProps) => {
  return (
    prevProps.children === nextProps.children &&
    prevProps.themeComponent === nextProps.themeComponent
  );
});*/
export default DomainAppLayout;
