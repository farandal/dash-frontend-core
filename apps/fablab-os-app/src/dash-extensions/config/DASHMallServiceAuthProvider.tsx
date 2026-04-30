import genericAuthProvider from './DASHAuthProvider';

/**
 * Self-Service Client Auth Provider
 * 
 * This auth provider is used for public self-service kiosk ordering (unauthenticated users).
 * It treats guests as "authenticated" so React Admin renders the private routes.
 * The guest identity allows access to self-service ordering without login.
 */
const authProvider = {
    ...genericAuthProvider,
    
    // Always return a guest identity for public self-service users
    getIdentity: async () => { 
        return Promise.resolve({
            id: 'guest',
            fullName: 'Guest',
            avatar: undefined,
        });
    },
    
    // Always resolve - tells React Admin the user is authenticated
    checkAuth: async () => {
        console.log('🔐 SelfServiceClientAuthProvider: checkAuth - resolving as authenticated guest');
        return Promise.resolve();
    },
    
    // No login required - just resolve
    login: async () => {
        console.log('🔐 SelfServiceClientAuthProvider: login - auto-resolving for guest');
        return Promise.resolve();
    },
    
    // No logout action needed
    logout: async () => {
        console.log('🔐 SelfServiceClientAuthProvider: logout - resolving');
        return Promise.resolve();
    },
    
    // Check error - don't redirect to login on errors
    checkError: async (error: any) => {
        console.log('🔐 SelfServiceClientAuthProvider: checkError - resolving (no redirect)');
        return Promise.resolve();
    },
    
    // Return guest permissions for public users
    getPermissions: async () => {
        return Promise.resolve(['guest', 'public']);
    },
};

export default authProvider;
