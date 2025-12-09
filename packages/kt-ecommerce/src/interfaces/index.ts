/**
 * kt-ecommerce Interfaces
 * 
 * Core interfaces for the e-commerce domain
 */

// ============================================================================
// TENANT & CURRENCY
// ============================================================================

export interface ITenant {
    id: number;
    name: string;
    public_id: string;
    currencies?: ICurrency[];
    currency_primary_id?: number;
    currency_ids?: number[];
    systemMarketplaces: ISystemMarketplace[];
    systemPointOfSales: ISystemPointOfSale[];
    settings: any[];
}

export interface ICurrency {
    id: number;
    code: string;
    decimals: number;
    symbol: string;
}

// ============================================================================
// CATEGORY
// ============================================================================

export interface ICategory {
    id: number;
    tenant_id: number;
    category_id: number;
    name: string;
    tenant?: ITenant;
    category?: ICategory;
    subcategories?: ICategory[];
    breadcrumbed_name: string;
    [x: string]: any;
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
    custom_properties: {
        source_url: string;
        display_order: number;
        is_primary: boolean;
        product_sku: string;
        product_id: number;
    };
}

export interface IGallery {
    id: number;
    title: string;
    tenant_id: number;
    primary_image_id: number;
    images?: IGalleryImage[];
    product_ids: any[];
}

// ============================================================================
// PRODUCT
// ============================================================================

export interface IProductURL {
    url: string;
    marketplace_id: number;
}

export interface IProduct {
    id: number;
    product_name: string;
    tenant_id: number;
    sku: string;
    name: string;
    description: string;
    category_id: number;
    tenant?: ITenant;
    category?: ICategory;
    prices?: IPrice[];
    stocks?: IStock[];
    gallery?: IGallery;
    gallery_id?: number;
    metadata?: IProductMetadata[];
    products: IProduct[];
    urls: IProductURL[];
    is_pack: boolean;
    is_enabled: boolean;
    infinite_stock: boolean;
}

export interface IProductTemplateColumn {
    id: number;
    product_template_id: number;
    name: string;
    column: string;
    attribute: string;
    relationable_type?: string;
    relationable_id?: number;
    data_index: number;
    editable: boolean;
}

export interface IProductTemplate {
    id: string;
    tenant_id: string;
    name: string;
    file: string;
    skip_rows: number;
    productTemplateColumns: IProductTemplateColumn[];
}

// ============================================================================
// PRICE & PRICELIST
// ============================================================================

export interface IPriceList {
    id: number;
    tenant_id: number;
    name: string;
    currency_id: number;
    tenant?: ITenant;
    currency?: ICurrency;
}

export interface IPrice {
    id: number;
    price: number;
    product_id: number;
    pricelist_id: number;
    product?: IProduct;
    pricelist?: IPriceList;
}

// ============================================================================
// STOCK & STOCK TYPE
// ============================================================================

export interface IStockType {
    id: number;
    tenant_id: number;
    name: string;
    tenant?: ITenant;
}

export interface IStock {
    id: number;
    stock: number;
    product_id: number;
    stock_type_id: number;
    product?: IProduct;
    stockType?: IStockType;
}

// ============================================================================
// METADATA
// ============================================================================

export interface IProductMetadata {
    id: number;
    key: string;
    value: any;
    product_id: number;
}

// ============================================================================
// MARKETPLACE & SYSTEM MARKETPLACE
// ============================================================================

export interface ISystemMarketplace {
    id: number;
    class: string;
    name: string;
    icon_path: string;
    icon_url: string;
}

export interface ISystemPointOfSale {
    class: string;
    icon_path: string;
    icon_url: string;
    id: number;
    name: string;
    tenant_system_point_of_sale_id?: number;
}

export interface IConnectionParams {
    use_custom_connection: boolean;
    [x: string]: any;
}

export interface ITenantSystemMarketplace {
    id: number;
    tenant_id: number;
    system_marketplace_id: number;
    systemMarketplace: ISystemMarketplace;
}

export interface IMarketplace {
    id: number;
    tenant_system_marketplace_id: number;
    name: string;
    active: boolean;
    notified: boolean;
    connection_params: IConnectionParams;
    tenantSystemMarketplace: ITenantSystemMarketplace;
}

// ============================================================================
// CAMPAIGN
// ============================================================================

export enum CampaignStatuses {
    PENDING = 'PENDING',
    PUBLISHING = 'PUBLISHING',
    PUBLISHED = 'PUBLISHED',
    PAUSING = 'PAUSING',
    PAUSED = 'PAUSED',
    FINISHING = 'FINISHING',
    FINISHED = 'FINISHED'
}

