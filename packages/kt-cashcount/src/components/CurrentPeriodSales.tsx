import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Alert,
    CircularProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    LinearProgress,
    Stack,
    Divider,
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    ExpandMore,
    TrendingUp,
    TrendingDown,
    TrendingFlat,
    Refresh,
    Store,
    ShoppingCart,
    Receipt,
    Timeline,
} from '@mui/icons-material';
import { useDataProvider, useNotify, useTranslate } from 'react-admin';
import { formatCurrency } from 'kt-ecommerce';
import { useAxios } from 'dash-axios-hook';

interface CurrentPeriodData {
    period: {
        start: string;
        end: string;
        days: number;
        is_first_period: boolean;
    };
    last_closed_cash_count: {
        id: number;
        period_end: string;
        final_total_amount: string;
        final_total_sales: number;
    } | null;
    current_totals: {
        sales: number;
        amount: string;
        tips: string;
    };
    daily_averages: {
        sales: number;
        amount: number;
        tips: number;
    };
    pos_breakdown: Array<{
        point_of_sale_id: number;
        point_of_sale_name: string;
        sales: number;
        amount: string;
        tips: string;
        percentage_of_total: number;
    }>;
    product_breakdown: Array<{
        product_id: number;
        product_name: string;
        product_sku: string | null;
        quantity_sold: number;
        total_amount: string;
        average_price: string;
    }>;
    recent_orders: Array<{
        id: number;
        created_at: string;
        total_amount: string;
        status: string;
        point_of_sale_name: string;
        items_count: number;
    }>;
    growth_comparison: {
        has_comparison: boolean;
        message?: string;
        last_period_days?: number;
        current_period_days?: number;
        metrics?: {
            sales: {
                last_daily_average: number;
                current_daily_average: number;
                percentage_change: number;
                trend: 'up' | 'down' | 'stable';
            };
            amount: {
                last_daily_average: number;
                current_daily_average: number;
                percentage_change: number;
                trend: 'up' | 'down' | 'stable';
            };
            tips: {
                last_daily_average: number;
                current_daily_average: number;
                percentage_change: number;
                trend: 'up' | 'down' | 'stable';
            };
        };
    };
}

