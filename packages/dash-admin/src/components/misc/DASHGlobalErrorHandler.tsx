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

    let e: IDashGlobalError = { status: 500, body: "Error desconocido", ...error?.error ? error.error || {} : {} };

    let _extra = "";
    if (e.status >= 400 && e.status < 499) {


        if (e.status === 401) _extra = 'No estás autenticado';
        if (e.status === 403) _extra = 'No tienes permiso para acceder a este recurso';
        if (e.status === 404) _extra = 'El recurso solicitado no fue encontrado';
        if (e.status === 422) _extra = 'Error de validación';

        e = {
            status: e.status,
            body: _extra + " " + e.body
        };
    }
    /*else if (e.status >= 400 && e.status < 500) {
        e = {
            status: e.status || 400,
            body: 'Ocurrió un error en la solicitud. Por favor, inténtelo de nuevo.'
        };
    } else if (e.status >= 500) {
      
        e = {
            status: e.status || 500,
            body: 'Ocurrió un error en el servidor. Por favor, inténtelo más tarde.'
        };
    }*/
    
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
        
        /*globalError.config?.dialog &&*/
            dialog({
                variant: 'danger',
                title: 'Error',
                content: parsedError.body
            });
    };

    const errorChangeHandler = (event: GlobalErrorHandlerEvent<any>) => {
        const globalError = event.data;
        debugger;
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