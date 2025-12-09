import React, { useState, useEffect } from 'react';
import { useTranslate } from 'react-admin';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    FormControl,
    FormLabel,
    FormGroup,
    FormControlLabel,
    Radio,
    RadioGroup,
    Checkbox,
    Divider,
} from '@mui/material';
import { useKiosk } from '../contexts/KioskContext';
import { IKioskModifierGroup } from '../interfaces/IKiosk';

export const KioskModifierModal: React.FC = () => {
    const translate = useTranslate();
    const {
        selectedProduct,
        isModifierModalOpen,
        closeModifierModal,
        addToCart,
        formatPrice,
    } = useKiosk();

    const [selectedModifiers, setSelectedModifiers] = useState<Record<number, number[]>>({});

    // Reset selections when product changes
    useEffect(() => {
        if (isModifierModalOpen && selectedProduct) {
            // Initialize with first option for single-select modifiers
            const defaults: Record<number, number[]> = {};
            selectedProduct.modifiers?.forEach((group) => {
                if (group.type === 'single' && group.options.length > 0) {
                    defaults[group.id] = [group.options[0].id];
                } else {
                    defaults[group.id] = [];
                }
            });
            setSelectedModifiers(defaults);
        }
    }, [isModifierModalOpen, selectedProduct]);

    if (!selectedProduct) return null;

    const handleToggleOption = (groupId: number, optionId: number, type: 'single' | 'multiple') => {
        setSelectedModifiers((prev) => {
            const current = prev[groupId] || [];

            if (type === 'single') {
                return { ...prev, [groupId]: [optionId] };
            } else {
                if (current.includes(optionId)) {
                    return { ...prev, [groupId]: current.filter((id) => id !== optionId) };
                } else {
                    return { ...prev, [groupId]: [...current, optionId] };
                }
            }
        });
    };

    const calculateTotal = () => {
        let total = selectedProduct.price;
        selectedProduct.modifiers?.forEach((group) => {
            const selected = selectedModifiers[group.id] || [];
            selected.forEach((optId) => {
                const opt = group.options.find((o) => o.id === optId);
                if (opt) total += opt.price;
            });
        });
        return total;
    };

    const isValid = () => {
        if (!selectedProduct.modifiers) return true;

        for (const group of selectedProduct.modifiers) {
            if (group.required) {
                const selected = selectedModifiers[group.id] || [];
                if (selected.length === 0) return false;
                if (group.min_selections && selected.length < group.min_selections) return false;
            }
        }
        return true;
    };

    const handleConfirm = () => {
        addToCart(selectedProduct, selectedModifiers);
        closeModifierModal();
    };

    const renderModifierGroup = (group: IKioskModifierGroup) => {
        const selected = selectedModifiers[group.id] || [];

        return (
            <FormControl key={group.id} component="fieldset" fullWidth sx={{ mb: 3 }}>
                <FormLabel
                    component="legend"
                    sx={{
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        mb: 1,
                        color: 'text.primary',
                    }}
                >
                    {group.name}
                    {group.type === 'multiple' && (
                        <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                            sx={{ ml: 1 }}
                        >
                            ({translate('kiosk.select_multiple')})
                        </Typography>
                    )}
                    {group.required && (
                        <Typography
                            component="span"
                            variant="caption"
                            color="error"
                            sx={{ ml: 1 }}
                        >
                            {translate('kiosk.required')}
                        </Typography>
                    )}
                </FormLabel>

                {group.type === 'single' ? (
                    <RadioGroup
                        value={selected[0] || ''}
                        onChange={(e) => handleToggleOption(group.id, Number(e.target.value), 'single')}
                    >
                        {group.options.map((option) => (
                            <FormControlLabel
                                key={option.id}
                                value={option.id}
                                control={<Radio />}
                                label={
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            width: '100%',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Typography>{option.name}</Typography>
                                        {option.price > 0 && (
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ ml: 2 }}
                                            >
                                                +{formatPrice(option.price)}
                                            </Typography>
                                        )}
                                    </Box>
                                }
                                sx={{
                                    mx: 0,
                                    py: 0.5,
                                    px: 1.5,
                                    borderRadius: 1,
                                    border: 1,
                                    borderColor: selected.includes(option.id)
                                        ? 'primary.main'
                                        : 'divider',
                                    backgroundColor: selected.includes(option.id)
                                        ? 'primary.light'
                                        : 'transparent',
                                    mb: 1,
                                    transition: 'all 0.2s',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                    },
                                    '& .MuiFormControlLabel-label': {
                                        flexGrow: 1,
                                    },
                                }}
                            />
                        ))}
                    </RadioGroup>
                ) : (
                    <FormGroup>
                        {group.options.map((option) => (
                            <FormControlLabel
                                key={option.id}
                                control={
                                    <Checkbox
                                        checked={selected.includes(option.id)}
                                        onChange={() =>
                                            handleToggleOption(group.id, option.id, 'multiple')
                                        }
                                    />
                                }
                                label={
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            width: '100%',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Typography>{option.name}</Typography>
                                        {option.price > 0 && (
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ ml: 2 }}
                                            >
                                                +{formatPrice(option.price)}
                                            </Typography>
                                        )}
                                    </Box>
                                }
                                sx={{
                                    mx: 0,
                                    py: 0.5,
                                    px: 1.5,
                                    borderRadius: 1,
                                    border: 1,
                                    borderColor: selected.includes(option.id)
                                        ? 'primary.main'
                                        : 'divider',
                                    backgroundColor: selected.includes(option.id)
                                        ? 'primary.light'
                                        : 'transparent',
                                    mb: 1,
                                    transition: 'all 0.2s',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                    },
                                    '& .MuiFormControlLabel-label': {
                                        flexGrow: 1,
                                    },
                                }}
                            />
                        ))}
                    </FormGroup>
                )}
            </FormControl>
        );
    };

    return (
        <Dialog
            open={isModifierModalOpen}
            onClose={closeModifierModal}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    maxHeight: '90vh',
                },
            }}
        >
            <DialogTitle
                sx={{
                    pb: 1,
                    borderBottom: 1,
                    borderColor: 'divider',
                }}
            >
                <Typography variant="h5" component="span" fontWeight={700} color="primary">
                    {selectedProduct.name}
                </Typography>
                {selectedProduct.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {selectedProduct.description}
                    </Typography>
                )}
            </DialogTitle>

            <DialogContent sx={{ pt: 2 }}>
                {selectedProduct.modifiers?.map((group, index) => (
                    <React.Fragment key={group.id}>
                        {renderModifierGroup(group)}
                        {index < (selectedProduct.modifiers?.length || 0) - 1 && (
                            <Divider sx={{ my: 2 }} />
                        )}
                    </React.Fragment>
                ))}
            </DialogContent>

            <DialogActions
                sx={{
                    p: 2,
                    pt: 1,
                    borderTop: 1,
                    borderColor: 'divider',
                }}
            >
                <Button onClick={closeModifierModal} color="inherit" size="large">
                    {translate('kiosk.cancel')}
                </Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    size="large"
                    disabled={!isValid()}
                    sx={{
                        minWidth: 200,
                        py: 1.5,
                        fontWeight: 700,
                        fontSize: '1.1rem',
                    }}
                >
                    {translate('kiosk.add_to_order')} — {formatPrice(calculateTotal())}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default KioskModifierModal;