const CurrentPeriodSales: React.FC = () => {
    const [data, setData] = useState<CurrentPeriodData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const translate = useTranslate();
    const axios = useAxios();

    const fetchData = async (showRefreshIndicator = false) => {
        try {
            if (showRefreshIndicator) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const response = await axios.get('tab/cashcount/current-period-sales');

            if (response.data?.success) {
                setData(response.data.data);
            } else {
                notify('Failed to load current period sales', { type: 'error' });
            }
        } catch (error) {
            console.error('Error fetching current period sales:', error);
            notify('Failed to load current period sales', { type: 'error' });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRefresh = () => {
        fetchData(true);
    };

    const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
        switch (trend) {
            case 'up':
                return <TrendingUp color="success" />;
            case 'down':
                return <TrendingDown color="error" />;
            default:
                return <TrendingFlat color="action" />;
        }
    };

    const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
        switch (trend) {
            case 'up':
                return 'success.main';
            case 'down':
                return 'error.main';
            default:
                return 'text.secondary';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDateShort = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <Card>
                <CardContent>
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                        <CircularProgress />
                    </Box>
                </CardContent>
            </Card>
        );
    }

    if (!data) {
        return (
            <Card>
                <CardContent>
                    <Alert severity="error">
                        {translate('cashcount.current_period_error', { _: 'Failed to load current period data' })}
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <Box>
            {/* Header */}
            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6" component="h2">
                            <Timeline sx={{ mr: 1, verticalAlign: 'middle' }} />
                            {translate('cashcount.current_period_sales', { _: 'Current Period Sales' })}
                        </Typography>
                        <Tooltip title={translate('cashcount.refresh', { _: 'Refresh' })}>
                            <IconButton onClick={handleRefresh} disabled={refreshing}>
                                <Refresh />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    {refreshing && <LinearProgress sx={{ mb: 2 }} />}

                    {/* Period Info */}
                    <Alert severity="info" sx={{ mb: 2 }}>
                        {data.period.is_first_period ? (
                            translate('cashcount.first_period_message', {
                                days: data.period.days,
                                start: formatDateShort(data.period.start),
                                _: 'This is your first cash count period. Showing sales from %{start} (%{days} days ago) to now.'
                            })
                        ) : (
                            translate('cashcount.period_since_last', {
                                days: data.period.days,
                                lastEnd: formatDateShort(data.last_closed_cash_count!.period_end),
                                _: 'Showing sales since last cash count closed on %{lastEnd} (%{days} days ago).'
                            })
                        )}
                    </Alert>

                    {/* Current Totals */}
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Box textAlign="center">
                                <Typography variant="h4" color="primary">
                                    {data.current_totals.sales}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {translate('cashcount.total_sales', { _: 'Total Sales' })}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    {translate('cashcount.daily_average', { 
                                        avg: data.daily_averages.sales.toFixed(1),
                                        _: 'Avg: %{avg}/day'
                                    })}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Box textAlign="center">
                                <Typography variant="h4" color="primary">
                                    {formatCurrency(data.current_totals.amount)}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {translate('cashcount.total_amount', { _: 'Total Amount' })}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    {translate('cashcount.daily_average', { 
                                        avg: formatCurrency(data.daily_averages.amount),
                                        _: 'Avg: %{avg}/day'
                                    })}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Box textAlign="center">
                                <Typography variant="h4" color="primary">
                                    {formatCurrency(data.current_totals.tips)}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {translate('cashcount.total_tips', { _: 'Total Tips' })}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    {translate('cashcount.daily_average', { 
                                        avg: formatCurrency(data.daily_averages.tips),
                                        _: 'Avg: %{avg}/day'
                                    })}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Growth Comparison */}
            {/*data.growth_comparison.has_comparison && data.growth_comparison.metrics && (
                <Card sx={{ mb: 2 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            {translate('cashcount.growth_comparison', { _: 'Growth Comparison' })}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            {translate('cashcount.daily_average_comparison', { _: 'Daily averages compared to last closed period' })}
                        </Typography>
                        
                        <Grid container spacing={2}>
                            {Object.entries(data.growth_comparison.metrics).map(([metric, data]) => (
                                <Grid item xs={12} md={4} key={metric}>
                                    <Box display="flex" alignItems="center" justifyContent="space-between" p={1}>
                                        <Box>
                                            <Typography variant="body2" fontWeight="medium">
                                                {translate(`cashcount.${metric}`, { _: metric.charAt(0).toUpperCase() + metric.slice(1) })}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                {metric === 'sales' ? 
                                                    `${data.last_daily_average} → ${data.current_daily_average}` :
                                                    `${formatCurrency(data.last_daily_average)} → ${formatCurrency(data.current_daily_average)}`
                                                }
                                            </Typography>
                                        </Box>
                                        <Box display="flex" alignItems="center">
                                            {getTrendIcon(data.trend)}
                                            <Typography 
                                                variant="body2" 
                                                fontWeight="medium"
                                                color={getTrendColor(data.trend)}
                                                sx={{ ml: 0.5 }}
                                            >
                                                {data.percentage_change > 0 ? '+' : ''}{data.percentage_change}%
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </CardContent>
                </Card>
            )*/}

            {/* Detailed Breakdowns */}
            <Stack spacing={2}>
                {/* POS Breakdown */}
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                        <Box display="flex" alignItems="center">
                            <Store sx={{ mr: 1 }} />
                            <Typography variant="h6">
                                {translate('cashcount.pos_breakdown', { 
                                    count: data.pos_breakdown.length,
                                    _: 'Point of Sale Breakdown (%{count} locations)'
                                })}
                            </Typography>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                        <TableContainer component={Paper}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{translate('cashcount.location', { _: 'Location' })}</TableCell>
                                        <TableCell align="center">{translate('cashcount.sales', { _: 'Sales' })}</TableCell>
                                        <TableCell align="center">{translate('cashcount.amount', { _: 'Amount' })}</TableCell>
                                        <TableCell align="center">{translate('cashcount.tips', { _: 'Tips' })}</TableCell>
                                        <TableCell align="center">{translate('cashcount.percentage', { _: '% of Total' })}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.pos_breakdown.map((pos) => (
                                        <TableRow key={pos.point_of_sale_id}>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {pos.point_of_sale_name}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">{pos.sales}</TableCell>
                                            <TableCell align="center">{formatCurrency(pos.amount)}</TableCell>
                                            <TableCell align="center">{formatCurrency(pos.tips)}</TableCell>
                                            <TableCell align="center">
                                                <Box display="flex" alignItems="center" justifyContent="center">
                                                    <Typography variant="body2" sx={{ mr: 1 }}>
                                                        {pos.percentage_of_total}%
                                                    </Typography>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={pos.percentage_of_total}
                                                        sx={{ width: 40, height: 4 }}
                                                    />
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </AccordionDetails>
                </Accordion>

                {/* Product Breakdown */}
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                        <Box display="flex" alignItems="center">
                            <ShoppingCart sx={{ mr: 1 }} />
                            <Typography variant="h6">
                                {translate('cashcount.top_products', { _: 'Top Products' })}
                            </Typography>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                        <TableContainer component={Paper}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{translate('cashcount.product', { _: 'Product' })}</TableCell>
                                        <TableCell align="center">{translate('cashcount.quantity_sold', { _: 'Qty Sold' })}</TableCell>
                                        <TableCell align="center">{translate('cashcount.total_amount', { _: 'Total Amount' })}</TableCell>
                                        <TableCell align="center">{translate('cashcount.avg_price', { _: 'Avg Price' })}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.product_breakdown.map((product, index) => (
                                        <TableRow key={product.product_id}>
                                            <TableCell>
                                                <Box>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {product.product_name}
                                                    </Typography>
                                                    {product.product_sku && (
                                                        <Typography variant="caption" color="textSecondary">
                                                            SKU: {product.product_sku}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip 
                                                    label={product.quantity_sold}
                                                    size="small"
                                                    color={index < 3 ? 'primary' : 'default'}
                                                />
                                            </TableCell>
                                            <TableCell align="center">{formatCurrency(product.total_amount)}</TableCell>
                                            <TableCell align="center">{formatCurrency(product.average_price)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </AccordionDetails>
                </Accordion>

                {/* Recent Orders */}
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                        <Box display="flex" alignItems="center">
                            <Receipt sx={{ mr: 1 }} />
                            <Typography variant="h6">
                                {translate('cashcount.recent_orders', { _: 'Recent Orders' })}
                            </Typography>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                        <TableContainer component={Paper}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{translate('cashcount.order_id', { _: 'Order ID' })}</TableCell>
                                        <TableCell>{translate('cashcount.date_time', { _: 'Date & Time' })}</TableCell>
                                        <TableCell>{translate('cashcount.location', { _: 'Location' })}</TableCell>
                                        <TableCell align="center">{translate('cashcount.items', { _: 'Items' })}</TableCell>
                                        <TableCell align="center">{translate('cashcount.amount', { _: 'Amount' })}</TableCell>
                                        <TableCell align="center">{translate('cashcount.status', { _: 'Status' })}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.recent_orders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="medium">
                                                    #{order.id}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {formatDate(order.created_at)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {order.point_of_sale_name}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip 
                                                    label={order.items_count}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" fontWeight="medium">
                                                    {formatCurrency(order.total_amount)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip 
                                                    label={order.status}
                                                    size="small"
                                                    color={order.status === 'completed' ? 'success' : 'default'}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </AccordionDetails>
                </Accordion>
            </Stack>
        </Box>
    );
};

export default CurrentPeriodSales;
