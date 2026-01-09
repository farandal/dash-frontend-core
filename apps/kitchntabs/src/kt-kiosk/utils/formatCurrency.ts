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
 * Lightweight implementation that doesn't require numeral.js
 */
export const formatCurrency = (amount: number | string, currency?: IMallCurrency): string => {
    if (!currency) {
        currency = { code: "", symbol: '$', format: ',' };
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

    // If format is just "," (like CLP), use integer format
    const useDecimals = currency.format !== ',' && shouldShowDecimals;

    const options: Intl.NumberFormatOptions = {
        style: 'decimal',
        minimumFractionDigits: useDecimals ? 2 : 0,
        maximumFractionDigits: useDecimals ? 2 : 0,
        useGrouping: true,
    };

    try {
        const formattedNumber = numericAmount.toLocaleString('en-US', options);
        return `${currency.symbol}${formattedNumber}`;
    } catch (error) {
        // Fallback to basic formatting
        const fixedAmount = useDecimals ? numericAmount.toFixed(2) : Math.round(numericAmount).toString();
        return `${currency.symbol}${fixedAmount}`;
    }
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
