import React from 'react';
import { useTranslate } from 'react-admin';
import { 
    Box, 
    Drawer, 
    Typography, 
    Button, 
    IconButton,
    Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useMallOrderCreate } from '../contexts/MallOrderCreateContext';
import { MallCartItemsList } from './MallCartItemsList';

/**
 * MallOrderSummaryDrawer - Drawer showing full cart details
 * Uses reusable MallCartItemsList component for DRY code
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

    const handleClose = () => {
        setIsCartDrawerOpen(false);
    };

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

                    {/* Close button to continue shopping or use form submit */}
                    <Button
                        fullWidth
                        variant="outlined"
                        size="large"
                        onClick={handleClose}
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