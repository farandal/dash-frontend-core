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
    // KIOSK RESOURCES (from kt-kiosk)
    // ========================================================================
    //privateWebResources: () => import('kt-web/src/resources/privateWebResources'),
    tenancyResources: () => import('./private/tenancyResources'),
   //ecommerceTenantResource: () => import('kt-ecommerce/resources/ecommerceTenantResource'),
        // ========================================================================
    // GEOHIERARCHY RESOURCES (from kt-ecommerce)
    // ========================================================================
    communeResource: () => import('kt-ecommerce/resources/geohierarchy/communeResource'),
    countryResource: () => import('kt-ecommerce/resources/geohierarchy/countryResource'),
    regionResource: () => import('kt-ecommerce/resources/geohierarchy/regionResource'),

    // ========================================================================
    // MALL RESOURCES (from kt-mall)
    // ========================================================================
    //mallResources: () => import('./kt-mall/resources/MallResources'),

    // ========================================================================
    // ECOMMERCE RESOURCES (from kt-ecommerce)
    // ========================================================================
    // Essential ecommerce resources
    productResource: () => import('kt-ecommerce/resources/productResource'),
    categoryResource: () => import('kt-ecommerce/resources/categoryResource'),
    galleryResource: () => import('kt-ecommerce/resources/galleryResource'),
    brandResource: () => import('kt-ecommerce/resources/brandResource'),
    currencyResource: () => import('kt-ecommerce/resources/currencyResource'),
    pricelistResource: () => import('kt-ecommerce/resources/pricelistResource'),
    stockTypeResource: () => import('kt-ecommerce/resources/stockTypeResource'),
    modifierGroupResource: () => import('kt-ecommerce/resources/modifiersResource'),
    // Import/export resources
    productImportTemplateResource: () => import('kt-ecommerce/resources/productImportTemplateResource'),
    productImportInstanceResource: () => import('kt-ecommerce/resources/productImportInstanceResource'),
    // Tenant ecommerce resources
    
    marketplaceResource: () => import('kt-ecommerce/resources/marketplaceResource'),
    checkoutGatewayResource: () => import('kt-ecommerce/resources/checkoutGatewayResource'),
    pointOfSaleResource: () => import('kt-ecommerce/resources/pointOfSaleResource'),
    metadataFormatsResource: () => import('kt-ecommerce/resources/metadataFormatsResource'),
    //systemMarketplaceResource: () => import('kt-ecommerce/resources/systemMarketplaceResource'),
    //systemPointOfSaleResource: () => import('kt-ecommerce/resources/systemPointOfSaleResource'),
    campaignResource: () => import('kt-ecommerce/resources/campaignResource'),
    // Order resources
    //orderResource: () => import('kt-ecommerce/resources/orderResource'),
    //deliveryDriverResource: () => import('kt-ecommerce/resources/delivery/deliveryDriverResource'),
    //deliveryRouteResource: () => import('kt-ecommerce/resources/delivery/deliveryRouteResource'),

    
};

export default KitchnTabsWebPrivateResources;
