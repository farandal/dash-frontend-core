import React, { useCallback } from 'react';
import { useTranslate, useSaveContext } from 'react-admin';
import { useFormContext } from 'react-hook-form';
import { 
    Box, 
    Drawer, 
    Typography, 
    Button, 
    IconButton,
    Paper,
    CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import { useMallOrderCreate } from '../contexts/MallOrderCreateContext';
import { MallCartItemsList } from './MallCartItemsList';

/**
 * MallOrderSummaryDrawer - Drawer showing full cart details
 * Uses reusable MallCartItemsList component for DRY code
 * 
 * Now includes direct form submission via React-Admin's useSaveContext
 */
export const MallOrderSummaryDrawer: React.FC = () => {
    const translate = useTranslate();
    const {
        cartItems,
        cartTotal,
        cartItemCount,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        clearCart,
        formatPrice,
    } = useMallOrderCreate();

    // Get React-Admin save context for form submission
    const saveContext = useSaveContext();
    
    // Get form context for getting current form values
    const formContext = useFormContext();

    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleClose = () => {
        setIsCartDrawerOpen(false);
    };

    /**
     * Handle order submission directly from the drawer
     * Uses React-Admin's save function from useSaveContext
     */
    const handleSubmitOrder = useCallback(async () => {
        if (!saveContext?.save || !formContext) {
            console.warn('Save context or form context not available');
            return;
        }

        // Disable button while submitting
        setIsSubmitting(true);

        try {
            // Get current form values
            const formValues = formContext.getValues();
            
            // Trigger form submission through React-Admin's save
            // The save function will handle beforeSubmit hooks and validation
            await saveContext.save(formValues);
            
            // Close drawer after successful submission
            setIsCartDrawerOpen(false);
        } catch (error) {
            console.error('Error submitting order:', error);
            // Error handling is done by React-Admin and resource config
        } finally {
            setIsSubmitting(false);
        }
    }, [saveContext, formContext, setIsCartDrawerOpen]);

    return (
        <Drawer
            className="kt-mall-order-summary-drawer"
            anchor="right"
            open={isCartDrawerOpen}
            onClose={handleClose}
            PaperProps={{
                sx: {
                    width: { xs: '100%', sm: 400 },
                    maxWidth: '100vw',
                    background: 'background',
                },
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                    borderBottom: 1,
                    borderColor: 'divider',
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                }}
            >
                <Typography variant="h6" fontWeight={700}>
                    {translate('mall.your_order')}
                    {cartItemCount > 0 && (
                        <Typography component="span" variant="body2" sx={{ ml: 1, opacity: 0.8 }}>
                            ({cartItemCount} {cartItemCount === 1 ? translate('mall.item') : translate('mall.items')})
                        </Typography>
                    )}
                </Typography>
                <IconButton
                    onClick={handleClose}
                    sx={{ color: 'primary.contrastText' }}
                >
                    <CloseIcon />
                </IconButton>
            </Box>

            {/* Cart content - using reusable MallCartItemsList */}
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                <MallCartItemsList 
                    showStoreHeaders={true}
                    showEmptyState={true}
                    showClearButton={false}
                />
                
                {/* Clear cart button */}
                {cartItems.length > 0 && (
                    <Box sx={{ p: 2, pt: 0 }}>
                        <Button
                            fullWidth
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={clearCart}
                            startIcon={<DeleteOutlineIcon />}
                            sx={{ borderRadius: 2 }}
                        >
                            {translate('mall.clear_cart')}
                        </Button>
                    </Box>
                )}
            </Box>

            {/* Footer with total */}
            {cartItems.length > 0 && (
                <Paper
                    elevation={8}
                    sx={{
                        p: 2,
                        borderTop: 1,
                        borderColor: 'divider',
                    }}
                >
                    {/* Total */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 2,
                        }}
                    >
                        <Typography variant="subtitle1" fontWeight={500}>
                            {translate('mall.total')}
                        </Typography>
                        <Typography variant="h5" fontWeight={700} color="primary.main">
                            {formatPrice(cartTotal)}
                        </Typography>
                    </Box>

                    {/* Submit Order Button - Primary action */}
                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={handleSubmitOrder}
                        disabled={isSubmitting || cartItemCount === 0}
                        startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <ShoppingCartCheckoutIcon />}
                        sx={{
                            py: 1.5,
                            borderRadius: 2,
                            fontWeight: 700,
                            fontSize: '1rem',
                            mb: 1.5,
                        }}
                    >
                        {isSubmitting 
                            ? translate('mall.submitting_order') 
                            : translate('mall.submit_order')
                        }
                    </Button>

                    {/* Continue shopping button - Secondary action */}
                    <Button
                        fullWidth
                        variant="outlined"
                        size="large"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        sx={{
                            py: 1.5,
                            borderRadius: 2,
                            fontWeight: 700,
                            fontSize: '1rem',
                        }}
                    >
                        {translate('mall.continue_shopping')}
                    </Button>
                </Paper>
            )}
        </Drawer>
    );
};

export default MallOrderSummaryDrawer;