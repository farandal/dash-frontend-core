export interface IMallOrder {
    mall_id: number;
    customer_name: string;
    table_number: string;
    note?: string;
    products: IMallOrderProduct[];
}

export interface IMallOrderProduct {
    product_id: number;
    quantity: number;
    unit_price?: number;
    note?: string;
    line_id?: string;
    modifiers?: IMallOrderModifier[];
}

export interface IMallOrderModifier {
    modifier_option_id: number;
    price_adjustment: number;
}

export interface IMall {
    id: number;
    name: string;
    slug: string;
    description?: string;
    address?: string;
    manager_tenant: {
        id: number;
        name: string;
    };
    settings?: any;
}

export interface IMallOrderResponse {
    message: string;
    master_tab: any;
    tenant_tabs: any[];
    mall: {
        id: number;
        name: string;
        manager_tenant_id: string;
    };
    customer_info: {
        name: string;
        table: string;
    };
    summary: {
        total_tabs: number;
        tenants_involved: number[];
        total_amount: number;
    };
}
