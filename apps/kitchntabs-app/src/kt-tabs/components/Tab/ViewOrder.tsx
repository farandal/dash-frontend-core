import React, { useEffect, useState } from "react";
import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import { useShowContext, useTranslate } from "react-admin";

import { 
    CardContent, 
    ListItem, 
    List, 
    Typography, 
    Box, 
    Card, 
    Avatar, 
    Chip,
    Divider,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    CircularProgress,
    Paper
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ReceiptIcon from "@mui/icons-material/Receipt";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PaymentIcon from "@mui/icons-material/Payment";
import InfoIcon from "@mui/icons-material/Info";
import StoreIcon from "@mui/icons-material/Store";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import { ITab } from "../interfaces/ITab";
import { ImagePlaceHolder as ImagePlaceHolder } from 'kt-utils';
import { formatCurrencyWithTenant, getCurrencyFromAuth, calculateItemTotal } from '../tab2/utils';
import { MuiSimpleJsonTable as MUISimpleJsonTable } from "kt-ecommerce";

const PLACEHOLDER_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

// Helper function to get product image URL from gallery
const getProductImageUrl = (product: any): string => {
    if (!product) return '';
    
    // If product has gallery with images
    if (product.gallery?.images && product.gallery.images.length > 0) {
        // Try to find primary image first
        const primaryImageId = product.gallery.primary_image_id;
        if (primaryImageId) {
            const primaryImage = product.gallery.images.find((img: any) => img.id === primaryImageId);
            if (primaryImage) {
                return primaryImage.preview || primaryImage.medium || primaryImage.original || '';
            }
        }
        // Fallback to first image
        const firstImage = product.gallery.images[0];
        return firstImage.preview || firstImage.medium || firstImage.original || '';
    }
    
    return '';
};

// Status chip colors
const statusColors: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
    'CREATED': 'default',
    'CONFIRMED': 'info',
    'IN_PREPARATION': 'warning',
    'PREPARED': 'primary',
    'DELIVERED': 'success',
    'CLOSED': 'secondary',
    'CANCELLED': 'error'
};



