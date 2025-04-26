import * as React from 'react';
import { useEffect, useRef, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useStore } from 'react-admin';
import { Box } from '@mui/material';
import { isEqual } from 'lodash'; // You might need to add this dependency

import useLocalStorage from 'dash-admin/src/hooks/useLocalStorage';
import { IAppLayout } from 'dash-admin/src/layout/AppLayout';
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
  
  // Use memoized selector with isEqual for deep comparison
  const groupIcons = useSelector(
    (state: IDASHAppState<U, A, IDashAutoAdminResourceConfig>) =>
      state.settings.groupIcons,
    isEqual
  );

  // Memoize the authenticated value to prevent re-renders when it hasn't changed
  const authenticated = useSelector(
    (state: IDASHAppState<U, A, IDashAutoAdminResourceConfig>) =>
      state.auth.authenticated,
    // Use simple equality check since authenticated is likely a boolean
  );

  // Store previous authenticated value to compare
  const prevAuthenticatedRef = useRef(authenticated);

  // Memoize the update page action to prevent unnecessary dispatches
  const updatePageInfo = useCallback(() => {
    if (resourceConfig) {
      dispatch(
        DASH_REDUX_ACTIONS.updatePage({
          title: resourceConfig.label,
          icon: resourceConfig.group && groupIcons[resourceConfig.group],
          subTitle: resourceConfig.group,
        }),
      );
    }
  }, [resourceConfig, groupIcons, dispatch]);

  // Only update page info when resourceConfig changes
  useEffect(() => {
    updatePageInfo();
  }, [updatePageInfo]);

  // Only log when authenticated actually changes
  useEffect(() => {
    if (prevAuthenticatedRef.current !== authenticated) {
      console.log("authenticated changed:", authenticated);
      prevAuthenticatedRef.current = authenticated;
    }
  }, [authenticated]);

  // Memoize the rendered content to prevent re-renders when props haven't changed
  const renderContent = useMemo(() => {
    if (!authenticated) {
      return (
        <>
          <Box key={1} ref={contentRef} className={'dash-layout-content'}>
            {children}
          </Box>
        </>
      );
    }

    return (
      <>
        {themeComponent ? (
          themeComponent
        ) : (
          <DomainTheme
            headerComponent={<DomainHeader />}
            key={0}
          >
            <Box key={1} ref={contentRef} className={'dash-layout-content'}>
              {children}
            </Box>
            <Box key={2} sx={{ mb: 3 }}>
              <div className='dash-layout-footer-content'></div>
            </Box>
          </DomainTheme>
        )}
      </>
    );
  }, [authenticated, themeComponent, children]);

  return renderContent;
};

// Use React.memo to prevent re-renders when props haven't changed
export default React.memo(DomainAppLayout);