export interface ICampaignMarketplace {
    id: number;
    marketplace: IMarketplace;
    source_primary_pricelist_id: number;
    source_sale_pricelist_id: number;
    primary_pricelist_id: number;
    sale_pricelist_id: number;
    source_stock_type_id: number;
    stock_type_id: number;
}

export interface ICampaignInfo {
    totalProducts: number;
    validProducts: number;
    invalidProducts: number;
    errorsCount: number;
}

export interface ICampaignLogJson {
    info: ICampaignInfo;
    errors: string[];
    valid: any[];
}

export interface ICampaignLog {
    id: number;
    tenant_id: number;
    loggeable_type: string;
    loggeable_id: number;
    type: string;
    date: string;
    name: string;
    filepath: string;
    json: ICampaignLogJson;
}

export interface ITrackerSummary {
    id: number;
    campaign_id: number;
    marketplace_id: number | null;
    action: string;
    overall_status: string;
    overall_progress: string;
    is_provisioned: boolean;
    started_at: string;
    completed_at: string | null;
    last_activity_at: string;
    total_products: number;
    total_tasks?: number;
    processed_tasks?: number;
    successful_tasks?: number;
    failed_tasks?: number;
    current_phase?: string;
    phases: any[];
    is_task_based?: boolean;
    estimated_completion?: string;
    marketplace_metadata?: any;
    user_metadata?: any;
    message?: string;
    campaign?: {
        id: number;
        name: string;
    };
    marketplace?: {
        id: number;
        name: string;
    };
}

export interface ITrackerEndpointResponse {
    success: boolean;
    message?: string;
    data?: ITrackerSummary;
}

export interface ICampaign {
    id: number;
    name: string;
    description: string;
    scheduled: boolean;
    start_date?: any;
    end_date?: any;
    status: string;
    tenant_id: number;
    tenant: ITenant;
    campaign_marketplaces: ICampaignMarketplace[];
    products_count: number;
    sales_count: number;
    total_errored: number;
    total_finished: number;
    total_paused: number;
    total_pending: number;
    total_published: number;
    total_sales: number | string;
    total_warning: number;
    tracker_id?: number;
    tracker_summary?: ITrackerSummary;
}

export interface ISocketCampaignTrackerNotificationData {
    type: string;
    tracker_update: Partial<ITrackerSummary>;
    message: string;
    notification_metadata: {
        event: string;
        failure_reason: string;
        duration: string;
        timestamp: string;
    };
}

// ============================================================================
// ORDER
// ============================================================================

export interface IOrder {
    id: number;
    system_marketplace_id: number;
    marketplace_id: number;
    tenant_id: number;
    source_id: string;
    status: string;
    currency_id: number;
    total_amount: string;
    date_created: Date;
    date_confirmed: Date;
    date_canceled?: any;
    sale_note_path: string;
    tax_document_path?: any;
    systemMarketplace: ISystemMarketplace;
    marketplace: IMarketplace;
    tenant: ITenant;
}

// ============================================================================
// LOGGING
// ============================================================================

export interface ILog {
    id: number;
    tenant_id: number;
    loggeable_type: string;
    loggeable_id: number;
    type: string;
    date: string;
    name: string;
    filepath: string;
    json: any;
}

// ============================================================================
// USER
// ============================================================================

export interface IUser {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    [x: string]: any;
}

// ============================================================================
// CAMPAIGN PRODUCT
// ============================================================================

export enum ProductStatuses {
    PENDING = 'PENDING',
    PUBLISHING = 'PUBLISHING',
    PUBLISHED = 'PUBLISHED',
    PAUSING = 'PAUSING',
    PAUSED = 'PAUSED',
    FINISHING = 'FINISHING',
    FINISHED = 'FINISHED',
    ERROR = 'ERROR',
    WARNING = 'WARNING'
}

export interface Pivot {
    product_id: number;
    campaign_marketplace_id: number;
    status: string;
    product_extra_info?: any;
    stock_alert_threshold?: number;
    [x: string]: any;
}

export interface ICampaignProduct {
    id: number;
    product_id: number;
    name: string;
    sku: string;
    pivot: Pivot;
    [x: string]: any;
}

// Aliases for backwards compatibility
export type Tenant = ITenant;
export type Category = ICategory;
export type Product = IProduct;
export type Gallery = IGallery;
export type GalleryImage = IGalleryImage;
export type CampaignMarketplace = ICampaignMarketplace;
export type SystemMarketplace = ISystemMarketplace;
export type TrackerSummary = ITrackerSummary;
export type TrackerEndpointResponse = ITrackerEndpointResponse;
