/**
 * Dash Default Auth Provider Utilities
 * 
 * Dash default authentication utilities.
 * Uses the base utilities from dash-utils with default configuration.
 */
import { AuthPersistenceService, syncLocalStorageToDeviceStore } from 'dash-auth';
import { 
    createLogoutFromStorage,
    isUserAuthenticated,
    getCurrentUser,
    getAuthToken
} from 'dash-utils';
import { removeCookie } from 'dash-admin/src/utils/cookies';

/**
 * Dash default logout function
 * Configured with AuthPersistenceService and cookie removal
 */
export const dashDefaultLogoutFromStorage = createLogoutFromStorage({
    clearAuthPersistence: () => AuthPersistenceService.clearAuth(),
    syncToDeviceStore: syncLocalStorageToDeviceStore,
    removeCookies: (names) => names.forEach(name => removeCookie(name))
});

// Re-export utility functions from dash-utils with DashDefault prefix
export const dashDefaultIsAuthenticated = isUserAuthenticated;
export const dashDefaultGetCurrentUser = getCurrentUser;
export const dashDefaultGetToken = getAuthToken;

export default {
    dashDefaultLogoutFromStorage,
    dashDefaultIsAuthenticated,
    dashDefaultGetCurrentUser,
    dashDefaultGetToken
};
