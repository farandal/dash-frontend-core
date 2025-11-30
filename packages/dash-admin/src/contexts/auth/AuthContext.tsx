// 1. Direct Login with DASHAuthenticationService
// // In a custom login component using react-admin.
// import DASHAuthenticationService from './DASHAuthenticationService';
// import { useLogin } from 'react-admin';
// 
// const CustomLoginComponent = () => {
//   const login = useLogin();
// 
//   const handleLogin = async (credentials) => {
//     try {
//       // Use your custom authentication service
//       await DASHAuthenticationService.loginWithReactAdmin(credentials, login);
//       // User is now logged in and React Admin is aware
//     } catch (error) {
//       console.error('Login failed:', error);
//     }
//   };
// 
//   // Your login form JSX
// };
// 
// 
// 
// 2. Using React Admin's Standard Login
// // React Admin will automatically use your authProvider
// const App = () => (
//   <Admin
//     authProvider={authProvider}
//     dataProvider={dataProvider}
//     // ... other props
//   >
//     {/* Your resources */}
//   </Admin>
// );
// 
// 
// 3. Manual Integration
// // If you need to manually set auth data
// import authProvider from './DASHAuthProvider';
// 
// const someFunction = async () => {
//   const authData = {
//     token: 'your-token',
//     user: { /* user data */ },
//     auth: { /* auth data */ }
//   };
// 
//   await authProvider.loginWithAuthData(authData);
// };
import { useDispatch, useSelector } from 'react-redux';
import { IGetAuth } from '../../interfaces/user/IGetAuth';
import { IGetAuthUser } from '../../interfaces/user/IUser';
import React, {
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useRef,
} from 'react';
import { DASH_REDUX_ACTIONS, IAuthState, IDASHAppState } from 'dash-admin-state';
import { ACTION_UPDATE_AUTH, ACTION_UPDATE_AUTH_AUTH } from 'dash-admin-state/src/redux/reducers/Auth';
import useAxios from '../../hooks/axios';
import { getEnv } from 'dash-constants/src/DASHAdminSystemConstants';

import { useDashThemeContext } from '../../../src/default-theme/DashThemeContext';
import AppLayoutSettings from '../../theme/AppLayoutSetting';
import DASHAuthenticationService from './DASHAuthenticationService';

import { AuthPersistenceService, clearDeviceStoreAuth } from 'dash-auth';
import { dashStorage } from 'dash-utils';
export class AuthContextClass {
  static values: Partial<IAuthContextProps>;
}

export interface IAuthContextProps {
  authenticated: boolean;
  user: IGetAuthUser;
  auth: IGetAuth;
  token: string;
  roles: any;
  systemValues?: any;
}

export interface IAuthContext {
  user: IGetAuthUser;
  authenticated: boolean;
  auth?: IGetAuth;
  token?: string;
  roles?: any;
  systemValues?: any;
  updateValues: (values: Partial<IAuthContextProps>) => void;
  logout: (callback?: () => void)  => Promise<void>;
  handleReactAdminIdentity: (identity: any) => void;
  getPermissions: () => Promise<any>; 
  fetchAuth: () => Promise<any>;
  getSystemValues: () => any;
  getSystemValue: (key: string) => any;
  getPointOfSales: () => any;
}

export const AuthContext = React.createContext<IAuthContext>(null);

export interface IAuthContextProvider extends PropsWithChildren {
  values?: Partial<IAuthContextProps>;
}

