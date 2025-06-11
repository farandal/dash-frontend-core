import { useDispatch, useSelector } from 'react-redux';
import { IGetAuth } from '../../interfaces/user/IGetAuth';
import { IGetAuthUser } from '../../interfaces/user/IUser';
import React, {
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
} from 'react';
import { DASH_REDUX_ACTIONS, IAuthState, IDASHAppState } from 'dash-admin-state';
import { ACTION_UPDATE_AUTH, ACTION_UPDATE_AUTH_AUTH } from 'dash-admin-state/src/redux/reducers/Auth';
import useAxios from '../../hooks/axios';
import { getEnv } from 'dash-admin/src/config/DASHAdminSystemConstants';

// Auth persistence service
export class AuthPersistenceService {
  private static readonly AUTH_KEY = 'dashAuth';
  private static readonly TIMESTAMP_KEY = 'dashAuthTimestamp';
  private static readonly TENANT_IMAGES_KEY = 'dashTenantImages'; 
  private static readonly TENANT_SETTINGS_KEY = 'dashTenantSettings'; // Add this
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
      
      // Remove logout markers when saving new auth data
      const cleanAuthData = { ...authToPersist };
      delete cleanAuthData._loggedOut;
      delete cleanAuthData._loggedOutAt;
      
      localStorage.setItem(this.AUTH_KEY, JSON.stringify(cleanAuthData));
      localStorage.setItem(this.TIMESTAMP_KEY, Date.now().toString());
      //localStorage.setItem('authenticated', 'true');
    } catch (error) {
      console.error('Failed to save auth data:', error);
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

  static getTenantSettings(): any | null {
    try {
      const tenantSettings = localStorage.getItem(this.TENANT_SETTINGS_KEY);
      return tenantSettings ? JSON.parse(tenantSettings) : null;
    } catch (error) {
      console.error('Failed to get tenant settings:', error);
      return null;
    }
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.setItem('authenticated', 'false');
  }

  static getStoredAuthData(): any | null {
    try {
      const authData = localStorage.getItem(this.AUTH_KEY);
      return authData ? JSON.parse(authData) : null;
    } catch (error) {
      console.error('Failed to get stored auth data:', error);
      return null;
    }
  }

  static isAuthValid(): boolean {
    return this.getAuth() !== null;
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
}

export interface IAuthContext {
  user: IGetAuthUser;
  authenticated: boolean;
  auth?: IGetAuth;
  token?: string;
  roles?: any;
  updateValues: (values: Partial<IAuthContextProps>) => void;
  logout: () => Promise<void>;
  handleReactAdminIdentity: (identity: any) => void; // New method for RADashComponent
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
  
  const [contextValues, setContextValues] = React.useState<Partial<IAuthContextProps>>({
    authenticated: auth.authenticated,
    user: auth.user,
    auth: auth.auth,
    token: auth.user?.token,
    roles: auth.user?.roles
  });

  // Internal method to fetch complete auth data
  const fetchCompleteAuth = useCallback(async () => {
    console.log('Making GET request to:', getEnv('APP_GETAUTH_ENDPOINT'));
    try {
      const { data: authResponse } = await axios.get(getEnv('APP_GETAUTH_ENDPOINT'));
      console.log('Received complete auth data:', authResponse);

      // Save only auth.auth to localStorage
      AuthPersistenceService.saveAuth(authResponse);
      
      // Update Redux store with complete auth data (both user and auth)
      dispatch(
        DASH_REDUX_ACTIONS.updateAuth(ACTION_UPDATE_AUTH, {
          user: authResponse.user,
          authenticated: true,
          auth: authResponse.auth,
        })
      );

      return authResponse;
    } catch (error) {
      console.error('Error fetching complete auth data:', error);
      AuthPersistenceService.markAsLoggedOut();
      throw error;
    }
  }, [axios, dispatch]);

  // Method for RADashComponent to call when react-admin identity is loaded
  const handleReactAdminIdentity = useCallback(async (identity: any) => {
    if (!identity || auth.authenticated) {
      return; // Already authenticated or no identity
    }

    console.log('Handling react-admin identity:', identity);
    
    // First set basic identity data
    dispatch(
      DASH_REDUX_ACTIONS.updateAuth(ACTION_UPDATE_AUTH, {
        user: identity.user,
        authenticated: identity?.user ? true : false,
        auth: identity.auth,
      })
    );

    // Then fetch complete auth data including tenant settings
    try {
      await fetchCompleteAuth();
    } catch (error) {
      console.error('Failed to fetch complete auth data after identity load');
    }
  }, [auth.authenticated, dispatch, fetchCompleteAuth]);

  // Load persisted auth data on mount
  React.useEffect(() => {
    const persistedAuth = AuthPersistenceService.getAuth();
    if (persistedAuth && !auth.authenticated) {
      console.log('Loading persisted auth data from localStorage (auth.auth only)');
      
      // Only restore auth.auth from localStorage, user data comes from react-admin identity
      dispatch(
        DASH_REDUX_ACTIONS.updateAuth(ACTION_UPDATE_AUTH, {
          user: null, // Don't restore user from localStorage
          authenticated: false, // Don't auto-authenticate from localStorage
          auth: persistedAuth.auth, // Only restore auth.auth
        })
      );
    } else {
      const storedAuth = AuthPersistenceService.getStoredAuthData();
      if (storedAuth && storedAuth._loggedOut) {
        console.log('Found logged out auth data in localStorage - not auto-logging in');
      }
    }
  }, [dispatch]);

  const logout = async () => {
    try {
      // Try to use react-admin's logout if available
      const { useLogout } = await import('react-admin');
      
      try {
        const raLogout = useLogout();
        await raLogout({}, '/login', true);
      } catch (reactAdminError) {
        console.warn('React-admin logout not available, using fallback');
        window.location.href = '/login';
      }
    } catch (importError) {
      console.warn('React-admin not available, using fallback logout');
      window.location.href = '/login';
    }
    
    // Mark as logged out but keep the auth.auth data
    AuthPersistenceService.markAsLoggedOut();

    setContextValues({
      authenticated: false,
      user: null,
      auth: null,
      token: null,
      roles: null
    });

    dispatch(
      DASH_REDUX_ACTIONS.updateAuth(ACTION_UPDATE_AUTH, {
        user: null,
        authenticated: false,
        auth: null,
      }),
    );         
  };

  const updateAuth = useCallback((authData: Partial<IAuthContextProps>) => {
    if (authData) {
      setContextValues(prevValues => {
        const hasChanges = Object.keys(authData).some(key => {
          const newValue = authData[key as keyof IAuthContextProps];
          const oldValue = prevValues[key as keyof IAuthContextProps];
          return JSON.stringify(newValue) !== JSON.stringify(oldValue);
        });
        
        if (hasChanges) {
          return {
            ...prevValues,
            ...authData
          };
        }
        return prevValues;
      });
    }
  }, []);
    
  const updateValues = useCallback((authData: Partial<IAuthContextProps>) => {
    setContextValues(prevValues => ({
      ...prevValues,
      ...authData
    }));
  }, []);
    
  React.useEffect(() => {
    const handleAuthEvent = (event: CustomEvent<Partial<IAuthContextProps>>) => {
      updateAuth(event.detail);
    };

    window.addEventListener('authEvent', handleAuthEvent as EventListener);
    return () => {
      window.removeEventListener('authEvent', handleAuthEvent as EventListener);
    };
  }, [updateAuth]);

  // Sync with Redux state changes and handle persistence + panel settings
  React.useEffect(() => {
    setContextValues(prevValues => {
      const newValues = {
        authenticated: auth.authenticated,
        user: auth.user,
        auth: auth.auth,
        token: auth.user?.token,
        roles: auth.user?.roles
      };
      
      const hasChanges = Object.keys(newValues).some(key => {
        const newValue = newValues[key as keyof typeof newValues];
        const oldValue = prevValues[key as keyof typeof newValues];
        return JSON.stringify(newValue) !== JSON.stringify(oldValue);
      });
      
      if (hasChanges) {
        // Persist only auth.auth to localStorage when auth data changes
        if (auth.authenticated && auth.auth) {
          AuthPersistenceService.saveAuth({
            auth: auth.auth // Only persist auth.auth, not auth.user
          });
        }
        
        return {
          ...prevValues,
          ...newValues
        };
      }
      return prevValues;
    });

 // Update panel settings when tenant images are available OR get from persisted data
  let tenantImages = auth?.auth?.tenantImages;
  let tenantSettings = auth?.auth?.tenantSettings;
  
  // If no tenant data in current auth (e.g., after logout), try to get persisted ones
  if (!tenantImages) {
    tenantImages = AuthPersistenceService.getTenantImages();
  }
  
  if (!tenantSettings) {
    tenantSettings = AuthPersistenceService.getTenantSettings();
  }
  
  // Update panel settings with tenant images
  if (tenantImages) {
    console.log('Updating panel settings with tenant images from auth context or persisted data');
    
    dispatch(
      DASH_REDUX_ACTIONS.setPanelSettings({
        ...(tenantImages.horizontal_logo?.original && { horizontalLogo: tenantImages.horizontal_logo.original }),
        ...(tenantImages.squared_logo?.original && { squaredLogo: tenantImages.squared_logo.original }),
        ...(tenantImages.banner?.original && { loginBackground: tenantImages.banner.original })
      })
    );
  }


   if (tenantSettings) {
    console.log('Updating app settings with tenant settings from auth context or persisted data');
    
    // Example: Update theme settings, colors, or other configurations
    // TODO
    

   }

    // Handle IPC service for background service
    const storageAuthenticated = JSON.parse(localStorage.getItem('authenticated') || 'false');
    if (storageAuthenticated && auth.authenticated && auth.user?.tenant_id) {
      const { DashIPCService } = window;
      DashIPCService && DashIPCService.action('start-background-service', {
        token: localStorage.getItem('token'),
        channel: `private-tenant.${auth.user.tenant_id}.system`
      });
    }

  }, [auth.authenticated, auth.user, auth.auth, dispatch]);

  // Create the context value
  const contextValue: IAuthContext = {
    user: contextValues.user || null,
    authenticated: contextValues.authenticated ?? false,
    auth: contextValues.auth,
    token: contextValues.token,
    roles: contextValues.roles,
    updateValues,
    logout,
    handleReactAdminIdentity
  };

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
  window.dispatchEvent(new CustomEvent('authEvent', { detail: values }));
  return values;
};

export default AuthContext;
