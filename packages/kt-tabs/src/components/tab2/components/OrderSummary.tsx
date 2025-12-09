import React, { useEffect, useState } from 'react';
import { 
    Box, 
    Typography, 
    Paper, 
    Divider, 
    Chip
} from '@mui/material';
import { 
    Receipt as ReceiptIcon, 
    Discount as DiscountIcon
} from '@mui/icons-material';
import { OrderSummaryProps } from '../types';
import { formatCurrencyWithTenant, getCurrencyFromAuth, getDefaultServiceFeeFromAuth, calculateServiceFee } from '../utils';
import { useTabManager } from '../../contexts/TabManagerContext';
import { useFormContext, useWatch } from 'react-hook-form';

interface ExtendedOrderSummaryProps extends Omit<OrderSummaryProps, 'totalAmount'> {
    showDiscount?: boolean;
}

const OrderSummary: React.FC<ExtendedOrderSummaryProps> = ({ 
    enableServiceFee = true,
    showServiceFee = true,
    showDiscount = true
}) => {
    const { totalAmount } = useTabManager();
    const formContext = useFormContext();
    
    const [tenantCurrency, setTenantCurrency] = useState<any>(null);
    const [defaultServiceFeePercentage, setDefaultServiceFeePercentage] = useState<number>(0);
    
    // Watch discount values from form (these are set by DiscountSection)
    const discountType = formContext ? useWatch({ control: formContext.control, name: 'discount_type' }) : null;
    const discountValue = formContext ? useWatch({ control: formContext.control, name: 'discount_value' }) : null;
    
    // Calculate discount amount
    const calculateDiscountAmount = (subtotal: number, type: string | null, value: number | null): number => {
        if (!type || !value || value <= 0) return 0;
        
        if (type === 'percentage') {
            return Math.min((subtotal * value) / 100, subtotal);
        }
        if (type === 'fixed') {
            return Math.min(value, subtotal);
        }
        return 0;
    };
    
    // Calculate amounts
    const hasDiscount = discountType && discountValue && parseFloat(String(discountValue)) > 0;
    const subtotalBeforeDiscount = totalAmount || 0;
    const discountAmount = hasDiscount 
        ? calculateDiscountAmount(subtotalBeforeDiscount, discountType, parseFloat(String(discountValue)))
        : 0;
    const subtotalAfterDiscount = Math.max(0, subtotalBeforeDiscount - discountAmount);
    
    const serviceFee = showServiceFee ? calculateServiceFee(subtotalAfterDiscount, defaultServiceFeePercentage) : 0;
    const finalTotal = enableServiceFee ? subtotalAfterDiscount + serviceFee : subtotalAfterDiscount;

    useEffect(() => {
        const currency = getCurrencyFromAuth();
        const defaultServiceFee = getDefaultServiceFeeFromAuth();
        setTenantCurrency(currency);
        setDefaultServiceFeePercentage(defaultServiceFee || 10);
    }, []);

    return (
        <Paper elevation={2} sx={{ p: 2, mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ReceiptIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" color="primary">
                    Resumen de la Orden
                </Typography>
                {tenantCurrency && (
                    <Chip 
                        label={tenantCurrency.code} 
                        size="small" 
                        variant="outlined" 
                        sx={{ ml: 1 }}
                    />
                )}
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            {/* Subtotal */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">
                    Subtotal:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                    {formatCurrencyWithTenant(subtotalBeforeDiscount, tenantCurrency)}
                </Typography>
            </Box>

            {/* Discount Display (if applied) */}
            {showDiscount && hasDiscount && (
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    mb: 1,
                    py: 0.5,
                    px: 1,
                    borderRadius: 1,
                    backgroundColor: 'success.light'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <DiscountIcon color="success" fontSize="small" />
                        <Typography variant="body2" color="success.dark">
                            Descuento
                            {discountType === 'percentage' && ` (${discountValue}%)`}:
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="success.dark" fontWeight="medium">
                        -{formatCurrencyWithTenant(discountAmount, tenantCurrency)}
                    </Typography>
                </Box>
            )}
            
            {/* Service Fee */}
            {enableServiceFee && showServiceFee && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2">
                        Servicio sugerido ({defaultServiceFeePercentage}%):
                    </Typography>
                    <Typography variant="body2">
                        {formatCurrencyWithTenant(serviceFee, tenantCurrency)}
                    </Typography>
                </Box>
            )}
            
            {/* Total */}
            <Divider sx={{ mb: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" color="primary">
                    Total:
                </Typography>
                <Typography variant="h6" color="primary" fontWeight="bold">
                    {formatCurrencyWithTenant(finalTotal, tenantCurrency)}
                </Typography>
            </Box>

            {/* Currency info */}
            {tenantCurrency && (
                <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary">
                        Moneda: {tenantCurrency.code} ({tenantCurrency.symbol})
                    </Typography>
                </Box>
            )}
        </Paper>
    );
};

export default OrderSummary;

