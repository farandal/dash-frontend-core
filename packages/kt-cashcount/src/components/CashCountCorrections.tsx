import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { useRecordContext } from 'react-admin';

const CashCountCorrections = () => {
    const record = useRecordContext();
    
    if (!record || !record.corrections) {
        return (
            <Alert severity="info">
                No corrections made - system values were accepted as final.
            </Alert>
        );
    }
    
    const { corrections } = record;
    
    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Corrections Applied
            </Typography>
            
            {corrections.sales_diff !== 0 && (
                <Typography variant="body2">
                    Sales Count: {corrections.sales_diff > 0 ? '+' : ''}{corrections.sales_diff}
                </Typography>
            )}
            
            {corrections.amount_diff !== 0 && (
                <Typography variant="body2">
                    Amount: {corrections.amount_diff > 0 ? '+' : ''}${corrections.amount_diff.toFixed(2)}
                </Typography>
            )}
            
            {corrections.tips_diff !== 0 && (
                <Typography variant="body2">
                    Tips: {corrections.tips_diff > 0 ? '+' : ''}${corrections.tips_diff.toFixed(2)}
                </Typography>
            )}
        </Box>
    );
};

export default CashCountCorrections;
