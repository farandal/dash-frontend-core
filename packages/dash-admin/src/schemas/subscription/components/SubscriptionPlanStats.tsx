import React, { useState, useEffect } from 'react';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Box,
    CircularProgress,
    Chip
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    People as PeopleIcon,
    AttachMoney as MoneyIcon,
    Timeline as TimelineIcon
} from '@mui/icons-material';
import { useRecordContext, useDataProvider } from 'react-admin';
import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";

interface PlanStats {
    total_subscriptions: number;
    active_subscriptions: number;
    trial_subscriptions: number;
    cancelled_subscriptions: number;
    total_revenue: number;
    monthly_revenue: number;
    conversion_rate: number;
}

const StatsView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute, resourceConfig }) => {
    const record = useRecordContext();
    const dataProvider = useDataProvider();
    const [stats, setStats] = useState<PlanStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (record?.id) {
            fetchStats();
        }
    }, [record?.id]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const { data } = await dataProvider.getOne('system/subscription-plan/stats', {id:record.id});
            setStats(data);
        } catch (error) {
            console.error('Error fetching plan stats:', error);
            setStats({
                total_subscriptions: record.active_subscriptions_count || 0,
                active_subscriptions: record.active_subscriptions_count || 0,
                trial_subscriptions: 0,
                cancelled_subscriptions: 0,
                total_revenue: 0,
                monthly_revenue: 0,
                conversion_rate: 0
            });
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(amount / 100);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
            </Box>
        );
    }

    if (!stats) {
        return (
            <Typography variant="body2" color="error">
                Error al cargar las estadísticas
            </Typography>
        );
    }

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Estadísticas del Plan
            </Typography>
            
            <Grid container spacing={2}>
                {/* @ts-ignore - Grid API compatibility issue */}
                <Grid component="div" item size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={1}>
                                <PeopleIcon color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6" color="primary">
                                    {stats.total_subscriptions}
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                                Total Suscripciones
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* @ts-ignore - Grid API compatibility issue */}
                <Grid component="div" item size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={1}>
                                <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                                <Typography variant="h6" color="success.main">
                                    {stats.active_subscriptions}
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                                Suscripciones Activas
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* @ts-ignore - Grid API compatibility issue */}
                <Grid component="div" item size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={1}>
                                <TimelineIcon color="info" sx={{ mr: 1 }} />
                                <Typography variant="h6" color="info.main">
                                    {stats.trial_subscriptions}
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                                En Período de Prueba
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* @ts-ignore - Grid API compatibility issue */}
                <Grid component="div" item size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={1}>
                                <Typography variant="h6" color="error.main">
                                    {stats.cancelled_subscriptions}
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                                Canceladas
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* @ts-ignore - Grid API compatibility issue */}
                <Grid component="div" item size={{ xs: 12, sm: 6 }}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={1}>
                                <MoneyIcon color="success" sx={{ mr: 1 }} />
                                <Typography variant="h6" color="success.main">
                                    {formatCurrency(stats.total_revenue)}
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                                Ingresos Totales
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* @ts-ignore - Grid API compatibility issue */}
                <Grid component="div" item size={{ xs: 12, sm: 6 }}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={1}>
                                <MoneyIcon color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6" color="primary">
                                    {formatCurrency(stats.monthly_revenue)}
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                                Ingresos Mensuales
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* @ts-ignore - Grid API compatibility issue */}
                <Grid component="div" item size={12}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="h6">
                                        Tasa de Conversión
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        De prueba a suscripción pagada
                                    </Typography>
                                </Box>
                                <Chip
                                    label={`${stats.conversion_rate.toFixed(1)}%`}
                                    color={stats.conversion_rate > 50 ? 'success' : stats.conversion_rate > 25 ? 'warning' : 'error'}
                                    size="medium"
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Box mt={3}>
                <Typography variant="h6" gutterBottom>
                    Información Adicional
                </Typography>
                <Grid container spacing={2}>
                    {/* @ts-ignore - Grid API compatibility issue */}
                    <Grid component="div" item size={{ xs: 12, sm: 6 }}>
                        <Typography variant="body2" color="textSecondary">
                            <strong>Estado del Plan:</strong>{' '}
                            <Chip
                                label={record.is_active ? 'Activo' : 'Inactivo'}
                                color={record.is_active ? 'success' : 'error'}
                                size="small"
                            />
                        </Typography>
                    </Grid>
                    {/* @ts-ignore - Grid API compatibility issue */}
                    <Grid component="div" item size={{ xs: 12, sm: 6 }}>
                        <Typography variant="body2" color="textSecondary">
                            <strong>Período de Prueba:</strong>{' '}
                            {record.has_trial ? `${record.trial_days} días` : 'No disponible'}
                        </Typography>
                    </Grid>
                    {/* @ts-ignore - Grid API compatibility issue */}
                    <Grid component="div" item size={{ xs: 12, sm: 6 }}>
                        <Typography variant="body2" color="textSecondary">
                            <strong>Ciclo de Facturación:</strong>{' '}
                            {record.billing_cycle_label}
                        </Typography>
                    </Grid>
                    {/* @ts-ignore - Grid API compatibility issue */}
                    <Grid component="div" item size={{ xs: 12, sm: 6 }}>
                        <Typography variant="body2" color="textSecondary">
                            <strong>Precio por Mes:</strong>{' '}
                            {formatCurrency(record.price_per_month)}
                        </Typography>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

const SubscriptionPlanStats = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
    switch (method) {
        case "view":
            return <StatsView attribute={attribute} method={method} resourceConfig={resourceConfig} />;
        default:
            return <></>;
    }
};

export default SubscriptionPlanStats;