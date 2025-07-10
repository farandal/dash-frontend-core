import * as React from 'react';
import { ToastContainer } from 'react-toastify';
import { DialogServiceProvider } from 'dash-dialog';
import DASHModal from 'dash-modal';
import { LaravelEchoProvider } from 'dash-admin/src/contexts/com/LaravelEchoContext';
import DASHAppConstants from 'dash-constants';
import { CacheInvalidatorContextProvider } from 'dash-admin/src/utils/cache/CacheInvalidatorContext';
import { CacheInvalidatorListenerComponent, DASHGlobalErrorHandler, Redirect, WSMessagesManager } from 'dash-admin';
import { Theme } from '@mui/material';
import { LocalizationProvider, LocalizationProviderProps } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { AuthContextProvider } from 'dash-admin/src/contexts/auth';
import { Provider } from 'react-redux';
import { IDASHAppState } from 'dash-admin-state';
import { Store } from 'redux';
import { DashThemeProvider } from './DashThemeContext';
import { ComponentRegistryProvider, IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';


export interface IDomainAppProviders<U, A, R> extends React.PropsWithChildren {
    wsMessagesManager?: typeof WSMessagesManager
    theme?: Partial<Theme> | ((outerTheme: Partial<Theme>) => Partial<Theme>)
    dateAdapter?: LocalizationProviderProps<any>["dateAdapter"]
    store?: Store<IDASHAppState<U, A, R>>
    extendedThemeOptions?: any
    dashAutoAdminComponents?: Record<string, React.FC<IDashAutoAdminCustomFieldComponent>>
}


const DomainAppProviders = <U, A, R>({
    wsMessagesManager,
    dateAdapter,
    store,
    children,
    extendedThemeOptions,
    dashAutoAdminComponents,

}: IDomainAppProviders<U, A, R>): React.JSX.Element => {

    
   
    const content = (
       <DashThemeProvider extendedOptions={extendedThemeOptions}>
        <LocalizationProvider dateAdapter={dateAdapter || AdapterDayjs}>
            <AuthContextProvider>
                <ComponentRegistryProvider customComponents={dashAutoAdminComponents || {}}>
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
                </ComponentRegistryProvider>
            </AuthContextProvider>
            </LocalizationProvider>
         </DashThemeProvider>
    );

    return store ? <Provider store={store}>{content}</Provider> : content;
};

export default DomainAppProviders;
