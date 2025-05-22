import * as React from 'react';
import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { DialogServiceProvider } from 'dash-dialog';
import DASHModal from 'dash-modal';
import { LaravelEchoProvider } from 'dash-admin/src/contexts/com/LaravelEchoContext';
import DASHAppConstants from 'dash-constants';
import { CacheInvalidatorContextProvider } from 'dash-admin/src/utils/cache/CacheInvalidatorContext';
import { CacheInvalidatorListenerComponent, DASHGlobalErrorHandler, Redirect, WSMessagesManager } from 'dash-admin';
import { ThemeProvider as MuiThemeProvider, Theme } from '@mui/material';


import { LocalizationProvider, LocalizationProviderProps } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { AuthContextProvider } from 'dash-admin/src/contexts/auth';
import { Provider } from 'react-redux';
import { IDASHAppState } from 'dash-admin-state';
import { Store } from 'redux';
import { DashThemeProvider, useDashThemeContext } from './DashThemeContext';
import { ComponentRegistryProvider, IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';

export interface IDomainAppProviders<U, A, R> extends React.PropsWithChildren {
    wsMessagesManager?: typeof WSMessagesManager
    theme?: Partial<Theme> | ((outerTheme: Partial<Theme>) => Partial<Theme>)
    dateAdapter?: LocalizationProviderProps<any>["dateAdapter"]
    store?: Store<IDASHAppState<U, A, R>>
    extendedThemeOptions?: any
    dashAutoAdminComponents?: Record<string, React.FC<IDashAutoAdminCustomFieldComponent>>
}

// Inner component that uses the theme context
const ThemedApp = ({ children, dateAdapter }) => {
    const { theme } = useDashThemeContext();

    return (
        <MuiThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={dateAdapter || AdapterDayjs}>
                {children}
            </LocalizationProvider>
        </MuiThemeProvider>
    );
};

const DomainAppProviders = <U, A, R>({
    wsMessagesManager,
    dateAdapter,
    store,
    children,
    extendedThemeOptions,
    dashAutoAdminComponents
}: IDomainAppProviders<U, A, R>): React.JSX.Element => {
    return (
        <Provider store={store}>
            <ComponentRegistryProvider customComponents={dashAutoAdminComponents || {}}>
                <AuthContextProvider>
                    <DashThemeProvider extendedOptions={extendedThemeOptions}>
                        <ThemedApp dateAdapter={dateAdapter}>
                            <DialogServiceProvider
                                component={DASHModal}
                                componentProps={{ sound: DASHAppConstants.system.UI_SOUNDS }}
                            >
                                <LaravelEchoProvider manager={wsMessagesManager || WSMessagesManager}>
                                    <CacheInvalidatorContextProvider>
                                        <CacheInvalidatorListenerComponent />
                                        <ToastContainer style={{ width: '520px' }} />
                                        <DASHGlobalErrorHandler />
                                        {children}
                                    </CacheInvalidatorContextProvider>
                                </LaravelEchoProvider>
                            </DialogServiceProvider>
                        </ThemedApp>
                    </DashThemeProvider>
                </AuthContextProvider>
            </ComponentRegistryProvider>
        </Provider>
    );
};

export default DomainAppProviders;
