import React from 'react';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper,
    Typography,
    TextField,
    Box
} from '@mui/material';
import { useRecordContext, useInput } from 'react-admin';

const CashCountPOSBreakdown = ({ source }) => {
    const record = useRecordContext();
    
    if (!record || !record.pos_breakdowns) {
        return (
            <Typography variant="body2" color="textSecondary">
                No point of sale breakdown available.
            </Typography>
        );
    }
    
    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Point of Sale Breakdown
            </Typography>
            
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Point of Sale</TableCell>
                            <TableCell align="right">System Sales</TableCell>
                            <TableCell align="right">System Amount</TableCell>
                            <TableCell align="right">System Tips</TableCell>
                            <TableCell align="right">Final Sales</TableCell>
                            <TableCell align="right">Final Amount</TableCell>
                            <TableCell align="right">Final Tips</TableCell>
                            <TableCell align="center">Corrections</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {record.pos_breakdowns.map((breakdown) => (
                            <TableRow key={breakdown.id}>
                                <TableCell component="th" scope="row">
                                    {breakdown.point_of_sale_name}
                                </TableCell>
                                <TableCell align="right">
                                    {breakdown.system_sales}
                                </TableCell>
                                <TableCell align="right">
                                    ${Number(breakdown.system_amount || 0).toFixed(2)}
                                </TableCell>
                                <TableCell align="right">
                                    ${Number(breakdown.system_tips || 0).toFixed(2)}
                                </TableCell>
                                <TableCell align="right">
                                    {breakdown.final_sales || breakdown.system_sales}
                                </TableCell>
                                <TableCell align="right">
                                    ${Number(breakdown.final_amount || breakdown.system_amount || 0).toFixed(2)}
                                </TableCell>
                                <TableCell align="right">
                                    ${Number(breakdown.final_tips || breakdown.system_tips || 0).toFixed(2)}
                                </TableCell>
                                <TableCell align="center">
                                    {breakdown.has_corrections ? '✓' : '-'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default CashCountPOSBreakdown;
