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
import { getEnv } from 'dash-admin/src/config/DASHAdminSystemConstants';
import { useDashThemeContext } from 'dash-default-theme/src/DashThemeContext';
import AppLayoutSettings from '../../theme/AppLayoutSetting';
import DASHAuthenticationService from './DASHAuthenticationService';

// Auth persistence service
export class AuthPersistenceService {
  private static readonly AUTH_KEY = 'dashAuth';
  private static readonly TIMESTAMP_KEY = 'dashAuthTimestamp';
  private static readonly TENANT_IMAGES_KEY = 'dashTenantImages'; 
  private static readonly TENANT_SETTINGS_KEY = 'dashTenantSettings';
  private static readonly SYSTEM_VALUES_KEY = 'dashSystemValues';

  private static readonly EXPIRY_HOURS = 24;

  static saveAuth(authData: any): void {
    try {
      // Only persist the auth.auth object, not the user data
      const authToPersist = {
        auth: authData.auth // Only save auth.auth, not auth.user
      };

      // Separately save tenant images for persistence across logout
      if (authData.auth?.tenantImages) {
        localStorage.setItem(this.TENANT_IMAGES_KEY, JSON.stringify(authData.auth.tenantImages));
      }
      
      // Separately save tenant settings for persistence across logout
      if (authData.auth?.tenantSettings) {
        localStorage.setItem(this.TENANT_SETTINGS_KEY, JSON.stringify(authData.auth.tenantSettings));
      }

      // Separately save system values for persistence across logout
      if (authData.systemValues) {
        localStorage.setItem(this.SYSTEM_VALUES_KEY, JSON.stringify(authData.systemValues));
      }
      
      // Remove logout markers when saving new auth data
      const cleanAuthData = { ...authToPersist };
      delete cleanAuthData._loggedOut;
      delete cleanAuthData._loggedOutAt;
      
      localStorage.setItem(this.AUTH_KEY, JSON.stringify(cleanAuthData));
      localStorage.setItem(this.TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.error('Failed to save auth data:', error);
    }
  }

  static setAuth(authData: any): void {
    try {
      // Store token separately for easy access
      if (authData.token) {
       
        localStorage.setItem('token', authData.token);
      }
      
      // Store user data separately for easy access
      if (authData.user) {
        localStorage.setItem('user', JSON.stringify(authData.user));
      }

      // Store system values separately for easy access
      if (authData.systemValues) {
        localStorage.setItem(this.SYSTEM_VALUES_KEY, JSON.stringify(authData.systemValues));
      }
      
      // Mark as authenticated
      localStorage.setItem('authenticated', 'true');
      
      // Use existing saveAuth method for the main auth data
      this.saveAuth({
        auth: {
          user: authData.user,
          token: authData.token,
          refreshToken: authData.refreshToken,
          // Include any other auth-related data
        },
        systemValues: authData.systemValues
      });
      
      console.log('Auth data set successfully');
    } catch (error) {
      console.error('Failed to set auth data:', error);
    }
  }

  static getToken(): string | null {
    try {
      return localStorage.getItem('token');
    } catch (error) {
      console.error('Failed to get token:', error);
      return null;
    }
  }

  static getUser(): any | null {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to get user data:', error);
      return null;
    }
  }

  static getAuth(): any | null {
    try {
      const authData = localStorage.getItem(this.AUTH_KEY);
      const timestamp = localStorage.getItem(this.TIMESTAMP_KEY);

      if (!authData || !timestamp) {
        return null;
      }

      const savedTime = parseInt(timestamp);
      const currentTime = Date.now();
      const hoursDiff = (currentTime - savedTime) / (1000 * 60 * 60);

      if (hoursDiff > this.EXPIRY_HOURS) {
        this.clearAuth();
        return null;
      }

      const parsedData = JSON.parse(authData);
      
      // Don't return auth data if marked as logged out
      if (parsedData._loggedOut) {
        console.log('Auth data exists but user is marked as logged out');
        return null;
      }

      return parsedData;
    } catch (error) {
      console.error('Failed to retrieve auth data:', error);
      this.clearAuth();
      return null;
    }
  }

