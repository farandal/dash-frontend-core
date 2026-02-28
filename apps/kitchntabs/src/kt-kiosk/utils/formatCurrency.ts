import { priceFormatter } from 'dash-utils';

/**
 * Currency interface for mall operations
 * Lightweight version to avoid pulling in kt-ecommerce dependency
 */
export interface IMallCurrency {
    code?: string;
    symbol: string;
    format?: string;
}

/**
 * Format a number as currency
 * @deprecated Use priceFormatter from dash-utils directly instead.
 * This function delegates to the centralized priceFormatter.
 */
export const formatCurrency = (amount: number | string, currency?: IMallCurrency): string => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numericAmount)) return `${currency?.symbol || '$'}0`;
    const currencyCode = currency?.code || 'CLP';
    return priceFormatter(numericAmount, currencyCode);
};

/**
 * Convert kt-ecommerce ICurrency format to mall currency format
 */
export const convertToMallCurrency = (currency: any): IMallCurrency | null => {
    if (!currency) return null;
    return {
        code: currency.code || '',
        symbol: currency.symbol || '$',
        format: currency.format || ','
    };
};

export default formatCurrency;

