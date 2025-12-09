import numeral from 'numeral';

export interface Currency {
    id?: number;
    code: string;
    symbol: string;
    format?: string;
}

// Export a simple formatter function for display purposes
export const formatCurrency = (amount: number | string, currency?: Currency): string => {

    if(!currency) {
        currency = { code:"", symbol: '$', format: ',' }
    }
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numericAmount)) {
        const shouldShowDecimals = currency.format ? 
            currency.format.includes('.') || currency.format.includes('0.') : 
            true;
        return shouldShowDecimals ? `${currency.symbol}0.00` : `${currency.symbol}0`;
    }
    
    // Determine if we should show decimals based on currency format
    const shouldShowDecimals = currency.format ? 
        currency.format.includes('.') || currency.format.includes('0.') : 
        true;
    
    // Use the currency format if available, otherwise use default
    let formatString = currency.format || '0,0.00';
    
    // If format is just "," (like CLP), use integer format
    if (currency.format === ',' || !shouldShowDecimals) {
        formatString = '0,0';
    }
    
    try {
        const formattedNumber = numeral(numericAmount).format(formatString);
        return `${currency.symbol}${formattedNumber}`;
    } catch (error) {
        // Fallback to basic formatting
        const options: Intl.NumberFormatOptions = {
            style: 'decimal',
            minimumFractionDigits: shouldShowDecimals ? 2 : 0,
            maximumFractionDigits: shouldShowDecimals ? 2 : 0,
        };
        
        if (currency.format?.includes(',')) {
            options.useGrouping = true;
        }
        
        const formatted = new Intl.NumberFormat('en-US', options).format(numericAmount);
        return `${currency.symbol}${formatted}`;
    }
};

// Helper function to determine if a currency should show decimals
export const shouldCurrencyShowDecimals = (currency: Currency): boolean => {
    if (!currency.format) return true; // Default to showing decimals
    
    // If format is just "," or doesn't include decimal indicators, don't show decimals
    if (currency.format === ',' || currency.format === '#,##0') return false;
    
    // If format includes decimal indicators, show decimals
    return currency.format.includes('.') || currency.format.includes('0.') || currency.format.includes('#.');
};

// Helper function to get decimal places for a currency
export const getCurrencyDecimalPlaces = (currency: Currency): number => {
    if (!shouldCurrencyShowDecimals(currency)) return 0;
    
    // Count decimal places in format string
    if (currency.format?.includes('.')) {
        const afterDecimal = currency.format.split('.')[1];
        return afterDecimal ? afterDecimal.length : 2;
    }
    
    return 2; // Default to 2 decimal places
};
