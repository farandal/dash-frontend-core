/**
 * Default Bootstrap Extensions Index
 * 
 * Exports all bootstrap-related utilities for app initialization.
 */

// Default Initialization utilities
export { 
    dashDefaultInitializeApp, 
    dashDefaultBootstrapApp,
    type DashDefaultInitializeAppConfig 
} from './dashDefaultInitializeApp';

// Default UI Components
export { 
    DashDefaultLoader,
    type DashDefaultLoaderProps 
} from '../components/DashDefaultLoader';

export { 
    DashDefaultErrorBoundary,
    type DashDefaultErrorBoundaryProps,
    type DashDefaultErrorBoundaryState 
} from './DashDefaultErrorBoundary';

// Re-export lazy app loader from dash-utils for convenience
export { 
    createLazyAppComponent,
    createSimpleLazyApp,
    DefaultLoadFailedComponent,
    type LazyAppLoaderConfig 
} from 'dash-utils';
