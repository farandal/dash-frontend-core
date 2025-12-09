import React from 'react';
import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import { useRecordContext, useTranslate } from "react-admin";
import { 
    Box, 
    Typography, 
    Grid, 
    Card, 
    CardContent,
    Chip
} from '@mui/material';
import { format, parseISO } from 'date-fns';

const ListComponent: React.FC<IDashAutoAdminCustomFieldComponent> = () => {
    const record = useRecordContext();
    const translate = useTranslate();
    
    const formatDate = (dateString: string) => {
        try {
            return format(parseISO(dateString), 'MMM dd, yyyy HH:mm');
        } catch {
            return translate('cashcount.invalid_date', { _: 'Invalid date' });
        }
    };
    
    return (
        <Box>
            <Typography variant="body2" color="textSecondary">
                {record?.period_start && formatDate(record.period_start)} - {record?.period_end && formatDate(record.period_end)}
            </Typography>
            {record?.period_duration && (
                <Typography variant="caption" color="textSecondary">
                    {translate('cashcount.duration_label', { duration: record.period_duration, _: 'Duration: %{duration}' })}
                </Typography>
            )}
        </Box>
    );
};

const ViewComponent: React.FC<IDashAutoAdminCustomFieldComponent> = () => {
    const record = useRecordContext();
    const translate = useTranslate();
    
    const formatDate = (dateString: string) => {
        try {
            return format(parseISO(dateString), 'MMMM dd, yyyy HH:mm:ss');
        } catch {
            return translate('cashcount.invalid_date', { _: 'Invalid date' });
        }
    };
    
    return (
        <Card>
            <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                    {translate('cashcount.cash_count_period', { _: 'Cash Count Period' })}
                </Typography>
                
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                            {translate('cashcount.period_start', { _: 'Period Start' })}
                        </Typography>
                        <Typography variant="body1" sx={{ fontSize: '0.875rem' }}>
                            {record?.period_start && formatDate(record.period_start)}
                        </Typography>
                    </Grid>
                    
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                            {translate('cashcount.period_end', { _: 'Period End' })}
                        </Typography>
                        <Typography variant="body1" sx={{ fontSize: '0.875rem' }}>
                            {record?.period_end && formatDate(record.period_end)}
                        </Typography>
                    </Grid>
                    
                    {record?.period_duration && (
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                                {translate('cashcount.duration', { _: 'Duration' })}
                            </Typography>
                            <Chip 
                                label={record.period_duration} 
                                color="primary" 
                                variant="outlined" 
                                size="small"
                                sx={{ fontSize: '0.75rem', height: 24 }}
                            />
                        </Grid>
                    )}
                </Grid>
            </CardContent>
        </Card>
    );
};

const EditComponent: React.FC<IDashAutoAdminCustomFieldComponent> = () => {
    const record = useRecordContext();
    const translate = useTranslate();
    
    const formatDate = (dateString: string) => {
        try {
            return format(parseISO(dateString), 'MMMM dd, yyyy HH:mm:ss');
        } catch {
            return translate('cashcount.invalid_date', { _: 'Invalid date' });
        }
    };
    
    // Period dates are read-only in edit mode
    return (
        <Card>
            <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                    {translate('cashcount.cash_count_period_readonly', { _: 'Cash Count Period (Read Only)' })}
                </Typography>
                
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                            {translate('cashcount.period_start', { _: 'Period Start' })}
                        </Typography>
                        <Typography variant="body1" sx={{ fontSize: '0.875rem' }}>
                            {record?.period_start && formatDate(record.period_start)}
                        </Typography>
                    </Grid>
                    
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                            {translate('cashcount.period_end', { _: 'Period End' })}
                        </Typography>
                        <Typography variant="body1" sx={{ fontSize: '0.875rem' }}>
                            {record?.period_end && formatDate(record.period_end)}
                        </Typography>
                    </Grid>
                    
                    {record?.period_duration && (
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                                {translate('cashcount.duration', { _: 'Duration' })}
                            </Typography>
                            <Chip 
                                label={record.period_duration} 
                                color="primary" 
                                variant="outlined" 
                                size="small"
                                sx={{ fontSize: '0.75rem', height: 24 }}
                            />
                        </Grid>
                    )}
                </Grid>
            </CardContent>
        </Card>
    );
};

const CreateComponent: React.FC<IDashAutoAdminCustomFieldComponent> = () => {
    const translate = useTranslate();
    
    return (
        <Card>
            <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                    {translate('cashcount.cash_count_period', { _: 'Cash Count Period' })}
                </Typography>
                
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Box 
                            p={2} 
                            borderRadius={1} 
                            textAlign="center"
                            sx={{ backgroundColor: 'grey.50' }}
                        >
                            <Typography variant="body1" color="textSecondary" gutterBottom sx={{ fontSize: '0.875rem' }}>
                                📅 {translate('cashcount.period_auto_calculated', { _: 'Period dates will be calculated automatically' })}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8rem' }}>
                                {translate('cashcount.period_auto_description', { _: 'The system will determine the optimal period based on your last cash count' })}
                            </Typography>
                        </Box>
                    </Grid>
                    
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Box 
                            p={2} 
                            bgcolor="success.light" 
                            borderRadius={1}
                            sx={{ height: 'fit-content' }}
                        >
                            <Typography variant="body2" color="success.contrastText" sx={{ fontSize: '0.8rem' }}>
                                ✅ <strong>{translate('cashcount.automatic_calculation', { _: 'Automatic Period Calculation:' })}</strong> {translate('cashcount.automatic_calculation_description', { _: 'The cash count will start from where your last one ended and continue until now, ensuring no gaps in your records.' })}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

const CashCountPeriodInfo = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
    switch (method) {
        case "edit":
            return <EditComponent attribute={attribute} method={method} resourceConfig={resourceConfig} />;
        case "create":
            return <CreateComponent attribute={attribute} method={method} resourceConfig={resourceConfig} />;
        case "view":
            return <ViewComponent attribute={attribute} method={method} resourceConfig={resourceConfig} />;
        case "list":
            return <ListComponent attribute={attribute} method={method} resourceConfig={resourceConfig} />;
        default:
            return <>-</>;
    }
};

export default CashCountPeriodInfo;
