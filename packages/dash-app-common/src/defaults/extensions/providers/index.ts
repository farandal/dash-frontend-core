/**
 * Default Providers Extension Index
 * 
 * This module exports all default provider extensions for the app.
 * These providers wrap the dash-auto-admin factories with default logic.
 */

// Auth Provider
export { 
    dashDefaultAuthProvider, 
    dashDefaultAuthProviderConfig, 
    dashDefaultAuthProviderOverrides 
} from './dashDefaultAuthProvider';

// Data Provider
export { 
    dashDefaultDataProvider, 
    dashDefaultDataProviderConfig, 
    dashDefaultDataProviderOverrides,
    dashDefaultDataProviderExtensions 
} from './dashDefaultDataProvider';

// Default exports for convenience
export { default as dashAuthProvider } from './dashDefaultAuthProvider';
export { default as dashDataProvider } from './dashDefaultDataProvider';
