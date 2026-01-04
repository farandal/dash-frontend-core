/* eslint-disable @typescript-eslint/indent */
/* eslint-disable no-mixed-spaces-and-tabs */
/**
 * TODO: Customize the error page
 * TODO: Implement MemoryHistory instead of history.
 */
import * as React from 'react';
import { Route, useNavigate } from 'react-router-dom';
//import { appTheme } from 'dash-styles';

//import RoutingWrapper from './RoutingWrapper';

// Lazy load pages that use Router hooks (useNavigate, useRedirect, etc.)
// This prevents them from executing before Router context is established
const MyLoginPage = React.lazy(() => import('./pages/Login'));
const Profile = React.lazy(() => import('./pages/Profile'));

import { useDispatch, useSelector } from 'react-redux';
import { setCookie } from './utils/cookies';
import { useAuthContext } from './contexts/auth';
import { IDASHAppState } from 'dash-admin-state';
import { Error } from './components/error/Error';
//import { lightTheme } from './themes';
import coreResources from './resources';
import { dashStorage } from 'dash-utils';

import { CustomRoutes, AdminUI, AdminContext, AdminUIProps } from 'react-admin';
import I18nBridgeSetter from './contexts/I18nBridgeSetter';
import I18nReduxSync from './contexts/I18nReduxSync';

export interface IAppResourceGroupsIcon {
    [x: string]: JSX.Element;
}

/**
 * Defines the interface for the DASHAdmin application, which includes various configuration options for customizing the application's behavior.
 */
export interface IDASHAdmin<U, A, R, C> {
    initialAppConstants?: C;
    customDataProvider?: any;
    customResources?: R[];
    customLoginPage?: React.FC<any>;
    customLayout?: React.FC<IAppLayout>;
    customNotification?: () => React.JSX.Element;
    customErrorPage?: any;
    customAuthProvider?: any;
    customI18nProvider?: any;
    useCoreResources?: boolean;
    customProfilePage?: JSX.Element | false;
    customRecoverPassword?: JSX.Element | false;
    customChangePassword?: JSX.Element | false;
    customVerifyAccount?: JSX.Element | false;
    customThemeConfig?: any;
    customAuthRoutes?: React.ReactElement[];
    customRoutes?: React.ReactElement[];
    customQueryClient?: any;
    history?: any;
    customDict?: { [x: string]: string }
    customReplacements?: { [x: string]: string }
    basePath?: string;
    AdminHook?: React.ComponentType<any>;
    children?: JSX.Element;
}

import authProvider from './providers/authProvider';
import dataProvider from './providers/dataProvider';
import i18nProvider from './providers/i18nProvider';

import DASHStorageClass from './classes/DASHStorageClass';

import { QueryClient } from '@tanstack/react-query';

import checkRole from './helpers/checkRole';


import ConstantsProvider, { ConstantsContext } from './config/ConstantsService';

import AppLayout, { IAppLayout } from './layout/AppLayout';

// Lazy load auth pages that use Router hooks
const VerifyAccount = React.lazy(() => import('./pages/VerifyAccount'));
const RecoverPassword = React.lazy(() => import('./pages/RecoverPassword'));
const ChangePassword = React.lazy(() => import('./pages/ChangePassword'));

import { setResources } from 'dash-admin-state/src/redux/actions/Resources';
import {
    DictionaryProvider,
} from './contexts/dictionary/DictionaryContext';
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import ResourceTemplate from './templates/ResourceTemplate';
import { JSX, useMemo, useCallback } from 'react';
import { useDashThemeContext } from '../src/default-theme/DashThemeContext';
import { DASHAdminSystemConstants } from 'dash-constants';

interface IAsyncResources extends AdminUIProps {
    resources: any;
    locale: any;
    customProfilePage?: JSX.Element | false;
    customAuthRoutes?: React.ReactElement[];
    customRoutes?: React.ReactElement[];
}

// Memoized selectors
const selectLocale = (state: IDASHAppState<unknown, unknown, IDashAutoAdminResourceConfig>) =>
    state.settings.locale;

const selectResources = (state: IDASHAppState<unknown, unknown, IDashAutoAdminResourceConfig>) =>
    state.resources.items;

