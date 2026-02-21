import React from 'react';
import { 
    Box, 
    Typography, 
    Button, 
    Paper,
    Grid,
    Divider
} from '@mui/material';
import { useRecordContext, useDataProvider } from 'react-admin';
import { Print, GetApp } from '@mui/icons-material';
import { priceFormatter } from 'dash-utils';

// Bridge helper for string amounts
const formatAmount = (amount: number | string): string => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : (amount || 0);
    return priceFormatter(numericAmount, 'CLP');
};

const CashCountReport = () => {
    const record = useRecordContext();
    const dataProvider = useDataProvider();
    
    if (!record) return null;
    
    const handlePrintReport = () => {
        // Implement print functionality
        window.print();
    };
    
    const handleDownloadReport = async () => {
        try {
            const response = await dataProvider.getOne('tab/cashcount', {
                id: record.id,
                meta: { action: 'report' }
            });
            
            // Handle download logic here
            console.log('Report data:', response.data);
        } catch (error) {
            console.error('Error downloading report:', error);
        }
    };
  
    
    const formatDate = (date) => {
        return new Date(date).toLocaleString();
    };
    
    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                    Cash Count Report
                </Typography>
                <Box>
                    <Button
                        startIcon={<Print />}
                        onClick={handlePrintReport}
                        variant="outlined"
                        size="small"
                        sx={{ mr: 1 }}
                    >
                        Print
                    </Button>
                    <Button
                        startIcon={<GetApp />}
                        onClick={handleDownloadReport}
                        variant="outlined"
                        size="small"
                    >
                        Download
                    </Button>
                </Box>
            </Box>
            
            <Paper sx={{ p: 3 }}>
                {/* Header */}
                <Box mb={3}>
                    <Typography variant="h4" gutterBottom>
                        Cash Count Report #{record.id}
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Typography variant="body2" color="textSecondary">
                                Period Start
                            </Typography>
                            <Typography variant="body1">
                                {formatDate(record.period_start)}
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2" color="textSecondary">
                                Period End
                            </Typography>
                            <Typography variant="body1">
                                {formatDate(record.period_end)}
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2" color="textSecondary">
                                Duration
                            </Typography>
                            <Typography variant="body1">
                                {record.period_duration}
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2" color="textSecondary">
                                Status
                            </Typography>
                            <Typography variant="body1">
                                {record.status_label}
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                {/* Summary */}
                <Box mb={3}>
                    <Typography variant="h6" gutterBottom>
                        Summary
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={4}>
                            <Typography variant="body2" color="textSecondary">
                                Total Sales
                            </Typography>
                            <Typography variant="h5">
                                {record.final_total_sales || record.system_total_sales}
                            </Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body2" color="textSecondary">
                                Total Amount
                            </Typography>
                            <Typography variant="h5">
                                {formatAmount(record.final_total_amount || record.system_total_amount)}
                            </Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body2" color="textSecondary">
                                Total Tips
                            </Typography>
                            <Typography variant="h5">
                                {formatAmount(record.final_total_tips || record.system_total_tips)}
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                {/* Notes */}
                {record.notes && (
                    <Box mb={3}>
                        <Typography variant="h6" gutterBottom>
                            Notes
                        </Typography>
                        <Typography variant="body1">
                            {record.notes}
                        </Typography>
                    </Box>
                )}
                
                {/* Footer */}
                <Box mt={4} pt={2} borderTop={1} borderColor="divider">
                    <Typography variant="body2" color="textSecondary">
                        Generated on {formatDate(new Date())} by {record.user?.name}
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
};

export default CashCountReport;
