import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { useController, Control } from 'react-hook-form';
import { NumericFormat, NumericFormatProps } from 'react-number-format';
import numeral from 'numeral';

interface Currency {
    id?: number;
    code: string;
    symbol: string;
    format?: string;
}

interface FormattedPriceProps {
    name: string;
    label?: string;
    currency: Currency;
    control?: Control<any>;
    defaultValue?: string | number;
    disabled?: boolean;
    size?: 'small' | 'medium';
    fullWidth?: boolean;
    placeholder?: string;
    helperText?: string;
    error?: boolean;
    onChange?: (value: string) => void;
    textFieldProps?: Partial<TextFieldProps>;
    numericFormatProps?: Partial<NumericFormatProps>;
}

interface CustomProps {
    onChange: (event: { target: { name: string; value: string } }) => void;
    name: string;
    currency: Currency;
}

const NumberFormatCustom = React.forwardRef<
    typeof NumericFormat,
    CustomProps & Partial<NumericFormatProps>
>(function NumberFormatCustom(props, ref) {
    const { onChange, currency, ...other } = props;
    
    // Determine decimal settings based on currency format
    const shouldShowDecimals = currency.format ? 
        currency.format.includes('.') || currency.format.includes('0.') : 
        true; // Default to showing decimals if no format specified
    
    const decimalScale = shouldShowDecimals ? 2 : 0;
    const fixedDecimalScale = shouldShowDecimals;
    
    // Determine thousand separator
    const thousandSeparator = currency.format?.includes(',') ? ',' : false;
    
    return (
        <NumericFormat
            {...other}
            getInputRef={ref}
            onValueChange={(values) => {
                onChange({
                    target: {
                        name: props.name,
                        value: values.value || '',
                    },
                });
            }}
            valueIsNumericString
            thousandSeparator={thousandSeparator}
            decimalSeparator="."
            prefix={currency.symbol}
            allowNegative={false}
            decimalScale={decimalScale}
            fixedDecimalScale={fixedDecimalScale}
        />
    );
});

const FormattedPrice: React.FC<FormattedPriceProps> = ({
    name,
    label,
    currency,
    control,
    defaultValue = '',
    disabled = false,
    size = 'small',
    fullWidth = true,
    placeholder,
    helperText,
    error = false,
    onChange,
    textFieldProps = {},
    numericFormatProps = {},
}) => {
    // If control is provided, use react-hook-form controller
    if (control) {
        const {
            field: { onChange: fieldOnChange, value, ...fieldProps },
            fieldState: { error: fieldError }
        } = useController({
            name,
            control,
            defaultValue: defaultValue?.toString() || '',
        });

        return (
            <TextField
                {...fieldProps}
                {...textFieldProps}
                label={label}
                value={value}
                onChange={(e) => {
                    fieldOnChange(e.target.value);
                    onChange?.(e.target.value);
                }}
                disabled={disabled}
                size={size}
                fullWidth={fullWidth}
                placeholder={placeholder}
                helperText={fieldError?.message || helperText}
                error={!!fieldError || error}
                InputProps={{
                    inputComponent: NumberFormatCustom as any,
                    inputProps: {
                        currency,
                        ...numericFormatProps,
                    },
                    ...textFieldProps.InputProps,
                }}
            />
        );
    }

    // Standalone component without react-hook-form
    return (
        <TextField
            {...textFieldProps}
            name={name}
            label={label}
            defaultValue={defaultValue}
            disabled={disabled}
            size={size}
            fullWidth={fullWidth}
            placeholder={placeholder}
            helperText={helperText}
            error={error}
            onChange={(e) => onChange?.(e.target.value)}
            InputProps={{
                inputComponent: NumberFormatCustom as any,
                inputProps: {
                    currency,
                    ...numericFormatProps,
                },
                ...textFieldProps.InputProps,
            }}
        />
    );
};

export default FormattedPrice;

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
