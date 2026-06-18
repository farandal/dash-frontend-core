
import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import { Loading, useGetOne } from "react-admin";
import { useEffect, useState } from 'react';

import { CardMedia, ListItem, List, Typography, Box, Grid, Card } from "@mui/material";
import { ITab } from "../interfaces/ITab";

import { priceFormatter } from "dash-utils";
import { PLACEHOLDER_IMAGE, getCurrencyFromAuth, getDefaultServiceFeeFromAuth } from "../tab2/utils";
import { ImagePlaceHolder } from "kt-utils";

const placeholder = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="

const calculateServiceFee = (totalAmount: number, servicePercentage: number): number => {
    return (totalAmount * servicePercentage) / 100;
};

const formatCurrencyWithTenant = (amount: number, currency: any): string => {
    const currencyCode = currency?.code || 'CLP';
    return priceFormatter(amount, currencyCode);
};

/**
 * Component to display order products in view mode
 * Shows product details including image, name, quantity, notes, modifiers
 * Calculates and displays prices including modifiers and service charge
 * @param record - The tab record containing order details
 * @returns JSX element displaying the order products view
 */

export const OrderProductsView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ record,tabsResource }) => {
    const tab: ITab = record as ITab;
    const [tenantCurrency, setTenantCurrency] = useState<any>(null);
    const [defaultServiceFeePercentage, setDefaultServiceFeePercentage] = useState<number>(10);

    const { data: tabData } = useGetOne(tabsResource || 'tab/tab', { id: tab.id });

    useEffect(() => {
        const currency = getCurrencyFromAuth();
        const defaultServiceFee = getDefaultServiceFeeFromAuth();
        setTenantCurrency(currency);
        setDefaultServiceFeePercentage(defaultServiceFee || 10);
    }, []);

    const calculateModifierTotal = (modifiers) => {
        if (!modifiers || !Array.isArray(modifiers)) return 0;
        return modifiers.reduce((total, modifier) => {
            return total + (parseFloat(modifier.price_adjustment) || 0);
        }, 0);
    };

    // Calculate totals
    const subtotal = parseFloat(tab.order?.total_amount || "0");
    
    // Calculate discount
    const discountAmount = tab.order?.discount_type && tab.order?.discount_value 
        ? (tab.order.discount_type === 'percentage' 
            ? (subtotal * parseFloat(String(tab.order.discount_value))) / 100
            : parseFloat(String(tab.order.discount_value)))
        : 0;
    const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount);
    
    const serviceFee = calculateServiceFee(subtotalAfterDiscount, defaultServiceFeePercentage);
    const finalTotal = subtotalAfterDiscount + serviceFee;

    return (
        <Box>
            <List>
                {tabData?.order?.items?.map((item, index) => (
                    <ListItem key={`${item.id || item.line_id || index}`} disableGutters sx={{ p: 0, mb: 1 }} >
                        <Card sx={{ width: '100%' }}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={2}>
                                    <CardMedia
                                        sx={{ maxWidth: 80, maxHeight: 80, height: 80 }}
                                    >
                                        <ImagePlaceHolder
                                            loading={<Loading />}
                                            placeHolder={placeholder}
                                            src={item.product.image_url}
                                        />
                                    </CardMedia>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography className="print_text" variant="h6">{item.product.name}</Typography>
                                    <Typography className="print_text" variant="body2" color="text.secondary">
                                        Cantidad: {item.quantity}
                                    </Typography>
                                    {item.note && (
                                        <Typography className="print_text" variant="body2" color="text.secondary">
                                            Nota: {item.note}
                                        </Typography>
                                    )}
                                    {item.modifiers && item.modifiers.length > 0 && (
                                        <Box sx={{ mt: 1 }}>
                                            <Typography variant="subtitle2">Modificadores:</Typography>
                                            <List dense>
                                                {item.modifiers.map((modifier, modIndex) => (
                                                    <ListItem key={modIndex} sx={{ py: 0 }}>
                                                        <Typography variant="body2">
                                                            {modifier.modifier_option?.name || `Opción ${modIndex + 1}`}
                                                            {modifier.price_adjustment !== 0 &&
                                                                ` (${modifier.price_adjustment > 0 ? '+' : ''}${formatCurrencyWithTenant(parseFloat(modifier.price_adjustment), tenantCurrency)})`
                                                            }
                                                        </Typography>
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Box>
                                    )}
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography className="print_text" variant="h6" align="right">
                                        {formatCurrencyWithTenant((parseFloat(item.unit_price || "0") + calculateModifierTotal(item.modifiers)) * item.quantity, tenantCurrency)}
                                    </Typography>
                                    <Typography className="print_text" variant="body2" color="text.secondary" align="right">
                                        {formatCurrencyWithTenant(parseFloat(item.unit_price || "0"), tenantCurrency)} + {formatCurrencyWithTenant(calculateModifierTotal(item.modifiers), tenantCurrency)}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Card>
                    </ListItem>
                ))}
            </List>
            <Box sx={{ mt: 2, p: 2, borderTop: 1, borderColor: 'divider' }}>
                <Typography className="print_text" variant="h5" align="right">
                    SubTotal: {formatCurrencyWithTenant(subtotal, tenantCurrency)}
                </Typography>
                {/* Discount Display */}
                {tab.order?.discount_type && tab.order?.discount_value && parseFloat(String(tab.order.discount_value)) > 0 && (
                    <Typography className="print_text" variant="body1" color="success.main" align="right">
                        Descuento
                        {tab.order.discount_type === 'percentage' && ` (${tab.order.discount_value}%)`}
                        : -{formatCurrencyWithTenant(
                            tab.order.discount_type === 'percentage' 
                                ? (subtotal * parseFloat(String(tab.order.discount_value))) / 100
                                : parseFloat(String(tab.order.discount_value)),
                            tenantCurrency
                        )}
                    </Typography>
                )}
                <Typography className="print_text" variant="body1" color="text.secondary" align="right">
                    Servicio sugerido ({defaultServiceFeePercentage}%): {formatCurrencyWithTenant(serviceFee, tenantCurrency)}
                </Typography>
                <Typography className="print_text" variant="h5" align="right">
                    Total: {formatCurrencyWithTenant(finalTotal, tenantCurrency)}
                </Typography>
            </Box>
        </Box>
    );
}

export default OrderProductsView;