  static markAsLoggedOut(): void {
    try {
      const authData = localStorage.getItem(this.AUTH_KEY);
      if (authData) {
        const parsedData = JSON.parse(authData);
        // Keep the auth data but mark as logged out
        const loggedOutAuth = {
          ...parsedData,
          _loggedOut: true,
          _loggedOutAt: Date.now()
        };
        localStorage.setItem(this.AUTH_KEY, JSON.stringify(loggedOutAuth));
        console.log('Auth data marked as logged out but preserved in localStorage');
      }
      localStorage.removeItem('token');
      localStorage.setItem('authenticated', 'false');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Failed to mark auth as logged out:', error);
    }
  }

static getTenantImages(): any | null {
    try {
        const tenantImages = localStorage.getItem(this.TENANT_IMAGES_KEY);
        return tenantImages ? JSON.parse(tenantImages) : null;
    } catch (error) {
        console.error('Failed to get tenant images:', error);
        return null;
    }
}

static setTenantImages(images: any): void {
    try {
        localStorage.setItem(this.TENANT_IMAGES_KEY, JSON.stringify(images));
    } catch (error) {
        console.error('Failed to set tenant images:', error);
    }
}

static getTenantSettings(): any | null {
    try {
        const tenantSettings = localStorage.getItem(this.TENANT_SETTINGS_KEY);
        return tenantSettings ? JSON.parse(tenantSettings) : null;
    } catch (error) {
        console.error('Failed to get tenant settings:', error);
        return null;
    }
}

static setTenantSettings(settings: any): void {
    try {
        localStorage.setItem(this.TENANT_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error('Failed to set tenant settings:', error);
    }
}

static getSystemValues(): any | null {
    try {
        const systemValues = localStorage.getItem(this.SYSTEM_VALUES_KEY);
        return systemValues ? JSON.parse(systemValues) : null;
    } catch (error) {
        console.error('Failed to get system values:', error);
        return null;
    }
}

static setSystemValues(values: any): void {
    try {
        localStorage.setItem(this.SYSTEM_VALUES_KEY, JSON.stringify(values));
    } catch (error) {
        console.error('Failed to set system values:', error);
    }
}

  static getSystemValue(key: string): any | null {
    try {
      const systemValues = this.getSystemValues();
      return systemValues ? systemValues[key] : null;
    } catch (error) {
      console.error(`Failed to get system value for key '${key}':`, error);
      return null;
    }
  }

  static getPointOfSales(): any | null {
    return this.getSystemValue('point_of_sales');
  }

  static clearAuth(): void {
    localStorage.removeItem(this.AUTH_KEY);
    localStorage.removeItem(this.TIMESTAMP_KEY);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.setItem('authenticated', 'false');
  }

    static clearAllAuthData(): void {
        // Complete cleanup including tenant data
        localStorage.removeItem(this.AUTH_KEY);
        localStorage.removeItem(this.TIMESTAMP_KEY);
        localStorage.removeItem(this.TENANT_IMAGES_KEY);
        localStorage.removeItem(this.TENANT_SETTINGS_KEY);
        localStorage.removeItem(this.SYSTEM_VALUES_KEY);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.setItem('authenticated', 'false');
    }

    static getStoredAuthData(): {
        token: string | null;
        user: any | null;
        systemValues: any | null;
        auth: any | null;
        tenantImages: any | null;
        tenantSettings: any | null;
    } | null {
        try {
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('user');
            const systemValuesData = localStorage.getItem(this.SYSTEM_VALUES_KEY);
            const authData = localStorage.getItem(this.AUTH_KEY);
            const tenantImagesData = localStorage.getItem(this.TENANT_IMAGES_KEY);
            const tenantSettingsData = localStorage.getItem(this.TENANT_SETTINGS_KEY);

            const user = userData ? JSON.parse(userData) : null;
            const systemValues = systemValuesData ? JSON.parse(systemValuesData) : null;
            const auth = authData ? JSON.parse(authData) : null;
            const tenantImages = tenantImagesData ? JSON.parse(tenantImagesData) : null;
            const tenantSettings = tenantSettingsData ? JSON.parse(tenantSettingsData) : null;

            // Return in the format expected by setAuth
            return {
                token,
                user,
                systemValues,
                auth: auth?.auth || null,
                tenantImages,
                tenantSettings
            };
        } catch (error) {
            console.error('Failed to get stored auth data:', error);
            return null;
        }
    }


  static isAuthValid(): boolean {
    return this.getAuth() !== null;
  }

  static getPermissions(): Promise<any> {
    try {
      // First check if user is guest
      const storedRoles = localStorage.getItem('roles');
      if (storedRoles === 'guest') {
        return Promise.resolve('guest');
      }

      // Try to get permissions from the persisted auth data first
      const authData = this.getAuth();
      if (authData?.auth?.user?.roles) {
        const processedPermissions = {
          roles: authData.auth.user.roles.map((item: any) => 
            typeof item === 'string' ? item : item.name
          )
        };
        return Promise.resolve(processedPermissions);
      }

      // Fallback to localStorage roles if auth data doesn't have roles
      if (storedRoles) {
        try {
          const parsedRoles = JSON.parse(storedRoles);
          const processedPermissions = {
            roles: Array.isArray(parsedRoles) 
              ? parsedRoles.map((item: any) => typeof item === 'string' ? item : item.name)
              : [parsedRoles]
          };
          return Promise.resolve(processedPermissions);
        } catch (parseError) {
          console.error('Failed to parse roles from localStorage:', parseError);
          return Promise.resolve('null');
        }
      }

      return Promise.resolve('null');
    } catch (error) {
      console.error('Failed to get permissions:', error);
      return Promise.resolve('null');
    }
  }
}

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
  logout: (callback?: () => void)  => void;
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
    const isAuthenticated = JSON.parse(localStorage.getItem('authenticated') || 'false');
    
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
    const isAuthenticated = JSON.parse(localStorage.getItem('authenticated') || 'false');

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

  const logout = (callback?: () => void) => {
    // Mark as logged out but keep the auth.auth data
    AuthPersistenceService.markAsLoggedOut();
    
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
      const storageAuthenticated = JSON.parse(localStorage.getItem('authenticated') || 'false');
      if (storageAuthenticated && auth.user?.tenant_id) {
        const { DashIPCService } = window;
        DashIPCService && DashIPCService.action('start-bg-service', {
          token: localStorage.getItem('token'),
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
