import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { useController, Control } from 'react-hook-form';
import { NumericFormat, NumericFormatProps } from 'react-number-format';
import numeral from 'numeral';
import { priceFormatter } from 'dash-utils';

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
/**
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
