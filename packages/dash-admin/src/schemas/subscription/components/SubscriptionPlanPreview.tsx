import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Button,
    Divider
} from '@mui/material';
import { Check as CheckIcon, Star as StarIcon } from '@mui/icons-material';
import { useRecordContext } from 'react-admin';
import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import { priceFormatter } from 'dash-utils';

const SubscriptionPlanPreview: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute, resourceConfig }) => {
    const record = useRecordContext();

    if (!record) return null;

    const formatPrice = (price: number) => {
        return priceFormatter(price, 'CLP');
    };

    const getBillingCycleText = (cycle: string) => {
        return cycle === 'monthly' ? 'mes' : 'año';
    };

    return (
        <Box maxWidth={400}>
            <Card elevation={3}>
                <CardContent>
                    {/* Header */}
                    <Box textAlign="center" mb={2}>
                        <Typography variant="h5" component="h2" gutterBottom>
                            {record.name}
                        </Typography>
                        
                        {record.has_trial && (
                            <Chip
                                icon={<StarIcon />}
                                label={`${record.trial_days} días gratis`}
                                color="primary"
                                size="small"
                                sx={{ mb: 1 }}
                            />
                        )}
                        
                        <Typography variant="h3" component="div" color="primary">
                            {formatPrice(record.price)}
                        </Typography>
                        
                        <Typography variant="body2" color="textSecondary">
                            por {getBillingCycleText(record.billing_cycle)}
                        </Typography>

                        {record.billing_cycle === 'yearly' && (
                            <Typography variant="body2" color="success.main">
                                {formatPrice(record.price_per_month)} por mes
                            </Typography>
                        )}
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Description */}
                    {record.description && (
                        <Typography variant="body2" color="textSecondary" paragraph>
                            {record.description}
                        </Typography>
                    )}

                    {/* Features */}
                    {record.features && record.features.length > 0 && (
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                Características incluidas:
                            </Typography>
                            <List dense>
                                {record.features.map((feature: string, index: number) => (
                                    <ListItem key={index} disableGutters>
                                        <ListItemIcon sx={{ minWidth: 32 }}>
                                            <CheckIcon color="success" fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary={feature}
                                            primaryTypographyProps={{ variant: 'body2' }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}

                    <Divider sx={{ my: 2 }} />

                    {/* Action Button */}
                    <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        disabled={!record.is_active}
                    >
                        {record.has_trial ? 'Comenzar Prueba Gratis' : 'Suscribirse Ahora'}
                    </Button>

                    {!record.is_active && (
                        <Typography 
                            variant="caption" 
                            color="error" 
                            display="block" 
                            textAlign="center" 
                            mt={1}
                        >
                            Plan no disponible
                        </Typography>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default SubscriptionPlanPreview;