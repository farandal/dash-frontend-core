import { AxiosError } from 'axios';
import { IDashAutoAdminBackendError,IDashAutoAdminDefaultBackendStructure } from '../interfaces/IDashAutoAdminBackendError';

const processAxiosError = (error:AxiosError<IDashAutoAdminDefaultBackendStructure>,resource:string,method:string='update') => {

  // Map method to Spanish action words
  const methodMap = {
      'update': 'Actualizar',
      'create': 'Crear',
      'delete': 'Eliminar'
  };

  // Extract error details
  const errorMessage = error.response?.data?.message ||  error.message ||  'Error al '+ (methodMap[method] || method) +' el recurso';
  // Get HTTP status or fallback to 500
  const status = error.response?.status || 500;

  // If validation errors exist, format them for React Admin
  let body = {
      errors: {}
  };

  if (error.response?.data?.errors) {
      // Format Laravel validation errors for React Admin
      const validationErrors = error.response.data.errors;
      Object.keys(validationErrors).forEach(field => {
          if (typeof validationErrors[field] === 'string') {
              body.errors[field] = validationErrors[field];
          } else if (Array.isArray(validationErrors[field])) {
              body.errors[field] = validationErrors[field].join(', ');
          } else if (typeof validationErrors[field] === 'object') {
              body.errors[field] = validationErrors[field];
          }
      });

      // Add global validation error if exists
      if (errorMessage) {
          body.errors["root"] = {
              serverError: errorMessage
          };
      }
  }

  // Create an enhanced error object that React Admin can understand
  const enhancedError = {
      message: errorMessage,
      status: status,
      body: body,
      resource: resource,
      originalError: error,
      name: 'Error'
  } as IDashAutoAdminBackendError;

    // Log for debugging
    console.error('Update error:', {
      resource,
      errorMessage,
      status,
      validationErrors: body.errors,
      originalError: error
  });

  window.dispatchEvent(
    new MessageEvent('global-axios-error', {
        data: enhancedError,
        origin: "processAxiosErrorFunction"
    }),
);



  return enhancedError;

}

export default processAxiosError;
