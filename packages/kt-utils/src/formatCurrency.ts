import { priceFormatter } from 'dash-utils';

export interface Currency {
    id?: number;
    code: string;
    symbol: string;
    format?: string;
}

/**
 * Format a number as currency
 * @deprecated Use priceFormatter from dash-utils directly instead.
 * This function delegates to the centralized priceFormatter.
 */
export const formatCurrency = (amount: number | string, currency?: Currency): string => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numericAmount)) return `${currency?.symbol || '$'}0`;
    const currencyCode = currency?.code || 'CLP';
    return priceFormatter(numericAmount, currencyCode);
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

