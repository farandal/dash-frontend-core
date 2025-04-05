export const parseAxiosError = (error: any): string => {

    // Handle array of validation errors
    if (error?.originalError?.response?.data?.errors && typeof error?.originalError?.response?.data?.errors === 'object') {    
        const originalErrors = error.originalError.response.data.errors;
        const errorMessages = []
        
        for (const key in originalErrors) {
            if (Array.isArray(originalErrors[key])) {
                errorMessages.push(...originalErrors[key])
            }
        }
        
        if (errorMessages.length > 0) {
            return errorMessages.join('\n')
        }
    }

     // First priority - response data message
     if (error?.response?.data?.message) {
        return error.response.data.message;
    }

    // Second priority - error code + name + message
    if (error?.code || error?.message) {
        return [error.code, error.name || '', error.message]
            .filter(Boolean)
            .join(' - ');
    }

   
    // Third priority - status + statusText
    if (error?.response?.status || error?.response?.statusText) {
        return [error.response.status, error.response.statusText]
            .filter(Boolean)
            .join(' - ');
    }

    // Fallback
    return 'An unexpected error occurred';
};