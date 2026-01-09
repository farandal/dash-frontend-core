import { IDashAutoAdminResourceConfig } from "dash-auto-admin";
import { useRecordContext } from "react-admin";
import { dashStorage } from 'dash-utils';
// Direct imports from local kt-tabs (avoid barrel exports for tree-shaking)
import { TabManagerProvider } from "../../kt-tabs/components/contexts/TabManagerContext";
import type { ITab } from "../../kt-tabs/components/interfaces/ITab";
import { MallClientTabsProvider } from "./MallClientTabsContext";
import { MallOrderCreateProvider } from "../contexts/MallOrderCreateContext";

// Configuration interface for making MallTabsContextV2 work with Self-Service
interface MallTabsContextConfig {
    storesPath?: string;
    productsPath?: string;
    /** Template for dynamic products path, use {tenantSlug} as placeholder */
    productsPathTemplate?: string;
    /** Categories path for filtering (alternative to stores in single-tenant mode) */
    categoriesPath?: string;
    /** Template for dynamic categories path, use {tenantSlug} as placeholder */
    categoriesPathTemplate?: string;
    sessionStorageKey?: string;
    apiPathPrefix?: string;
    singleTenantMode?: boolean;
    /** Storage key to read tenant slug from (for singleTenantMode) */
    tenantSlugStorageKey?: string;
}

// Default configuration for Mall mode
const DEFAULT_CONFIG: MallTabsContextConfig = {
    storesPath: 'public/mall/stores',
    productsPath: 'public/mall/products',
    sessionStorageKey: 'mall-session-hash',
    apiPathPrefix: '/public/mall',
    singleTenantMode: false,
    tenantSlugStorageKey: 'selfservice-tenant-slug',
};

/**
 * MallTabsContextV2 - Context wrapper for V2 kiosk-style mall ordering
 * 
 * Key differences from MallTabsContext:
 * - For 'create' mode, wraps with MallOrderCreateProvider for product selection and cart
 * - MallOrderToolbarMediator and MallOrderProductsFieldV2 use MallOrderCreateProvider
 * - For 'edit'/'show' modes, still uses TabManagerProvider for existing functionality
 * 
 * Supports Self-Service mode via resourceConfig.config object:
 * - config.storesPath: API path for stores (e.g., 'public/selfservice/stores')
 * - config.productsPath: API path for products (e.g., 'public/selfservice/{slug}/products')
 * - config.sessionStorageKey: Storage key for session (e.g., 'selfservice-session-hash')
 * - config.apiPathPrefix: API prefix (e.g., '/public/selfservice')
 * - config.singleTenantMode: If true, skip multi-store logic
 */
export const MallTabsContextV2: IDashAutoAdminResourceConfig["contextComponent"] = (props) => {
    const { children, mode, resourceConfig } = props;
    const tab: ITab = useRecordContext();
    
    // Get configuration from resourceConfig.config or use defaults
    const config: MallTabsContextConfig = {
        ...DEFAULT_CONFIG,
        ...(resourceConfig?.config || {}),
    };
    
    // Get tenant slug for dynamic path resolution (legacy)
    const tenantSlug = config.singleTenantMode 
        ? dashStorage.getItem(config.tenantSlugStorageKey || 'selfservice-tenant-slug')
        : null;
    
    // Get session hash for dynamic path resolution (new approach)
    const sessionHash = config.singleTenantMode
        ? dashStorage.getItem(config.sessionStorageKey || 'selfservice-session-hash')
        : null;
    
    // Resolve products path dynamically for single-tenant mode
    let resolvedProductsPath = config.productsPathTemplate || config.productsPath || DEFAULT_CONFIG.productsPath || '';
    
    // Replace {hash} placeholder with session hash
    if (config.singleTenantMode && resolvedProductsPath.includes('{hash}')) {
        if (sessionHash) {
            resolvedProductsPath = resolvedProductsPath.replace('{hash}', sessionHash);
        } else {
            console.warn('🔧 MallTabsContextV2: Session hash not in storage yet, waiting for auth to complete');
            resolvedProductsPath = ''; // Will show no products until hash is available
        }
    }
    // Legacy: Replace {tenantSlug} placeholder with tenant slug
    else if (config.singleTenantMode && resolvedProductsPath.includes('{tenantSlug}')) {
        if (tenantSlug) {
            resolvedProductsPath = resolvedProductsPath.replace('{tenantSlug}', tenantSlug);
        } else {
            console.warn('🔧 MallTabsContextV2: Tenant slug not in storage yet, waiting for auth to complete');
            resolvedProductsPath = '';
        }
    }
    
    // Resolve categories path dynamically for single-tenant mode
    let resolvedCategoriesPath = config.categoriesPathTemplate || config.categoriesPath || '';
    
    // Replace {hash} placeholder with session hash
    if (config.singleTenantMode && resolvedCategoriesPath.includes('{hash}')) {
        if (sessionHash) {
            resolvedCategoriesPath = resolvedCategoriesPath.replace('{hash}', sessionHash);
        } else {
            resolvedCategoriesPath = '';
        }
    }
    // Legacy: Replace {tenantSlug} placeholder with tenant slug
    else if (config.singleTenantMode && resolvedCategoriesPath.includes('{tenantSlug}')) {
        if (tenantSlug) {
            resolvedCategoriesPath = resolvedCategoriesPath.replace('{tenantSlug}', tenantSlug);
        } else {
             resolvedCategoriesPath = '';
        }
    }
    
    console.log('🔧 MallTabsContextV2: Resolved config', {
        singleTenantMode: config.singleTenantMode,
        productsPath: resolvedProductsPath,
        categoriesPath: resolvedCategoriesPath,
        sessionStorageKey: config.sessionStorageKey,
        tenantSlugFromStorage: tenantSlug,
    });

    // For list mode, wrap with MallClientTabsProvider for notifications/tenant status tracking
    if (mode === "list") {
        return (
            <MallClientTabsProvider 
                mode={mode} 
                resourceConfig={resourceConfig}
                sessionStorageKey={config.sessionStorageKey}
                apiPathPrefix={config.apiPathPrefix}
            >
                {children}
            </MallClientTabsProvider>
        );
    }

    // For create mode, wrap with MallOrderCreateProvider for product/cart management
    // MallOrderToolbarMediator and MallOrderProductsFieldV2 both use this context
    if (mode === "create") {
        return (
            <MallClientTabsProvider 
                mode={mode} 
                resourceConfig={resourceConfig}
                sessionStorageKey={config.sessionStorageKey}
                apiPathPrefix={config.apiPathPrefix}
            >
                <MallOrderCreateProvider
                    storesPath={config.storesPath}
                    productsPath={resolvedProductsPath}
                    categoriesPath={resolvedCategoriesPath}
                    sessionStorageKey={config.sessionStorageKey}
                    singleTenantMode={config.singleTenantMode}
                >
                    {children}
                </MallOrderCreateProvider>
            </MallClientTabsProvider>
        );
    }

    // For edit/show modes, wrap with TabManagerProvider and MallClientTabsProvider
    // This preserves existing functionality for editing orders
    return (
        <MallClientTabsProvider 
            mode={mode} 
            resourceConfig={resourceConfig}
            sessionStorageKey={config.sessionStorageKey}
            apiPathPrefix={config.apiPathPrefix}
        >
            <TabManagerProvider
                tab={tab}
                productsResource={resolvedProductsPath}
                enableInfiniteScroll={true}
                showPrice={true}
                productsField="products"
                method={mode}
            >
                {children}
            </TabManagerProvider>
        </MallClientTabsProvider>
    );
};

export default MallTabsContextV2;
