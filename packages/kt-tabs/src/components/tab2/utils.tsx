import { AuthPersistenceService } from 'dash-auth';
import { ProductItem } from './types';

// Discount types
export const DISCOUNT_TYPE_PERCENTAGE = 'percentage';
export const DISCOUNT_TYPE_FIXED = 'fixed';

// Add currency utilities
export const getCurrencyFromAuth = () => {
    // Try to get from AuthContext or AuthPersistenceService
    const currency = AuthPersistenceService.getTenantSettings()?.primary_currency || null;
  // debugger;
    return currency;
   
};

export const getDefaultServiceFeeFromAuth = () => {
    // Try to get from AuthContext or AuthPersistenceService
    const serviceFee = AuthPersistenceService.getTenantSettings()?.service_fee || 10;

    return serviceFee;
   
};

/**
 * Calculate discount amount based on type and value
 * @param subtotal The subtotal before discount
 * @param discountType 'percentage' or 'fixed'
 * @param discountValue The discount value
 * @returns The calculated discount amount
 */
export const calculateDiscountAmount = (
    subtotal: number, 
    discountType: string | null | undefined, 
    discountValue: number | string | null | undefined
): number => {
    // Handle invalid inputs
    if (!discountType || !discountValue) return 0;
    
    const numericValue = typeof discountValue === 'string' ? parseFloat(discountValue) : discountValue;
    
    if (isNaN(numericValue) || numericValue <= 0) return 0;
    if (isNaN(subtotal) || subtotal <= 0) return 0;
    
    if (discountType === DISCOUNT_TYPE_PERCENTAGE) {
        // Calculate percentage discount and cap at subtotal (max 100%)
        const discountAmount = (subtotal * numericValue) / 100;
        return Math.min(discountAmount, subtotal);
    }
    
    if (discountType === DISCOUNT_TYPE_FIXED) {
        // Fixed discount - cap at subtotal
        return Math.min(numericValue, subtotal);
    }
    
    return 0;
};

export const calculateServiceFee = (subtotal: number, serviceFeePercentage?: number): number => {
    const defaultServiceFee = serviceFeePercentage || getDefaultServiceFeeFromAuth();
    
    // Handle null, undefined, or invalid values
    if (subtotal === null || subtotal === undefined || isNaN(subtotal) || subtotal <= 0) {
        return 0;
    }
    
    if (defaultServiceFee === null || defaultServiceFee === undefined || isNaN(defaultServiceFee) || defaultServiceFee < 0) {
        return 0;
    }
    
    return (subtotal * defaultServiceFee) / 100;
};

export const formatCurrencyWithTenant = (amount: any, currency?: any): string => {
    const tenantCurrency = currency || getCurrencyFromAuth();
    

    // TODO! get the primary currency for the current tenant from the AuthService or so. 
    // Handle null, undefined, or empty values
    if (amount === null || amount === undefined || amount === '') {
        return tenantCurrency ? `${tenantCurrency.symbol}0` : '$0.00';
    }

    // Convert to number
    let numericAmount: number;
    
    if (typeof amount === 'string') {
        numericAmount = parseFloat(amount);
    } else if (typeof amount === 'number') {
        numericAmount = amount;
    } else {
        numericAmount = parseFloat(String(amount));
    }

    // Check if conversion was successful
    if (isNaN(numericAmount)) {
        console.warn('Invalid amount value:', amount);
        return tenantCurrency ? `${tenantCurrency.symbol}0` : '$0.00';
    }

    // Format based on currency
    if (tenantCurrency) {
        const { symbol, code, format } = tenantCurrency;
        
        // For CLP and similar currencies without decimals
        if (code === 'CLP' || format === ',') {
            return `${symbol}${Math.round(numericAmount).toLocaleString()}`;
        }
        
        // For currencies with decimals
        return `${symbol}${numericAmount.toFixed(2)}`;
    }

    // Fallback to default formatting
    return `$${numericAmount.toFixed(2)}`;
};

