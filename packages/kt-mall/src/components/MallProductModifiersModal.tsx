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
    FormGroup,
    FormControlLabel,
    Checkbox,
    Radio,
    RadioGroup,
    Avatar,
    Divider,
    Chip,
    IconButton,
    TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { useMallOrderCreate, IMallProduct, IMallCurrency } from '../contexts/MallOrderCreateContext';

/**
 * MallProductModifiersModal - Dialog for selecting product modifiers
 * 
 * This component follows the V1 ProductModifiers pattern but in a modal format.
 * Supports both SINGLE (radio) and MULTIPLE (checkbox) modifier group types.
 * Displays price adjustments for each option.
 * 
 * Now supports EDIT MODE: When editingCartItemId is set, the modal pre-populates
 * with existing selections and updates the cart item instead of adding a new one.
 */
export const MallProductModifiersModal: React.FC = () => {
    const translate = useTranslate();
    const {
        selectedProductForModifier: product,
        isModifierModalOpen,
        closeModifierModal,
        addToCart,
        updateCartItem,
        editingCartItemId,
        getEditingCartItem,
        formatPrice,
        getProductPrice,
        getProductCurrency,
    } = useMallOrderCreate();

    // Track selected modifiers by group ID
    const [selectedModifiers, setSelectedModifiers] = useState<Record<number, number[]>>({});
    // Track optional note
    const [note, setNote] = useState<string>('');

    // Determine if we're in edit mode
    const isEditMode = Boolean(editingCartItemId);
    const editingItem = isEditMode ? getEditingCartItem() : null;

    // Reset selections when product changes or edit mode starts
    useEffect(() => {
        if (product) {
            // If editing, use existing cart item values
            if (isEditMode && editingItem) {
                setSelectedModifiers(editingItem.selectedModifiers || {});
                setNote(editingItem.note || '');
            } else {
                // Initialize with default selections from modifier groups
                const defaults: Record<number, number[]> = {};
                
                product.modifier_groups?.forEach(group => {
                    const defaultOptions = group.options?.filter(opt => (opt as any).is_default) || [];
                    if (defaultOptions.length > 0) {
                        defaults[group.id] = defaultOptions.map(opt => opt.id);
                    } else if (group.is_required && group.type === 'SINGLE' && group.options?.length) {
                        // If required single selection and no default, select first option
                        defaults[group.id] = [group.options[0].id];
                    } else {
                        defaults[group.id] = [];
                    }
                });
                
                setSelectedModifiers(defaults);
                setNote('');
            }
        }
    }, [product, isEditMode, editingItem]);

    // Calculate total price including base and modifier adjustments
    const totalPrice = useMemo(() => {
        if (!product) return 0;
        
        const basePrice = getProductPrice(product);
        let modifierTotal = 0;
        
        product.modifier_groups?.forEach(group => {
            const selectedOptions = selectedModifiers[group.id] || [];
            selectedOptions.forEach(optionId => {
                const option = group.options?.find(o => o.id === optionId);
                if (option) {
                    modifierTotal += parseFloat(option.price_adjustment) || 0;
                }
            });
        });
        
        return basePrice + modifierTotal;
    }, [product, selectedModifiers, getProductPrice]);

    // Check if all required modifiers are selected
    const isValid = useMemo(() => {
        if (!product) return false;
        
        for (const group of product.modifier_groups || []) {
            if (group.is_required) {
                const selected = selectedModifiers[group.id] || [];
                if (selected.length === 0) {
                    return false;
                }
                // Check min selections for MULTIPLE type
                if (group.type === 'MULTIPLE' && group.min_selections > 0) {
                    if (selected.length < group.min_selections) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }, [product, selectedModifiers]);

    // Handle single selection (radio) change
    const handleSingleChange = (groupId: number, optionId: number) => {
        setSelectedModifiers(prev => ({
            ...prev,
            [groupId]: [optionId],
        }));
    };

    // Handle multiple selection (checkbox) change
    const handleMultipleChange = (groupId: number, optionId: number, checked: boolean) => {
        setSelectedModifiers(prev => {
            const currentSelected = prev[groupId] || [];
            const group = product?.modifier_groups?.find(g => g.id === groupId);
            
            let newSelected: number[];
            
            if (checked) {
                // Check max selections limit
                if (group?.max_selections && currentSelected.length >= group.max_selections) {
                    // Replace oldest selection with new one
                    newSelected = [...currentSelected.slice(1), optionId];
                } else {
                    newSelected = [...currentSelected, optionId];
                }
            } else {
                newSelected = currentSelected.filter(id => id !== optionId);
            }
            
            return {
                ...prev,
                [groupId]: newSelected,
            };
        });
    };

    // Handle add to cart or update cart item
    const handleSubmit = () => {
        if (product && isValid) {
            if (isEditMode && editingCartItemId) {
                // Update existing cart item
                updateCartItem(editingCartItemId, selectedModifiers, note || undefined);
            } else {
                // Add new item to cart
                addToCart(product, selectedModifiers, note || undefined);
            }
            closeModifierModal();
        }
    };

    // Handle close
    const handleClose = () => {
        closeModifierModal();
    };

    if (!product) return null;

    // Get product image
    const imageUrl = product.gallery?.primary_image_url || 
                     (product.gallery?.images?.[0]?.url) || 
                     null;

    const currency = getProductCurrency(product);

    return (
        <Dialog
            className="kt-mall-product-modifiers-modal"
            open={isModifierModalOpen}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    maxHeight: '90vh',
                },
            }}
        >
            {/* Header */}
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                    variant="rounded"
                    src={imageUrl || undefined}
                    sx={{ width: 56, height: 56, backgroundColor: 'grey.200' }}
                >
                    {!imageUrl && <RestaurantIcon sx={{ color: 'grey.400' }} />}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={600}>
                        {product.name}
                    </Typography>
                    <Typography variant="subtitle2" color="primary.main" fontWeight={600}>
                        {formatPrice(getProductPrice(product), currency)}
                    </Typography>
                </Box>
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: 'grey.500',
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <Divider />

            {/* Content */}
            <DialogContent dividers sx={{ p: 2 }}>
                {/* Modifier Groups */}
                {product.modifier_groups?.map((group, index) => (
                    <Box key={group.id} sx={{ mb: index < (product.modifier_groups?.length || 0) - 1 ? 3 : 0 }}>
                        <FormControl component="fieldset" fullWidth>
                            <FormLabel
                                component="legend"
                                sx={{
                                    fontWeight: 600,
                                    color: 'text.primary',
                                    mb: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                }}
                            >
                                {group.name}
                                {group.is_required && (
                                    <Chip
                                        label={translate('mall.required')}
                                        color="error"
                                        size="small"
                                        sx={{ fontSize: '0.65rem', height: 20 }}
                                    />
                                )}
                                {group.type === 'MULTIPLE' && group.max_selections && (
                                    <Typography variant="caption" color="text.secondary">
                                        ({translate('mall.select_up_to', { count: group.max_selections })})
                                    </Typography>
                                )}
                            </FormLabel>

                            {/* SINGLE type - Radio buttons */}
                            {group.type === 'SINGLE' && (
                                <RadioGroup
                                    value={selectedModifiers[group.id]?.[0] || ''}
                                    onChange={(e) => handleSingleChange(group.id, parseInt(e.target.value))}
                                >
                                    {group.options?.map(option => {
                                        const priceAdjustment = parseFloat(option.price_adjustment) || 0;
                                        return (
                                            <FormControlLabel
                                                key={option.id}
                                                value={option.id}
                                                control={<Radio size="small" />}
                                                label={
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                                                        <Typography variant="body2">{option.name}</Typography>
                                                        {priceAdjustment !== 0 && (
                                                            <Typography
                                                                variant="body2"
                                                                color={priceAdjustment > 0 ? 'success.main' : 'error.main'}
                                                                fontWeight={600}
                                                            >
                                                                {priceAdjustment > 0 ? '+' : ''}{formatPrice(priceAdjustment, currency)}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                }
                                                sx={{
                                                    mr: 0,
                                                    '& .MuiFormControlLabel-label': { width: '100%' },
                                                }}
                                            />
                                        );
                                    })}
                                </RadioGroup>
                            )}

                            {/* MULTIPLE type - Checkboxes */}
                            {group.type === 'MULTIPLE' && (
                                <FormGroup>
                                    {group.options?.map(option => {
                                        const priceAdjustment = parseFloat(option.price_adjustment) || 0;
                                        const isChecked = selectedModifiers[group.id]?.includes(option.id) || false;
                                        
                                        return (
                                            <FormControlLabel
                                                key={option.id}
                                                control={
                                                    <Checkbox
                                                        size="small"
                                                        checked={isChecked}
                                                        onChange={(e) => handleMultipleChange(group.id, option.id, e.target.checked)}
                                                    />
                                                }
                                                label={
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                                                        <Typography variant="body2">{option.name}</Typography>
                                                        {priceAdjustment !== 0 && (
                                                            <Typography
                                                                variant="body2"
                                                                color={priceAdjustment > 0 ? 'success.main' : 'error.main'}
                                                                fontWeight={600}
                                                            >
                                                                {priceAdjustment > 0 ? '+' : ''}{formatPrice(priceAdjustment, currency)}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                }
                                                sx={{
                                                    mr: 0,
                                                    '& .MuiFormControlLabel-label': { width: '100%' },
                                                }}
                                            />
                                        );
                                    })}
                                </FormGroup>
                            )}
                        </FormControl>
                    </Box>
                ))}

                {/* Note field */}
                <Box sx={{ mt: 3 }}>
                    <TextField
                        fullWidth
                        label={translate('mall.special_instructions')}
                        placeholder={translate('mall.special_instructions_placeholder')}
                        multiline
                        rows={2}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        variant="outlined"
                        size="small"
                    />
                </Box>
            </DialogContent>

            <Divider />

            {/* Actions */}
            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700}>
                        {translate('mall.total')}: {formatPrice(totalPrice, currency)}
                    </Typography>
                </Box>
                <Button onClick={handleClose} color="inherit">
                    {translate('ra.action.cancel')}
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={!isValid}
                    startIcon={isEditMode ? <EditIcon /> : <AddIcon />}
                >
                    {isEditMode ? translate('mall.update_item') : translate('mall.add_to_cart')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default MallProductModifiersModal;
