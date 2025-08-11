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
