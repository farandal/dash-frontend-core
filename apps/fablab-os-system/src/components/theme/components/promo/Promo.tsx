import React from "react";
import { useTranslate } from "@app/components/hooks/usePolyglotTranslation";
import { Box, Container, Grid, Card, CardContent, Typography, useTheme } from "@mui/material";

const Promo = () => {
    const translate = useTranslate();
    const theme = useTheme();

    const items = [
        {
            icon: translate('landing.features.digitalOrders.icon'),
            title: translate('landing.features.digitalOrders.title'),
            description: translate('landing.features.digitalOrders.description'),
        },
        {
            icon: translate('landing.features.optimizeKitchen.icon'),
            title: translate('landing.features.optimizeKitchen.title'),
            description: translate('landing.features.optimizeKitchen.description'),
        },
        {
            icon: translate('landing.features.syncTeam.icon'),
            title: translate('landing.features.syncTeam.title'),
            description: translate('landing.features.syncTeam.description'),
        }
    ];

    return (
        <Box component="section" sx={{ py: 8 }}>
            <Container maxWidth="lg">
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: 4,
                        alignItems: 'stretch',
                        justifyContent: 'center',
                    }}
                >
                    {items.map((item, index) => (
                        <Card
                            key={index}
                            sx={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                p: 4,
                                borderRadius: 3,
                                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                '&:hover': {
                                    transform: 'translateY(-12px)',
                                    boxShadow: '0 16px 32px rgba(0,0,0,0.15)',
                                    borderColor: 'primary.main',
                                },
                                background: theme.palette.mode === 'dark' 
                                    ? 'rgba(255, 255, 255, 0.03)' 
                                    : '#ffffff',
                                backdropFilter: 'blur(10px)',
                                border: `1px solid ${theme.palette.divider}`,
                            }}
                        >
                            <Box
                                sx={{
                                    mb: 4,
                                    width: 80,
                                    height: 80,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'linear-gradient(135deg, #2a5298 0%, #1e3c72 100%)',
                                    color: '#fff',
                                    borderRadius: '50%',
                                    fontSize: '2.5rem',
                                    boxShadow: '0 6px 20px rgba(30, 60, 114, 0.3)',
                                }}
                            >
                                {item.icon}
                            </Box>
                            <CardContent sx={{ p: 0, flexGrow: 1 }}>
                                <Typography
                                    variant="h5"
                                    component="h3"
                                    sx={{
                                        mb: 2,
                                        fontWeight: 700,
                                        color: 'text.primary',
                                        letterSpacing: '-0.02em'
                                    }}
                                >
                                    {item.title}
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: 'text.secondary',
                                        lineHeight: 1.6
                                    }}
                                >
                                    {item.description}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            </Container>
        </Box>
    );
    
};

export default Promo;
