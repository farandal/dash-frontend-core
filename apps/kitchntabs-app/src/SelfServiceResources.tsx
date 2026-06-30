/**
 * SelfServiceResources.tsx
 * 
 * Resource manifest for the Self-Service Kiosk client (public ordering).
 * This is a minimal set of resources for guest kiosk ordering:
 * - Home page with product menu
 * - Tab/Order creation and tracking
 */
import { ResourceManifest } from 'dash-app-common/components/DashResourceLoader';

/**
 * Self-Service Kiosk Resource Manifest
 * 
 * Only includes resources needed for public kiosk ordering.
 * Uses lazy imports for code-splitting.
 * 
 * Uses the same Mall UI components but configured for Self-Service mode
 * via SelfServiceClientAppResources (which has different API paths and storage keys).
 */
export const SelfServiceResources: ResourceManifest = {
    // Tab/Order resource - for creating and tracking orders
    // Uses Mall UI components configured for Self-Service endpoints
    selfServiceTabResource: () => import('./kt-kiosk/SelfServiceClientAppResources'),
};

export default SelfServiceResources;

