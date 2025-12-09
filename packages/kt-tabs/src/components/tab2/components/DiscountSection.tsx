import React, { useEffect, useState, useRef } from 'react';
import {
    Box,
    Typography,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    IconButton,
    InputAdornment,
    Collapse,
    Button
} from '@mui/material';
import {
    Discount as DiscountIcon,
    Percent as PercentIcon,
    AttachMoney as MoneyIcon,
    Clear as ClearIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { useFormContext, Controller } from 'react-hook-form';
import { useEditContext } from 'react-admin';
import { ITab } from '../../interfaces/ITab';
import { useTabManager } from '../../contexts/TabManagerContext';
import { formatCurrencyWithTenant, getCurrencyFromAuth } from '../utils';

export interface DiscountSectionProps {
    method?: 'create' | 'edit' | 'show';
}

const DISCOUNT_TYPE_PERCENTAGE = 'percentage';
const DISCOUNT_TYPE_FIXED = 'fixed';

const DiscountSection: React.FC<DiscountSectionProps> = ({ 
    method = 'edit' 
}) => {
    const formContext = useFormContext();
    const { totalAmount } = useTabManager();
    const [tenantCurrency, setTenantCurrency] = useState<any>(null);
    const [expanded, setExpanded] = useState(false);
    const initializedRef = useRef(false);
    
    // Try to get tab data from edit context (only available in edit mode)
    let tabRecord: ITab | null = null;
    try {
        const editContext = useEditContext<ITab>();
        tabRecord = editContext?.record || null;
    } catch (e) {
        // Not in edit context, that's fine for create mode
    }

    // Get stable values from tab record
    const recordDiscountType = tabRecord?.order?.discount_type;
    const recordDiscountValue = tabRecord?.order?.discount_value;
    const recordDiscountReason = tabRecord?.order?.discount_reason;
    const recordId = tabRecord?.id;

    // Initialize form with existing discount values (only once per record)
    useEffect(() => {
        if (!formContext || initializedRef.current) return;
        
        if (recordId && recordDiscountType && recordDiscountValue) {
            const numValue = parseFloat(String(recordDiscountValue));
            if (numValue > 0) {
                formContext.setValue('discount_type', recordDiscountType);
                formContext.setValue('discount_value', numValue);
                formContext.setValue('discount_reason', recordDiscountReason || '');
                setExpanded(true);
                initializedRef.current = true;
            }
        }
    }, [recordId, recordDiscountType, recordDiscountValue, recordDiscountReason, formContext]);

    // Load tenant currency
    useEffect(() => {
        const currency = getCurrencyFromAuth();
        setTenantCurrency(currency);
    }, []);

    // Watch form values
    const watchedDiscountType = formContext?.watch('discount_type');
    const watchedDiscountValue = formContext?.watch('discount_value');
    const watchedDiscountReason = formContext?.watch('discount_reason');

    // Use watched values, falling back to record values during initial load
    const discountType = watchedDiscountType ?? recordDiscountType;
    const discountValue = watchedDiscountValue ?? recordDiscountValue;
    const discountReason = watchedDiscountReason ?? recordDiscountReason;

    // Calculate discount amount
    const calculateDiscountAmount = (subtotal: number, type: string | null, value: number | null): number => {
        if (!type || !value || value <= 0) return 0;
        
        if (type === DISCOUNT_TYPE_PERCENTAGE) {
            return Math.min((subtotal * value) / 100, subtotal);
        }
        if (type === DISCOUNT_TYPE_FIXED) {
            return Math.min(value, subtotal);
        }
        return 0;
    };

    const subtotal = totalAmount || parseFloat(String(tabRecord?.order?.subtotal)) || 0;
    const hasDiscount = discountType && discountValue && parseFloat(String(discountValue)) > 0;
    const calculatedDiscountAmount = hasDiscount 
        ? calculateDiscountAmount(subtotal, discountType, parseFloat(String(discountValue)))
        : 0;

    const handleClearDiscount = () => {
        if (formContext) {
            formContext.setValue('discount_type', null);
            formContext.setValue('discount_value', null);
            formContext.setValue('discount_reason', '');
        }
    };

    const formatCurrency = (amount: number) => {
        if (tenantCurrency) {
            return formatCurrencyWithTenant(amount, tenantCurrency);
        }
        return `$${amount.toFixed(2)}`;
    };

    if (!formContext) {
        return null;
    }

    return (
        <Paper 
            elevation={0} 
            sx={{ 
                p: 2, 
                mb: 2,
                border: '1px solid',
                borderColor: hasDiscount ? 'success.main' : 'divider',
                borderRadius: 2,
                bgcolor: hasDiscount ? 'success.lighter' : 'background.paper'
            }}
        >
            {/* Header - Always visible */}
            <Box 
                sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                }}
                onClick={() => setExpanded(!expanded)}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DiscountIcon color={hasDiscount ? 'success' : 'action'} />
                    <Typography variant="subtitle1" fontWeight="medium">
                        Descuento
                    </Typography>
                    {hasDiscount && (
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                color: 'success.main',
                                fontWeight: 'bold',
                                ml: 1
                            }}
                        >
                            -{formatCurrency(calculatedDiscountAmount)}
                            {discountType === DISCOUNT_TYPE_PERCENTAGE && ` (${discountValue}%)`}
                        </Typography>
                    )}
                </Box>
                <IconButton size="small">
                    {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
            </Box>

            {/* Collapsible Content */}
            <Collapse in={expanded}>
                <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        {/* Discount Type */}
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Tipo</InputLabel>
                            <Controller
                                name="discount_type"
                                control={formContext.control}
                                defaultValue={recordDiscountType || ''}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        label="Tipo"
                                        value={field.value || ''}
                                        onChange={(e) => {
                                            field.onChange(e.target.value || null);
                                        }}
                                    >
                                        <MenuItem value="">
                                            <em>Sin descuento</em>
                                        </MenuItem>
                                        <MenuItem value={DISCOUNT_TYPE_PERCENTAGE}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <PercentIcon fontSize="small" />
                                                Porcentaje
                                            </Box>
                                        </MenuItem>
                                        <MenuItem value={DISCOUNT_TYPE_FIXED}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <MoneyIcon fontSize="small" />
                                                Monto Fijo
                                            </Box>
                                        </MenuItem>
                                    </Select>
                                )}
                            />
                        </FormControl>

                        {/* Discount Value */}
                        <Controller
                            name="discount_value"
                            control={formContext.control}
                            defaultValue={recordDiscountValue ? parseFloat(String(recordDiscountValue)) : ''}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    size="small"
                                    label="Valor"
                                    type="number"
                                    disabled={!discountType}
                                    value={field.value || ''}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        field.onChange(val ? parseFloat(val) : null);
                                    }}
                                    sx={{ width: 120 }}
                                    InputProps={{
                                        startAdornment: discountType && (
                                            <InputAdornment position="start">
                                                {discountType === DISCOUNT_TYPE_PERCENTAGE ? '%' : '$'}
                                            </InputAdornment>
                                        ),
                                        inputProps: {
                                            min: 0,
                                            max: discountType === DISCOUNT_TYPE_PERCENTAGE ? 100 : subtotal,
                                            step: discountType === DISCOUNT_TYPE_PERCENTAGE ? 1 : 100
                                        }
                                    }}
                                />
                            )}
                        />

                        {/* Clear Button */}
                        {hasDiscount && (
                            <IconButton 
                                onClick={handleClearDiscount}
                                size="small"
                                color="error"
                                sx={{ alignSelf: 'center' }}
                            >
                                <ClearIcon />
                            </IconButton>
                        )}
                    </Box>

                    {/* Discount Reason */}
                    <Controller
                        name="discount_reason"
                        control={formContext.control}
                        defaultValue={recordDiscountReason || ''}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                size="small"
                                label="Razón del descuento (opcional)"
                                fullWidth
                                disabled={!discountType}
                                value={field.value || ''}
                                sx={{ mt: 2 }}
                                placeholder="Ej: Cortesía del chef, Cliente frecuente, Promoción..."
                            />
                        )}
                    />

                    {/* Discount Summary */}
                    {hasDiscount && (
                        <Box 
                            sx={{ 
                                mt: 2, 
                                p: 1.5, 
                                bgcolor: 'grey.100', 
                                borderRadius: 1,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <Typography variant="body2" color="text.secondary">
                                Descuento aplicado:
                            </Typography>
                            <Typography variant="body1" fontWeight="bold" color="success.main">
                                -{formatCurrency(calculatedDiscountAmount)}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Collapse>
        </Paper>
    );
};

export default DiscountSection;
