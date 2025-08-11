import * as React from 'react';
import { ToastContainer } from 'react-toastify';
import { DialogServiceProvider } from 'dash-dialog';
import DASHModal from 'dash-modal';
import { LaravelEchoProvider } from '../contexts/com/LaravelEchoContext';
import {DASHAppConstants} from 'dash-constants';
import { CacheInvalidatorContextProvider } from '../utils/cache/CacheInvalidatorContext';
import { CacheInvalidatorListenerComponent, DASHGlobalErrorHandler, DashQueryClientContext, FCMProvider, Redirect, WSMessagesManager } from '../';
import { Theme } from '@mui/material';
import { LocalizationProvider, LocalizationProviderProps } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { AuthContextProvider } from '../contexts/auth';
import { Provider } from 'react-redux';
import { IDASHAppState } from 'dash-admin-state';
import { Store } from 'redux';
import { DashThemeProvider } from './DashThemeContext';
import { ComponentRegistryProvider, IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import { QueryClient } from '@tanstack/react-query';

export interface IDomainAppProviders<U, A, R> extends React.PropsWithChildren {
    wsMessagesManager?: typeof WSMessagesManager
    theme?: Partial<Theme> | ((outerTheme: Partial<Theme>) => Partial<Theme>)
    dateAdapter?: LocalizationProviderProps<any>["dateAdapter"]
    store?: Store<IDASHAppState<U, A, R>>
    extendedThemeOptions?: any
    dashAutoAdminComponents?: Record<string, React.FC<IDashAutoAdminCustomFieldComponent>>
    queryClient?: QueryClient
}


const DomainAppProviders = <U, A, R>({
    wsMessagesManager,
    dateAdapter,
    store,
    children,
    extendedThemeOptions,
    dashAutoAdminComponents,
    queryClient

}: IDomainAppProviders<U, A, R>): React.JSX.Element => {
   
    const content = (
       <DashThemeProvider extendedOptions={extendedThemeOptions}>
        <LocalizationProvider dateAdapter={dateAdapter || AdapterDayjs}>
            <AuthContextProvider>
                <DashQueryClientContext queryClient={queryClient}>
                <ComponentRegistryProvider customComponents={dashAutoAdminComponents || {}}>
                    <DialogServiceProvider
                        component={DASHModal}
                        componentProps={{ sound: DASHAppConstants.system.UI_SOUNDS }}
                    ><FCMProvider>
                        <LaravelEchoProvider manager={wsMessagesManager || WSMessagesManager}>
                            <CacheInvalidatorContextProvider>
                                <CacheInvalidatorListenerComponent />
                                <ToastContainer style={{ width: '520px' }} />
                                <DASHGlobalErrorHandler />
                                {children}
                            </CacheInvalidatorContextProvider>
                        </LaravelEchoProvider>
                    </FCMProvider>
                    </DialogServiceProvider>
                </ComponentRegistryProvider>
                </DashQueryClientContext>
            </AuthContextProvider>
            </LocalizationProvider>
         </DashThemeProvider>
    );

    return store ? <Provider store={store}>{content}</Provider> : content;
};

export default DomainAppProviders;