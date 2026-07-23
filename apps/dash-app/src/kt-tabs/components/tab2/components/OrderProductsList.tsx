import React from 'react';
import { 
    Box, 
    Typography, 
    List, 
    Paper, 
    Chip 
} from '@mui/material';
import { 
    ShoppingCart as CartIcon, 
    Psychology as AiIcon 
} from '@mui/icons-material';
import { useTabManager } from '../../contexts/TabManagerContext';
import { useTranslate } from 'react-admin';
import { formatPrice } from '../../tab/helpers/product';
import ProductListItem from './ProductListItem';

// Simplified props - only UI customization options
interface OrderProductsListProps {
    showImage?: boolean;
    disabled?: boolean;
}

const OrderProductsList: React.FC<OrderProductsListProps> = ({
    showImage = true,
    disabled = false
}) => {
    const translate = useTranslate();
    const {
        orderProducts,
        handleOrderQuantityChange,
        handleOrderNoteChange,
        removeOrderProduct,
        handleOrderModifierChange // Get this from context instead of props
    } = useTabManager();

    const calculateItemTotal = (item: any) => {
        const basePrice = parseFloat(item.unit_price) || 0;
        const modifierAdjustments = (item.modifiers || []).reduce((sum: number, modifier: any) => {
            return sum + (parseFloat(modifier.price_adjustment) || 0);
        }, 0);
        return (basePrice + modifierAdjustments) * item.quantity;
    };

    const aiEnhancedCount = orderProducts.filter(product => 
        product.modifiers?.some(mod => mod.ai_suggested)
    ).length;

    if (orderProducts.length === 0) {
        return (
            <Box  sx={{ p: 4, textAlign: 'center' }}>
                <CartIcon sx={{ fontSize: 48,  mb: 2 }} />
                <Typography variant="h6"  gutterBottom>
                    {translate('tab.order.no_products')}
                </Typography>
                <Typography variant="body2" >
                    {translate('tab.order.add_products_hint')}
                </Typography>
            </Box>
        );
    }

    return (
        <>
            <Box sx={{ p: 2 }}>
                {aiEnhancedCount > 0 && (
                    <Chip
                        icon={<AiIcon />}
                        label={`${aiEnhancedCount} con IA`}
                        size="small"
                        color="primary"
                        variant="outlined"
                    />
                )}
            </Box>
            
            {/* Products list */}
            <List sx={{ p: 0 }}>
                {orderProducts.map((product, index) => (
                    <ProductListItem
                        key={product.line_id || `${product.product_id}-${index}`}
                        product={product}
                        index={index}
                        showImage={showImage}
                        disabled={disabled}
                    />
                ))}
            </List>
        </>
    );
};

export default OrderProductsList;
 