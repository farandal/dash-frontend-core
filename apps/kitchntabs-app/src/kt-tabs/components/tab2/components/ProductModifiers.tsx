import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    FormControl,
    FormGroup,
    Checkbox,
    Chip,
    Tooltip,
    Select,
    MenuItem,
    InputLabel,
    SelectChangeEvent,
    FormControlLabel,
    Alert
} from '@mui/material';
import {
    Psychology as AiIcon,
    AttachMoney as PriceIcon
} from '@mui/icons-material';

import { formatPriceAdjustmentWithTenant, safeParseFloat, getCurrencyFromAuth } from '../utils';
import { ProductModifiersProps } from '../types';

const ProductModifiers: React.FC<ProductModifiersProps> = ({
    product,
    productIndex,
    modifiers,
    onModifierChange,
    disabled = false
}) => {
    const [localModifiers, setLocalModifiers] = useState(modifiers);
    const [tenantCurrency, setTenantCurrency] = useState<any>(null);

    useEffect(() => {
        setLocalModifiers(modifiers);
    }, [modifiers]);

    useEffect(() => {
        const currency = getCurrencyFromAuth();
        setTenantCurrency(currency);
    }, []);

    const handleModifierSelection = (groupId: string, optionId: string, groupType: string) => {
        let updatedModifiers = [...localModifiers];

        if (groupType === 'SINGLE') {
            // Remove any existing modifier for this group
            updatedModifiers = updatedModifiers.filter(mod => mod.modifier_group_id !== groupId);
            
            // If optionId is empty (user selected "None"), don't add any modifier
            if (optionId === '') {
                setLocalModifiers(updatedModifiers);
                onModifierChange(updatedModifiers);
                return;
            }
            
            // Find the selected option
            const group = product.product?.modifier_groups?.find(g => g.id === groupId);
            const option = group?.options?.find(o => o.id === optionId);
            
            if (option) {
                // Add the new modifier - following OrderProductsEdit pattern
                updatedModifiers.push({
                    modifier_option_id: optionId,
                    modifier_group_id: groupId,
                    price_adjustment: option.price_adjustment,
                    modifier_option: {
                        id: option.id,
                        name: option.name,
                        price_adjustment: option.price_adjustment,
                        modifierGroup: {
                            id: group.id,
                            name: group.name,
                            type: group.type 
                        }
                    }
                });
            }
        } else if (groupType === 'MULTIPLE') {
            // Check if this modifier already exists
            const existingIndex = updatedModifiers.findIndex(
                mod => mod.modifier_option_id === optionId && mod.modifier_group_id === groupId
            );

            if (existingIndex >= 0) {
                // Remove the modifier
                updatedModifiers.splice(existingIndex, 1);
            } else {
                // Add the modifier
                const group = product.product?.modifier_groups?.find(g => g.id === groupId);
                const option = group?.options?.find(o => o.id === optionId);
                
                if (option) {
                    updatedModifiers.push({
                        modifier_option_id: optionId,
                        modifier_group_id: groupId,
                        price_adjustment: option.price_adjustment,
                        modifier_option: {
                            id: option.id,
                            name: option.name,
                            price_adjustment: option.price_adjustment,
                            modifierGroup: {
                                id: group.id,
                                name: group.name,
                                type: group.type
                            }
                        }
                    });
                }
            }
        }

        setLocalModifiers(updatedModifiers);
        onModifierChange(updatedModifiers);
    };

    const handleSelectChange = (event: SelectChangeEvent<string>, groupId: string, groupType: string) => {
        const optionId = event.target.value;
        handleModifierSelection(groupId, optionId, groupType);
    };

    const isOptionSelected = (groupId: string, optionId: string) => {
        return localModifiers.some(
            mod => mod.modifier_option_id === optionId && mod.modifier_group_id === groupId
        );
    };

    const getSelectedOptionForSingleGroup = (groupId: string) => {
        const selectedModifier = localModifiers.find(mod => mod.modifier_group_id === groupId);
        return selectedModifier?.modifier_option_id || '';
    };

    const getAiModifiersForGroup = (groupId: string) => {
        return localModifiers.filter(mod => 
            mod.modifier_group_id === groupId && mod.ai_suggested
        );
    };

    if (!product.product?.modifier_groups || product.product.modifier_groups.length === 0) {
        return null;
    }

    return (
        <Box sx={{ mt: 1 }}>
            {product.product.modifier_groups.map((group: any) => {
                const aiModifiers = getAiModifiersForGroup(group.id);
                const hasAiModifiers = aiModifiers.length > 0;

                return (
                    <Box key={group.id} >
         
                        <Box sx={{ p: 1, pl: 2 }}>
                            {group.type === 'SINGLE' ? (
                                <FormControl fullWidth disabled={disabled} size="small">
                                    <InputLabel id={`modifier-select-${group.id}`}>
                                        {group.name}
                                    </InputLabel>
                                    <Select
                                        labelId={`modifier-select-${group.id}`}
                                        value={getSelectedOptionForSingleGroup(group.id)}
                                        onChange={(e) => handleSelectChange(e, group.id, group.type)}
                                        label={group.name}
                                        displayEmpty
                                    >
                                        <MenuItem value="">
                                            <Typography variant="body2" color="text.secondary">
                                                Ninguno
                                            </Typography>
                                        </MenuItem>
                                        {group.options?.map((option: any) => {
                                            const isAiSuggested = aiModifiers.some(mod => 
                                                mod.modifier_option_id === option.id
                                            );
                                            const priceAdjustment = safeParseFloat(option.price_adjustment, 0);
                                            
                                            return (
                                                <MenuItem 
                                                    key={option.id} 
                                                    value={option.id}
                                                    sx={{
                                                        bgcolor: isAiSuggested ? 'primary.light' : 'transparent',
                                                        opacity: isAiSuggested ? 0.8 : 1,
                                                        '&:hover': {
                                                            bgcolor: isAiSuggested ? 'primary.main' : 'action.hover',
                                                        }
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                                        <Typography variant="body2" sx={{ flexGrow: 1 }}>
                                                            {option.name}
                                                        </Typography>
                                                        {priceAdjustment !== 0 && (
                                                            <Chip
                                                                icon={<PriceIcon />}
                                                                label={formatPriceAdjustmentWithTenant(priceAdjustment, tenantCurrency)}
                                                                size="small"
                                                                variant="outlined"
                                                                color={priceAdjustment > 0 ? 'warning' : 'success'}
                                                            />
                                                        )}
                                                        {isAiSuggested && (
                                                            <AiIcon fontSize="small" color="primary" />
                                                        )}
                                                    </Box>
                                                </MenuItem>
                                            );
                                        })}
                                    </Select>
                                </FormControl>
                            ) : (
                                <FormGroup>
                                    {group.options?.map((option: any) => {
                                        const isSelected = isOptionSelected(group.id, option.id);
                                        const isAiSuggested = aiModifiers.some(mod => 
                                            mod.modifier_option_id === option.id
                                        );
                                        const priceAdjustment = safeParseFloat(option.price_adjustment, 0);
                                        
                                        return (
                                            <FormControlLabel
                                                key={option.id}
                                                control={
                                                    <Checkbox
                                                        size="small"
                                                        checked={isSelected}
                                                        onChange={() => handleModifierSelection(group.id, option.id, group.type)}
                                                        disabled={disabled}
                                                    />
                                                }
                                                label={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="body2">
                                                            {option.name}
                                                        </Typography>
                                                        {priceAdjustment !== 0 && (
                                                            <Chip
                                                                icon={<PriceIcon />}
                                                                label={formatPriceAdjustmentWithTenant(priceAdjustment, tenantCurrency)}
                                                                size="small"
                                                                variant="outlined"
                                                                color={priceAdjustment > 0 ? 'warning' : 'success'}
                                                            />
                                                        )}
                                                        {isAiSuggested && (
                                                            <AiIcon fontSize="small" color="primary" />
                                                        )}
                                                    </Box>
                                                }
                                                sx={{
                                                    bgcolor: isAiSuggested ? 'primary.light' : 'transparent',
                                                    borderRadius: 1,
                                                    m: 0.5,
                                                    opacity: isAiSuggested ? 0.8 : 1
                                                }}
                                            />
                                        );
                                    })}
                                </FormGroup>
                            )}

                            {/* AI Modifier Details - always visible */}
                            {/*hasAiModifiers && (
                                <Box sx={{ mt: 1, p: 1, bgcolor: 'primary.light', borderRadius: 1, opacity: 0.7 }}>
                                    <Typography variant="caption" color="primary.dark">
                                        <AiIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                                        Modificadores aplicados automáticamente por IA:
                                    </Typography>
                                    {aiModifiers.map((mod, idx) => (
                                        <Box key={idx} sx={{ mt: 0.5 }}>
                                            <Typography variant="caption" display="block">
                                                • {mod.modifier_option?.name || 'Modificador'}
                                                {mod.detection_reason && ` (${mod.detection_reason})`}
                                                {mod.confidence && ` - ${Math.round(mod.confidence * 100)}% confianza`}
                                            </Typography>
                                            {mod.matched_keywords && mod.matched_keywords.length > 0 && (
                                                <Typography variant="caption" display="block" sx={{ ml: 1, fontStyle: 'italic' }}>
                                                    Palabras clave: {mod.matched_keywords.join(', ')}
                                                </Typography>
                                            )}
                                        </Box>
                                    ))}
                                </Box>
                            )*/}
                        </Box>
                    </Box>
                );
            })}
        </Box>
    );
};

export default ProductModifiers;
