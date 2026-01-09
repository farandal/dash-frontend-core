import React, { useCallback, useState } from 'react';
import { useTranslate } from 'react-admin';
import { useFormContext } from 'react-hook-form';
import { 
    Box, 
    Drawer, 
    Typography, 
    Button, 
    IconButton,
    Paper,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import { useDashAutoAdminForm } from 'dash-auto-admin';

import { useSelfServiceOrderCreate } from '../contexts/SelfServiceOrderCreateContext';
import SelfServiceCartItemsList from './SelfServiceCartItemsList';

const SelfServiceOrderSummaryDrawer: React.FC = () => {
    const translate = useTranslate();
    const {
        cartItems,
        cartTotal,
        cartItemCount,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        clearCart,
        formatPrice
    } = useSelfServiceOrderCreate();

    const { onSave } = useDashAutoAdminForm();
    const { handleSubmit } = useFormContext();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);

    const handleClose = useCallback(() => setIsCartDrawerOpen(false), [setIsCartDrawerOpen]);

    const handleSubmitOrder = useCallback(async () => {
        if (!onSave) {
            console.warn('Form save handler not available');
            return;
        }

        setIsSubmitting(true);
        try {
            // Validate form and submit
            await handleSubmit(async (values) => {
                 // Inject cart items into the form values if needed
                 // Assuming separate state sync logic or backend processing
                 // But typically we should inject `products` array here from cartItems
                 // For now, let's assume the backend or a hook processes the cart state
                 
                 // Ideally we should map cartItems to the API structure and put it in 'products'
                 const productsPayload = cartItems.map(item => ({
                     product_id: item.product.id,
                     quantity: item.quantity,
                     note: item.note,
                     modifiers: Object.entries(item.selectedModifiers).flatMap(([groupId, optIds]) => 
                        optIds.map(optId => ({ modifier_option_id: optId }))
                     )
                 }));
                 values.products = productsPayload;

                 await onSave(values);
                 setShowSuccessDialog(true);
                 clearCart();
            })();
        } catch (error) {
            console.error('Error submitting order', error);
        } finally {
            setIsSubmitting(false);
        }
    }, [handleSubmit, onSave, cartItems, clearCart, handleClose]);

    return (
        <>
        <Drawer
            anchor="right"
            open={isCartDrawerOpen}
            onClose={handleClose}
            PaperProps={{ sx: { width: { xs: '100%', sm: 400 }, maxWidth: '100vw' } }}
        >
            {/* Header */}
            <Box sx={{ 
                p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                bgcolor: 'primary.main', color: 'primary.contrastText' 
            }}>
                <Typography variant="h6" fontWeight={700}>
                    {translate('mall.your_order')} ({cartItemCount})
                </Typography>
                <IconButton onClick={handleClose} sx={{ color: 'inherit' }}>
                    <CloseIcon />
                </IconButton>
            </Box>

            {/* List */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
                <SelfServiceCartItemsList />
                {cartItems.length > 0 && (
                     <Box sx={{ p: 2, pt: 0 }}>
                         <Button 
                            color="error" 
                            size="small" 
                            startIcon={<DeleteOutlineIcon />} onClick={clearCart}
                        >
                            {translate('mall.clear_cart')}
                        </Button>
                     </Box>
                )}
            </Box>

            {/* Footer */}
            {cartItems.length > 0 && (
                <Paper elevation={8} sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight={500}>
                            {translate('mall.total')}
                        </Typography>
                        <Typography variant="h5" fontWeight={700} color="primary.main">
                            {formatPrice(cartTotal)}
                        </Typography>
                    </Box>

                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={handleSubmitOrder}
                        disabled={isSubmitting}
                        startIcon={isSubmitting ? <CircularProgress size={20} /> : <ShoppingCartCheckoutIcon />}
                        sx={{ mb: 1.5, py: 1.5, fontWeight: 'bold' }}
                    >
                        {isSubmitting ? translate('mall.submitting_order') : translate('mall.submit_order')}
                    </Button>
                     
                    <Button fullWidth variant="outlined" size="large" onClick={handleClose}>
                        {translate('mall.continue_shopping')}
                    </Button>
                </Paper>
            )}
        </Drawer>
        
        {/* Success Dialog */}
        <Dialog 
            open={showSuccessDialog} 
            onClose={() => setShowSuccessDialog(false)}
            maxWidth="xs"
            fullWidth
        >
            <DialogTitle sx={{ textAlign: 'center', pb: 0 }}>
                <Typography variant="h5" fontWeight="bold">
                    {translate('tab.products.message.created_success')}
                </Typography>
            </DialogTitle>
            <DialogContent sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body1" color="text.secondary">
                    {translate('mall.session.order_status.created_text')}
                </Typography>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button 
                    variant="contained" 
                    onClick={() => {
                        setShowSuccessDialog(false);
                        handleClose();
                    }}
                    sx={{ px: 4, py: 1, borderRadius: 2, fontWeight: 'bold' }}
                >
                    {translate('ra.action.close')}
                </Button>
            </DialogActions>
        </Dialog>
        </>
    );
};

export default SelfServiceOrderSummaryDrawer;