export const AuthContextProvider: FC<IAuthContextProvider> = (props) => {
  const { children } = props;
  const auth: IAuthState<any, any> = useSelector((state: IDASHAppState<any, any, any>) => state.auth);
  const dispatch = useDispatch();
  const { axios } = useAxios();
  
  // Add this line to get theme context
  const { recreateTheme } = useDashThemeContext();

  // Use refs to prevent infinite loops
  const isHandlingIdentityRef = useRef(false);
  const lastIdentityRef = useRef<string>('');
  const lastTenantImagesRef = useRef<string>('');
  const lastTenantSettingsRef = useRef<string>('');
  const lastSystemValuesRef = useRef<string>('');
  const hasInitializedRef = useRef(false);

  // Initialize context values with proper fallbacks
  const [contextValues, setContextValues] = React.useState<Partial<IAuthContextProps>>(() => {
    // Try to get initial values from localStorage and Redux
    const storedUser = AuthPersistenceService.getUser();
    const storedToken = AuthPersistenceService.getToken();
    const storedSystemValues = AuthPersistenceService.getSystemValues();
    const isAuthenticated = JSON.parse(dashStorage.getItem('authenticated') || 'false');
    
    return {
      authenticated: auth.authenticated || isAuthenticated,
      user: auth.user || storedUser,
      auth: auth.auth,
      token: auth.user?.token || storedToken,
      roles: auth.user?.roles,
      systemValues: storedSystemValues
    };
  });

  // Internal method to fetch complete auth data
  const fetchCompleteAuth = useCallback(async () => {
    console.log('Making GET request to:', getEnv('APP_GETAUTH_ENDPOINT'));
    try {
      const { data: authResponse } = await axios.get(getEnv('APP_GETAUTH_ENDPOINT'));
      console.log('Received complete auth data:', authResponse);

      // Save auth data including systemValues to localStorage
      AuthPersistenceService.saveAuth({
        auth: authResponse.auth,
        systemValues: authResponse.systemValues
      });
      
      // Update Redux store with complete auth data (both user and auth)
      dispatch(
        DASH_REDUX_ACTIONS.updateAuth(ACTION_UPDATE_AUTH, {
          user: authResponse.user,
          authenticated: true,
          auth: authResponse.auth,
        })
      );

      // Update context with system values
      setContextValues(prev => ({
        ...prev,
        systemValues: authResponse.systemValues
      }));

      return authResponse;
    } catch (error) {
      console.error('Error fetching complete auth data:', error);
      AuthPersistenceService.markAsLoggedOut();
      throw error;
    }
  }, [axios, dispatch]);

  // Method to initialize auth from token
  const initializeAuthFromToken = useCallback(async () => {
    const token = AuthPersistenceService.getToken();
    const storedUser = AuthPersistenceService.getUser();
    const isAuthenticated = JSON.parse(dashStorage.getItem('authenticated') || 'false');

    console.log('Initializing auth from token:', {
      hasToken: !!token,
      hasStoredUser: !!storedUser,
      isAuthenticated,
      reduxAuthenticated: auth.authenticated
    });

    // If we have a token but no complete auth data, fetch it
    if (token && !auth.authenticated) {
      try {
        console.log('Token found but not fully authenticated, fetching complete auth data...');
        await fetchCompleteAuth();
      } catch (error) {
        console.error('Failed to initialize auth from token:', error);
        // If fetching fails, clear the invalid token
        AuthPersistenceService.markAsLoggedOut();
      }
    } else if (isAuthenticated && storedUser && token && !auth.authenticated) {
      // If we have all stored data but Redux isn't updated, restore the session
      console.log('Restoring auth session from localStorage');
      
      const persistedAuth = AuthPersistenceService.getAuth();

      dispatch(
        DASH_REDUX_ACTIONS.updateAuth(ACTION_UPDATE_AUTH, {
          user: storedUser,
          authenticated: true,
          auth: persistedAuth?.auth || null,
        })
      );
    }
  }, [auth.authenticated, dispatch, fetchCompleteAuth]);

  // Method for RADashComponent to call when react-admin identity is loaded
  const handleReactAdminIdentity = useCallback(async (identity: any) => {
    if (!identity || auth.authenticated || isHandlingIdentityRef.current) {
      return; // Already authenticated, no identity, or already handling
    }

    const identityKey = JSON.stringify(identity);
    if (lastIdentityRef.current === identityKey) {
      return; // Same identity, skip processing
    }

    isHandlingIdentityRef.current = true;
    lastIdentityRef.current = identityKey;

    console.log('Handling react-admin identity:', identity);
    
    try {
      // First set basic identity data
      dispatch(
        DASH_REDUX_ACTIONS.updateAuth(ACTION_UPDATE_AUTH, {
          user: identity.user || identity,
          authenticated: identity?.user ? true : (identity?.id ? true : false),
          auth: identity.auth,
        })
      );

      // Then fetch complete auth data including tenant settings
      await fetchCompleteAuth();
    } catch (error) {
      console.error('Failed to fetch complete auth data after identity load');
    } finally {
      isHandlingIdentityRef.current = false;
    }
  }, [auth.authenticated, dispatch, fetchCompleteAuth]);

  const logout = async (callback?: () => void) => {
    // Mark as logged out but keep the auth.auth data
    AuthPersistenceService.markAsLoggedOut();
    
    // Clear auth data from device store (Electron/Capacitor)
    // This is crucial - it removes token/user from electron-store so they
    // don't get restored on next app launch
    await clearDeviceStoreAuth();
    
    DASHAuthenticationService.setPendingRedirect(window.location.pathname);

    setContextValues({
      authenticated: false,
      user: null,
      auth: null,
      token: null,
      roles: null,
      systemValues: null
    });

    dispatch(
      DASH_REDUX_ACTIONS.updateAuth(ACTION_UPDATE_AUTH, {
        user: null,
        authenticated: false,
        auth: null,
      }),
    );    

    setAuthEvent({
      authenticated: false,
      user: null,
      auth: null,
      token: null,
      roles: null,
      systemValues: null
    });

    document.body.classList.remove(
      AppLayoutSettings.LAYOUT_TYPE_FULL,
      AppLayoutSettings.LAYOUT_TYPE_BOXED,
      AppLayoutSettings.LAYOUT_TYPE_FRAMED,
      AppLayoutSettings.THEME_TYPE_DARK,
      AppLayoutSettings.THEME_TYPE_LIGHT
    );
    
    if (callback) {
      callback();
    }
  };

  // Replace the updateAuth function with this simplified version:
  const updateAuth = useCallback((authData: Partial<IAuthContextProps>) => {
    if (authData) {
      console.log('🔄 AuthContext: Updating auth context with:', authData);
      
      // Update local context state first
      setContextValues(prevValues => {
        const newValues = {
          ...prevValues,
          ...authData
        };
        console.log('✅ AuthContext: Local context updated:', newValues);
        return newValues;
      });

      // Update Redux state if we have meaningful auth data and it's not a logout
      if ((authData.authenticated !== undefined || authData.user || authData.auth) && authData.authenticated !== false) {
        console.log('🔄 AuthContext: Dispatching to Redux state...');
        
        const reduxPayload = {
          user: authData.user || auth.user,
          authenticated: authData.authenticated ?? auth.authenticated,
          auth: authData.auth || auth.auth,
        };
        
        console.log('🔄 AuthContext: Redux payload:', reduxPayload);
        
        dispatch(
          DASH_REDUX_ACTIONS.updateAuth(ACTION_UPDATE_AUTH, reduxPayload)
        );
        
        console.log('✅ AuthContext: Redux dispatch completed');
      }
    }
  }, [dispatch, auth.user, auth.authenticated, auth.auth]);
    
  const updateValues = useCallback((authData: Partial<IAuthContextProps>) => {
    console.log('Manual update values called with:', authData);
    setContextValues(prevValues => ({
      ...prevValues,
      ...authData
    }));
  }, []);

  const getPermissions = useCallback((): Promise<any> => {
    try {
      // First check if user is guest
      if (contextValues.roles === 'guest') {
        return Promise.resolve('guest');
      }

      // Use current context values first (most up-to-date)
      if (contextValues.roles && Array.isArray(contextValues.roles)) {
        const processedPermissions = {
          roles: contextValues.roles.map((item: any) => 
            typeof item === 'string' ? item : item.name
          )
        };
        return Promise.resolve(processedPermissions);
      }

      // Fallback to auth object roles
      if (auth.user?.roles && Array.isArray(auth.user.roles)) {
        const processedPermissions = {
          roles: auth.user.roles.map((item: any) => 
            typeof item === 'string' ? item : item.name
          )
        };
        return Promise.resolve(processedPermissions);
      }

      // Final fallback to persistence service
      return AuthPersistenceService.getPermissions();
    } catch (error) {
      console.error('Failed to get permissions from context:', error);
      return Promise.resolve('null');
    }
  }, [contextValues.roles, auth.user?.roles]);

  // Add system values methods
  const getSystemValues = useCallback(() => {
    return contextValues.systemValues || AuthPersistenceService.getSystemValues();
  }, [contextValues.systemValues]);

  const getSystemValue = useCallback((key: string) => {
    const systemValues = getSystemValues();
    return systemValues ? systemValues[key] : null;
  }, [getSystemValues]);

  const getPointOfSales = useCallback(() => {
    return getSystemValue('point_of_sales');
  }, [getSystemValue]);

  React.useEffect(() => {
    const handleAuthEvent = (event: CustomEvent<Partial<IAuthContextProps>>) => {
      console.log('Auth event received:', event.detail);
      updateAuth(event.detail);
    };

    window.addEventListener('authEvent', handleAuthEvent as EventListener);
    return () => {
      window.removeEventListener('authEvent', handleAuthEvent as EventListener);
    };
  }, [updateAuth]);

  // Sync with Redux state changes and handle persistence + panel settings
  React.useEffect(() => {
    console.log('Redux auth state changed:', {
      authenticated: auth.authenticated,
      user: !!auth.user,
      auth: !!auth.auth
    });
    
    // Update panel settings and recreate theme when tenant data is available
    // Use refs to prevent unnecessary updates
    if (auth.authenticated) {
      let tenantImages = auth?.auth?.tenantImages;
      let tenantSettings = auth?.auth?.tenantSettings;
      let systemValues = contextValues.systemValues; // Get from context values
      
      if (!tenantImages) {
        tenantImages = AuthPersistenceService.getTenantImages();
      }
      
      if (!tenantSettings) {
        tenantSettings = AuthPersistenceService.getTenantSettings();
      }

      if (!systemValues) {
        systemValues = AuthPersistenceService.getSystemValues();
      }
      
      // Update panel settings with tenant images (only if we have new data)
      const tenantImagesKey = JSON.stringify(tenantImages);
      if (tenantImages && lastTenantImagesRef.current !== tenantImagesKey) {
        console.log('Updating panel settings with tenant images from auth context or persisted data');
        lastTenantImagesRef.current = tenantImagesKey;
        const logos = {
            ...(tenantImages.horizontal_logo.original && { horizontalLogo: tenantImages.horizontal_logo.original }),
            ...(tenantImages.squared_logo.original && { squaredLogo: tenantImages.squared_logo.original }),
            ...(tenantImages.banner.original && { loginBackground: tenantImages.banner.original })
          };
        
        dispatch(
          DASH_REDUX_ACTIONS.setPanelSettings(logos)
        );
      }

  
      // Recreate MUI theme when tenant settings are available (only if we have new data)
      const tenantSettingsKey = JSON.stringify(tenantSettings);
      if (tenantSettings && lastTenantSettingsRef.current !== tenantSettingsKey) {
        console.log('Recreating MUI theme with tenant settings from auth context');
        lastTenantSettingsRef.current = tenantSettingsKey;
        recreateTheme(tenantSettings);
       
       
      }

      // Handle system values data (only if we have new data)
      const systemValuesKey = JSON.stringify(systemValues);
      if (systemValues && lastSystemValuesRef.current !== systemValuesKey) {
        console.log('Processing system values from auth context or persisted data');
        lastSystemValuesRef.current = systemValuesKey;
        
        // Log available system values
        console.log('Available system values:', Object.keys(systemValues));
        console.log('Point of Sales:', systemValues.point_of_sales);
        
        // You can dispatch to Redux or handle other system values as needed
        // For example:
        // if (systemValues.some_other_key) {
        //   dispatch(DASH_REDUX_ACTIONS.setSomeOtherData(systemValues.some_other_key));
        // }
      }

      // Handle IPC service for background service
      const storageAuthenticated = JSON.parse(dashStorage.getItem('authenticated') || 'false');
      if (storageAuthenticated && auth.user?.tenant_id) {
        const { DashIPCService } = window;
        DashIPCService && DashIPCService.action('start-bg-service', {
          token: dashStorage.getItem('token'),
          channel: `private-tenant.${auth.user.tenant_id}.system`
        });
      }
    }

  }, [auth.authenticated, contextValues.systemValues]);

  // Debug effect to log context values changes
  React.useEffect(() => {
    console.log('Auth context values changed:', {
      authenticated: contextValues.authenticated,
      user: contextValues.user ? `${contextValues.user.name} (${contextValues.user.id})` : null,
      auth: contextValues.auth,
      token: contextValues.token ? 'present' : 'missing',
      systemValues: contextValues.systemValues ? Object.keys(contextValues.systemValues) : null
    });
  }, [contextValues]);
  
  // Create the context value - ensure we always return the most current data
  const contextValue: IAuthContext = React.useMemo(() => {
    const currentUser = contextValues.user || auth.user || AuthPersistenceService.getUser();
    const currentAuthenticated = contextValues.authenticated ?? auth.authenticated ?? false;
    const currentToken = contextValues.token || auth.user?.token || AuthPersistenceService.getToken();
    
    return {
      user: currentUser,
      authenticated: currentAuthenticated,
      auth: contextValues.auth || auth.auth,
      token: currentToken,
      roles: contextValues.roles || auth.user?.roles,
      systemValues: contextValues.systemValues || AuthPersistenceService.getSystemValues(),
      updateValues,
      logout,
      handleReactAdminIdentity,
      getPermissions,
      fetchAuth: fetchCompleteAuth,
      getSystemValues,
      getSystemValue,
      getPointOfSales
    };
  }, [contextValues, auth, updateValues, logout, handleReactAdminIdentity, getPermissions, fetchCompleteAuth, getSystemValues, getSystemValue, getPointOfSales]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const AuthContextConsumer = AuthContext.Consumer;

export const useAuthContext = () => {
  const authContext: IAuthContext = useContext(AuthContext);
  return authContext;
};

export const setAuthEvent = (values: Partial<IAuthContextProps>) => {
  console.log('Setting auth event:', values);
  window.dispatchEvent(new CustomEvent('authEvent', { detail: values }));
  return values;
};

export const getAuthPermissions = (): Promise<any> => {
  return AuthPersistenceService.getPermissions();
};

export default AuthContext;
