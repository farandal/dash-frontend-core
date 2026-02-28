import React, { useState, useEffect } from 'react';
import {
    CardContent,
    ListItem,
    IconButton,
    Typography,
    Box,
    Card,
    TextField,
    CircularProgress,
    Avatar,
    Chip,
    Collapse,
    Tooltip
} from '@mui/material';
import {
    Add as AddIcon,
    Remove as RemoveIcon,
    Delete as DeleteIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Psychology as AiIcon,
    AutoAwesome as AutoAddedIcon
} from '@mui/icons-material';
import { ImagePlaceHolder as ImagePlaceHolder } from 'kt-utils';
import ProductModifiers from './ProductModifiers';
import { useTabManager } from '../../contexts/TabManagerContext';
import { calculateItemTotal, formatCurrencyWithTenant, getCurrencyFromAuth, safeParseInt } from '../utils';


// Simplified props - only product data and UI customization
interface ProductListItemProps {
    product: any;
    index: number;
    showImage?: boolean;
    disabled?: boolean;
}

const PLACEHOLDER_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

const ProductListItem: React.FC<ProductListItemProps> = ({
    product,
    index,
    showImage = true,
    disabled = false
}) => {
    // Get functions from TabManager context
    const {
        handleOrderQuantityChange,
        removeOrderProduct,
        handleOrderNoteChange,
        handleOrderModifierChange
    } = useTabManager();

    const [showDetails, setShowDetails] = useState(true);
    const [tenantCurrency, setTenantCurrency] = useState<any>(null);
    
    const itemTotal = calculateItemTotal(product);
    const hasAiModifiers = product.modifiers?.some(mod => mod.ai_suggested);
    const isAutoAdded = !!product.auto_added;
    const currentQuantity = safeParseInt(product.quantity, 1);

    useEffect(() => {
        const currency = getCurrencyFromAuth();
        setTenantCurrency(currency);
    }, []);

    return (
        <ListItem sx={{ p: 0, mb: 1 }}>
            <Card 
                className="dash-tab-edit-item" 
                sx={{ 
                    width: '100%', 
                    m: 0,
                    opacity: disabled ? 0.6 : 1,
                    border: isAutoAdded ? '2px solid' : hasAiModifiers ? '2px solid' : '1px solid',
                    borderColor: isAutoAdded ? 'warning.main' : hasAiModifiers ? 'primary.main' : 'divider'
                }}
            >
                <CardContent sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    m: 0, 
                    p: 1, 
                    '&:last-child': { pb: 1 } 
                }}>
                    {/* Header with AI indicator */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body1" sx={{ flex: 1 }}>
                            <b>{product.product?.name || 'Producto sin nombre o eliminado'}</b>
                        </Typography>
                        {isAutoAdded && (
                            <Tooltip title="Agregado automáticamente por IA">
                                <Chip
                                    icon={<AutoAddedIcon />}
                                    label="Auto IA"
                                    size="small"
                                    color="warning"
                                    variant="outlined"
                                    sx={{ mr: 1 }}
                                />
                            </Tooltip>
                        )}
                        {hasAiModifiers && (
                            <Tooltip title="Modificadores sugeridos por IA">
                                <Chip
                                    icon={<AiIcon />}
                                    label="IA"
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                />
                            </Tooltip>
                        )}
                        <IconButton
                            size="small"
                            onClick={() => setShowDetails(!showDetails)}
                            sx={{ ml: 1 }}
                        >
                            {showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        {/* Image block */}
                        {showImage && (
                            <Avatar sx={{ width: 80, height: 80, border: '2px solid', borderColor: 'divider' }}>
                                <ImagePlaceHolder
                                    loading={<CircularProgress size={20} />}
                                    placeHolder={PLACEHOLDER_IMAGE}
                                    src={product.product?.gallery?.primary_image_url || product.product?.image_url || ''}
                                />
                            </Avatar>
                        )}

                        {/* Content column */}
                        <Box sx={{ flex: 1 }}>
                            {/* Quantity and price row */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <IconButton 
                                        onClick={() => handleOrderQuantityChange(product, currentQuantity - 1)}
                                        disabled={disabled || currentQuantity <= 1}
                                        size="small"
                                    >
                                        <RemoveIcon />
                                    </IconButton>
                                    <Typography variant="h6" sx={{ minWidth: 30, textAlign: 'center' }}>
                                        {currentQuantity}
                                    </Typography>
                                    <IconButton 
                                        onClick={() => handleOrderQuantityChange(product, currentQuantity + 1)}
                                        disabled={disabled}
                                        size="small"
                                    >
                                        <AddIcon />
                                    </IconButton>
                                    <IconButton 
                                        onClick={() => removeOrderProduct(product)}
                                        disabled={disabled}
                                        size="small"
                                        color="error"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                                <Typography variant="h6" color="primary">
                                    {formatCurrencyWithTenant(itemTotal, tenantCurrency)}
                                </Typography>
                            </Box>

                            {/* Expandable details */}
                            <Collapse in={showDetails}>
                                <Box sx={{ mt: 1 }}>
                                    {/* Note section */}
                                    <Box sx={{ mb: 2 }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            placeholder="Agregar nota (opcional)"
                                            variant="outlined"
                                            value={product.note || ''}
                                            onChange={(e) => handleOrderNoteChange(product, e.target.value)}
                                            disabled={disabled}
                                            multiline
                                            rows={2}
                                        />
                                        {product.note && (
                                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mt: 1 }}>
                                                {product.note}
                                            </Typography>
                                        )}
                                    </Box>
                                    {/* Modifiers section */}
                                    {product.product?.modifier_groups && product.product.modifier_groups.length > 0 && (
                                        <Box sx={{ mb: 1 }}>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                Modificadores
                                            </Typography>
                                            <ProductModifiers
                                                product={product}
                                                productIndex={index}
                                                modifiers={product.modifiers || []}
                                                onModifierChange={(updatedModifiers) => handleOrderModifierChange(product, updatedModifiers)}
                                                disabled={disabled}
                                            />
                                        </Box>
                                    )}

                                    {/* AI Modifier Summary */}
                                    {isAutoAdded && (
                                        <Box sx={{ mt: 1, p: 1, bgcolor: 'warning.light', borderRadius: 1, opacity: 0.7 }}>
                                            <Typography variant="caption" color="warning.dark">
                                                <AutoAddedIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                                                Producto agregado automáticamente por IA
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Collapse>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </ListItem>
    );
};

export default ProductListItem;
