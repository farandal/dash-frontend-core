import React, { useState, useEffect, useMemo } from 'react';
import { useTranslate } from 'react-admin';
import {
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    FormControl,
    FormLabel,
    Checkbox,
    Radio,
    RadioGroup,
    FormControlLabel,
    IconButton,
    TextField,
    Divider,
    useMediaQuery,
    useTheme,
    Avatar
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { useSelfServiceOrderCreate } from '../contexts/SelfServiceOrderCreateContext';

const SelfServiceProductModifiersModal: React.FC = () => {
    const translate = useTranslate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { 
        selectedProductForModifier: product, 
        editingCartItem,
        isModifierModalOpen, 
        closeModifierModal,
        addToCart,
        updateCartItem,
        formatPrice
    } = useSelfServiceOrderCreate();

    const [selectedModifiers, setSelectedModifiers] = useState<Record<number, number[]>>({});
    const [note, setNote] = useState('');

    // Reset when product changes - pre-populate with existing modifiers if editing
    useEffect(() => {
        if (product) {
            if (editingCartItem && editingCartItem.product.id === product.id) {
                // Editing existing item - use its modifiers and note
                setSelectedModifiers(editingCartItem.selectedModifiers);
                setNote(editingCartItem.note || '');
            } else {
                // New item - initialize with defaults
                const defaults: Record<number, number[]> = {};
                product.modifier_groups?.forEach(group => {
                    const defaultOpts = group.options?.filter(o => o.is_default) || [];
                    if (defaultOpts.length > 0) {
                        defaults[group.id] = defaultOpts.map(o => o.id);
                    } else if (group.is_required && group.type === 'SINGLE' && group.options?.length) {
                        defaults[group.id] = [group.options[0].id];
                    }
                });
                setSelectedModifiers(defaults);
                setNote('');
            }
        }
    }, [product, editingCartItem]);

    // Validation
    const isValid = useMemo(() => {
        if (!product) return false;
        for (const group of (product.modifier_groups || [])) {
            if (group.is_required) {
                const selected = selectedModifiers[group.id] || [];
                if (selected.length === 0) return false;
                if (group.type === 'MULTIPLE' && group.min_selections > 0 && selected.length < group.min_selections) return false;
            }
        }
        return true;
    }, [product, selectedModifiers]);

    // Price Calc
    const totalPrice = useMemo(() => {
        if (!product) return 0;
        let total = parseFloat(product.prices?.[0]?.price || '0');
        
        product.modifier_groups?.forEach(group => {
            const selected = selectedModifiers[group.id] || [];
            selected.forEach(optId => {
                const opt = group.options?.find(o => o.id === optId);
                total += parseFloat(opt?.price_adjustment || '0');
            });
        });
        return total;
    }, [product, selectedModifiers]);

    if (!product) return null;

    const handleSingleChange = (groupId: number, val: number) => {
        setSelectedModifiers(prev => ({ ...prev, [groupId]: [val] }));
    };

    const handleMultipleChange = (groupId: number, optId: number, checked: boolean) => {
        setSelectedModifiers(prev => {
            const current = prev[groupId] || [];
            if (checked) return { ...prev, [groupId]: [...current, optId] };
            return { ...prev, [groupId]: current.filter(id => id !== optId) };
        });
    };

    const handleSubmit = () => {
        if (isValid) {
            if (editingCartItem) {
                // Update existing cart item
                updateCartItem(editingCartItem.uniqueId, selectedModifiers, note);
            } else {
                // Add new item to cart
                addToCart(product, selectedModifiers, note);
            }
            closeModifierModal();
        }
    };

    const imageUrl = product.gallery?.primary_image_url || product.primary_image;

    return (
        <Dialog 
            open={isModifierModalOpen} 
            onClose={closeModifierModal}
            fullWidth
            maxWidth="sm"
            fullScreen={isMobile}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                 <Avatar 
                    src={imageUrl} 
                    variant="rounded" 
                    sx={{ width: 56, height: 56, bgcolor: 'grey.200' }}
                >
                    <RestaurantIcon color="disabled"/>
                </Avatar>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight="bold">
                        {product.name}
                    </Typography>
                    <Typography variant="subtitle2" color="primary.main" fontWeight="bold">
                        {formatPrice(parseFloat(product.prices?.[0]?.price || '0'))}
                    </Typography>
                </Box>
                <IconButton onClick={closeModifierModal} sx={{ position: 'absolute', right: 8, top: 8 }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <Divider />
            
            <DialogContent>
                {product.modifier_groups?.map(group => (
                    <Box key={group.id} sx={{ mb: 3 }}>
                        <FormLabel sx={{ fontWeight: 'bold', mb: 1, display: 'block' }}>
                            {group.name} {group.is_required && <Box component="span" sx={{ color: 'error.main' }}>*</Box>}
                        </FormLabel>
                        
                        {group.type === 'SINGLE' ? (
                            <RadioGroup 
                                value={selectedModifiers[group.id]?.[0] || ''}
                                onChange={(e) => handleSingleChange(group.id, parseInt(e.target.value))}
                            >
                                {group.options?.map(opt => (
                                    <FormControlLabel 
                                        key={opt.id} 
                                        value={opt.id} 
                                        control={<Radio />} 
                                        label={`${opt.name} ${parseFloat(opt.price_adjustment) !== 0 ? `(${formatPrice(opt.price_adjustment)})` : ''}`} 
                                    />
                                ))}
                            </RadioGroup>
                        ) : (
                             <Box>
                                {group.options?.map(opt => (
                                    <FormControlLabel 
                                        key={opt.id} 
                                        control={
                                            <Checkbox 
                                                checked={selectedModifiers[group.id]?.includes(opt.id) || false}
                                                onChange={(e) => handleMultipleChange(group.id, opt.id, e.target.checked)}
                                            />
                                        } 
                                        label={`${opt.name} ${parseFloat(opt.price_adjustment) !== 0 ? `(${formatPrice(opt.price_adjustment)})` : ''}`} 
                                    />
                                ))}
                             </Box>
                        )}
                    </Box>
                ))}

                <Box sx={{ mt: 2 }}>
                    <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label={translate('mall.special_instructions')}
                        placeholder="Ex: No onions, sauce on side..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </Box>

            </DialogContent>
            
            <DialogActions sx={{ p: 2 }}>
                 <Button onClick={closeModifierModal} color="inherit">
                    {translate('ra.action.cancel')}
                </Button>@
                <Button 
                    variant="contained" 
                    onClick={handleSubmit} 
                    disabled={!isValid}
                    startIcon={editingCartItem ? undefined : <AddIcon />}
                >
                    {editingCartItem 
                        ? `${translate('ra.action.save')} - ${formatPrice(totalPrice)}`
                        : `${translate('mall.add_to_cart')} - ${formatPrice(totalPrice)}`
                    }
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SelfServiceProductModifiersModal;