// Single AsyncResources component with full memoization
const AsyncResources: React.FC<IAsyncResources> = React.memo((props) => {
    const {
        resources: res,
        locale,
        customProfilePage,
        customAuthRoutes = [],
        customRoutes = [],
        ...rest
    } = props;


    // Get auth state
    const { authenticated } = useAuthContext();

    // Memoize the resources processing
    const processedResources = useMemo(() => {
        return res.map((originalResource: any) => {
            const { component: InputResourceTemplate, ...restProps } = originalResource;
            const ResourceComponent = InputResourceTemplate || ResourceTemplate;
            // Reverted to function call to allow react-admin introspection
            // Passing locale explicitly as a prop
            return ResourceComponent({ ...restProps, locale });
        });
    }, [res, locale]);

    // Memoize route functions
    const getCustomAuthRoutes = useCallback(() => customAuthRoutes, [customAuthRoutes]);
    const getCustomRoutes = useCallback(() => customRoutes, [customRoutes]);

    // Helper to clone a Route element with a new key
    // Using cloneElement preserves the original Route component reference
    // which is important when routes come from different packages
    const createRouteFromProps = (routeElement: React.ReactElement, key: string) => {
        return React.cloneElement(routeElement, { key });
    };

    // Memoize custom routes
    const memoizedCustomRoutes = useMemo(() => (
        <CustomRoutes>
            {(authenticated) && customProfilePage !== false ? (
                <Route
                    key={'/profile'}
                    path='/profile'
                    element={customProfilePage || <Profile />}
                />
            ) : null}

            {(authenticated) ? getCustomAuthRoutes()
                .filter(route => !route.props['data-layout']?.toString().includes('no-layout'))
                .map((route, index) => createRouteFromProps(route, route.key || `auth-route-${index}`)) : null}

            {getCustomRoutes()
                .filter(route => {
                    /* @ts-ignore */
                    if ((authenticated) && getCustomAuthRoutes().some(authRoute => authRoute.props.path === route.props.path)) {
                        return false
                    }
                    return !route.props['data-layout']?.toString().includes('no-layout')
                })
                .map((route, index) => createRouteFromProps(route, route.key || `custom-route-${index}`))}
        </CustomRoutes>
    ), [authenticated, customProfilePage, getCustomAuthRoutes, getCustomRoutes]);

    const memoizedNoLayoutRoutes = useMemo(() => (
        <CustomRoutes noLayout>
            {authenticated ? getCustomAuthRoutes()
                .filter(route => route.props['data-layout']?.toString().includes('no-layout'))
                .map((route, index) => createRouteFromProps(route, route.key || `auth-no-layout-${index}`)) : null}

            {getCustomRoutes()
                .filter(route => {
                    /* TODO interface authRoute */
                    /* @ts-ignore */
                    if (authenticated && getCustomAuthRoutes().some(authRoute => authRoute.props.path === route.props.path)) {
                        return false
                    }
                    return route.props['data-layout']?.toString().includes('no-layout')
                })
                .map((route, index) => createRouteFromProps(route, route.key || `custom-no-layout-${index}`))}
        </CustomRoutes>
    ), [authenticated, getCustomAuthRoutes, getCustomRoutes]);


    return <AdminUI {...rest}>
        {processedResources}
        {memoizedCustomRoutes}
        {memoizedNoLayoutRoutes}
    </AdminUI>

}, (prevProps, nextProps) => {
    // Deep comparison for AsyncResources
    const prevRes = prevProps.resources || [];
    const nextRes = nextProps.resources || [];
    
    const resourcesEqual = prevRes.length === nextRes.length &&
        prevRes.every((resource, index) =>
            resource === nextRes[index]
        );

    return resourcesEqual &&
        prevProps.locale === nextProps.locale &&
        prevProps.layout === nextProps.layout &&
        prevProps.loginPage === nextProps.loginPage &&
        prevProps.notification === nextProps.notification &&
        prevProps.catchAll === nextProps.catchAll &&
        prevProps.error === nextProps.error &&
        prevProps.customProfilePage === nextProps.customProfilePage &&
        prevProps.customAuthRoutes === nextProps.customAuthRoutes &&
        prevProps.customRoutes === nextProps.customRoutes;
});



