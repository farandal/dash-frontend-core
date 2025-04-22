import * as React from 'react';
import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { DialogServiceProvider } from 'dash-dialog';
import DASHModal from 'dash-modal';
import { LaravelEchoProvider } from 'dash-admin/src/contexts/com/LaravelEchoContext';
import DASHAppConstants from 'dash-constants';
import { CacheInvalidatorContextProvider } from 'dash-admin/src/utils/cache/CacheInvalidatorContext';
import { CacheInvalidatorListenerComponent, DASHGlobalErrorHandler, Redirect, WSMessagesManager } from 'dash-admin';
import { createTheme, Theme, ThemeProvider } from '@mui/material';
import { appTheme } from 'dash-styles';

import { LocalizationProvider, LocalizationProviderProps } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { AuthContextProvider } from 'dash-admin/src/contexts/auth';
import { Provider } from 'react-redux';
import { IDASHAppState } from 'dash-admin-state';
import { Store } from 'redux';
export interface IDomainAppProviders<U,A,R> extends React.PropsWithChildren {
      wsMessagesManager?: typeof WSMessagesManager
      theme?: Partial<Theme> | ((outerTheme: Partial<Theme>) => Partial<Theme>)
      dateAdapter?: LocalizationProviderProps<any,any>["dateAdapter"]
      store?:  Store<IDASHAppState<U, A, R>>
}

const DomainAppProviders = <U,A,R>({
    wsMessagesManager,
    theme,
    dateAdapter,
    store,
    children
}: IDomainAppProviders<U,A,R>): React.JSX.Element => {  
    

    const [themeState, setTheme] = useState(() => theme ? theme : createTheme(appTheme()))
    /*const [theme, setTheme] = useState(() => createTheme(appTheme()));
    const [customTheme, setCustomTheme] = useState(() => appTheme());
    
    useEffect(() => {
        // Create theme after CSS variables are loaded
        const extendedOptions = deepmerge(appTheme(), {
            breakpoints: {
                values: {
                  xs: 0,
                  sm: 960,
                  md: 990,
                  lg: 1200,
                  xl: 1536,
                },
            },
        });
        setTheme(createTheme(extendedOptions));
        setCustomTheme(extendedOptions);
    }, []);*/

  return (
    <Provider store={store}>
    <AuthContextProvider>
    <ThemeProvider theme={themeState}>
        <LocalizationProvider dateAdapter={dateAdapter || AdapterDayjs}>
    <DialogServiceProvider
      component={DASHModal}
      componentProps={{ sound: DASHAppConstants.system.UI_SOUNDS }}
    >
      <LaravelEchoProvider manager={wsMessagesManager || WSMessagesManager}>
        <CacheInvalidatorContextProvider>
          <CacheInvalidatorListenerComponent />
          <ToastContainer style={{ width: '520px' }} />
          <DASHGlobalErrorHandler/>
          {children}
      
        </CacheInvalidatorContextProvider>
      </LaravelEchoProvider>

    </DialogServiceProvider>
    </LocalizationProvider>
    </ThemeProvider>
    </AuthContextProvider>
    </Provider>
  );
};

export default DomainAppProviders;