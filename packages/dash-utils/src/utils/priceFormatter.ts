/***
 * Centralized price formatter for all currencies.
 *
 * Amounts are ALWAYS passed as their real value (never in cents).
 *   - e.g. CLP 4990  → "$4.990"
 *   - e.g. USD 6.00  → "$6.00"
 *   - e.g. USD 6     → "$6"
 *
 * Formatting rules:
 *   - CLP: always formatted as an integer (no decimals), with thousands separator.
 *   - Other currencies: if the value is an integer → no decimals;
 *     if the value has a fractional part → up to 2 decimal places.
 */
export const priceFormatter = (price: number, currencyCode: string = 'CLP'): string => {
    // Ensure we work with an actual number
    const numericPrice = typeof price === 'number' ? price : parseFloat(String(price));
    if (isNaN(numericPrice)) return '$0';

    if (currencyCode === 'CLP') {
        // CLP never uses decimals – format as whole number with locale thousands separator
        return `$${Math.round(numericPrice).toLocaleString('es-CL')}`;
    }

    // For all other currencies: detect int vs float
    const isInteger = Number.isInteger(numericPrice);

    if (isInteger) {
        // Integer amount → no decimals, with thousands separator
        return `$${numericPrice.toLocaleString('en-US')}`;
    }

    // Float amount → up to 2 decimal places
    return `$${numericPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default priceFormatter;