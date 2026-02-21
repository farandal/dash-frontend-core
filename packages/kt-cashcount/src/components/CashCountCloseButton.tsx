import React, { useState } from 'react';
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Box,
    Alert,
    CircularProgress,
    Chip
} from '@mui/material';
import { useRecordContext, useNotify, useRefresh, useDataProvider } from 'react-admin';
import { format } from 'date-fns';
import { priceFormatter } from 'dash-utils';

interface CashCountCloseButtonProps {
    onClose?: () => void;
}

const CashCountCloseButton: React.FC<CashCountCloseButtonProps> = ({ onClose }) => {
    const record = useRecordContext();
    const notify = useNotify();
    const refresh = useRefresh();
    const dataProvider = useDataProvider();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);


    const canClose = record?.status === 'draft';
    const effectiveTotals = {
        sales: record?.final_total_sales ?? record?.system_total_sales ?? 0,
        amount: record?.final_total_amount ?? record?.system_total_amount ?? 0,
        tips: record?.final_total_tips ?? record?.system_total_tips ?? 0,
    };

    const handleClose = async () => {
        setLoading(true);
        try {
            // Use the dataProvider to make the API call
            await dataProvider.create('cashCount/close', {
                data: { id: record.id }
            });

            notify('Cash count closed successfully', { type: 'success' });
            setOpen(false);
            refresh();
            onClose?.();
        } catch (error: any) {
            notify(`Error closing cash count: ${error.message || 'Unknown error'}`, { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (!canClose) {
        return null;
    }

    return (
        <>
            <Button
                variant="contained"
                color="success"
                onClick={() => setOpen(true)}
                disabled={loading}
                size="large"
                sx={{ mt: 2 }}
            >
                Close Cash Count
            </Button>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={1}>
                        Close Cash Count
                        <Chip label="Final Step" color="success" size="small" />
                    </Box>
                </DialogTitle>
                
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        <Typography variant="body2">
                            <strong>⚠️ This action cannot be undone.</strong> Once closed, this cash count 
                            will be finalized and cannot be modified.
                        </Typography>
                    </Alert>

                      <Box mb={3}>
                        <Typography variant="h6" gutterBottom>
                            Cash Count Summary
                        </Typography>
                        
                        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
                            <Box>
                                <Typography variant="body2" color="textSecondary">Period Start</Typography>
                                <Typography variant="body1">
                                    {record?.period_start && format(new Date(record.period_start), 'MMM dd, yyyy HH:mm')}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="body2" color="textSecondary">Period End</Typography>
                                <Typography variant="body1">
                                    {record?.period_end && format(new Date(record.period_end), 'MMM dd, yyyy HH:mm')}
                                </Typography>
                            </Box>
                        </Box>

                        <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={2}>
                            <Box textAlign="center" p={2} bgcolor="grey.50" borderRadius={1}>
                                <Typography variant="h4" color="primary">
                                    {effectiveTotals.sales}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Total Sales
                                </Typography>
                            </Box>
                            <Box textAlign="center" p={2} bgcolor="grey.50" borderRadius={1}>
                                <Typography variant="h4" color="primary">
                                    {priceFormatter(parseFloat(String(effectiveTotals.amount)) || 0, 'CLP')}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Total Amount
                                </Typography>
                            </Box>
                            <Box textAlign="center" p={2} bgcolor="grey.50" borderRadius={1}>
                                <Typography variant="h4" color="primary">
                                    {priceFormatter(parseFloat(String(effectiveTotals.tips)) || 0, 'CLP')}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Total Tips
                                </Typography>
                            </Box>
                        </Box>

                        {record?.has_corrections && (
                            <Alert severity="info" sx={{ mt: 2 }}>
                                <Typography variant="body2">
                                    📝 This cash count includes manual corrections from the system calculations.
                                </Typography>
                            </Alert>
                        )}
                    </Box>

                    <Box bgcolor="success.light" p={2} borderRadius={1}>
                        <Typography variant="body2" color="success.contrastText">
                            <strong>✅ Ready to Close:</strong> All totals have been reviewed and are ready 
                            for finalization. This will mark the cash count as complete and allow you to 
                            create the next cash count period.
                        </Typography>
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button 
                        onClick={() => setOpen(false)} 
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleClose}
                        variant="contained"
                        color="success"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : null}
                    >
                        {loading ? 'Closing...' : 'Close Cash Count'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default CashCountCloseButton;
