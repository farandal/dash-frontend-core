
export interface ModifierItem {
    id?: string;
    modifier_option_id: string;
    modifier_group_id: string;
    price_adjustment: number | string;
    modifier_option: {
        id: string;
        name: string;
        price_adjustment: number | string;
        modifierGroup: {
            id: string;
            name: string;
            type: string;
        };
    };
    // AI-related fields
    ai_suggested?: boolean;
    detection_reason?: string;
    confidence?: number;
    matched_keywords?: string[];
    detection_type?: string;
}

export interface ModifierGroup {
    id: string;
    name: string;
    type: 'SINGLE' | 'MULTIPLE';
    options: ModifierOption[];
}

export interface ModifierOption {
    id: string;
    name: string;
    price_adjustment: number | string;
    is_default?: boolean;
}

// Voice Action Types
export interface VoiceAction {
    action: 'add' | 'remove' | 'modify_quantity' | 'add_note';
    product_names: string[];
    quantity?: number;
    note?: string;
    confidence: number;
    resolved_products?: Array<{
        id: string;
        name: string;
        sku: string;
        price: string;
        product_data: any;
    }>;
    resolution_status?: 'found' | 'not_found' | 'multiple';
    suggested_modifiers?: Array<{
        product_id: string;
        modifier_group_id: string;
        modifier_option_id: string;
        modifier_group_name?: string;
        modifier_option_name?: string;
        detection_reason: string;
        confidence: number;
        matched_keywords?: string[];
        detection_type: string;
    }>;
    auto_added?: boolean;
    auto_added_reason?: string;
    ai_analysis?: string;
}

// Component Props Types
export interface ProductListItemProps {
    product: ProductItem;
    index: number;
    onQuantityChange: (product: ProductItem, qty: number) => void;
    onRemoveProduct: (product: ProductItem) => void;
    onNoteChange: (product: ProductItem, note: string) => void;
    onModifierChange: (product: ProductItem, updatedModifiers: ModifierItem[]) => void;
    showImage?: boolean;
    disabled?: boolean;
}

export interface ProductModifiersProps {
    product: ProductItem;
    productIndex: number;
    modifiers: ModifierItem[];
    onModifierChange: (updatedModifiers: ModifierItem[]) => void;
    disabled?: boolean;
}

export interface OrderProductsListProps {
    products: ProductItem[];
    onQuantityChange: (index: number, increment: boolean) => void;
    onRemoveProduct: (index: number) => void;
    onNoteChange: (index: number, note: string) => void;
    onModifierChange: (index: number, updatedModifiers: ModifierItem[]) => void;
    showImage?: boolean;
    disabled?: boolean;
}

export interface OrderSummaryProps {
    totalAmount: number;
    currency?: string;
    showServiceFee?: boolean;
    serviceFeePercentage?: number;
    enableServiceFee?: boolean;
}

// Hook Return Types
export interface UseOrderManagementReturn {
    localProducts: ProductItem[];
    setLocalProducts: React.Dispatch<React.SetStateAction<ProductItem[]>>;
    totalAmount: number;
    updateProducts: (products: ProductItem[], options?: any) => void;
    handleNoteChange: (index: number, note: string) => void;
    handleModifierChange: (index: number, updatedModifiers: ModifierItem[]) => void;
    handleQuantityChange: (index: number, increment: boolean) => void;
    removeProduct: (index: number) => void;
    addProduct: (product: any) => void;
    calculateTotal: (products: ProductItem[]) => void;
}

export interface UseVoiceProcessingReturn {
    isProcessingVoiceActions: boolean;
    handleVoiceActions: (actions: VoiceAction[]) => Promise<void>;
    handleVoiceError: (error: string) => void;
    showMessage: (message: string) => void;
    showError: (error: string) => void;
}

// Tab Related Types
export interface ITab {
    id: string;
    status: string;
    delivery_method: string;
    note?: string;
    date_created: string;
    date_confirmed?: string;
    date_in_preparation?: string;
    date_prepared?: string;
    date_delivered?: string;
    date_closed?: string;
    order?: {
        id: string;
        total_amount: number;
        currency_id: number;
        pricelist_id: number;
        items: ProductItem[];
    };
    tenant_id: string;
}

// Action Result Types
export interface ActionResult {
    success: boolean;
    message?: string;
    error?: string;
}

// Voice Action Handler Types
export interface VoiceActionHandlers {
    processVoiceAction: (action: VoiceAction) => Promise<ActionResult>;
    handleAddProductAction: (action: VoiceAction) => Promise<ActionResult>;
    handleRemoveProductAction: (action: VoiceAction) => Promise<ActionResult>;
    handleModifyQuantityAction: (action: VoiceAction) => Promise<ActionResult>;
    handleAddNoteAction: (action: VoiceAction) => Promise<ActionResult>;
}

// Form Context Types
export interface OrderFormData {
    products: ProductItem[];
    tenant_id?: number;
    status?: string;
    delivery_method?: string;
    note?: string;
    currency_id?: number;
    pricelist_id?: number;
}

// Utility Types
export type CurrencyFormatter = (amount: number | string) => string;
export type PriceAdjustmentFormatter = (price: number | string) => string;
export type SafeNumberParser = (value: any, defaultValue?: number) => number;


























export interface ProductItem {
    product_id: string;
    product: any;
    quantity: number;
    unit_price: string;
    note: string;
    modifiers: any[];
    line_id?: string;
}

export interface OrderSummaryProps {
    totalAmount: number;
    serviceFeePercentage?: number;
    showServiceFee?: boolean;
}


export interface VoiceAction {
    action: 'add' | 'remove' | 'modify_quantity' | 'add_note';
    product_names: string[];
    quantity?: number;
    note?: string;
    confidence: number;
    resolved_products?: Array<{
        id: string;
        name: string;
        sku: string;
        price: string;
        product_data: any;
    }>;
    resolution_status?: 'found' | 'not_found' | 'multiple';
    suggested_modifiers?: Array<{
        product_id: string;
        modifier_group_id: string;
        modifier_option_id: string;
        modifier_group_name?: string;
        modifier_option_name?: string;
        detection_reason: string;
        confidence: number;
        matched_keywords?: string[];
        detection_type: string;
    }>;
    auto_added?: boolean;
    auto_added_reason?: string;
    ai_analysis?: string;
}


export interface OrderManagementHookReturn {
    localProducts: ProductItem[];
    setLocalProducts: React.Dispatch<React.SetStateAction<ProductItem[]>>;
    totalAmount: number;
    updateProducts: (products: ProductItem[], options?: any) => void;
    handleNoteChange: (index: number, note: string) => void;
    handleModifierChange: (index: number, updatedModifiers: any[]) => void;
    handleQuantityChange: (index: number, increment: boolean) => void;
    removeProduct: (index: number) => void;
    addProduct: (product: any) => void;
    calculateTotal: (products: ProductItem[]) => void;
    clearPersistedData: () => void;
    saveFormData: () => void;
    restoreFormData: () => boolean;
}















