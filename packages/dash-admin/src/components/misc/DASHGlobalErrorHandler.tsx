import { useEffect } from 'react';

import { toast } from 'react-toastify';


import { useDialog } from 'dash-dialog';

interface GlobalErrorHandlerEvent<T> {
    data: T;
    config: { dialog: boolean, toast: boolean } 

}
interface IDashGlobalError {
    status: number;
    body: any;
}
const _checkError = (error: GlobalErrorHandlerEvent<any>): IDashGlobalError => {
    const status = error.data.status;
    let e: IDashGlobalError = { status: 500, body: "Error desconocido" };
    
    if (status >= 400 && status < 499) {

    
        let message = error.data.message;

        if (status === 401) message = 'No estás autenticado';
        if (status === 403) message = 'No tienes permiso para acceder a este recurso';
        if (status === 404) message = 'El recurso solicitado no fue encontrado';
        if (status === 422) message = 'Error de validación';
        
        e = {
            status: status,
            body: message
        };
    }
    
    if (status >= 500) {
      
        e = {
            status: status || 500,
            body: 'Ocurrió un error en el servidor. Por favor, inténtelo más tarde.'
        };
    }
    
    return e;
}
export interface IDASHGlobalErrorHandler {
    checkError?: (error: GlobalErrorHandlerEvent<any>) => IDashGlobalError;
}
const DASHGlobalErrorHandler: React.FC<IDASHGlobalErrorHandler> = ({checkError}) => {

    const dialog = useDialog();

    const showError = (parsedError: IDashGlobalError ,globalError:GlobalErrorHandlerEvent<any>) => {
        globalError.config?.toast &&
            toast.error(<>{parsedError.body}</>, {
                position: 'bottom-center',
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        globalError.config?.dialog &&
            dialog({
                variant: 'danger',
                title: 'Error',
                content: parsedError.body
            });
    };

    const errorChangeHandler = (event: GlobalErrorHandlerEvent<any>) => {
        const globalError = event.data;
        if (!!globalError?.error) {
            try {
                showError(checkError ? checkError(globalError) : _checkError(globalError),globalError);
            } catch (e) {
                console.error(e);
            }
        }
    };

    useEffect(() => {
        window.addEventListener('DASHGlobalError', errorChangeHandler as unknown as EventListener);
        return () => {
            window.removeEventListener('DASHGlobalError', errorChangeHandler as unknown as EventListener);
        };
    }, []);

    return <></>;
};

export default DASHGlobalErrorHandler;