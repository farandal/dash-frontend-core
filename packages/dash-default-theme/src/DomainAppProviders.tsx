import * as React from 'react';
import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { DialogServiceProvider } from 'dash-dialog';
import DASHModal from 'dash-modal';
import { LaravelEchoProvider } from 'dash-admin/src/contexts/com/LaravelEchoContext';
import DASHAppConstants from 'dash-constants';
import { CacheInvalidatorContextProvider } from 'dash-admin/src/utils/cache/CacheInvalidatorContext';
import { CacheInvalidatorListenerComponent, Redirect, WSMessagesManager } from 'dash-admin';

export interface IDomainAppProviders extends React.PropsWithChildren { }

const DomainAppProviders = (props): React.JSX.Element => {
  const { children } = props;

  return (
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
  );
};

export default DomainAppProviders;