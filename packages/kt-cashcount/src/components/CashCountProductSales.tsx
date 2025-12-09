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
    Box,
    Chip
} from '@mui/material';
import { useRecordContext } from 'react-admin';

const CashCountProductSales = () => {
    const record = useRecordContext();
    
    if (!record || !record.product_sales) {
        return (
            <Typography variant="body2" color="textSecondary">
                No product sales data available.
            </Typography>
        );
    }
    
    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Products Sold During Period
            </Typography>
            
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>SKU</TableCell>
                            <TableCell>Product Name</TableCell>
                            <TableCell align="right">Unit Price</TableCell>
                            <TableCell align="right">Quantity Sold</TableCell>
                            <TableCell align="right">Total Amount</TableCell>
                            <TableCell>POS Distribution</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {record.product_sales.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell>
                                    <Typography variant="body2" fontFamily="monospace">
                                        {product.product_sku || 'N/A'}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">
                                        {product.product_name}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    ${product.unit_price?.toFixed(2)}
                                </TableCell>
                                <TableCell align="right">
                                    <Typography variant="body2" fontWeight="bold">
                                        {product.quantity_sold}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Typography variant="body2" fontWeight="bold">
                                        ${product.total_amount?.toFixed(2)}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                                        {product.pos_breakdown && Object.entries(product.pos_breakdown).map(([posId, data]) => (
                                            <Chip
                                                key={posId}
                                                label={`POS ${posId}: ${data.quantity}`}
                                                size="small"
                                                variant="outlined"
                                            />
                                        ))}
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default CashCountProductSales;
