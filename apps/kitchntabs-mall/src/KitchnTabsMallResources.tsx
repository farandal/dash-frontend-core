/**
 * KitchnTabsMallResources
 * 
 * Resource manifest for the KitchnTabs Mall application.
 * This file uses the refactored kt-* packages for all domain-specific resources.
 * 
 * Resources are loaded dynamically using import functions,
 * allowing Vite to properly analyze and code-split them.
 */

import { ResourceManifest } from 'dash-app-common';

// ============================================================================
// RESOURCE MANIFEST
// ============================================================================
// All resources are imported from kt-* packages for proper modularization.

export const KitchnTabsMallResources: ResourceManifest = {
    // ========================================================================
    // SYSTEM RESOURCES (from dash-admin)
    // ========================================================================
    // Core system resources from dash-admin (users, roles, permissions, etc.)
    //systemResources: () => import('dash-admin/src/systemResources'),

    // ========================================================================
    // USER & PROFILE RESOURCES (from kt-ecommerce)
    // ========================================================================
    //profileResource: () => import('kt-ecommerce/src/resources/user/profileResource'),
    //userResource: () => import('kt-ecommerce/src/resources/user/userResource'),

    // ========================================================================
    // MALL RESOURCES (from local kt-mall)
    // ========================================================================
    // Mall admin resources (system-level mall management)
    //mallResources: () => import('./kt-mall/resources/MallResources'),
    
    // Mall App Resources (admin-side mall features)
    //mallAppResources: () => import('./kt-mall/MallAppResources'),
    
    // Mall Client App Resources (public-facing mall features - ordering, etc.)
    mallClientAppResources: () => import('./kt-mall/MallClientAppResourcesV2'),

};

export default KitchnTabsMallResources;
