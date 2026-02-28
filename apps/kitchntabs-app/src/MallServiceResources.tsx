/**
 * MallServiceResources.tsx
 * 
 * Resource manifest for the Mall Service client (public multi-tenant food court ordering).
 * This is a minimal set of resources for guest mall ordering:
 * - Home page with product menu from multiple stores
 * - Tab/Order creation and tracking
 */
import { ResourceManifest } from 'dash-app-common/src/components/DashResourceLoader';

/**
 * Mall Service Resource Manifest
 * 
 * Only includes resources needed for public mall ordering.
 * Uses lazy imports for code-splitting.
 * 
 * Uses MallClientAppResourcesV2 which provides:
 * - Horizontal store selector with "All Stores" option
 * - Product grid with horizontal pagination or infinite scroll
 * - Cart summary header with drawer
 * - Search box and assistance button per store
 * - Featured products highlighting
 */
export const MallServiceResources: ResourceManifest = {
    // Tab/Order resource - for creating and tracking orders in a mall context
    // Uses MallClientAppResourcesV2 for multi-tenant product aggregation
    mallTabResource: () => import('./kt-kiosk/MallClientAppResourcesV2'),
};

export default MallServiceResources;
