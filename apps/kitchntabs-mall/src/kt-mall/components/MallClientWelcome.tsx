import { FC, useState } from 'react';
import { Box, Card, Portal, Typography, Button, TextField, IconButton } from '@mui/material';
import { KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material';
import { AuthPersistenceService } from 'dash-auth';
import { dashStorage } from 'dash-utils';
import { useTranslate } from 'react-admin';
/* @ts-ignore */
import KtWaiter from '@app/assets/ktwaiter.svg?react';
import { useRedirect } from 'react-admin';

interface MallClientWelcomeProps {
}

const MallClientWelcome: FC<MallClientWelcomeProps> = (props) => {
    const redirect = useRedirect();
    const translate = useTranslate();
    const tenantImages = AuthPersistenceService.getTenantImages();
    
    // Form state
    const [customerName, setCustomerName] = useState('');
    const [tableNumber, setTableNumber] = useState('');
    
    // Use relative path - React Router will handle the basename
    const create = '/tab/create';

    const handleIncrement = () => {
        setTableNumber(prev => prev ? String(Number(prev) + 1) : '1');
    };

    const handleDecrement = () => {
        setTableNumber(prev => prev && Number(prev) > 0 ? String(Number(prev) - 1) : '0');
    };

    const handleSubmit = () => {
        // Save form data to storage
        dashStorage.setItem('orderData', JSON.stringify({
            name: customerName,
            tableNumber: tableNumber
        }));
        
        // Navigate to create order
        redirect(create);
    };

    const isFormValid = customerName.trim() !== '' && tableNumber.trim() !== '';
    
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
                        opacity: 0.08,
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
                    minHeight: 'calc(100vh - 120px)',
                    position: 'relative',
                    zIndex: 1,
                    p: { xs: 2, md: 4 },
                    maxWidth: 600,
                    mx: 'auto',
                }}
            >
                    {/* Logo */}
                    {tenantImages?.squared_logo?.original && (
                        <img
                            style={{
                                width: '100%',
                                maxWidth: 150,
                                height: 'auto',
                                marginBottom: 16,
                            }}
                            src={tenantImages.squared_logo.original}
                            alt="Logo"
                        />
                    )}

                    {/* Welcome message */}
                    <Typography variant="h4" align="center" gutterBottom>
                        {translate('mall.welcome.title', { _: 'Bienvenido' })}
                    </Typography>
                    <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
                        {translate('mall.welcome.subtitle', { _: 'Ingresa tus datos para comenzar tu orden' })}
                    </Typography>

                    {/* Form Card */}
                    <Card 
                        sx={{ 
                            width: '100%', 
                            p: 3,
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            gap: 2,
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
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            sx={{ flex: 2 }}
                            fullWidth
                        />

                        {/* Table Number Field with increment/decrement */}
                        <Box sx={{ flex: 1, position: 'relative', minWidth: 120 }}>
                            <TextField
                                id="tableNumber"
                                label={translate('mall.welcome.table_label', { _: 'Mesa' })}
                                type="number"
                                variant="outlined"
                                value={tableNumber}
                                onChange={(e) => setTableNumber(e.target.value)}
                                fullWidth
                                inputProps={{
                                    style: {
                                        textAlign: 'center',
                                        fontSize: '1.5rem',
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
                                    sx={{ p: 0.25 }}
                                >
                                    <KeyboardArrowUp fontSize="small" />
                                </IconButton>
                                <IconButton
                                    onClick={handleDecrement}
                                    size="small"
                                    sx={{ p: 0.25 }}
                                >
                                    <KeyboardArrowDown fontSize="small" />
                                </IconButton>
                            </Box>
                        </Box>
                    </Card>

                    {/* Submit Button */}
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        sx={{ mt: 3, px: 4, py: 1.5 }}
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
                            href="https://kitchntabs.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                textDecoration: 'none',
                                color: 'inherit',
                                fontWeight: 600,
                            }}
                        >
                            Kitchntabs.com
                        </a>
                    </Typography>
                </Box>
            </Portal>
        </>
    );
};

export default MallClientWelcome;