export const formatPriceAdjustmentWithTenant = (price: any, currency?: any): string => {
    const tenantCurrency = currency || getCurrencyFromAuth();
    
    // Handle null, undefined, or empty values
    if (price === null || price === undefined || price === '') {
        return '';
    }

    // Convert to number
    let numericPrice: number;
    
    if (typeof price === 'string') {
        numericPrice = parseFloat(price);
    } else if (typeof price === 'number') {
        numericPrice = price;
    } else {
        numericPrice = parseFloat(String(price));
    }

    // Check if conversion was successful
    if (isNaN(numericPrice)) {
        console.warn('Invalid price value:', price);
        return '';
    }

    // Return empty for zero
    if (numericPrice === 0) return '';

    // Format based on currency
    if (tenantCurrency) {
        const { code, format } = tenantCurrency;
        
        // For CLP and similar currencies without decimals
        if (code === 'CLP' || format === ',') {
            const roundedPrice = Math.round(Math.abs(numericPrice));
            return numericPrice > 0 ? `+${roundedPrice.toLocaleString()}` : `-${roundedPrice.toLocaleString()}`;
        }
        
        // For currencies with decimals
        return numericPrice > 0 ? `+${numericPrice.toFixed(2)}` : `-${Math.abs(numericPrice).toFixed(2)}`;
    }

    // Fallback
    return numericPrice > 0 ? `+${numericPrice.toFixed(2)}` : `-${Math.abs(numericPrice).toFixed(2)}`;
};

export const calculateOrderTotal = (products: ProductItem[]): number => {
    if (!products || !Array.isArray(products) || !products.length) {
        return 0;
    }

    return products.reduce((acc, item) => {
        console.log("Calculating item price:", item);
        const price = parseFloat(item?.unit_price || "0");
        console.log(`Item ${item.product_id} price: ${price}, quantity: ${item.quantity}`);
        let itemTotal = price * (item.quantity || 0);

        // Add modifier price adjustments
        if (item.modifiers && Array.isArray(item.modifiers)) {
            const modifierAdjustments = item.modifiers.reduce((modAcc: number, mod: any) => {
                return modAcc + parseFloat(mod.price_adjustment || "0");
            }, 0);
            itemTotal += modifierAdjustments * (item.quantity || 0);
        }

        console.log(`Item total: ${itemTotal}`);
        return acc + itemTotal;
    }, 0);
};

