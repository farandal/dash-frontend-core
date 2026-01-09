import React, { useState, useEffect } from 'react';
import { useTranslate } from 'react-admin';
import { 
    Box, 
    Typography, 
    IconButton,
    List,
    Card,
    CardContent,
    useMediaQuery,
    useTheme,
    TextField,
    Collapse
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import { useSelfServiceOrderCreate, ISelfServiceCartItem } from '../contexts/SelfServiceOrderCreateContext';

// ----------------------------------------------------------------------
// CartItem
// ----------------------------------------------------------------------

interface CartItemProps {
    item: ISelfServiceCartItem;
    isExpanded: boolean;
    onToggleExpand: () => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, isExpanded, onToggleExpand }) => {
    const { updateQuantity, formatPrice, editCartItem } = useSelfServiceOrderCreate();
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const [note, setNote] = useState(item.note || '');

    // Format modifiers for display
    const modifierDisplay = Object.entries(item.selectedModifiers).map(([groupId, optionIds]) => {
        const group = item.product.modifier_groups?.find(g => g.id === Number(groupId));
        if (!group) return null;
        return optionIds.map(optId => {
            const opt = group.options?.find(o => o.id === optId);
            return opt?.name;
        }).filter(Boolean).join(', ');
    }).filter(Boolean).join('; ');

    const imageUrl = item.product.gallery?.primary_image_url || item.product.primary_image;

    return (
        <Card sx={{ mb: 1, border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: isSmallScreen ? 1 : 2, '&:last-child': { pb: isSmallScreen ? 1 : 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {/* Image */}
                    {imageUrl && (
                        <Box 
                            component="img" 
                            src={imageUrl} 
                            sx={{ 
                                width: 60, height: 60, objectFit: 'cover', borderRadius: 1,
                                display: { xs: 'none', sm: 'block' }
                            }}
                        />
                    )}
                    
                    {/* Details */}
                    <Box sx={{ flex: 1, overflow: 'hidden' }}>
                        <Typography variant="subtitle2" fontWeight="bold" noWrap>
                            {item.product.name}
                        </Typography>
                        {modifierDisplay && (
                            <Typography variant="caption" color="text.secondary" display="block" noWrap>
                                {modifierDisplay}
                            </Typography>
                        )}
                         
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
                            {/* Qty Controls */}
                            <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'grey.100', borderRadius: 1 }}>
                                <IconButton size="small" onClick={() => updateQuantity(item.uniqueId, item.quantity - 1)}>
                                    <RemoveIcon fontSize="small" />
                                </IconButton>
                                <Typography variant="body2" sx={{ minWidth: 20, textAlign: 'center', fontWeight: 'bold' }}>
                                    {item.quantity}
                                </Typography>
                                <IconButton size="small" onClick={() => updateQuantity(item.uniqueId, item.quantity + 1)}>
                                    <AddIcon fontSize="small" />
                                </IconButton>
                            </Box>
                            
                            {/* Price */}
                            <Typography variant="body2" fontWeight="bold" color="primary.main">
                                {formatPrice(item.lineTotal * item.quantity)}
                            </Typography>
                        </Box>
                    </Box>

                     {/* Edit Button - opens modifier modal for editing */}
                     <IconButton size="small" onClick={() => editCartItem(item)} color="primary">
                        <EditIcon fontSize="small" />
                    </IconButton>

                     {/* Delete Button */}
                     <IconButton size="small" onClick={() => updateQuantity(item.uniqueId, 0)} color="error">
                        <DeleteOutlineIcon fontSize="small" />
                    </IconButton>

                     {/* Expand Button for Notes */}
                     <IconButton size="small" onClick={onToggleExpand}>
                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                </Box>

                {/* Expanded Note Section */}
                <Collapse in={isExpanded}>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Special instructions..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            // In a real app we'd update context on blur
                            // onBlur={() => updateCartItem(item.uniqueId, { ...item, note })} 
                        />
                    </Box>
                </Collapse>
            </CardContent>
        </Card>
    );
};

// ----------------------------------------------------------------------
// SelfServiceCartItemsList
// ----------------------------------------------------------------------

const SelfServiceCartItemsList: React.FC = () => {
    const { cartItems } = useSelfServiceOrderCreate();
    const translate = useTranslate();
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const handleToggle = (id: string) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    if (cartItems.length === 0) {
        return (
            <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                <Typography variant="h4" sx={{ mb: 1, opacity: 0.5 }}>🛒</Typography>
                <Typography>{translate('mall.cart_empty')}</Typography>
            </Box>
        );
    }

    return (
        <List disablePadding>
            {cartItems.map(item => (
                <CartItem 
                    key={item.uniqueId} 
                    item={item} 
                    isExpanded={!!expanded[item.uniqueId]} 
                    onToggleExpand={() => handleToggle(item.uniqueId)} 
                />
            ))}
        </List>
    );
};

export default SelfServiceCartItemsList;