const DASHAdminApp: React.FC<IDASHAdmin<unknown, unknown, unknown, unknown>> = React.memo((props) => {
    const {
        customLoginPage = MyLoginPage,
        customLayout = AppLayout,
        customNotification,
        customErrorPage,
        customDataProvider,
        customAuthProvider,
        customI18nProvider,
        customResources,
        useCoreResources = true,
        customProfilePage,
        customRecoverPassword,
        customChangePassword,
        customVerifyAccount,
        customThemeConfig,
        customAuthRoutes,
        customRoutes,
        customQueryClient,
        customDict,
        customReplacements,
        history,
        basePath,
        AdminHook = (props) => props.children,
        children,
    } = props;

    //Locale
    const ReactLocale = useSelector(selectLocale);
    const resources = useSelector(selectResources);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    //Roles
    const _checkRole = useCallback((permissions, roles) => {
        return checkRole(permissions, roles);
    }, []);

    /** The auth context watches for auth changes */
    const { authenticated, user } = useAuthContext();

    // Memoize the resource calculation
    const calculateResources = useCallback(() => {
        const _resources = !children
            ? customResources
                ? customResources && useCoreResources === false
                    ? customResources
                    : [...coreResources, ...customResources]
                : coreResources
            : [];
        if (_resources && _resources.length > 0) {
            dispatch<any>(setResources(_resources));
        }
    }, [children, customResources, useCoreResources, dispatch]);

    /** When the authcontext changes, update the resources */
    /*React.useEffect(() => {
      if(authenticated) calculateResources();
    }, [authenticated, calculateResources]);*/

    React.useEffect(() => {
        calculateResources();
    }, []);
    /** When the redux resources are updated, store them in an ES6 Class */
    React.useEffect(() => {
        DASHStorageClass.resources = resources;
    }, [resources]);

    /**
     * DASH Admin AuthContext
     */
    React.useEffect(() => {
        if (authenticated && resources) {
            if (!children) {
                try {
                    if (user?.tenant_id) {

                        dashStorage.setItem('tenant_id', user.tenant_id.toString());
                        setCookie('tenant_id', user.tenant_id.toString());
                        dashStorage.setItem('user_id', user.id.toString());
                        setCookie('user_id', user.id.toString());
                    }
                } catch (e) {
                    console.error(e);
                }
            }
        }
    }, [authenticated, user, resources, children]);

    /* Sets the application auth and no auth custom routes */
    //const getCustomAuthRoutes = useCallback(() => customAuthRoutes ?? [], [customAuthRoutes]);
    //const getCustomRoutes = useCallback(() => customRoutes ?? [], [customRoutes]);

    /*useEffect(() => {
      const redirect = DASHAuthenticationService.getPendingRedirect();
      if(redirect) {
        DASHAuthenticationService.clearPendingRedirect();
        navigate(redirect)
      }
    }, [authenticated, navigate]);*/

    const constants = React.useContext(ConstantsContext);

    // Memoize dictionary and replacements
    const memoizedDictionary = useMemo(() =>
        customDict ? { ...constants.systemConstants.dict, ...customDict } : constants.systemConstants.dict,
        [customDict, constants.systemConstants.dict]
    );

    const memoizedReplacements = useMemo(() =>
        customReplacements ? { ...constants.systemConstants.replacements, ...customReplacements } : constants.systemConstants.replacements,
        [customReplacements, constants.systemConstants.replacements]
    );

    const { themeOptions } = useDashThemeContext();
    // Memoize AdminContext props
    const adminContextProps = {
        dataProvider: customDataProvider || dataProvider,
        i18nProvider: customI18nProvider || i18nProvider,
        authProvider: customAuthProvider || authProvider,
        ...(customThemeConfig ? { theme: customThemeConfig } : { theme: themeOptions }),
        ...(customQueryClient && { queryClient: customQueryClient as QueryClient }),
        ...(history && { history: history }),
        ...(basePath ? { basename: basePath } : { basename: DASHAdminSystemConstants.system.URL_PREFIX }),
    } as any;


    const adminUIProps = useMemo(() => ({
        ...(customNotification && { notification: customNotification }),
        layout: customLayout,
        loginPage: customLoginPage,
        ...(customErrorPage && { catchAll: customErrorPage }),
        ...(Error && { error: Error }),
    }), [customNotification, customLayout, customLoginPage, customErrorPage]);

    // TODO As AdminHook was added, possible to refactor and remove RADashComponent from here
    return children ? (
        <DictionaryProvider
            dictionary={memoizedDictionary}
            replacements={memoizedReplacements}
        >
            <AdminContext {...adminContextProps}>
                <I18nReduxSync locale={ReactLocale} />
                <I18nBridgeSetter />
                <AdminHook />
                <AdminUI {...adminUIProps}>
                    {children}
                </AdminUI>


            </AdminContext>
        </DictionaryProvider>
    ) : (
        <DictionaryProvider
            dictionary={memoizedDictionary}
            replacements={memoizedReplacements}
        >
            <AdminContext {...adminContextProps}>
                <I18nReduxSync locale={ReactLocale} />
                <I18nBridgeSetter />
                <AdminHook />
                <AsyncResources
                    {...adminUIProps}
                    resources={resources}
                    locale={ReactLocale}
                    customProfilePage={customProfilePage}
                    customAuthRoutes={customAuthRoutes}
                    customRoutes={customRoutes}
                />


            </AdminContext>
        </DictionaryProvider>
    );


}, (prevProps, nextProps) => {
    // Custom comparison for DASHAdminApp
    return (
        prevProps.customResources === nextProps.customResources &&
        prevProps.useCoreResources === nextProps.useCoreResources &&
        prevProps.children === nextProps.children &&
        prevProps.customLoginPage === nextProps.customLoginPage &&
        prevProps.customLayout === nextProps.customLayout &&
        prevProps.customDataProvider === nextProps.customDataProvider &&
        prevProps.customAuthProvider === nextProps.customAuthProvider
    );
});

//DASHAdminApp.whyDidYouRender = true;

/**
 * The main DASHAdmin component
 */
const DASHAdmin = <U, A, R, C, S>(props: IDASHAdmin<U, A, R, C>): JSX.Element => {
    const { initialAppConstants, children, ...rest } = props;

    return (
        <ConstantsProvider<C> initialAppConstants={initialAppConstants}>
            {children ? <DASHAdminApp {...rest}>{children}</DASHAdminApp> : <DASHAdminApp {...rest} />}
        </ConstantsProvider>
    );
};

/*export default React.memo(
  DASHAdmin as React.ComponentType<IDASHAdmin<unknown, unknown, unknown, unknown>>
) as typeof DASHAdmin;
*/

export default DASHAdmin;