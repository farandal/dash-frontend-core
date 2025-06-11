import { useContext, useEffect } from 'react';
import { useGetIdentity } from 'react-admin';
import { useAuthContext } from '../contexts/auth';
import { useDialog } from 'dash-dialog';

declare global {
    interface Window {
        DashIPCService: any;
    }
}

const RADashComponent = () => {
    // React admin integration entry point
    const { identity, isLoading: identityLoading } = useGetIdentity();
    const authContext = useAuthContext();
    const dialog = useDialog();

    // Global axios error handler
    useEffect(() => {
        const handleGlobalAxiosError = (event) => {
            dialog({
                variant: 'danger',
                title: event.data?.name || "Error",
                content: event.data?.message || "Error desconocido",
                confirmText: 'Volver',
                closeText: 'Cerrar',
                onConfirm: () => {},
                onClose: () => {},
            });
        };

        window.addEventListener('global-axios-error', handleGlobalAxiosError);
        return () => {
            window.removeEventListener('global-axios-error', handleGlobalAxiosError);
        };
    }, [dialog]);    

    // Handle react-admin identity - delegate everything to AuthContext
    useEffect(() => {
        if (!identityLoading && identity) {
            authContext.handleReactAdminIdentity(identity);
        }
    }, [identity, identityLoading, authContext]);

    return null;
};

export default RADashComponent;
