/**
 * kt-mall - KitchnTabs Mall Features Package
 *
 * This package contains multi-tenant mall features, mall sessions,
 * store management, and mall-specific routes.
 */

// Core mall resources (always needed)
export { default as MallAppResources } from './MallAppResources';
export { default as MallClientAppResources } from './MallClientAppResources';

// Lazy-loaded components for better chunking
export const lazyComponents = {
  // Components chunk
  components: () => import('./components'),

  // Contexts chunk
  contexts: () => import('./contexts'),

  // Schemas chunk
  schemas: () => import('./schemas'),

  // Interfaces chunk
  interfaces: () => import('./interfaces'),

  // Resources chunk
  resources: () => import('./resources'),
};

// For backward compatibility - direct exports (consider deprecating)
export * from './schemas';
export * from './resources';
export * from './components';
export * from './interfaces';

// Contexts - Bridge context for WebSocket events
export {
    MallEchoBridgeContext,
    MallEchoBridgeProvider,
    useMallEchoBridge,
    type IMallEchoBridgeContext,
} from './contexts/MallEchoBridgeContext';
