import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import React, { useMemo } from "react";
import { useRecordContext, useGetList, Loading } from "react-admin";
import { useFormContext } from "react-hook-form";
import { 
    Box, 
    TextField, 
    Typography, 
    InputAdornment,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip
} from "@mui/material";
import numeral from "numeral";

/**
 * PlanPricesSettings Component
 * 
 * A dynamic form component for managing subscription plan prices across multiple currencies.
 * Fetches available currencies from the system and renders input fields for each.
 * 
 * The prices are stored as a JSON object: { "CLP": 29900, "USD": 33 }
 * 
 * Usage:
 * - In edit/create mode: Renders price input fields for each available currency
 * - In view mode: Displays the prices as a formatted table
 */

interface Currency {
    id: number;
    code: string;
    symbol: string;
    format: string;
    is_default?: boolean;
}

interface SubscriptionPlan {
    id?: number;
    name?: string;
    price?: number;
    prices?: Record<string, number>;
    [key: string]: any;
}

// ============ VIEW MODE ============
const PlanPricesView: React.FC<IDashAutoAdminCustomFieldComponent> = () => {
    const plan: SubscriptionPlan = useRecordContext();
    const prices = plan?.prices;

    const { data: currencies, isLoading } = useGetList<Currency>(
        'system/currency', // core "shared master data" — works for every domain, unlike ecommerce/currency (kitchntabs-backend-domain only)
        { 
            pagination: { page: 1, perPage: 100 },
            sort: { field: 'code', order: 'ASC' },
            filter: { show_disabled: true } // Fetch all currencies including disabled ones
        },
        { 
            staleTime: 5 * 60 * 1000, // 5 minutes cache
            refetchOnWindowFocus: false 
        }
    );

    if (isLoading) return <Loading />;

    if (!prices || Object.keys(prices).length === 0) {
        return (
            <Typography variant="body2" sx={{
                color: "text.secondary"
            }}>No prices configured
                            </Typography>
        );
    }

    return (
        <TableContainer component={Paper} variant="outlined" sx={{ maxWidth: 400 }}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Currency</TableCell>
                        <TableCell align="right">Price</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Object.entries(prices).map(([code, value]) => {
                        const currency = currencies?.find(c => c.code === code);
                        const formattedValue = currency?.format 
                            ? numeral(value).format(currency.format)
                            : value;
                        
                        return (
                            <TableRow key={code}>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Chip 
                                            label={code} 
                                            size="small" 
                                            color={currency?.is_default ? 'primary' : 'default'}
                                        />
                                        {currency?.is_default && (
                                            <Typography variant="caption" sx={{
                                                color: "text.secondary"
                                            }}>
                                                (Default)
                                            </Typography>
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell align="right">
                                    <Typography variant="body2">
                                        {currency?.symbol}{formattedValue}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

// ============ LIST MODE ============
const PlanPricesList: React.FC<IDashAutoAdminCustomFieldComponent> = () => {
    const plan: SubscriptionPlan = useRecordContext();
    const prices = plan?.prices;

    if (!prices || Object.keys(prices).length === 0) {
        return (
            <Typography variant="body2" sx={{
                color: "text.secondary"
            }}>—</Typography>
        );
    }

    return (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {Object.entries(prices).slice(0, 3).map(([code, value]) => (
                <Chip
                    key={code}
                    label={`${code}: ${value}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '11px' }}
                />
            ))}
            {Object.keys(prices).length > 3 && (
                <Chip
                    label={`+${Object.keys(prices).length - 3}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '11px' }}
                />
            )}
        </Box>
    );
};

// ============ EDIT/CREATE MODE ============
const PlanPricesEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method }) => {
    const plan: SubscriptionPlan = useRecordContext();
    const formContext = useFormContext();
    const { register, setValue, watch } = formContext;

    // Fetch available currencies
    const { data: currencies, isLoading, error } = useGetList<Currency>(
        'system/currency', // core "shared master data" — works for every domain, unlike ecommerce/currency (kitchntabs-backend-domain only)
        { 
            pagination: { page: 1, perPage: 100 },
            sort: { field: 'code', order: 'ASC' },
            filter: { show_disabled: true } // Fetch all currencies including disabled ones
        },
        { 
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false 
        }
    );

    // Watch the prices field for reactivity
    const watchedPrices = watch('prices');

    // Get current prices from record or form
    const currentPrices = useMemo(() => {
        if (watchedPrices && typeof watchedPrices === 'object') {
            return watchedPrices;
        }
        return plan?.prices || {};
    }, [watchedPrices, plan?.prices]);

    // Handle price change for a specific currency
    const handlePriceChange = (currencyCode: string, value: string) => {
        const numValue = value === '' ? null : parseInt(value, 10);
        
        const updatedPrices = {
            ...currentPrices,
            [currencyCode]: numValue
        };

        // Remove null/undefined values
        Object.keys(updatedPrices).forEach(key => {
            if (updatedPrices[key] === null || updatedPrices[key] === undefined) {
                delete updatedPrices[key];
            }
        });

        setValue('prices', updatedPrices, { shouldDirty: true });
    };

    if (isLoading) return <Loading />;

    if (error) {
        return (
            <Typography color="error">
                Error loading currencies: {error.message}
            </Typography>
        );
    }

    if (!currencies || currencies.length === 0) {
        return (
            <Typography variant="body2" sx={{
                color: "text.secondary"
            }}>No currencies available. Please configure currencies first.
                            </Typography>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle2" sx={{
                color: "text.secondary"
            }}>
                Set the price for each available currency (in cents/smallest unit)
            </Typography>

            {currencies.map((currency) => {
                const currentValue = currentPrices[currency.code] ?? '';
                
                return (
                    <TextField
                        key={currency.code}
                        label={`${currency.code} Price${currency.is_default ? ' (Default)' : ''}`}
                        type="number"
                        value={currentValue}
                        onChange={(e) => handlePriceChange(currency.code, e.target.value)}
                        helperText={
                            currency.format 
                                ? `Format: ${currency.format} • Example: ${currency.symbol}${numeral(29900).format(currency.format)}`
                                : `Enter price in smallest unit (cents)`
                        }
                        fullWidth
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': currency.is_default ? {
                                borderColor: 'primary.main',
                                '& fieldset': {
                                    borderWidth: 2,
                                }
                            } : {}
                        }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        {currency.symbol}
                                    </InputAdornment>
                                ),
                            }
                        }}
                    />
                );
            })}

            {/* Hidden input to ensure prices gets submitted */}
            <input 
                type="hidden" 
                {...register('prices')} 
                value={JSON.stringify(currentPrices)}
            />
        </Box>
    );
};

// ============ MAIN COMPONENT ============
const PlanPricesSettings: React.FC<IDashAutoAdminCustomFieldComponent> = ({ 
    method, 
    attribute, 
    resourceConfig 
}) => {
    switch (method) {
        case "edit":
        case "create":
            return <PlanPricesEdit method={method} attribute={attribute} resourceConfig={resourceConfig} />;
        case "view":
            return <PlanPricesView method={method} attribute={attribute} resourceConfig={resourceConfig} />;
        case "list":
            return <PlanPricesList method={method} attribute={attribute} resourceConfig={resourceConfig} />;
        default:
            return null;
    }
};

export default PlanPricesSettings;
