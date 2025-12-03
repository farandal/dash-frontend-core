/**
 * Defaults Index
 * 
 * Exports all default components, routes, extensions, pages, filters, and schemas
 * for the dash-app-common package. This provides a complete zero-config solution
 * that can be customized or extended by applications.
 */

// Default routes (from extensions/router)
export { dashDefaultPublicRoutes as defaultPublicRoutes } from './extensions/router/dashDefaultPublicRoutes';
export { dashDefaultPrivateRoutes as defaultPrivateRoutes } from './extensions/router/dashDefaultPrivateRoutes';

// Default app components
export { default as DashDefaultPublicApp } from '../components/DashDefaultPublicApp';
export { default as DashDefaultPrivateApp } from '../components/DashDefaultPrivateApp';

// Extensions
export * from './extensions';

// Pages
export * from './pages';

// Filters
export * from './filters';

// Schemas
export * from './schemas';