const ViewOrder: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute, resourceConfig, locale }) => {
    const { record: tab, isPending } = useShowContext<ITab>();
    const translate = useTranslate();
    const [tenantCurrency, setTenantCurrency] = useState<any>(null);

    useEffect(() => {
        const currency = getCurrencyFromAuth();
        setTenantCurrency(currency);
    }, []);

    // Function to calculate modifier total for an item
    const calculateModifierTotal = (modifiers: any[]) => {
        if (!modifiers || !Array.isArray(modifiers)) return 0;
        return modifiers.reduce((total, modifier) => {
            return total + (parseFloat(modifier.price_adjustment) || 0);
        }, 0);
    };

    // Format date helper
    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return '-';
        // Use the passed locale or fallback to 'es-ES'
        const dateLocale = locale || 'es-ES';
        return new Date(dateString).toLocaleString(dateLocale, { 
            day: '2-digit', 
            month: '2-digit', 
            year: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    // Show loading state
    if (isPending) {
        return (
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    // Handle missing record
    if (!tab) {
        return (
            <Box sx={{ p: 2 }}>
                <Typography color="text.secondary">{translate('tab.view_order.no_data')}</Typography>
            </Box>
        );
    }

    const order = tab.order;
    const marketplaceInfo = order?.marketplace_info;

    return (
        <Box sx={{ p: 0 }}>
            {/* Header Card - Tab Info */}
            <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant="h5" gutterBottom>
                            {translate('tab.view_order.title', { id: String(tab.id).slice(-6) })}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <AccessTimeIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                                {formatDate(tab.created_at)}
                            </Typography>
                        </Box>
                        {tab.delivery_method_localized && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LocalShippingIcon fontSize="small" color="action" />
                                <Typography variant="body2" color="text.secondary">
                                    {tab.delivery_method_localized}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Chip 
                            label={tab.status_localized || translate(`tab.status.${tab.status.toLowerCase()}`)}
                            color={statusColors[tab.status] || 'default'}
                            sx={{ mb: 1 }}
                        />
                        <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
                            {formatCurrencyWithTenant(order?.total_amount || 0, tenantCurrency)}
                        </Typography>
                        {order?.is_paid && (
                            <Chip label={translate('tab.view_order.paid')} color="success" size="small" sx={{ mt: 1 }} />
                        )}
                    </Box>
                </Box>
            </Paper>

            {/* Products List */}
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ReceiptIcon /> {translate('tab.view_order.products_title')} ({order?.items?.length || 0})
            </Typography>

            {order?.items && order.items.length > 0 ? (
                <List disablePadding>
                    {order.items.map((item, index) => {
                        const itemSubtotal = parseFloat(item.unit_price || "0") * item.quantity;
                        const modifierTotal = calculateModifierTotal(item.modifiers) * item.quantity;
                        const itemTotal = itemSubtotal + modifierTotal;

                        return (
                            <ListItem key={item.id || index} sx={{ px: 0, py: 1 }}>
                                <Card sx={{ width: '100%' }} variant="outlined">
                                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            {/* Product Image */}
                                            <Avatar 
                                                variant="rounded"
                                                sx={{ 
                                                    width: 72, 
                                                    height: 72, 
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                    bgcolor: 'background.default'
                                                }}
                                            >
                                                <ImagePlaceHolder
                                                    loading={<CircularProgress size={20} />}
                                                    placeHolder={PLACEHOLDER_IMAGE}
                                                    src={getProductImageUrl(item.product)}
                                                />
                                            </Avatar>

                                            {/* Product Details */}
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                        {item.quantity}x {item.product?.name || item.product_name || translate('tab.view_order.product_default')}
                                                    </Typography>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main', whiteSpace: 'nowrap', ml: 1 }}>
                                                        {formatCurrencyWithTenant(itemTotal, tenantCurrency)}
                                                    </Typography>
                                                </Box>

                                                <Typography variant="body2" color="text.secondary">
                                                    {formatCurrencyWithTenant(item.unit_price, tenantCurrency)} {translate('tab.view_order.unit_price_suffix')}
                                                </Typography>

                                                {/* Note */}
                                                {item.note && (
                                                    <Typography variant="body2" sx={{ fontStyle: 'italic', mt: 1, color: 'warning.main' }}>
                                                        📝 {item.note}
                                                    </Typography>
                                                )}

                                                {/* Modifiers */}
                                                {item.modifiers && item.modifiers.length > 0 && (
                                                    <Box sx={{ mt: 1 }}>
                                                        {item.modifiers.map((modifier, modIndex) => (
                                                            <Box key={modIndex} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    + {modifier.modifier_option?.name || `${translate('tab.view_order.option_default')} ${modIndex + 1}`}
                                                                </Typography>
                                                                {parseFloat(modifier.price_adjustment) !== 0 && (
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        {parseFloat(modifier.price_adjustment) > 0 ? '+' : ''}
                                                                        {formatCurrencyWithTenant(modifier.price_adjustment, tenantCurrency)}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        ))}
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </ListItem>
                        );
                    })}
                </List>
            ) : (
                <Typography color="text.secondary" sx={{ py: 2 }}>{translate('tab.view_order.no_data')}</Typography>
            )}

            {/* Order Summary */}
            {order && (
                <Paper elevation={0} sx={{ p: 2, mt: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body1">{translate('tab.view_order.subtotal')}</Typography>
                        <Typography variant="body1">{formatCurrencyWithTenant(order.subtotal, tenantCurrency)}</Typography>
                    </Box>
                    {order.discount_amount && parseFloat(String(order.discount_amount)) > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body1" color="error.main">
                                {translate('tab.view_order.discount')} {order.discount_type === 'percentage' ? `(${order.discount_value}%)` : ''}
                            </Typography>
                            <Typography variant="body1" color="error.main">
                                -{formatCurrencyWithTenant(order.discount_amount, tenantCurrency)}
                            </Typography>
                        </Box>
                    )}
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{translate('tab.view_order.total')}</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            {formatCurrencyWithTenant(order.total_amount, tenantCurrency)}
                        </Typography>
                    </Box>
                </Paper>
            )}

            {/* Tab Note */}
            {tab.note && (
                <Paper elevation={0} sx={{ p: 2, mt: 2, bgcolor: 'warning.light', borderRadius: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>{translate('tab.view_order.order_note')}</Typography>
                    <Typography variant="body1">{tab.note}</Typography>
                </Paper>
            )}

            {/* Additional Information Accordions */}
            <Box sx={{ mt: 3 }}>
                {/* Marketplace Info */}
                {marketplaceInfo && (
                    <Accordion defaultExpanded={false}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <StoreIcon />
                                <Typography>{translate('tab.view_order.marketplace_info', { name: marketplaceInfo.name })}</Typography>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                {marketplaceInfo.system_marketplace?.icon_url && (
                                    <Avatar src={marketplaceInfo.system_marketplace.icon_url} alt={marketplaceInfo.name} />
                                )}
                                <Box>
                                    <Typography variant="body1"><strong>{translate('tab.view_order.type')}</strong> {marketplaceInfo.type}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {marketplaceInfo.system_marketplace?.name}
                                    </Typography>
                                </Box>
                            </Box>
                            {order?.data && (
                                <MUISimpleJsonTable tableData={order.data} showKey vertical={true} />
                            )}
                        </AccordionDetails>
                    </Accordion>
                )}

                {/* Payment Info */}
                {order && (
                    <Accordion defaultExpanded={false}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PaymentIcon />
                                <Typography>{translate('tab.view_order.payment_info')}</Typography>
                                {order.is_paid && <Chip label={translate('tab.view_order.paid')} color="success" size="small" sx={{ ml: 1 }} />}
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography><strong>{translate('tab.view_order.payment_status')}</strong> {order.is_paid ? translate('tab.view_order.paid') : translate('tab.view_order.pending')}</Typography>
                            <Typography><strong>{translate('tab.view_order.broker_status')}</strong> {order.broker_status || '-'}</Typography>
                            {order.billing_path && (
                                <Typography>
                                    <strong>{translate('tab.view_order.receipt')}</strong> <a href={order.billing_path} target="_blank" rel="noopener noreferrer">{translate('tab.view_order.view_document')}</a>
                                </Typography>
                            )}
                            {order.tax_document_path && (
                                <Typography>
                                    <strong>{translate('tab.view_order.invoice')}</strong> <a href={order.tax_document_path} target="_blank" rel="noopener noreferrer">{translate('tab.view_order.view_document')}</a>
                                </Typography>
                            )}
                        </AccordionDetails>
                    </Accordion>
                )}

                {/* Timestamps */}
                <Accordion defaultExpanded={false}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <InfoIcon />
                            <Typography>{translate('tab.view_order.dates_times')}</Typography>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 1, rowGap: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">{translate('tab.view_order.created_at')}</Typography>
                            <Typography variant="body2">{formatDate(tab.date_created)}</Typography>
                            
                            {tab.date_confirmed && (
                                <>
                                    <Typography variant="body2" color="text.secondary">{translate('tab.view_order.confirmed_at')}</Typography>
                                    <Typography variant="body2">{formatDate(tab.date_confirmed)}</Typography>
                                </>
                            )}
                            {tab.date_in_preparation && (
                                <>
                                    <Typography variant="body2" color="text.secondary">{translate('tab.view_order.preparing_at')}</Typography>
                                    <Typography variant="body2">{formatDate(tab.date_in_preparation)}</Typography>
                                </>
                            )}
                            {tab.date_prepared && (
                                <>
                                    <Typography variant="body2" color="text.secondary">{translate('tab.view_order.prepared_at')}</Typography>
                                    <Typography variant="body2">{formatDate(tab.date_prepared)}</Typography>
                                </>
                            )}
                            {tab.date_delivered && (
                                <>
                                    <Typography variant="body2" color="text.secondary">{translate('tab.view_order.delivered_at')}</Typography>
                                    <Typography variant="body2">{formatDate(tab.date_delivered)}</Typography>
                                </>
                            )}
                            {tab.date_closed && (
                                <>
                                    <Typography variant="body2" color="text.secondary">{translate('tab.view_order.closed_at')}</Typography>
                                    <Typography variant="body2">{formatDate(tab.date_closed)}</Typography>
                                </>
                            )}
                            {tab.date_cancelled && (
                                <>
                                    <Typography variant="body2" color="text.secondary">{translate('tab.view_order.cancelled_at')}</Typography>
                                    <Typography variant="body2">{formatDate(tab.date_cancelled)}</Typography>
                                </>
                            )}
                        </Box>
                    </AccordionDetails>
                </Accordion>

                {/* Tenant Info */}
                {tab.tenant && (
                    <Accordion defaultExpanded={false}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <StoreIcon />
                                <Typography>{translate('tab.view_order.tenant_info')}</Typography>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography><strong>{translate('tab.view_order.name')}</strong> {tab.tenant.public_name || tab.tenant.name}</Typography>
                            {tab.tenant.address && <Typography><strong>{translate('tab.view_order.address')}</strong> {tab.tenant.address}</Typography>}
                            {tab.tenant.phone && <Typography><strong>{translate('tab.view_order.phone')}</strong> {tab.tenant.phone}</Typography>}
                            {tab.tenant.contact_email && <Typography><strong>{translate('tab.view_order.email')}</strong> {tab.tenant.contact_email}</Typography>}
                        </AccordionDetails>
                    </Accordion>
                )}
            </Box>
        </Box>
    );
};

export default ViewOrder;
