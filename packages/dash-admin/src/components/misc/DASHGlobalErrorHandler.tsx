import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useDialog } from 'dash-dialog';
import { AxiosError } from 'axios';
import { IDashAutoAdminBackendError } from 'dash-axios-hook/src/interfaces/IDashAutoAdminBackendError';

interface GlobalErrorHandlerEvent<T> {
    data: T;
    config?: { dialog?: boolean, toast?: boolean };
    origin?: string;
}

interface IDashGlobalError {
    status: number;
    body: any;
    message?: string;
}

const _checkError = (errorData: any): IDashGlobalError => {
    // Handle new AxiosError format from processAxiosError
    if (errorData.originalError && errorData.status && errorData.message) {
        const processedError = errorData as IDashAutoAdminBackendError;
        
        let errorMessage = processedError.message || "";
        
        // Add status-specific context if needed
        if (processedError.status >= 400 && processedError.status < 499) {
            switch (processedError.status) {
                case 401:
                    errorMessage = 'No estás autenticado: ' + errorMessage;
                    break;
                case 403:
                    errorMessage = 'No tienes permiso: ' + errorMessage;
                    break;
                case 404:
                    errorMessage = 'Recurso no encontrado: ' + errorMessage;
                    break;
                case 422:
                    errorMessage = 'Error de validación: ' + errorMessage;
                    break;
            }
        }
        
        return {
            status: processedError.status,
            body: errorMessage,
            message: processedError.message
        };
    }
    
    // Handle legacy error format
    let e: IDashGlobalError = { ...errorData?.error ? errorData.error : {} };
    
    let _extra = "";
    if (e.status >= 400 && e.status < 499) {
        if (e.status === 401) _extra = 'No estás autenticado';
        if (e.status === 403) _extra = 'No tienes permiso para acceder a este recurso';
        if (e.status === 404) _extra = 'El recurso solicitado no fue encontrado';
        if (e.status === 422) _extra = 'Error de validación';

        e = {
            status: e.status,
            body: _extra + (e.body ? " " + e.body : "")
        };
    }
    
    return e;
};

export interface IDASHGlobalErrorHandler {
    checkError?: (error: any) => IDashGlobalError;
}

const DASHGlobalErrorHandler: React.FC<IDASHGlobalErrorHandler> = ({ checkError }) => {
    const dialog = useDialog();
    const [disableNextDialog, setDisableNextDialog] = useState(false);

    const showError = (parsedError: IDashGlobalError, globalError: GlobalErrorHandlerEvent<any>) => {
        // Show toast if configured
        if (globalError.config?.toast) {
            toast.error(<>{parsedError.body}</>, {
                position: 'bottom-center',
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
        
        // Show dialog (default behavior unless explicitly disabled)
        if (globalError.config?.dialog !== false) {
            dialog({
                variant: 'danger',
                title: 'Error',
                content: parsedError.body
            });
        }
    };

    const errorChangeHandler = (event: any) => {
        const eventData = event.data || event;
        
        // Check if we have an error to process
        const hasError = eventData?.error || 
                         eventData?.originalError || 
                         (eventData?.status && eventData?.message);

        
        if (hasError) {
            if (!disableNextDialog) {
                try {
                    const parsedError = checkError ? checkError(eventData) : _checkError(eventData);
                    const globalErrorEvent: GlobalErrorHandlerEvent<any> = {
                        data: eventData,
                        config: eventData.config || { dialog: true, toast: false },
                        origin: eventData.origin || 'Unknown'
                    };
                    
                    showError(parsedError, globalErrorEvent);
                } catch (e) {
                    console.error('Error processing global error:', e);
                    // Fallback error display
                    showError({
                        status: 500,
                        body: 'Error inesperado en la aplicación'
                    }, {
                        data: eventData,
                        config: { dialog: true, toast: false }
                    });
                }
            }
            
            // Reset the ignore flag after processing (or skipping) the error
            if (disableNextDialog) {
                setDisableNextDialog(false);
            }
        }
    };

    const ignoreNextDialogHandler = () => {
        setDisableNextDialog(true);
        
        // Safety timeout to reset the flag after 30 seconds
        setTimeout(() => {
            setDisableNextDialog(false);
        }, 30000);
    };

    useEffect(() => {
        window.addEventListener('DASHGlobalError', errorChangeHandler);
        window.addEventListener('DASHGlobalErrorIgnore', ignoreNextDialogHandler);
        
        return () => {
            window.removeEventListener('DASHGlobalError', errorChangeHandler);
            window.removeEventListener('DASHGlobalErrorIgnore', ignoreNextDialogHandler);
        };
    }, [disableNextDialog, checkError]);

    return <></>;
};

export default DASHGlobalErrorHandler;