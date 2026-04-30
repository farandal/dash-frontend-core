import React, { useState } from 'react';
import { 
    Box, 
    Typography, 
    List,
    Paper,
    Divider,
    Avatar,
    Card,
    CardContent,
    IconButton,
    Collapse,
    TextField,
    CircularProgress,
    Chip,
    Tooltip
} from '@mui/material';
import { 
    Delete as DeleteIcon, 
    Add as AddIcon, 
    Remove as RemoveIcon,
    Fastfood as FastfoodIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Psychology as AiIcon
} from '@mui/icons-material';
import { useTabManager } from '../contexts/TabManagerContext';
import { useTranslate } from 'react-admin';
import { formatPrice, getProductImage } from '../helpers/product';
import ProductModifiers from './ProductModifiers';


const OrderProductsList: React.FC = () => {
    const translate = useTranslate();
    const {
        orderProducts,
        totalAmount,
        handleOrderQuantityChange,
        handleOrderNoteChange,
        handleOrderModifierChange,
        removeOrderProduct
    } = useTabManager();

    const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});

    const toggleItemExpansion = (lineId: string) => {
        setExpandedItems(prev => ({
            ...prev,
            [lineId]: !prev[lineId]
        }));
    };

    const calculateItemTotal = (item: any) => {
        const basePrice = parseFloat(item.unit_price) || 0;
        const modifierAdjustments = (item.modifiers || []).reduce((sum: number, modifier: any) => {
            return sum + (parseFloat(modifier.price_adjustment) || 0);
        }, 0);
        
        return (basePrice + modifierAdjustments) * item.quantity;
    };

    if (orderProducts.length === 0) {
        return (
            <Box sx={{ p: 3, textAlign: 'center',}}>
                <Typography variant="body1" >
                    {translate('tab.order.no_products')}
                </Typography>
                <Typography variant="caption" >
                    {translate('tab.order.add_products_hint')}
                </Typography>
            </Box>
        );
    }

    return (
        <Paper sx={{ mb: 2 }}>
            
            <List sx={{ p: 0 }}>
                {orderProducts.map((item, index) => {
                    const isExpanded = expandedItems[item.line_id] ?? true;
                    const hasAiModifiers = item.modifiers?.some(mod => mod.ai_suggested);
                    
                    return (
                        <React.Fragment key={item.line_id}>
                            <Card 
                                sx={{ 
                                    m: 1,
                                    border: hasAiModifiers ? '2px solid' : '1px solid',
                                    borderColor: hasAiModifiers ? 'primary.main' : 'divider'
                                }}
                            >
                                <CardContent sx={{ p: 2 }}>
                                    {/* Header with name and controls */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="subtitle1" sx={{ flex: 1, fontWeight: 'bold' }}>
                                            {item.product.name}
                                        </Typography>
                                        {hasAiModifiers && (
                                            <Tooltip title={translate('tab.products.ai_modifiers')}>
                                                <Chip
                                                    icon={<AiIcon />}
                                                    label="IA"
                                                    size="small"
                                                    color="primary"
                                                    variant="outlined"
                                                    sx={{ mr: 1 }}
                                                />
                                            </Tooltip>
                                        )}
                                        <IconButton
                                            size="small"
                                            onClick={() => toggleItemExpansion(item.line_id)}
                                        >
                                            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                        </IconButton>
                                    </Box>

                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        {/* Product Image */}
                                        <Avatar
                                            src={getProductImage(item.product)}
                                            alt={item.product.name}
                                            sx={{ width: 80, height: 80, border: '2px solid', borderColor: 'divider' }}
                                        >
                                            {!getProductImage(item.product) && <FastfoodIcon />}
                                        </Avatar>

                                        {/* Content Column */}
                                        <Box sx={{ flex: 1 }}>
                                            {/* Quantity and Price Controls */}
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <IconButton 
                                                        onClick={() => handleOrderQuantityChange(item, item.quantity - 1)}
                                                        disabled={item.quantity <= 1}
                                                        size="small"
                                                    >
                                                        <RemoveIcon />
                                                    </IconButton>
                                                    <Typography variant="h6" sx={{ minWidth: 30, textAlign: 'center' }}>
                                                        {item.quantity}
                                                    </Typography>
                                                    <IconButton 
                                                        onClick={() => handleOrderQuantityChange(item, item.quantity + 1)}
                                                        size="small"
                                                    >
                                                        <AddIcon />
                                                    </IconButton>
                                                    <IconButton 
                                                        onClick={() => removeOrderProduct(item)}
                                                        size="small"
                                                        color="error"
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Box>
                                                <Typography variant="h6" color="primary">
                                                    {formatPrice(item.unit_price)}
                                                </Typography>
                                            </Box>

                                            {/* Expandable Content */}
                                            <Collapse in={isExpanded}>
                                                <Box sx={{ mt: 2 }}>
                                                    {/* Note Section */}
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        placeholder={translate('tab.order.note_placeholder')}
                                                        value={item.note || ''}
                                                        onChange={(e) => handleOrderNoteChange(item, e.target.value)}
                                                        multiline
                                                        rows={2}
                                                        sx={{ mb: 2 }}
                                                    />

                                                    {/* Modifiers Section */}
                                                    {item.product?.modifier_groups && item.product.modifier_groups.length > 0 && (
                                                        <Box sx={{ mb: 1 }}>
                                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                                {translate('tab.order.modifiers')}
                                                            </Typography>
                                                            <ProductModifiers
                                                                product={item}
                                                                productIndex={index}
                                                                modifiers={item.modifiers || []}
                                                                onModifierChange={(updatedModifiers) => handleOrderModifierChange(item, updatedModifiers)}
                                                            />
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Collapse>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </React.Fragment>
                    );
                })}
            </List>

            {/* Total Section */}
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">
                        {translate('tab.order.total')}:
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="primary">
                        {formatPrice(totalAmount)}
                    </Typography>
                </Box>
            </Box>
        </Paper>
    );
};

export default OrderProductsList;
