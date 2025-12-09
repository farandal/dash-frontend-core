import React, { useState, useEffect } from 'react';
import { 
    Create, 
    SimpleForm, 
    TextInput, 
    useNotify, 
    useRedirect,
    useDataProvider 
} from 'react-admin';
import { 
    Box, 
    Typography, 
    Alert, 
    Card, 
    CardContent, 
    Grid,
    Chip,
    Button
} from '@mui/material';
import { Schedule, Warning, CheckCircle } from '@mui/icons-material';

const CashCountCreate = () => {
    const [canCreate, setCanCreate] = useState(null);
    const [nextPeriod, setNextPeriod] = useState(null);
    const [loading, setLoading] = useState(true);
    const [existingCashCount, setExistingCashCount] = useState(null);
    
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const redirect = useRedirect();

    useEffect(() => {
        checkCanCreate();
    }, []);

    const checkCanCreate = async () => {
        try {
            setLoading(true);
            const response = await dataProvider.getList('tab/cashcount/can-create', {
                pagination: { page: 1, perPage: 1 },
                sort: { field: 'id', order: 'ASC' },
                filter: {}
            });
            
            const data = response.data[0] || response;
            setCanCreate(data.can_create);
            setNextPeriod(data.next_period);
            setExistingCashCount(data.existing_cash_count);
        } catch (error) {
            notify('Error checking cash count status', { type: 'error' });
            console.error('Error checking can create:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGoToExisting = () => {
        if (existingCashCount) {
            redirect(`/tab/cashcount/${existingCashCount.id}/show`);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <Typography>Checking cash count status...</Typography>
            </Box>
        );
    }

    if (!canCreate) {
        return (
            <Box p={3}>
                <Alert 
                    severity="warning" 
                    icon={<Warning />}
                    sx={{ mb: 3 }}
                >
                    <Typography variant="h6" gutterBottom>
                        Cannot Create New Cash Count
                    </Typography>
                    <Typography>
                        There is already an open cash count. Please close it before creating a new one.
                    </Typography>
                </Alert>
                
                {existingCashCount && (
                    <Card sx={{ mt: 2 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Existing Open Cash Count
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="textSecondary">
                                        ID
                                    </Typography>
                                    <Typography variant="body1">
                                        #{existingCashCount.id}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="textSecondary">
                                        Status
                                    </Typography>
                                    <Chip 
                                        label={existingCashCount.status_label || existingCashCount.status}
                                        color={existingCashCount.status === 'preview' ? 'warning' : 'default'}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="textSecondary">
                                        Period Start
                                    </Typography>
                                    <Typography variant="body1">
                                        {new Date(existingCashCount.period_start).toLocaleString()}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="textSecondary">
                                        Period End
                                    </Typography>
                                    <Typography variant="body1">
                                        {new Date(existingCashCount.period_end).toLocaleString()}
                                    </Typography>
                                </Grid>
                            </Grid>
                            
                            <Box mt={2}>
                                <Button 
                                    variant="contained" 
                                    color="primary"
                                    onClick={handleGoToExisting}
                                >
                                    Go to Existing Cash Count
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                )}
            </Box>
        );
    }

    return (
        <Create>
            <Box p={3}>
                <Alert 
                    severity="info" 
                    icon={<CheckCircle />}
                    sx={{ mb: 3 }}
                >
                    <Typography variant="h6" gutterBottom>
                        Ready to Create New Cash Count
                    </Typography>
                    <Typography>
                        The system will automatically calculate the period dates based on your previous cash counts.
                    </Typography>
                </Alert>

                {nextPeriod && (
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <Schedule sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="h6">
                                    Next Cash Count Period
                                </Typography>
                            </Box>
                            
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <Typography variant="body2" color="textSecondary">
                                        Start Date
                                    </Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {new Date(nextPeriod.period_start).toLocaleString()}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Typography variant="body2" color="textSecondary">
                                        End Date
                                    </Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {new Date(nextPeriod.period_end).toLocaleString()}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Typography variant="body2" color="textSecondary">
                                        Duration
                                    </Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {nextPeriod.period_duration}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                )}

                <SimpleForm>
                    <Typography variant="h6" gutterBottom>
                        Cash Count Details
                    </Typography>
                    
                    <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                            <strong>Note:</strong> The period dates are automatically calculated to ensure sequential cash counts. 
                            Only notes can be added during creation.
                        </Typography>
                    </Alert>

                    <TextInput
                        source="notes"
                        label="Notes (Optional)"
                        multiline
                        rows={3}
                        fullWidth
                        helperText="Add any notes or comments about this cash count period"
                    />
                </SimpleForm>
            </Box>
        </Create>
    );
};

export default CashCountCreate;
