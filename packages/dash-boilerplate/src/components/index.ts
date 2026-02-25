/**
 * Components Module for dash-boilerplate
 * 
 * Lightweight UI components that don't depend on react-admin.
 */

export { GlobalSmallLoader, GlobalLoaderHtmlMarkup, injectCriticalStyles } from './GlobalSmallLoader';
export type { GlobalSmallLoaderProps } from './GlobalSmallLoader';

export { CustomErrorBoundary } from './CustomErrorBoundary';
export type { CustomErrorBoundaryProps } from './CustomErrorBoundary';

export { AppWrapperLight } from './AppWrapperLight';
export type { AppWrapperLightProps } from './AppWrapperLight';

// Default fallback components for error and loading states
export {
    DefaultInitializationErrorFallback,
    DefaultAppLoadErrorFallback,
    createLazyAppLoader,
} from './DefaultFallbacks';
export type {
    DefaultErrorFallbackProps,
    DefaultLoadingFallbackProps,
    CreateLazyAppLoaderOptions,
} from './DefaultFallbacks';
