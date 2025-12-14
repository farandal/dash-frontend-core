import { ICurrency, formatCurrency } from "../../types/ecommerce";

export const getProductImage = (product: any) => {
        if (!product) {
            return null;
        }

        if( product.image_url ) {
            return product.image_url;
        }
        // Try to get image from gallery
        if (product.gallery && product.gallery.length > 0) {
            return product.gallery[0].url || product.gallery[0].file_url;
        }
        
        // Try to get image from product.image
        if (product.image) {
            return typeof product.image === 'string' ? product.image : product.image.url;
        }
        
        // Try to get primary_image from product
        if (product.primary_image) {
            return product.primary_image.original_url || product.primary_image.url;
        }
        
        // Return null if no image found
        return null;
    };

export const formatPrice = (price: string | number, currency?: ICurrency) => {
    // Handle price from different sources
    let priceValue = 0;
    
    if (typeof price === 'string') {
        priceValue = parseFloat(price);
    } else if (typeof price === 'number') {
        priceValue = price;
    }
    
    return formatCurrency(priceValue, currency);
};

// Helper function to get the primary price from a product
export const getPrimaryPrice = (product: any) => {

    if (!product.prices || product.prices.length === 0) {
        return 0;
    }
    
    // Try to find primary pricelist price first
    const primaryPrice = product.prices.find((price: any) => 
        price.pricelist && price.pricelist.is_primary
    );
    
    if (primaryPrice) {
        return parseFloat(primaryPrice.price) || 0;
    }
    
    // Fallback to first price
    return parseFloat(product.prices[0].price) || 0;
};

// Helper function to get currency from product prices
export const getProductCurrency = (product: any): ICurrency | undefined => {

    if (!product.prices || product.prices.length === 0) {
        return undefined;
    }
    
    // Try to find primary pricelist currency first
    const primaryPrice = product.prices.find((price: any) => 
        price.pricelist && price.pricelist.is_primary
    );
    
    if (primaryPrice && primaryPrice.pricelist && primaryPrice.pricelist.currency) {
        return primaryPrice.pricelist.currency;
    }
    
    // Fallback to first price currency
    if (product.prices[0].pricelist && product.prices[0].pricelist.currency) {
        return product.prices[0].pricelist.currency;
    }
    
    return undefined;
};
