import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslate } from 'react-admin';
import { useFormContext } from 'react-hook-form';
import { useDashAutoAdminForm } from 'dash-auto-admin';
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
 * Now includes direct form submission through DashAutoAdminForm's onSave
 * This ensures the form goes through the full React-Admin pipeline:
 * - Form validation via react-hook-form
 * - beforeSubmit hooks (customer data injection)
 * - Data provider mutations
 * - Error handling via onError hooks
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

    // Get DashAutoAdminForm context for accessing the form's save handler
    const { onSave } = useDashAutoAdminForm();
    
    // Get form context for validation and getting form values
    const { handleSubmit, formState } = useFormContext();

    const [isSubmitting, setIsSubmitting] = React.useState(false);

    // Use a ref to track the latest handleSubmitOrder function
    const handleSubmitOrderRef = useRef<(() => Promise<void>) | null>(null);

    const handleClose = () => {
        setIsCartDrawerOpen(false);
    };

    /**
     * Handle order submission directly from the drawer
     * 
     * This function:
     * 1. Uses react-hook-form's handleSubmit to validate the form
     * 2. If validation passes, calls DashAutoAdminForm's onSave function
     * 3. The onSave function goes through the full pipeline:
     *    - beforeSubmit (injects customer_name and table_number)
     *    - dataProvider.create (API call)
     *    - onSubmit callback
     *    - onError if error (e.g., MISSING_SESSION_DATA triggers modal)
     */
    const handleSubmitOrder = useCallback(async () => {
        if (!onSave) {
            console.warn('Form save handler not available');
            return;
        }

        setIsSubmitting(true);

        try {
            // Use handleSubmit to validate form and call onSave with validated values
            // This ensures we go through the full React-Admin + DashAutoAdminForm pipeline
            await handleSubmit(async (values) => {
                if (onSave) {
                    await onSave(values);
                }
            })();
            
            // Close drawer after successful submission
            setIsCartDrawerOpen(false);
        } catch (error) {
            console.error('Error submitting order:', error);
            // Error handling is done by DashAutoAdminForm's onError hook
            // which will trigger the customer data modal if needed
        } finally {
            setIsSubmitting(false);
        }
    }, [handleSubmit, onSave, setIsCartDrawerOpen]);

    // Keep the ref updated with the latest handleSubmitOrder
    useEffect(() => {
        handleSubmitOrderRef.current = handleSubmitOrder;
    }, [handleSubmitOrder]);

    /**
     * Listen for 'order-data-saved' event dispatched by MallAppMediator
     * When customer data is saved, automatically retry the form submission
     * This provides a seamless UX: enter data → modal closes → order submits automatically
     */
    useEffect(() => {
        const handleOrderDataSaved = () => {
            console.log('Order data saved, retrying form submission...');
            // Use the ref to get the latest handleSubmitOrder function
            if (handleSubmitOrderRef.current) {
                handleSubmitOrderRef.current();
            }
        };

        window.addEventListener('order-data-saved', handleOrderDataSaved);

        return () => {
            window.removeEventListener('order-data-saved', handleOrderDataSaved);
        };
    }, []);

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
                        disabled={isSubmitting || formState.isSubmitting || cartItemCount === 0}
                        startIcon={isSubmitting || formState.isSubmitting ? <CircularProgress size={20} color="inherit" /> : <ShoppingCartCheckoutIcon />}
                        sx={{
                            py: 1.5,
                            borderRadius: 2,
                            fontWeight: 700,
                            fontSize: '1rem',
                            mb: 1.5,
                        }}
                    >
                        {isSubmitting || formState.isSubmitting
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