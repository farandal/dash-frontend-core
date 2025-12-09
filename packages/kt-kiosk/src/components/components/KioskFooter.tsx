import React from 'react';
import { Box, Paper, Typography, Button, Badge, IconButton, Tooltip } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useKiosk } from '../contexts/KioskContext';

export const KioskFooter: React.FC = () => {
    const {
        cartItems,
        cartTotal,
        cartItemCount,
        clearCart,
        setCurrentView,
        formatPrice,
    } = useKiosk();

    return (
        <Paper
            elevation={8}
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 100,
                backgroundColor: 'grey.900',
                color: 'white',
                px: 3,
                py: 2,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    maxWidth: 1200,
                    mx: 'auto',
                }}
            >
                {/* Left side - Cart info */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Badge
                        badgeContent={cartItemCount}
                        color="primary"
                        sx={{
                            '& .MuiBadge-badge': {
                                fontSize: '0.875rem',
                                fontWeight: 700,
                                minWidth: 24,
                                height: 24,
                            },
                        }}
                    >
                        <Box
                            sx={{
                                backgroundColor: 'primary.main',
                                borderRadius: '50%',
                                width: 48,
                                height: 48,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <ShoppingCartIcon />
                        </Box>
                    </Badge>

                    <Box>
                        <Typography
                            variant="caption"
                            sx={{
                                textTransform: 'uppercase',
                                letterSpacing: 1,
                                opacity: 0.7,
                            }}
                        >
                            Total
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                            {formatPrice(cartTotal)}
                        </Typography>
                    </Box>
                </Box>

                {/* Right side - Actions */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {cartItems.length > 0 ? (
                        <>
                            <Tooltip title="Clear Cart">
                                <IconButton
                                    onClick={clearCart}
                                    sx={{
                                        color: 'error.light',
                                        '&:hover': {
                                            backgroundColor: 'error.dark',
                                            color: 'white',
                                        },
                                    }}
                                >
                                    <DeleteOutlineIcon />
                                </IconButton>
                            </Tooltip>

                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => setCurrentView('cart')}
                                endIcon={<ArrowForwardIcon />}
                                sx={{
                                    py: 1.5,
                                    px: 4,
                                    fontSize: '1.1rem',
                                    fontWeight: 700,
                                    borderRadius: 2,
                                }}
                            >
                                View Order
                            </Button>
                        </>
                    ) : (
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                opacity: 0.6,
                            }}
                        >
                            <ShoppingCartIcon fontSize="small" />
                            <Typography variant="body2">
                                Add items to start your order
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </Paper>
    );
};

export default KioskFooter;
