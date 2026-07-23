/**
 * SelfServiceCart.tsx
 * 
 * Cart summary and checkout component for self-service kiosk.
 */
import React, { useState } from 'react';
import { useTranslate } from 'react-admin';
import {
    Box,
    Typography,
    IconButton,
    Button,
    Paper,
    Drawer,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Divider,
    Badge,
    TextField,
    CircularProgress,
    Fab,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { useSelfServiceOrderCreate } from '../contexts/SelfServiceOrderCreateContext';

// ============================================================================
// CART FAB (Floating Action Button)
// ============================================================================

interface CartFabProps {
    onClick: () => void;
}

export const CartFab: React.FC<CartFabProps> = ({ onClick }) => {
    const { cartItemCount, cartTotal, formatPrice } = useSelfServiceOrderCreate();
    
    if (cartItemCount === 0) return null;
    
    return (
        <Fab
            color="primary"
            onClick={onClick}
            sx={{
                position: 'fixed',
                bottom: 16,
                right: 16,
                zIndex: 1000,
            }}
        >
            <Badge badgeContent={cartItemCount} color="error">
                <ShoppingCartIcon />
            </Badge>
        </Fab>
    );
};

// ============================================================================
// CART DRAWER
// ============================================================================

interface CartDrawerProps {
    open: boolean;
    onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ open, onClose }) => {
    const {
        cartItems,
        cartTotal,
        cartItemCount,
        removeFromCart,
        updateQuantity,
        formatPrice,
        isSubmittingOrder,
        submitOrder,
        clearCart,
    } = useSelfServiceOrderCreate();
    const translate = useTranslate();
    
    const [customerName, setCustomerName] = useState('');
    const [tableNumber, setTableNumber] = useState('');
    const [orderSuccess, setOrderSuccess] = useState(false);
    
    const handleSubmitOrder = async () => {
        try {
            await submitOrder(customerName, tableNumber);
            setOrderSuccess(true);
            // Reset form
            setCustomerName('');
            setTableNumber('');
        } catch (error) {
            // Error handled in context
        }
    };
    
    const handleClose = () => {
        setOrderSuccess(false);
        onClose();
    };
    
    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={handleClose}
            PaperProps={{
                sx: {
                    width: { xs: '100%', sm: 400 },
                    maxWidth: '100vw',
                },
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: 1,
                    borderColor: 'divider',
                }}
            >
                <Typography variant="h6">
                    {translate('kiosk.your_cart', { defaultValue: 'Your Cart' })}
                    {cartItemCount > 0 && ` (${cartItemCount})`}
                </Typography>
                <IconButton onClick={handleClose}>
                    <CloseIcon />
                </IconButton>
            </Box>
            
            {/* Success Message */}
            {orderSuccess ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h5" color="success.main" gutterBottom>
                        🎉 {translate('kiosk.order_success', { defaultValue: 'Order Placed!' })}
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                        {translate('kiosk.order_success_message', { 
                            defaultValue: 'Your order has been sent to the kitchen.' 
                        })}
                    </Typography>
                    <Button variant="contained" onClick={handleClose}>
                        {translate('kiosk.continue_ordering', { defaultValue: 'Continue Ordering' })}
                    </Button>
                </Box>
            ) : cartItems.length === 0 ? (
                // Empty Cart
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <ShoppingCartIcon sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
                    <Typography color="text.secondary">
                        {translate('kiosk.cart_empty', { defaultValue: 'Your cart is empty' })}
                    </Typography>
                </Box>
            ) : (
                <>
                    {/* Cart Items */}
                    <List sx={{ flexGrow: 1, overflow: 'auto' }}>
                        {cartItems.map((item) => (
                            <React.Fragment key={item.uniqueId}>
                                <ListItem sx={{ py: 2 }}>
                                    <ListItemText
                                        primary={item.product.name}
                                        secondary={
                                            <Box component="span">
                                                <Typography variant="body2" component="span">
                                                    {formatPrice(item.lineTotal)} × {item.quantity}
                                                </Typography>
                                                {item.note && (
                                                    <Typography
                                                        variant="caption"
                                                        display="block"
                                                        color="text.secondary"
                                                    >
                                                        Note: {item.note}
                                                    </Typography>
                                                )}
                                            </Box>
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <IconButton
                                                size="small"
                                                onClick={() => updateQuantity(item.uniqueId, item.quantity - 1)}
                                            >
                                                <RemoveIcon fontSize="small" />
                                            </IconButton>
                                            <Typography sx={{ minWidth: 24, textAlign: 'center' }}>
                                                {item.quantity}
                                            </Typography>
                                            <IconButton
                                                size="small"
                                                onClick={() => updateQuantity(item.uniqueId, item.quantity + 1)}
                                            >
                                                <AddIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => removeFromCart(item.uniqueId)}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </ListItemSecondaryAction>
                                </ListItem>
                                <Divider />
                            </React.Fragment>
                        ))}
                    </List>
                    
                    {/* Order Form */}
                    <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                        <TextField
                            fullWidth
                            label={translate('kiosk.your_name', { defaultValue: 'Your Name (optional)' })}
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            sx={{ mb: 2 }}
                            size="small"
                        />
                        <TextField
                            fullWidth
                            label={translate('kiosk.table_number', { defaultValue: 'Table Number (optional)' })}
                            value={tableNumber}
                            onChange={(e) => setTableNumber(e.target.value)}
                            sx={{ mb: 2 }}
                            size="small"
                        />
                    </Box>
                    
                    {/* Footer with Total and Checkout */}
                    <Paper
                        elevation={4}
                        sx={{
                            p: 2,
                            mt: 'auto',
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6">
                                {translate('kiosk.total', { defaultValue: 'Total' })}
                            </Typography>
                            <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                                {formatPrice(cartTotal)}
                            </Typography>
                        </Box>
                        
                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={isSubmittingOrder}
                            onClick={handleSubmitOrder}
                        >
                            {isSubmittingOrder ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                translate('kiosk.place_order', { defaultValue: 'Place Order' })
                            )}
                        </Button>
                        
                        <Button
                            fullWidth
                            variant="text"
                            color="error"
                            onClick={clearCart}
                            sx={{ mt: 1 }}
                            disabled={isSubmittingOrder}
                        >
                            {translate('kiosk.clear_cart', { defaultValue: 'Clear Cart' })}
                        </Button>
                    </Paper>
                </>
            )}
        </Drawer>
    );
};

// ============================================================================
// COMBINED CART COMPONENT
// ============================================================================

const SelfServiceCart: React.FC = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    
    return (
        <>
            <CartFab onClick={() => setIsDrawerOpen(true)} />
            <CartDrawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
        </>
    );
};

export default SelfServiceCart;
