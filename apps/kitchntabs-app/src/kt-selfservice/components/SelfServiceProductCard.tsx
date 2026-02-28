import React, { useRef } from 'react';
import { useTranslate } from 'react-admin';
import { 
    Box, 
    Typography, 
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Button,
    IconButton,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import StarIcon from '@mui/icons-material/Star';
import TuneIcon from '@mui/icons-material/Tune';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { useSelfServiceOrderCreate, ISelfServiceProduct } from '../contexts/SelfServiceOrderCreateContext';

interface SelfServiceProductCardProps {
    product: ISelfServiceProduct;
}

const SelfServiceProductCard: React.FC<SelfServiceProductCardProps> = ({ product }) => {
    const translate = useTranslate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { addToCart, openModifierModal, formatPrice } = useSelfServiceOrderCreate();
    
    const startPosRef = useRef({ x: 0, y: 0 });
    const wasDraggingRef = useRef(false);

    const handleAddToCart = () => {
        if (product.modifier_groups && product.modifier_groups.length > 0) {
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

    const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        startPosRef.current = { x: clientX, y: clientY };
        wasDraggingRef.current = false;
    };

    const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const dx = Math.abs(clientX - startPosRef.current.x);
        const dy = Math.abs(clientY - startPosRef.current.y);
        if (dx > 10 || dy > 10) {
            wasDraggingRef.current = true;
        }
    };

    const handleCardClick = () => {
        if (!wasDraggingRef.current) {
            handleAddToCart();
        }
    };

    // Get primary image
    const imageUrl = product.gallery?.primary_image_url || 
                     (product.primary_image) || 
                     null;

    // Price
    const price = product.prices?.[0]?.price || '0';
    
    // Check if product has modifiers
    const hasModifiers = product.modifier_groups && product.modifier_groups.length > 0;

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                borderRadius: 2,
                overflow: 'hidden',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[4],
                    cursor: 'pointer',
                },
                bgcolor: 'background.paper',
            }}
            onClick={handleCardClick}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
        >
            {/* Badges */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    zIndex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5,
                }}
            >
                {product.featured && (
                    <Box sx={{ 
                        bgcolor: 'warning.main', 
                        color: 'warning.contrastText',
                        p: 0.5, 
                        borderRadius: 1,
                        display: 'flex'
                    }}>
                        <StarIcon fontSize="small" />
                    </Box>
                )}
                
                {hasModifiers && (
                    <Box sx={{ 
                        bgcolor: 'info.main', 
                        color: 'info.contrastText',
                        p: 0.5, 
                        borderRadius: 1,
                        display: 'flex'
                    }}>
                        <TuneIcon fontSize="small" />
                    </Box>
                )}
            </Box>

            {/* Image Container */}
            <Box sx={{ position: 'relative', pt: '75%', bgcolor: 'grey.100' }}>
                {imageUrl ? (
                    <CardMedia
                        component="img"
                        image={imageUrl}
                        alt={product.name}
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                    />
                ) : (
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'grey.400'
                    }}>
                        <RestaurantIcon sx={{ fontSize: 48 }} />
                    </Box>
                )}
                
                {/* Gradient overlay */}
                <Box sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '40%',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.05), transparent)',
                    pointerEvents: 'none',
                }} />
            </Box>

            {/* Content */}
            <CardContent sx={{ flexGrow: 1, p: 1.5, pb: 0 }}>
                {/* Price */}
                <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    color="primary"
                >
                    {formatPrice(price)}
                </Typography>
                
                {/* Product name */}
                <Typography
                    variant="subtitle2"
                    component="h3"
                    sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: 1.2,
                        minHeight: '2.4em',
                        mb: 0.5
                    }}
                >
                    {product.name}
                </Typography>
                
                {/* Description */}
                {product.description && (
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            lineHeight: 1.3,
                        }}
                    >
                        {product.description}
                    </Typography>
                )}
            </CardContent>

            {/* Add button */}
            <CardActions sx={{ p: 1.5, pt: 1 }}>
                {isMobile ? (
                    <IconButton
                        color="primary"
                        onClick={handleButtonClick}
                        sx={{
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            '&:hover': {
                                bgcolor: 'primary.dark',
                            },
                            width: 36,
                            height: 36,
                            ml: 'auto'
                        }}
                    >
                        <AddIcon fontSize="small" />
                    </IconButton>
                ) : (
                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleButtonClick}
                        size="small"
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600
                        }}
                    >
                        {translate('ra.action.add') || 'Add'}
                    </Button>
                )}
            </CardActions>
        </Card>
    );
};

export default SelfServiceProductCard;
