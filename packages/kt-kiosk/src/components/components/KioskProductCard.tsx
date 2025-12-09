import React, { useRef } from 'react';
import { useTranslate } from 'react-admin';
import { Box, Card, Typography, IconButton, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { IKioskProduct } from '../interfaces/IKiosk';
import { useKiosk } from '../contexts/KioskContext';

interface KioskProductCardProps {
    product: IKioskProduct;
}

export const KioskProductCard: React.FC<KioskProductCardProps> = ({ product }) => {
    const translate = useTranslate();
    const { openModifierModal, addToCart, formatPrice } = useKiosk();
    
    // Track drag to prevent click after dragging
    const startPosRef = useRef({ x: 0, y: 0 });
    const wasDraggingRef = useRef(false);

    const handleAddToCart = () => {
        if (product.has_modifiers && product.modifiers?.length) {
            openModifierModal(product);
        } else {
            addToCart(product, {});
        }
    };

    const handleButtonClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        handleAddToCart();
    };

    // Track mouse/touch start position
    const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        startPosRef.current = { x: clientX, y: clientY };
        wasDraggingRef.current = false;
    };

    // Check if moved enough to be considered a drag
    const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const dx = Math.abs(clientX - startPosRef.current.x);
        const dy = Math.abs(clientY - startPosRef.current.y);
        if (dx > 10 || dy > 10) {
            wasDraggingRef.current = true;
        }
    };

    // Handle click only if not dragging
    const handleCardClick = () => {
        if (!wasDraggingRef.current) {
            handleAddToCart();
        }
    };

    return (
        <Card
            onClick={handleCardClick}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'transform 0.15s ease',
                '&:hover': {
                    transform: 'scale(1.02)',
                },
                '&:active': {
                    transform: 'scale(0.98)',
                },
            }}
        >
            {/* Full Card Background Image */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'grey.300',
                }}
            >
                {product.image ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                ) : (
                    <Box
                        sx={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <RestaurantIcon sx={{ fontSize: 64, opacity: 0.2, color: 'grey.500' }} />
                    </Box>
                )}
            </Box>

            {/* Gradient Overlay for text readability */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.6) 100%)',
                }}
            />

            {/* Content Overlay - Top Section */}
            <Box
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    p: 1.5,
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* Product Name - Top */}
                <Typography
                    variant="subtitle2"
                    component="h3"
                    sx={{
                        fontWeight: 700,
                        lineHeight: 1.2,
                        color: 'white',
                        textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                    }}
                >
                    {product.name}
                </Typography>

                {/* Spacer */}
                <Box sx={{ flex: 1 }} />

                {/* Price and Add Button - Bottom */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 800,
                            color: 'white',
                            textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                        }}
                    >
                        {formatPrice(product.price)}
                    </Typography>

                    <IconButton
                        size="medium"
                        onClick={handleButtonClick}
                        sx={{
                            backgroundColor: 'primary.main',
                            color: 'primary.contrastText',
                            '&:hover': {
                                backgroundColor: 'primary.dark',
                                transform: 'scale(1.1)',
                            },
                            '&:active': {
                                transform: 'scale(0.95)',
                            },
                            width: 40,
                            height: 40,
                            boxShadow: 2,
                            transition: 'all 0.15s ease',
                        }}
                    >
                        <AddIcon />
                    </IconButton>
                </Box>
            </Box>

            {/* Modifiers indicator */}
            {product.has_modifiers && (
                <Chip
                    label={translate('kiosk.customizable')}
                    size="small"
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        fontSize: '0.65rem',
                        height: 18,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        color: 'text.primary',
                        fontWeight: 600,
                        zIndex: 2,
                    }}
                />
            )}
        </Card>
    );
};

export default KioskProductCard;
