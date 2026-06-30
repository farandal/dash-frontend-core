/**
 * KitchnTabsWebTenantPrivateResources
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

export const KitchnTabsWebTenantPrivateResources: ResourceManifest = {

    marketplaceResource: () => import('kt-ecommerce/resources/marketplaceResource'),
    pointOfSaleResource: () => import('kt-ecommerce/resources/pointOfSaleResource'),
    metadataFormatsResource: () => import('kt-ecommerce/resources/metadataFormatsResource'),
    campaignResource: () => import('kt-ecommerce/resources/campaignResource'),
 
};

export default KitchnTabsWebTenantPrivateResources;
