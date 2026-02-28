import React, { useState, useEffect } from 'react';
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
    
    // State for resolved paths to handle potential delays in storage availability
    // Initialize with safe defaults for Mall mode to avoid empty resource requests
    const [resolvedProductsPath, setResolvedProductsPath] = useState<string>(
        !config.singleTenantMode ? (config.productsPathTemplate || config.productsPath || DEFAULT_CONFIG.productsPath || '') : ''
    );
    const [resolvedCategoriesPath, setResolvedCategoriesPath] = useState<string>(
        !config.singleTenantMode ? (config.categoriesPathTemplate || config.categoriesPath || '') : ''
    );
    const [isReady, setIsReady] = useState<boolean>(!config.singleTenantMode);
    
    // Effect to resolve paths, retrying if session hash is missing
    useEffect(() => {
        const resolvePaths = () => {
            const currentSlug = config.singleTenantMode 
                ? dashStorage.getItem(config.tenantSlugStorageKey || 'selfservice-tenant-slug')
                : null;
            
            const currentHash = config.singleTenantMode
                ? dashStorage.getItem(config.sessionStorageKey || 'selfservice-session-hash')
                : null;

            // Resolve Products Path
            let prodPath = config.productsPathTemplate || config.productsPath || DEFAULT_CONFIG.productsPath || '';
            
            if (config.singleTenantMode) {
                if (prodPath.includes('{hash}')) {
                    if (currentHash) {
                        prodPath = prodPath.replace('{hash}', currentHash);
                    } else {
                        // console.warn('🔧 MallTabsContextV2: Session hash missing, waiting...');
                        prodPath = ''; 
                    }
                } else if (prodPath.includes('{tenantSlug}')) {
                    if (currentSlug) {
                        prodPath = prodPath.replace('{tenantSlug}', currentSlug);
                    } else {
                        prodPath = '';
                    }
                }
            }
            
            setResolvedProductsPath(prodPath);

            // Resolve Categories Path
            let catPath = config.categoriesPathTemplate || config.categoriesPath || '';
            
            if (config.singleTenantMode) {
                if (catPath.includes('{hash}')) {
                    if (currentHash) {
                        catPath = catPath.replace('{hash}', currentHash);
                    } else {
                        catPath = '';
                    }
                } else if (catPath.includes('{tenantSlug}')) {
                    if (currentSlug) {
                        catPath = catPath.replace('{tenantSlug}', currentSlug);
                    } else {
                        catPath = '';
                    }
                }
            }
            
            setResolvedCategoriesPath(catPath);

            if (prodPath) {
                console.log('🔧 MallTabsContextV2: Resolved config', {
                    singleTenantMode: config.singleTenantMode,
                    productsPath: prodPath,
                    categoriesPath: catPath,
                    sessionStorageKey: config.sessionStorageKey,
                    tenantSlug: currentSlug,
                    sessionHash: currentHash ? '(present)' : '(missing)'
                });
                setIsReady(true);
            }
        };

        resolvePaths();

        // Retry after short delay if empty (handle race conditions)
        const timer = setTimeout(resolvePaths, 500);
        return () => clearTimeout(timer);
    }, [config]); // Re-run if config changes

    // Don't render until configurations are resolved to prevent empty resource errors
    if (!isReady && config.singleTenantMode) {
        return null;
    }

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
