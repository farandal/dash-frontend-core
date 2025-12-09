import React from 'react';
import { useTranslate } from 'react-admin';
import { Box, Paper, Typography, IconButton, Badge, Button, Tooltip } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { KioskProvider, useKiosk } from '../contexts/KioskContext';
import { KioskCategoryNav } from './KioskCategoryNav';
import { KioskProductGrid } from './KioskProductGrid';
import { KioskModifierModal } from './KioskModifierModal';
import { KioskCartView } from './KioskCartView';
import { KioskConfirmationView } from './KioskConfirmationView';

interface KioskPageContentProps {
    isDarkMode?: boolean;
    onToggleDarkMode?: () => void;
}

const KioskPageContent: React.FC<KioskPageContentProps> = ({ isDarkMode, onToggleDarkMode }) => {
    const translate = useTranslate();
    const { 
        currentView, 
        cartItems,
        cartTotal,
        cartItemCount,
        clearCart,
        setCurrentView,
        formatPrice,
    } = useKiosk();

    // Render based on current view
    if (currentView === 'confirmation') {
        return <KioskConfirmationView />;
    }

    if (currentView === 'cart') {
        return <KioskCartView />;
    }

    // Menu view
    return (
        <Box
            sx={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                backgroundColor: 'background.default',
            }}
        >
            {/* Cart Header (replaces old header) */}
            <Paper
                elevation={3}
                sx={{
                    px: 2,
                    py: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderRadius: 0,
                    flexShrink: 0,
                    backgroundColor: 'grey.900',
                    color: 'white',
                }}
            >
                {/* Left side - Cart info */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Badge
                        badgeContent={cartItemCount}
                        color="primary"
                        sx={{
                            '& .MuiBadge-badge': {
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                minWidth: 20,
                                height: 20,
                            },
                        }}
                    >
                        <Box
                            sx={{
                                backgroundColor: 'primary.main',
                                borderRadius: '50%',
                                width: 40,
                                height: 40,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <ShoppingCartIcon fontSize="small" />
                        </Box>
                    </Badge>

                    <Box>
                        <Typography
                            variant="caption"
                            sx={{
                                textTransform: 'uppercase',
                                letterSpacing: 1,
                                opacity: 0.7,
                                fontSize: '0.65rem',
                            }}
                        >
                            {translate('kiosk.total')}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                            {formatPrice(cartTotal)}
                        </Typography>
                    </Box>
                </Box>

                {/* Right side - Actions */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {cartItems.length > 0 ? (
                        <>
                            <Tooltip title={translate('kiosk.clear_cart')}>
                                <IconButton
                                    onClick={clearCart}
                                    size="small"
                                    sx={{
                                        color: 'error.light',
                                        '&:hover': {
                                            backgroundColor: 'error.dark',
                                            color: 'white',
                                        },
                                    }}
                                >
                                    <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>

                            <Button
                                variant="contained"
                                size="medium"
                                onClick={() => setCurrentView('cart')}
                                endIcon={<ArrowForwardIcon />}
                                sx={{
                                    py: 1,
                                    px: 2,
                                    fontSize: '0.9rem',
                                    fontWeight: 700,
                                    borderRadius: 2,
                                }}
                            >
                                {translate('kiosk.view_order')}
                            </Button>
                        </>
                    ) : (
                        <Typography variant="body2" sx={{ opacity: 0.6 }}>
                            {translate('kiosk.add_items_to_start')}
                        </Typography>
                    )}
                </Box>
            </Paper>

            {/* Category Navigation */}
            <KioskCategoryNav />

            {/* Products Grid */}
            <Box
                sx={{
                    flexGrow: 1,
                    overflow: 'hidden',
                }}
            >
                <KioskProductGrid />
            </Box>

            {/* Modifier Modal */}
            <KioskModifierModal />
        </Box>
    );
};

interface KioskPageProps {
    isDarkMode?: boolean;
    onToggleDarkMode?: () => void;
}

export const KioskPage: React.FC<KioskPageProps> = (props) => {
    return (
        <KioskProvider>
            <KioskPageContent {...props} />
        </KioskProvider>
    );
};

export default KioskPage;
