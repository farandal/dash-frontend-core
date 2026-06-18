/**
 * SelfServiceSettingsForm.tsx
 * 
 * Reusable form component for configuring self-service session data.
 * Used in both SelfServiceHome and the settings drawer.
 */
import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    TextField, 
    Button, 
    Card, 
    IconButton,
    ToggleButton,
    ToggleButtonGroup,
    alpha
} from '@mui/material';
import { 
    KeyboardArrowUp, 
    KeyboardArrowDown, 
    TableRestaurant, 
    Storefront,
    Save,
    Close
} from '@mui/icons-material';
import { dashStorage } from 'dash-utils';
import { useTranslate } from 'react-admin';

type DeliveryMethod = 'TABLE' | 'COUNTER';

export interface OrderData {
    name: string;
    tableNumber: string | null;
    deliveryMethod: DeliveryMethod;
}

interface SelfServiceSettingsFormProps {
    /** Called when the form is successfully saved */
    onSave?: (data: OrderData) => void;
    /** Called when cancel/close is clicked */
    onClose?: () => void;
    /** Whether to show close button */
    showCloseButton?: boolean;
    /** Whether to show title */
    showTitle?: boolean;
    /** Custom title */
    title?: string;
}

const SelfServiceSettingsForm: React.FC<SelfServiceSettingsFormProps> = ({
    onSave,
    onClose,
    showCloseButton = true,
    showTitle = true,
    title
}) => {
    const translate = useTranslate();
    
    const [customerName, setCustomerName] = useState('');
    const [tableNumber, setTableNumber] = useState('');
    const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('TABLE');

    // Load existing data on mount
    useEffect(() => {
        const existingData = dashStorage.getItem('orderData') as OrderData | null;
        if (existingData) {
            setCustomerName(existingData.name || '');
            setTableNumber(existingData.tableNumber || '');
            setDeliveryMethod(existingData.deliveryMethod || 'TABLE');
        }
    }, []);

    const handleIncrement = () => {
        setTableNumber(prev => prev ? String(Number(prev) + 1) : '1');
    };

    const handleDecrement = () => {
        setTableNumber(prev => prev && Number(prev) > 0 ? String(Number(prev) - 1) : '0');
    };

    const handleDeliveryMethodChange = (
        _event: React.MouseEvent<HTMLElement>,
        newMethod: DeliveryMethod | null
    ) => {
        if (newMethod !== null) {
            setDeliveryMethod(newMethod);
            if (newMethod === 'COUNTER') {
                setTableNumber('');
            }
        }
    };

    const isFormValid = () => {
        if (!customerName.trim()) return false;
        if (deliveryMethod === 'TABLE' && !tableNumber.trim()) return false;
        return true;
    };

    const handleSubmit = () => {
        if (!isFormValid()) return;

        const orderData: OrderData = {
            name: customerName.trim(),
            tableNumber: deliveryMethod === 'TABLE' ? tableNumber : null,
            deliveryMethod
        };

        // Save to storage
        dashStorage.setItem('orderData', orderData);

        console.log('[SelfServiceSettingsForm] Saved orderData:', orderData);

        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('order-data-saved'));

        // Call onSave callback
        if (onSave) {
            onSave(orderData);
        }
    };

    return (
        <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2
            }}>
                {showTitle && (
                    <Typography variant="h6" fontWeight="bold">
                        {title || translate('selfservice.settings.title', { _: 'Configuración' })}
                    </Typography>
                )}
                {showCloseButton && onClose && (
                    <IconButton onClick={onClose} size="small">
                        <Close />
                    </IconButton>
                )}
            </Box>

            {/* Form content */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
                {/* Customer name */}
                <TextField
                    fullWidth
                    label={translate('selfservice.welcome.name_label', { _: 'Tu nombre' })}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    variant="outlined"
                    sx={{ mb: 3 }}
                    placeholder={translate('selfservice.welcome.name_placeholder', { _: 'Ingresa tu nombre' })}
                />

                {/* Delivery method toggle */}
                <Box sx={{ mb: 3 }}>
                    <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ mb: 1, textAlign: 'center' }}
                    >
                        {translate('selfservice.welcome.delivery_method_label', { _: '¿Cómo deseas recibir tu pedido?' })}
                    </Typography>
                    <ToggleButtonGroup
                        value={deliveryMethod}
                        exclusive
                        onChange={handleDeliveryMethodChange}
                        aria-label="delivery method"
                        fullWidth
                        sx={{
                            '& .MuiToggleButton-root': {
                                py: 1.5,
                                fontSize: '0.9rem',
                                '&.Mui-selected': {
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: 'primary.dark',
                                    }
                                }
                            }
                        }}
                    >
                        <ToggleButton value="TABLE" aria-label="table service">
                            <TableRestaurant sx={{ mr: 1 }} />
                            {translate('selfservice.welcome.table_service', { _: 'En mi mesa' })}
                        </ToggleButton>
                        <ToggleButton value="COUNTER" aria-label="counter pickup">
                            <Storefront sx={{ mr: 1 }} />
                            {translate('selfservice.welcome.counter_pickup', { _: 'En mostrador' })}
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                {/* Table number - Only for TABLE service */}
                {deliveryMethod === 'TABLE' && (
                    <Card 
                        variant="outlined"
                        sx={{ 
                            p: 2, 
                            mb: 3,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                        }}
                    >
                        <TextField
                            label={translate('selfservice.welcome.table_label', { _: 'Número de mesa' })}
                            type="number"
                            variant="outlined"
                            size="medium"
                            value={tableNumber}
                            onChange={(e) => setTableNumber(e.target.value)}
                            sx={{ flex: 1 }}
                            inputProps={{
                                style: { textAlign: 'center', fontSize: '1.5rem' }
                            }}
                        />
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <IconButton 
                                onClick={handleIncrement} 
                                size="small"
                                color="primary"
                            >
                                <KeyboardArrowUp />
                            </IconButton>
                            <IconButton 
                                onClick={handleDecrement} 
                                size="small"
                                color="primary"
                            >
                                <KeyboardArrowDown />
                            </IconButton>
                        </Box>
                    </Card>
                )}

                {/* Counter pickup info */}
                {deliveryMethod === 'COUNTER' && (
                    <Box 
                        sx={{ 
                            p: 2, 
                            mb: 3,
                            backgroundColor: alpha('#1976d2', 0.05), 
                            borderRadius: 2,
                            textAlign: 'center' 
                        }}
                    >
                        <Storefront sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                            {translate('selfservice.welcome.counter_info', { 
                                _: 'Tu pedido estará listo para recoger en el mostrador. Te notificaremos cuando esté listo.' 
                            })}
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Save button */}
            <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleSubmit}
                disabled={!isFormValid()}
                startIcon={<Save />}
                sx={{
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    mt: 2
                }}
            >
                {translate('selfservice.settings.save_button', { _: 'Guardar cambios' })}
            </Button>
        </Box>
    );
};

export default SelfServiceSettingsForm;
