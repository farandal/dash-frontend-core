import React, { useEffect } from 'react';
import { useTranslate } from 'react-admin';
import { Box, Paper, Typography, Button, Card, CardContent } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useKiosk } from '../contexts/KioskContext';

export const KioskConfirmationView: React.FC = () => {
    const translate = useTranslate();
    const { confirmation, resetOrder, formatPrice, session } = useKiosk();

    // Auto-reset after 30 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            resetOrder();
        }, 30000);

        return () => clearTimeout(timer);
    }, [resetOrder]);

    if (!confirmation) {
        return (
            <Box
                sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Typography>{translate('kiosk.loading')}</Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 4,
                backgroundColor: 'success.light',
            }}
        >
            <Paper
                elevation={8}
                sx={{
                    p: 4,
                    borderRadius: 4,
                    textAlign: 'center',
                    maxWidth: 500,
                    width: '100%',
                }}
            >
                {/* Success Icon */}
                <CheckCircleOutlineIcon
                    sx={{
                        fontSize: 100,
                        color: 'success.main',
                        mb: 2,
                    }}
                />

                {/* Title */}
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                    {translate('kiosk.order_confirmed')}
                </Typography>

                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    {translate('kiosk.thank_you')}
                </Typography>

                {/* Ticket Number */}
                <Card
                    sx={{
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                        mb: 4,
                    }}
                >
                    <CardContent sx={{ py: 4 }}>
                        <Typography
                            variant="overline"
                            sx={{ letterSpacing: 2, opacity: 0.9 }}
                        >
                            {translate('kiosk.your_order_number')}
                        </Typography>
                        <Typography
                            variant="h1"
                            sx={{
                                fontWeight: 800,
                                fontSize: '5rem',
                                lineHeight: 1,
                            }}
                        >
                            #{confirmation.ticket_number}
                        </Typography>
                    </CardContent>
                </Card>

                {/* Order Details */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 4,
                        mb: 4,
                    }}
                >
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                            {translate('kiosk.total')}
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            {formatPrice(confirmation.total)}
                        </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                            {translate('kiosk.status')}
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>
                            {confirmation.status}
                        </Typography>
                    </Box>
                </Box>

                {/* Tenant Branding */}
                {session?.tenant?.name && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                        {session.tenant.name}
                    </Typography>
                )}

                {/* New Order Button */}
                <Button
                    variant="contained"
                    size="large"
                    onClick={resetOrder}
                    startIcon={<RestartAltIcon />}
                    sx={{
                        py: 2,
                        px: 6,
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        borderRadius: 2,
                    }}
                >
                    {translate('kiosk.start_new_order')}
                </Button>

                {/* Auto-reset notice */}
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 2 }}
                >
                    {translate('kiosk.auto_reset_notice')}
                </Typography>
            </Paper>
        </Box>
    );
};

export default KioskConfirmationView;
