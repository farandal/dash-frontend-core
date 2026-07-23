import { FC, useState } from 'react';
import { Box, Card, Portal, Typography, Button, TextField, IconButton, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { KeyboardArrowUp, KeyboardArrowDown, TableRestaurant, Storefront } from '@mui/icons-material';
import { AuthPersistenceService } from 'dash-auth';
import { dashStorage } from 'dash-utils';
import { useTranslate } from 'react-admin';
/* @ts-ignore */
import KtWaiter from '@app/assets/ktwaiter.svg?react';
import { useRedirect } from 'react-admin';

interface MallClientWelcomeProps {
}

type DeliveryMethod = 'TABLE' | 'COUNTER';

const MallClientWelcome: FC<MallClientWelcomeProps> = (props) => {
    const redirect = useRedirect();
    const translate = useTranslate();
    const tenantImages = AuthPersistenceService.getTenantImages();
    
    // Form state
    const [customerName, setCustomerName] = useState('');
    const [tableNumber, setTableNumber] = useState('');
    const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('TABLE');
    
    // Use relative path - React Router will handle the basename
    const create = '/tab/create';

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
            // Clear table number when switching to counter
            if (newMethod === 'COUNTER') {
                setTableNumber('');
            }
        }
    };

    const handleSubmit = () => {
        // Save form data to storage
        // Note: dashStorage.setItem already handles JSON.stringify internally
        dashStorage.setItem('orderData', {
            name: customerName,
            tableNumber: deliveryMethod === 'TABLE' ? tableNumber : null,
            deliveryMethod
        });
        
        console.log('[MallClientWelcome] Saved orderData:', {
            name: customerName,
            tableNumber: deliveryMethod === 'TABLE' ? tableNumber : null,
            deliveryMethod
        });
        
        // Navigate to create order
        redirect(create);
    };

    // Form is valid if:
    // - Customer name is provided
    // - For TABLE: table number is required
    // - For COUNTER: no table number needed
    const isFormValid = customerName.trim() !== '' && 
        (deliveryMethod === 'COUNTER' || tableNumber.trim() !== '');
    
    return (
        <>
            {/* Full-screen background KtWaiter */}
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    pointerEvents: 'none',
                }}
            >
                <KtWaiter
                    style={{
                        width: 'auto',
                        height: '100%',
                        maxWidth: '100%',
                        objectFit: 'contain',
                        opacity: 0.5,
                    }}
                    aria-hidden="true"
                />
            </Box>

            {/* Main content container */}
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                sx={{ 
                    width: '100%', 
                    height: '100%',
                    minHeight: { xs: 'auto', md: 'calc(100vh - 120px)' },
                    position: 'relative',
                    zIndex: 1,
                    p: { xs: 1.5, md: 4 },
                    maxWidth: 500,
                    mx: 'auto',
                }}
            >
                    {/* Logo */}
                    {tenantImages?.squared_logo?.original && (
                        <img
                            style={{
                                width: '100%',
                                maxWidth: 100,
                                height: 'auto',
                                marginBottom: 8,
                            }}
                            src={tenantImages.squared_logo.original}
                            alt="Logo"
                        />
                    )}

                    {/* Welcome message */}
                    <Typography variant="h5" align="center" gutterBottom sx={{ mb: 0.5 }}>
                        {translate('mall.welcome.title', { _: 'Bienvenido' })}
                    </Typography>
                    <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 1.5 }}>
                        {translate('mall.welcome.subtitle', { _: 'Ingresa tus datos para comenzar tu orden' })}
                    </Typography>

                    {/* Form Card */}
                    <Card 
                        sx={{ 
                            width: '100%', 
                            p: { xs: 1.5, md: 2 },
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                            alignItems: 'stretch',
                        }}
                        elevation={3}
                    >
                        {/* Customer Name Field */}
                        <TextField
                            autoFocus
                            id="customerName"
                            label={translate('mall.welcome.name_label', { _: 'Tu Nombre' })}
                            type="text"
                            variant="outlined"
                            size="small"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            fullWidth
                        />

                        {/* Delivery Method Toggle */}
                        <Box sx={{ width: '100%' }}>
                            <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>
                                {translate('mall.welcome.delivery_method_label', { _: '¿Cómo prefieres recibir tu orden?' })}
                            </Typography>
                            <ToggleButtonGroup
                                value={deliveryMethod}
                                exclusive
                                onChange={handleDeliveryMethodChange}
                                fullWidth
                                size="small"
                                sx={{ 
                                    '& .MuiToggleButton-root': {
                                        py: 0.75,
                                        flex: 1,
                                    }
                                }}
                            >
                                <ToggleButton value="TABLE" aria-label="table service">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <TableRestaurant sx={{ fontSize: '1rem' }} />
                                        <Typography variant="caption">
                                            {translate('mall.welcome.table_service', { _: 'En mi mesa' })}
                                        </Typography>
                                    </Box>
                                </ToggleButton>
                                <ToggleButton value="COUNTER" aria-label="counter pickup">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Storefront sx={{ fontSize: '1rem' }} />
                                        <Typography variant="caption">
                                            {translate('mall.welcome.counter_pickup', { _: 'Retiro en mostrador' })}
                                        </Typography>
                                    </Box>
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Box>

                        {/* Table Number Field - Only shown for TABLE delivery */}
                        {deliveryMethod === 'TABLE' && (
                            <Box sx={{ position: 'relative', minWidth: 120 }}>
                                <TextField
                                    id="tableNumber"
                                    label={translate('mall.welcome.table_label', { _: 'Número de Mesa' })}
                                    type="number"
                                    variant="outlined"
                                    size="small"
                                    value={tableNumber}
                                    onChange={(e) => setTableNumber(e.target.value)}
                                    fullWidth
                                    inputProps={{
                                        style: {
                                            textAlign: 'center',
                                            fontSize: '1.25rem',
                                            fontWeight: 'bold',
                                            MozAppearance: 'textfield',
                                        }
                                    }}
                                    sx={{
                                        '& input': {
                                            textAlign: 'center',
                                            '&::-webkit-outer-spin-button': {
                                                WebkitAppearance: 'none',
                                                margin: 0,
                                            },
                                            '&::-webkit-inner-spin-button': {
                                                WebkitAppearance: 'none',
                                                margin: 0,
                                            },
                                            MozAppearance: 'textfield',
                                        }
                                    }}
                                />
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        right: 4,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                >
                                    <IconButton
                                        onClick={handleIncrement}
                                        size="small"
                                        sx={{ p: 0 }}
                                    >
                                        <KeyboardArrowUp fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                        onClick={handleDecrement}
                                        size="small"
                                        sx={{ p: 0 }}
                                    >
                                        <KeyboardArrowDown fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Box>
                        )}

                       
                    </Card>

                    {/* Submit Button */}
                    <Button
                        variant="contained"
                        color="primary"
                        size="medium"
                        sx={{ mt: 1.5, px: 3, py: 1 }}
                        onClick={handleSubmit}
                        disabled={!isFormValid}
                    >
                        {translate('mall.welcome.explore_button', { _: 'Explora nuestro menú y haz tu orden aquí!' })}
                    </Button>
                </Box>

            {/* Powered by footer */}
            <Portal>
                <Box
                    sx={{
                        position: 'absolute',
                        right: 24,
                        bottom: 24,
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <Typography
                        variant="caption"
                        color="textSecondary"
                        sx={{
                            fontSize: 12,
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 8,
                        }}
                    >
                        Powered by{' '}
                        <a
                            href="https://dash.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                textDecoration: 'none',
                                color: 'inherit',
                                fontWeight: 600,
                            }}
                        >
                            dashadmin.cl
                        </a>
                    </Typography>
                </Box>
            </Portal>
        </>
    );
};

export default MallClientWelcome;
