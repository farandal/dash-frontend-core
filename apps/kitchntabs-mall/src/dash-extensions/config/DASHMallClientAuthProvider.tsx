import genericAuthProvider from './DASHAuthProvider';
const authProvider = {
    ...genericAuthProvider,
    getIdentity: async () => { 
        return await Promise.resolve({});
    },
    checkAuth: async () => {
        return Promise.resolve();
    },

};

export default authProvider;