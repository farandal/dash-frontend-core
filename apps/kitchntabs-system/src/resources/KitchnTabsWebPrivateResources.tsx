/**
 * KitchnTabsResources
 * 
 * Resource manifest for the KitchnTabs application.
 * This file uses the refactored kt-* packages for all domain-specific resources.
 * 
 * Resources are loaded dynamically using import functions,
 * allowing Vite to properly analyze and code-split them.
 */

import { ResourceManifest } from 'dash-app-common';
//import MallResources from './kt-mall/resources/MallResources';
// ============================================================================
// RESOURCE MANIFEST
// ============================================================================
// All resources are imported from kt-* packages for proper modularization.

export const KitchnTabsWebPrivateResources: ResourceManifest = {

    // ========================================================================
    // SYSTEM RESOURCES (from dash-admin)
    // ========================================================================
    // Core system resources from dash-admin (users, roles, permissions, etc.)
    systemResources: () => import('dash-admin/src/systemResources'),

    // ========================================================================
    // SUBSCRIPTION PLAN OVERRIDE (KitchnTabs-specific)
    // ========================================================================
    // Overrides the default subscription plan resource with specialized audit logging
    // that includes gateway sync events (Flow, Rebill, etc.)
    subscriptionPlanResource: () => import('./private/subscriptionPlanResource'),

    // ========================================================================
    // KIOSK RESOURCES (from kt-kiosk)
    // ========================================================================
    //privateWebResources: () => import('kt-web/src/resources/privateWebResources'),
    tenancyResources: () => import('./private/tenancyResources'),

    systemMarketplaceResource: () => import('kt-ecommerce/src/resources/systemMarketplaceResource'),
    systemPointOfSaleResource: () => import('kt-ecommerce/src/resources/systemPointOfSaleResource'),
    systemPaymentGatewayResource: () => import('kt-ecommerce/src/resources/systemPaymentGatewayResource'),

    
};

export default KitchnTabsWebPrivateResources;
