import React from 'react';
import { useTranslate } from 'react-admin';
import { 
    Box, 
    Typography, 
    Button, 
    Badge, 
    Paper,
    Chip,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useMallOrderCreate } from '../contexts/MallOrderCreateContext';

/**
 * MallCartSummary - Header block showing cart summary and button to open drawer
 */
export const MallCartSummary: React.FC = () => {
    const translate = useTranslate();
    const {
        cartItems,
        cartTotal,
        cartItemCount,
        formatPrice,
        setIsCartDrawerOpen,
        stores,
    } = useMallOrderCreate();

    // Get unique tenant IDs from cart items
    const uniqueTenantIds = new Set(cartItems.map(item => item.product.tenant_id));
    const uniqueStoresCount = uniqueTenantIds.size;

    // Get store names for the chips
    const getStoreName = (tenantId: number) => {
        const store = stores.find(s => s.id === tenantId);
        return store?.name || `Store ${tenantId}`;
    };

    const handleOpenCart = () => {
        setIsCartDrawerOpen(true);
    };

    if (cartItems.length === 0) {
        return (
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                    //backgroundColor: 'grey.100',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                }}
            >
                <ShoppingCartIcon sx={{ opacity: 0.4, color: 'grey.500' }} />
                <Typography variant="body2" color="text.secondary">
                    {translate('mall.cart_empty')}
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper
            className="kt-mall-cart-summary"
            elevation={3}
            onClick={handleOpenCart}
            sx={{
                p: 2,
                mb: 2,
                borderRadius: 2,
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                cursor: 'pointer',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                '&:hover': {
                    transform: 'scale(1.01)',
                    boxShadow: 6,
                },
                '&:active': {
                    transform: 'scale(0.99)',
                },
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                {/* Left side - Cart icon with badge */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Badge 
                        badgeContent={cartItemCount} 
                        color="error"
                        sx={{
                            '& .MuiBadge-badge': {
                                fontWeight: 700,
                                fontSize: '0.75rem',
                            },
                        }}
                    >
                        <ShoppingCartIcon sx={{ fontSize: 32 }} />
                    </Badge>
                    
                    <Box>
                        <Typography variant="subtitle1" fontWeight={700}>
                            {translate('mall.view_cart')}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.85 }}>
                            {cartItemCount} {cartItemCount === 1 
                                ? translate('mall.item') 
                                : translate('mall.items')}
                            {uniqueStoresCount > 1 && (
                                <span> • {uniqueStoresCount} {translate('mall.stores')}</span>
                            )}
                        </Typography>
                    </Box>
                </Box>

                {/* Right side - Total and arrow */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" fontWeight={700}>
                            {formatPrice(cartTotal)}
                        </Typography>
                    </Box>
                    <ExpandMoreIcon 
                        sx={{ 
                            fontSize: 28, 
                            transform: 'rotate(-90deg)',
                            opacity: 0.7,
                        }} 
                    />
                </Box>
            </Box>

            {/* Store chips */}
            {uniqueStoresCount > 1 && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.5 }}>
                    {Array.from(uniqueTenantIds).map((tenantId) => (
                        <Chip
                            key={tenantId}
                            label={getStoreName(tenantId)}
                            size="small"
                            sx={{
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                color: 'primary.contrastText',
                                fontWeight: 600,
                                fontSize: '0.7rem',
                            }}
                        />
                    ))}
                </Box>
            )}
        </Paper>
    );
};

/**
 * MallCartFloatingButton - Fixed floating cart button for mobile view
 */
export const MallCartFloatingButton: React.FC = () => {
    const translate = useTranslate();
    const {
        cartItems,
        cartTotal,
        cartItemCount,
        formatPrice,
        setIsCartDrawerOpen,
    } = useMallOrderCreate();

    const handleOpenCart = () => {
        setIsCartDrawerOpen(true);
    };

    if (cartItems.length === 0) {
        return null;
    }

    return (
        <Box
            sx={{
                position: 'fixed',
                bottom: 16,
                left: 16,
                right: 16,
                zIndex: 1200,
                display: { xs: 'block', md: 'none' },
            }}
        >
            <Button
                fullWidth
                variant="contained"
                onClick={handleOpenCart}
                sx={{
                    py: 2,
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    display: 'flex',
                    justifyContent: 'space-between',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Badge badgeContent={cartItemCount} color="error">
                        <ShoppingCartIcon />
                    </Badge>
                    <Typography fontWeight={600}>
                        {translate('mall.view_cart')}
                    </Typography>
                </Box>
                <Typography fontWeight={700}>
                    {formatPrice(cartTotal)}
                </Typography>
            </Button>
        </Box>
    );
};

export default MallCartSummary;
