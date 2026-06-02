/**
 * KitchnTabsResources
 * 
 * Resource manifest for the FabLabOs application.
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
    // KIOSK RESOURCES (from kt-kiosk)
    // ========================================================================
    //privateWebResources: () => import('kt-web/src/resources/privateWebResources'),
    tenancyResources: () => import('./private/tenancyResources'),
   //ecommerceTenantResource: () => import('kt-ecommerce/src/resources/ecommerceTenantResource'),
        // ========================================================================
    // GEOHIERARCHY RESOURCES (from kt-ecommerce)
    // ========================================================================
    communeResource: () => import('kt-ecommerce/src/resources/geohierarchy/communeResource'),
    countryResource: () => import('kt-ecommerce/src/resources/geohierarchy/countryResource'),
    regionResource: () => import('kt-ecommerce/src/resources/geohierarchy/regionResource'),

    // ========================================================================
    // MALL RESOURCES (from kt-mall)
    // ========================================================================
    //mallResources: () => import('./kt-mall/resources/MallResources'),

    // ========================================================================
    // ECOMMERCE RESOURCES (from kt-ecommerce)
    // ========================================================================
    // Essential ecommerce resources
    productResource: () => import('kt-ecommerce/src/resources/productResource'),
    categoryResource: () => import('kt-ecommerce/src/resources/categoryResource'),
    galleryResource: () => import('kt-ecommerce/src/resources/galleryResource'),
    brandResource: () => import('kt-ecommerce/src/resources/brandResource'),
    currencyResource: () => import('kt-ecommerce/src/resources/currencyResource'),
    pricelistResource: () => import('kt-ecommerce/src/resources/pricelistResource'),
    stockTypeResource: () => import('kt-ecommerce/src/resources/stockTypeResource'),
    modifierGroupResource: () => import('kt-ecommerce/src/resources/modifiersResource'),
    // Import/export resources
    productImportTemplateResource: () => import('kt-ecommerce/src/resources/productImportTemplateResource'),
    productImportInstanceResource: () => import('kt-ecommerce/src/resources/productImportInstanceResource'),
    // Tenant ecommerce resources
    
    marketplaceResource: () => import('kt-ecommerce/src/resources/marketplaceResource'),
    pointOfSaleResource: () => import('kt-ecommerce/src/resources/pointOfSaleResource'),
    metadataFormatsResource: () => import('kt-ecommerce/src/resources/metadataFormatsResource'),
    //systemMarketplaceResource: () => import('kt-ecommerce/src/resources/systemMarketplaceResource'),
    //systemPointOfSaleResource: () => import('kt-ecommerce/src/resources/systemPointOfSaleResource'),
    campaignResource: () => import('kt-ecommerce/src/resources/campaignResource'),
    // Order resources
    //orderResource: () => import('kt-ecommerce/src/resources/orderResource'),
    //deliveryDriverResource: () => import('kt-ecommerce/src/resources/delivery/deliveryDriverResource'),
    //deliveryRouteResource: () => import('kt-ecommerce/src/resources/delivery/deliveryRouteResource'),

    
};

export default KitchnTabsWebPrivateResources;
