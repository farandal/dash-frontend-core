/**
 * SelfServiceHome.tsx
 * 
 * Welcome screen for the self-service kiosk.
 * Collects customer name and table number before allowing ordering.
 * After form submission, redirects to the ordering interface.
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
    Container,
    alpha
} from '@mui/material';
import { 
    KeyboardArrowUp, 
    KeyboardArrowDown, 
    TableRestaurant, 
    Storefront,
    ArrowForward 
} from '@mui/icons-material';
import { dashStorage } from 'dash-utils';
import { useTranslate, useRedirect } from 'react-admin';

// Import the waiter SVG
import waiterSvg from '../../assets/ktwaiter.svg';

type DeliveryMethod = 'TABLE' | 'COUNTER';

interface OrderData {
    name: string;
    tableNumber: string | null;
    deliveryMethod: DeliveryMethod;
}

const SelfServiceHome: React.FC = () => {
    const translate = useTranslate();
    const redirect = useRedirect();
    
    const [customerName, setCustomerName] = useState('');
    const [tableNumber, setTableNumber] = useState('');
    const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('TABLE');
    const [hasExistingData, setHasExistingData] = useState(false);

    // Check if we already have order data
    useEffect(() => {
        const existingData = dashStorage.getItem('orderData') as OrderData | null;
        if (existingData?.name) {
            setCustomerName(existingData.name);
            setTableNumber(existingData.tableNumber || '');
            setDeliveryMethod(existingData.deliveryMethod || 'TABLE');
            setHasExistingData(true);
        }
    }, []);

    // Unlock audio context on first user interaction
    useEffect(() => {
        const handleInteraction = () => {
             import('../../components/Notifications/CustomNotificationsProcessing').then(({ unlockAudio }) => {
                unlockAudio();
            });
            
            // Remove listeners after first successful interaction
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
        };

        window.addEventListener('click', handleInteraction);
        window.addEventListener('keydown', handleInteraction);
        window.addEventListener('touchstart', handleInteraction);

        return () => {
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
        };
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

        // Save to storage
        dashStorage.setItem('orderData', {
            name: customerName.trim(),
            tableNumber: deliveryMethod === 'TABLE' ? tableNumber : null,
            deliveryMethod
        });

        console.log('[SelfServiceHome] Saved orderData:', {
            name: customerName.trim(),
            tableNumber: deliveryMethod === 'TABLE' ? tableNumber : null,
            deliveryMethod
        });

        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('order-data-saved'));

        // Redirect to ordering interface (tab resource)
        redirect('create', 'tab');
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                background: `linear-gradient(135deg, 
                    ${alpha('#1976d2', 0.1)} 0%, 
                    ${alpha('#42a5f5', 0.05)} 50%,
                    ${alpha('#90caf9', 0.1)} 100%)`,
            }}
        >
            <Container maxWidth="sm" sx={{ flex: 1, py: 4, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {/* Waiter illustration */}
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Box
                        component="img"
                        src={waiterSvg}
                        alt="Waiter"
                        sx={{
                            width: '100%',
                            maxWidth: 200,
                            height: 'auto',
                            mx: 'auto',
                            display: 'block',
                        }}
                    />
                </Box>

                {/* Welcome text */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography 
                        variant="h4" 
                        component="h1" 
                        gutterBottom
                        sx={{ 
                            fontWeight: 700,
                            color: 'primary.main',
                        }}
                    >
                        {translate('selfservice.welcome.title', { _: '¡Bienvenido!' })}
                    </Typography>
                    <Typography 
                        variant="body1" 
                        color="text.secondary"
                        sx={{ maxWidth: 300, mx: 'auto' }}
                    >
                        {translate('selfservice.welcome.subtitle', { _: 'Por favor ingresa tus datos para comenzar tu pedido' })}
                    </Typography>
                </Box>

                {/* Form card */}
                <Card 
                    elevation={4}
                    sx={{ 
                        p: 3, 
                        borderRadius: 3,
                        background: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(10px)',
                    }}
                >
                    {/* Customer name */}
                    <TextField
                        autoFocus
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

                    {/* Submit button */}
                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={handleSubmit}
                        disabled={!isFormValid()}
                        endIcon={<ArrowForward />}
                        sx={{
                            py: 1.5,
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            borderRadius: 2,
                        }}
                    >
                        {hasExistingData 
                            ? translate('selfservice.welcome.continue_button', { _: 'Continuar con mi pedido' })
                            : translate('selfservice.welcome.start_button', { _: 'Comenzar a ordenar' })
                        }
                    </Button>
                </Card>

                {/* Session info - small text at bottom */}
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                        {translate('selfservice.welcome.session_info', { 
                            _: 'Sesión segura • Tus datos están protegidos' 
                        })}
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default SelfServiceHome;
