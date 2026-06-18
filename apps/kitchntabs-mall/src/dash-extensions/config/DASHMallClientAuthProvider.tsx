import genericAuthProvider from './DASHAuthProvider';

/**
 * Mall Client Auth Provider
 * 
 * This auth provider is used for public mall ordering (unauthenticated users).
 * It treats guests as "authenticated" so React Admin renders the private routes.
 * The guest identity allows access to mall ordering without login.
 */
const authProvider = {
    ...genericAuthProvider,
    
    // Always return a guest identity for public mall users
    // This makes React Admin treat the user as "authenticated"
    getIdentity: async () => { 
        return Promise.resolve({
            id: 'guest',
            fullName: 'Guest',
            avatar: undefined,
        });
    },
    
    // Always resolve - this tells React Admin the user is authenticated
    // React Admin calls this to check if it should show protected routes
    checkAuth: async () => {
        console.log('🔐 MallClientAuthProvider: checkAuth called - resolving as authenticated guest');
        return Promise.resolve();
    },
    
    // No login required - just resolve
    login: async () => {
        console.log('🔐 MallClientAuthProvider: login called - auto-resolving for guest');
        return Promise.resolve();
    },
    
    // No logout action needed
    logout: async () => {
        console.log('🔐 MallClientAuthProvider: logout called - resolving');
        return Promise.resolve();
    },
    
    // Check error - don't redirect to login on errors
    checkError: async (error: any) => {
        // Don't reject on auth errors - we're a public app
        console.log('🔐 MallClientAuthProvider: checkError called - resolving (no redirect)');
        return Promise.resolve();
    },
    
    // Return guest permissions for public users
    getPermissions: async () => {
        return Promise.resolve(['guest', 'public']);
    },
};

export default authProvider;