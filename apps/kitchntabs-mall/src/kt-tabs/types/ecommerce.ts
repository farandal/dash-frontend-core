/**
 * Local E-Commerce Types for kt-tabs
 * 
 * These are lightweight type definitions to avoid importing the entire
 * kt-ecommerce package which causes bundle bloat due to barrel exports.
 */

// ============================================================================
// CURRENCY
// ============================================================================

export interface ICurrency {
    id: number;
    code: string;
    decimals: number;
    symbol: string;
}

// ============================================================================
// GALLERY & IMAGES
// ============================================================================

export interface IGalleryImage {
    id: number;
    name: string;
    original: string;
    preview: string;
    medium: string;
    large: string;
    url?: string;
    custom_properties: {
        source_url: string;
        display_order: number;
        is_primary: boolean;
        product_sku: string;
        product_id: number;
    };
    title?: string;
}

export interface IGallery {
    id: number;
    title: string;
    tenant_id: string;
    primary_image_id: number;
    images?: IGalleryImage[];
    product_ids: any[];
}

// ============================================================================
// PRICE & PRICELIST
// ============================================================================

export interface IPriceList {
    id: number;
    tenant_id: string;
    name: string;
    currency_id: number;
    currency?: ICurrency;
}

export interface IPrice {
    id: number;
    price: number;
    product_id: number;
    pricelist_id: number;
    pricelist?: IPriceList;
}

// ============================================================================
// STOCK
// ============================================================================

export interface IStockType {
    id: number;
    tenant_id: string;
    name: string;
}

export interface IStock {
    id: number;
    stock: number;
    product_id: number;
    stock_type_id: number;
    stockType?: IStockType;
}

// ============================================================================
// PRODUCT
// ============================================================================

export interface IProductURL {
    url: string;
    marketplace_id: number;
}

export interface ICategory {
    id: number;
    tenant_id: string;
    category_id: number;
    name: string;
    breadcrumbed_name: string;
    [x: string]: any;
}

export interface IProductMetadata {
    id: number;
    key: string;
    value: any;
    product_id: number;
    metadata_format_id?: number;
    metadata_format_name?: string;
}

/**
 * Product interface - core product type used throughout kt-tabs
 */
export interface Product {
    id: number;
    product_name: string;
    tenant_id: string;
    sku: string;
    name: string;
    description: string;
    category_id: number;
    category?: ICategory;
    prices?: IPrice[];
    stocks?: IStock[];
    gallery?: IGallery;
    gallery_id?: number;
    metadata?: IProductMetadata[];
    products: Product[];
    urls: IProductURL[];
    is_pack: boolean;
    is_enabled: boolean;
    infinite_stock: boolean;
    [x: string]: any; // Allow additional properties
}

// Alias for IProduct
export type IProduct = Product;

// ============================================================================
// CURRENCY FORMATTING
// ============================================================================

/**
 * Format a number as currency
 * @param value - The numeric value to format
 * @param currency - The currency object with code, symbol, and decimals
 * @returns Formatted currency string
 */
export function formatCurrency(
    value: number | string | undefined | null,
    currency?: ICurrency | null
): string {
    if (value === undefined || value === null) {
        return '';
    }
    
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numericValue)) {
        return '';
    }
    
    const decimals = currency?.decimals ?? 0;
    const symbol = currency?.symbol ?? '$';
    
    // Format with proper decimal places
    const formatted = numericValue.toLocaleString('es-CL', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
    
    return `${symbol}${formatted}`;
}