export const generateLineId = (): string => {
    return `line_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const createNewProduct = (product: any): ProductItem => {
    const modifiers = product.modifier_groups?.flatMap((group: any) => {
        return group.options?.filter((option: any) => option.is_default)?.map((option: any) => {
            return ({
                modifier_option_id: option.id,
                modifier_group_id: group.id,
                price_adjustment: option.price_adjustment,
                modifier_option: {
                    id: option.id,
                    name: option.name,
                    price_adjustment: option.price_adjustment,
                    modifierGroup: {
                        id: group.id,
                        name: group.name,
                        type: group.type
                    }
                }
            })
        }) || []
    }).filter(Boolean) || [];

    return {
        product_id: product.id,
        product: product,
        quantity: 1,
        unit_price: String(product.price || "0"),
        note: "",
        modifiers: modifiers || [],
        line_id: generateLineId()
    };
};

export const applyModifierSuggestions = (product: ProductItem, suggestedModifiers: any[]): ProductItem => {
    if (!suggestedModifiers || suggestedModifiers.length === 0) {
        return product;
    }

    const enhancedProduct = { ...product };
    const newModifiers = [...(product.modifiers || [])];

    console.log('Applying modifier suggestions:', {
        product: product.product?.name,
        currentModifiers: newModifiers.length,
        suggestions: suggestedModifiers.length
    });

    suggestedModifiers.forEach(suggestion => {
        // Check if this product matches the suggestion
        if (suggestion.product_id !== product.product_id) {
            return;
        }

        // Find the modifier group in the product
        const modifierGroup = product.product?.modifier_groups?.find(
            group => group.id === suggestion.modifier_group_id
        );

        if (!modifierGroup) {
            console.warn('Modifier group not found:', suggestion.modifier_group_id);
            return;
        }

        // Find the specific option
        const modifierOption = modifierGroup.options?.find(
            option => option.id === suggestion.modifier_option_id
        );

        if (!modifierOption) {
            console.warn('Modifier option not found:', suggestion.modifier_option_id);
            return;
        }

        // Check if we already have a modifier for this group
        const existingModifierIndex = newModifiers.findIndex(
            mod => mod.modifier_group_id === suggestion.modifier_group_id
        );

        const newModifier = {
            modifier_option_id: modifierOption.id,
            modifier_group_id: modifierGroup.id,
            price_adjustment: modifierOption.price_adjustment || 0,
            modifier_option: {
                id: modifierOption.id,
                name: modifierOption.name,
                price_adjustment: modifierOption.price_adjustment || 0,
                modifierGroup: {
                    id: modifierGroup.id,
                    name: modifierGroup.name,
                    type: modifierGroup.type
                }
            },
            // Add AI suggestion metadata
            ai_suggested: true,
            detection_reason: suggestion.detection_reason,
            confidence: suggestion.confidence,
            matched_keywords: suggestion.matched_keywords || []
        };

        if (existingModifierIndex >= 0) {
            // Replace existing modifier for this group
            newModifiers[existingModifierIndex] = newModifier;
            console.log('Replaced existing modifier:', {
                group: modifierGroup.name,
                old: newModifiers[existingModifierIndex]?.modifier_option?.name,
                new: modifierOption.name,
                reason: suggestion.detection_reason
            });
        } else {
            // Add new modifier
            newModifiers.push(newModifier);
            console.log('Added new modifier:', {
                group: modifierGroup.name,
                option: modifierOption.name,
                reason: suggestion.detection_reason,
                confidence: suggestion.confidence
            });
        }
    });

    enhancedProduct.modifiers = newModifiers;
    return enhancedProduct;
};

// Keep legacy functions for backward compatibility
export const formatCurrency = (amount: any): string => {
    return formatCurrencyWithTenant(amount);
};

export const formatPriceAdjustment = (price: any): string => {
    return formatPriceAdjustmentWithTenant(price);
};

export const calculateItemTotal = (product: any): number => {
    if (!product) return 0;
    
    const unitPrice = parseFloat(product.unit_price || '0');
    const quantity = parseInt(product.quantity || '0');
    
    if (isNaN(unitPrice) || isNaN(quantity)) {
        console.warn('Invalid product data for calculation:', product);
        return 0;
    }
    
    let itemTotal = unitPrice * quantity;
    
    // Add modifier price adjustments
    if (product.modifiers && Array.isArray(product.modifiers)) {
        const modifierAdjustments = product.modifiers.reduce((acc: number, mod: any) => {
            const adjustment = parseFloat(mod.price_adjustment || '0');
            return acc + (isNaN(adjustment) ? 0 : adjustment);
        }, 0);
        itemTotal += modifierAdjustments * quantity;
    }
    
    return itemTotal;
};

export const PLACEHOLDER_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

// Safe number conversion utility
export const safeParseFloat = (value: any, defaultValue: number = 0): number => {
    if (value === null || value === undefined || value === '') {
        return defaultValue;
    }
    
    const parsed = parseFloat(String(value));
    return isNaN(parsed) ? defaultValue : parsed;
};

// Safe integer conversion utility
export const safeParseInt = (value: any, defaultValue: number = 0): number => {
    if (value === null || value === undefined || value === '') {
        return defaultValue;
    }
    
    const parsed = parseInt(String(value), 10);
    return isNaN(parsed) ? defaultValue : parsed;
};

