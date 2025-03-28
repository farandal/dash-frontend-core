import * as React from 'react';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useNavigate } from 'react-router';
import { useStore } from 'react-admin';
import { Store } from 'redux';
import { ToastContainer } from 'react-toastify';

import { Box } from '@mui/material';

import useLocalStorage from 'dash-admin/src/hooks/useLocalStorage';
import { IAppLayout } from 'dash-admin/src/layout/AppLayout';
import { DASH_REDUX_ACTIONS, IDASHAppState } from 'dash-admin-state';
import { DialogServiceProvider } from 'dash-dialog';
import DASHModal from 'dash-modal';
import { LaravelEchoProvider } from 'dash-admin/src/contexts/com/LaravelEchoContext';

import DASHAppConstants from 'dash-constants';

import { CacheInvalidatorContextProvider } from 'dash-admin/src/utils/cache/CacheInvalidatorContext';
import { CacheInvalidatorListenerComponent, Redirect, WSMessagesManager } from 'dash-admin';

export interface IDomainAppProviders extends React.PropsWithChildren {
  //store: Store<IDASHAppState<any, any, IDashAutoAdminResourceConfig>>;
}

const DomainAppProviders = (props): React.JSX.Element => {

  const { children } = props;

  const contentRef = useRef(null);
  const [authenticated, _] = useLocalStorage('authenticated');

  return authenticated ? (

    <DialogServiceProvider
      component={DASHModal}
      componentProps={{ sound: DASHAppConstants.system.UI_SOUNDS }}
    >
      <LaravelEchoProvider manager={WSMessagesManager}>
        <CacheInvalidatorContextProvider>
          <CacheInvalidatorListenerComponent />
          <ToastContainer style={{ width: '520px' }} />
          {children}
        </CacheInvalidatorContextProvider>
      </LaravelEchoProvider>
    </DialogServiceProvider>

  ) : (
    <DialogServiceProvider component={DASHModal}>
      <Box key={1} ref={contentRef} className={'dash-layout-content'}>
        <Redirect path={'/login'} timer={10} />
        {children}
      </Box>
    </DialogServiceProvider>
  );
};

export default DomainAppProviders;