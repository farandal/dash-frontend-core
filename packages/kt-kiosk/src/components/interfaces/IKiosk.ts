// Kiosk Interfaces

export interface IKioskProduct {
    id: number;
    name: string;
    description?: string;
    sku?: string;
    price: number;
    pricelist_id?: number;
    image?: string | null;
    category_id?: number;
    categories?: IKioskCategory[];
    has_modifiers?: boolean;
    modifiers?: IKioskModifierGroup[];
}

export interface IKioskCategory {
    id: number | string;
    name: string;
    icon?: string;
    image?: string | null;
    position?: number;
}

export interface IKioskModifierGroup {
    id: number;
    name: string;
    type: 'single' | 'multiple';
    required?: boolean;
    min_selections?: number;
    max_selections?: number | null;
    options: IKioskModifierOption[];
}

export interface IKioskModifierOption {
    id: number;
    name: string;
    price: number;
}

export interface IKioskCartItem {
    uniqueId: string;
    product: IKioskProduct;
    quantity: number;
    selectedModifiers: Record<number, number[]>; // modifierGroupId -> array of optionIds
    note?: string;
    totalPrice: number;
}

export interface IKioskOrder {
    delivery_method: 'counter' | 'table' | 'delivery';
    table_number?: string;
    customer_name?: string;
    note?: string;
    items: IKioskOrderItem[];
}

export interface IKioskOrderItem {
    product_id: number;
    quantity: number;
    modifiers?: { modifier_option_id: number }[];
    note?: string;
}

export interface IKioskSession {
    tenant: {
        id: number;
        name: string;
        logo?: string | null;
    };
    pricelist?: {
        id: number;
        name: string;
    } | null;
    currency?: {
        id: number;
        code: string;
        symbol: string;
    } | null;
    delivery_methods: { id: string; name: string }[];
}

export interface IKioskConfirmation {
    id: number;
    ticket_number: string;
    total: number;
    status: string;
}
