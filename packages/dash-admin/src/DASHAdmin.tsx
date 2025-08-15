/* eslint-disable @typescript-eslint/indent */
/* eslint-disable no-mixed-spaces-and-tabs */
/**
 * TODO: Customize the error page
 * TODO: Implement MemoryHistory instead of history.
 */
import * as React from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
//import { appTheme } from 'dash-styles';

//import RoutingWrapper from './RoutingWrapper';

import MyLoginPage from './pages/Login';
import Profile from './pages/Profile';

import { useDispatch, useSelector } from 'react-redux';
import { getCookie, setCookie } from './utils/cookies';
import {  useAuthContext } from './contexts/auth';
import { IDASHAppState } from 'dash-admin-state';
import { Error } from './components/error/Error';
//import { lightTheme } from './themes';
import coreResources from './resources';
import { dashStorage } from 'dash-utils';

import { CustomRoutes, useTheme, AdminUI, AdminContext, AdminUIProps, Resource, Admin } from 'react-admin';

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
  customQueryClient?: QueryClient;
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

import { Provider } from 'react-redux';

import ConstantsProvider, { ConstantsContext } from './config/ConstantsService';

import AppLayout, { IAppLayout } from './layout/AppLayout';
import VerifyAccount from './pages/VerifyAccount';
import RecoverPassword from './pages/RecoverPassword';
import ChangePassword from './pages/ChangePassword';

import { setResources } from 'dash-admin-state/src/redux/actions/Resources';
import {
  DictionaryProvider,
} from './contexts/dictionary/DictionaryContext';
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import ResourceTemplate from './templates/ResourceTemplate';
import { JSX, useEffect, useMemo, useCallback } from 'react';
import RADashComponent from './react-admin-dash/RADashComponent';
import DASHAuthenticationService from './contexts/auth/DASHAuthenticationService';
import { useDashThemeContext } from '../src/default-theme/DashThemeContext';
import {DASHAdminSystemConstants} from 'dash-constants';

interface IAsyncResources extends AdminUIProps {
  resources: any;
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
      return ResourceComponent(restProps);
    });
  }, [res]);

  // Memoize route functions
  const getCustomAuthRoutes = useCallback(() => customAuthRoutes, [customAuthRoutes]);
  const getCustomRoutes = useCallback(() => customRoutes, [customRoutes]);

  // Memoize custom routes
  const memoizedCustomRoutes = useMemo(() => (
    <CustomRoutes>
      {(authenticated) && customProfilePage !== false ? (
        <Route
          key={'/profile'}
          path='/profile'
          element={customProfilePage || <Profile />}
        />
      ) : <></>}
      
      {(authenticated) && getCustomAuthRoutes()
      .filter(route => !route.props['data-layout']?.toString().includes('no-layout'))
      .map((route, index) => {
        return <Route key={`auth-route-${index}`} {...route.props} />
      })}

      {getCustomRoutes()
      .filter(route => {
        if ((authenticated) && getCustomAuthRoutes().some(authRoute => authRoute.props.path === route.props.path)) {
          return false
        }
        return !route.props['data-layout']?.toString().includes('no-layout')
      })
      .map((route, index) => {
        return <Route key={`custom-auth-route-${index}`} {...route.props}>
          {route.props.children || <></>}
        </Route>
      })}         
    </CustomRoutes>
  ), [authenticated, customProfilePage, getCustomAuthRoutes, getCustomRoutes]);

  const memoizedNoLayoutRoutes = useMemo(() => (
    <CustomRoutes noLayout>
      {authenticated ? getCustomAuthRoutes()
      .filter(route => route.props['data-layout']?.toString().includes('no-layout'))
      .map((route, index) => {
        return <Route key={`auth-route-${index}`} {...route.props} />
      }) : <></>}

      {getCustomRoutes()
      .filter(route => {
        if (authenticated && getCustomAuthRoutes().some(authRoute => authRoute.props.path === route.props.path)) {
          return false
        }
        return route.props['data-layout']?.toString().includes('no-layout')
      })
      .map((route, index) => {
        return <Route key={`custom-auth-route-${index}`} {...route.props}>
          {route.props.children || <></>}
        </Route>
      })}        
    </CustomRoutes>
  ), [authenticated, getCustomAuthRoutes, getCustomRoutes]);


  return  <AdminUI {...rest}>
        {processedResources}
        {memoizedCustomRoutes}
        {memoizedNoLayoutRoutes}
      </AdminUI>
  
}, (prevProps, nextProps) => {
  // Deep comparison for AsyncResources
  const resourcesEqual = prevProps.resources.length === nextProps.resources.length &&
    prevProps.resources.every((resource, index) => 
      resource === nextProps.resources[index]
    );

  return resourcesEqual && 
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
            const existingTenantCookie = getCookie('tenant_id');
            if (!existingTenantCookie) {
              dashStorage.setItem('tenant_id', user.tenant_id.toString());
              setCookie('tenant_id', user.tenant_id.toString());
            }
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

  const {themeOptions} = useDashThemeContext();
  // Memoize AdminContext props
  const adminContextProps = {
    dataProvider: customDataProvider || dataProvider,
    i18nProvider: customI18nProvider || i18nProvider,
    authProvider: customAuthProvider || authProvider,
    ...(customThemeConfig ? { theme: customThemeConfig } : { theme: themeOptions }),
    ...(customQueryClient && { queryClient: customQueryClient as QueryClient }),
    ...(history && { history: history }),
    ...(basePath ? { basename: basePath } : { basename: DASHAdminSystemConstants.system.URL_PREFIX }),
  };


  // Add this debug right before the AdminContext
console.log('AdminContext Configuration:', {
    adminContextProps,
    basename: basePath || '/',
    currentWindowPath: window.location.pathname,
    expectedRelativePath: window.location.pathname.replace(basePath || '', '') || '/',
    resources: resources?.map(r => r.model)
});

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
          <AdminHook/>
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
        <AdminHook/>
        <AsyncResources
          {...adminUIProps}
          resources={resources}
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