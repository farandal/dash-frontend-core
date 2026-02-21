import React from 'react';
import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import { useRecordContext, useTranslate } from "react-admin";
import { 
    Box, 
    Typography, 
    Grid, 
    Card, 
    CardContent, 
    TextField,
    Chip,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Divider,
    Stack
} from '@mui/material';
import { useFormContext } from 'react-hook-form';
import { FormattedPrice } from 'kt-ecommerce';
import { priceFormatter } from 'dash-utils';

// Bridge helper: extracts currency code from currency object for priceFormatter
const formatCurrencyBridge = (amount: number | string, currency?: any): string => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : (amount || 0);
    const currencyCode = currency?.code || 'CLP';
    return priceFormatter(numericAmount, currencyCode);
};


const ListComponent: React.FC<IDashAutoAdminCustomFieldComponent> = () => {
    const record = useRecordContext();
    const translate = useTranslate();
    
    const effectiveAmount = record?.final_total_amount ?? record?.system_total_amount ?? 0;
    const effectiveSales = record?.final_total_sales ?? record?.system_total_sales ?? 0;
    
    return (
        <Box>
            <Typography variant="body2" color="textSecondary">
                {translate('cashcount.sales_count', { count: effectiveSales, _: '%{count} sales' })} • {formatCurrencyBridge(effectiveAmount, record?.currency)}
            </Typography>
        </Box>
    );
};

const ViewComponent: React.FC<IDashAutoAdminCustomFieldComponent> = () => {
    const record = useRecordContext();
    const translate = useTranslate();
    
    const hasCorrections = record?.has_corrections || 
        (record?.final_total_amount !== null && record?.final_total_amount !== record?.system_total_amount);
    
    return (
        <Grid container spacing={2}>
            {/* System and Final Totals - Side by Side */}
            <Grid size={12}>
                <Card>
                    <CardContent sx={{ py: 2 }}>
                        <Grid container spacing={3}>
                            {/* System Totals */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="h6" gutterBottom sx={{ mb: 1 }}>
                                    {translate('cashcount.system_totals', { _: 'System Totals' })}
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid size={4}>
                                        <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                                            {translate('cashcount.sales_count_short', { _: 'Sales' })}
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                                            {record?.system_total_sales || 0}
                                        </Typography>
                                    </Grid>
                                    <Grid size={4}>
                                        <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                                            {translate('cashcount.amount', { _: 'Amount' })}
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                                            {formatCurrencyBridge(record?.system_total_amount, record?.currency)}
                                        </Typography>
                                    </Grid>
                                    <Grid size={4}>
                                        <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                                            {translate('cashcount.tips', { _: 'Tips' })}
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                                            {formatCurrencyBridge(record?.system_total_tips, record?.currency)}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Grid>
                            
                            {/* Final Totals */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                                    <Typography variant="h6">
                                        {translate('cashcount.final_totals', { _: 'Final Totals' })}
                                    </Typography>
                                    {hasCorrections && (
                                        <Chip label={translate('cashcount.corrected', { _: 'Corrected' })} color="warning" size="small" />
                                    )}
                                </Box>
                                <Grid container spacing={2}>
                                    <Grid size={4}>
                                        <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                                            {translate('cashcount.sales_count_short', { _: 'Sales' })}
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                                            {(record?.final_total_sales ?? record?.system_total_sales) || 0}
                                        </Typography>
                                    </Grid>
                                    <Grid size={4}>
                                        <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                                            {translate('cashcount.amount', { _: 'Amount' })}
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                                            {formatCurrencyBridge(record?.final_total_amount ?? record?.system_total_amount, record?.currency)}
                                        </Typography>
                                    </Grid>
                                    <Grid size={4}>
                                        <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                                            {translate('cashcount.tips', { _: 'Tips' })}
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                                            {formatCurrencyBridge(record?.final_total_tips ?? record?.system_total_tips, record?.currency)}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>

            {/* POS Breakdowns */}
            {record?.point_of_sale_breakdowns && record.point_of_sale_breakdowns.length > 0 && (
                <Grid size={12}>
                    <Card>
                        <CardContent sx={{ py: 2 }}>
                            <Typography variant="h6" gutterBottom sx={{ mb: 1 }}>
                                {translate('cashcount.pos_breakdown', { 
                                    count: record.point_of_sale_breakdowns.length,
                                    _: 'Point of Sale Breakdown (%{count} locations)'
                                })}
                            </Typography>
                            <TableContainer component={Paper}>
                                <Table size="small" sx={{ '& .MuiTableCell-root': { py: 1 } }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>{translate('cashcount.location', { _: 'Location' })}</TableCell>
                                            <TableCell align="center">{translate('cashcount.sales_count_short', { _: 'Sales' })}</TableCell>
                                            <TableCell align="center">{translate('cashcount.amount', { _: 'Amount' })}</TableCell>
                                            <TableCell align="center">{translate('cashcount.tips', { _: 'Tips' })}</TableCell>
                                            <TableCell align="center">{translate('cashcount.status', { _: 'Status' })}</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {record.point_of_sale_breakdowns.map((breakdown: any) => {
                                            const hasPosCorrections = breakdown.has_corrections;
                                            
                                            return (
                                                <TableRow key={breakdown.point_of_sale_id}>
                                                    <TableCell>
                                                        <Typography variant="body2" fontWeight="medium">
                                                            {breakdown.point_of_sale?.name || translate('cashcount.unknown_location', { _: 'Unknown Location' })}
                                                        </Typography>
                                                        {hasPosCorrections && (
                                                            <Typography variant="caption" color="textSecondary" display="block">
                                                                {translate('cashcount.system_values', { 
                                                                    sales: breakdown.system_sales,
                                                                    amount: formatCurrencyBridge(breakdown.system_amount, record?.currency),
                                                                    tips: formatCurrencyBridge(breakdown.system_tips, record?.currency),
                                                                    _: 'System: %{sales} sales, %{amount}, %{tips} tips'
                                                                })}
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Typography variant="body2" color={hasPosCorrections ? 'warning.main' : 'inherit'}>
                                                            {breakdown.effective_sales}
                                                        </Typography>
                                                        {hasPosCorrections && breakdown.final_sales !== breakdown.system_sales && (
                                                            <Typography variant="caption" color="textSecondary" display="block">
                                                                ({translate('cashcount.was_value', { value: breakdown.system_sales, _: 'was %{value}' })})
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Typography variant="body2" color={hasPosCorrections ? 'warning.main' : 'inherit'}>
                                                            {formatCurrencyBridge(breakdown.effective_amount, record?.currency)}
                                                        </Typography>
                                                        {hasPosCorrections && breakdown.final_amount !== breakdown.system_amount && (
                                                            <Typography variant="caption" color="textSecondary" display="block">
                                                                ({translate('cashcount.was_value', { value: formatCurrencyBridge(breakdown.system_amount, record?.currency), _: 'was %{value}' })})
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Typography variant="body2" color={hasPosCorrections ? 'warning.main' : 'inherit'}>
                                                            {formatCurrencyBridge(breakdown.effective_tips, record?.currency)}
                                                        </Typography>
                                                        {hasPosCorrections && breakdown.final_tips !== breakdown.system_tips && (
                                                            <Typography variant="caption" color="textSecondary" display="block">
                                                                ({translate('cashcount.was_value', { value: formatCurrencyBridge(breakdown.system_tips, record?.currency), _: 'was %{value}' })})
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {hasPosCorrections ? (
                                                            <Chip label={translate('cashcount.corrected', { _: 'Corrected' })} color="warning" size="small" />
                                                        ) : (
                                                            <Chip label={translate('cashcount.system', { _: 'System' })} color="default" size="small" />
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>
            )}
        </Grid>
    );
};

const EditComponent: React.FC<IDashAutoAdminCustomFieldComponent> = () => {
    const record = useRecordContext();
    const translate = useTranslate();
    const { register, watch, setValue, control } = useFormContext();
    
    // Watch for changes in final values
    const finalSales = watch('final_total_sales') ?? record?.final_total_sales ?? record?.system_total_sales;
    const finalAmount = watch('final_total_amount') ?? record?.final_total_amount ?? record?.system_total_amount;
    const finalTips = watch('final_total_tips') ?? record?.final_total_tips ?? record?.system_total_tips;
    
    const hasCorrections = 
        finalSales !== record?.system_total_sales ||
        finalAmount !== record?.system_total_amount ||
        finalTips !== record?.system_total_tips;
    
    // Determine what actions are available based on status
    const canEdit = record?.status === 'preview';
    const isDraft = record?.status === 'draft';
    const isClosed = record?.status === 'closed';
    
    const getStatusMessage = () => {
        if (isClosed) {
            return {
                type: 'success' as const,
                message: translate('cashcount.status_closed', { _: '✅ This cash count is finalized and cannot be modified.' })
            };
        }
        if (isDraft) {
            return {
                type: 'warning' as const,
                message: translate('cashcount.status_draft', { _: '⚠️ Ready to close: Saving will finalize this cash count permanently.' })
            };
        }
        if (canEdit) {
            return {
                type: 'info' as const,
                message: translate('cashcount.status_preview', { _: '💡 Review and adjust individual location totals below. Final totals will be calculated automatically.' })
            };
        }
        return null;
    };
    
    const statusMessage = getStatusMessage();

    // Handle POS breakdown changes
    const handlePosBreakdownChange = (posId: number, field: string, value: any) => {
        const currentBreakdowns = watch('pos_breakdowns') || [];
        const updatedBreakdowns = [...currentBreakdowns];
        
        const existingIndex = updatedBreakdowns.findIndex(b => b.point_of_sale_id === posId);
        
        if (existingIndex >= 0) {
            updatedBreakdowns[existingIndex] = {
                ...updatedBreakdowns[existingIndex],
                [field]: value
            };
        } else {
            // Find the original breakdown to get default values
            const originalBreakdown = record?.point_of_sale_breakdowns?.find(
                (b: any) => b.point_of_sale_id === posId
            );
            
            updatedBreakdowns.push({
                point_of_sale_id: posId,
                final_sales: originalBreakdown?.final_sales ?? originalBreakdown?.system_sales ?? 0,
                final_amount: originalBreakdown?.final_amount ?? originalBreakdown?.system_amount ?? '0.00',
                final_tips: originalBreakdown?.final_tips ?? originalBreakdown?.system_tips ?? '0.00',
                [field]: value
            });
        }
        
        setValue('pos_breakdowns', updatedBreakdowns);
        
        // Recalculate totals from ALL POS breakdowns (modified + unmodified)
        let totalSales = 0;
        let totalAmount = 0;
        let totalTips = 0;
        
        record?.point_of_sale_breakdowns?.forEach((breakdown: any) => {
            // Check if this breakdown has been modified
            const modifiedBreakdown = updatedBreakdowns.find(
                (b: any) => b.point_of_sale_id === breakdown.point_of_sale_id
            );
            
            if (modifiedBreakdown) {
                // Use modified values
                totalSales += parseInt(modifiedBreakdown.final_sales) || 0;
                totalAmount += parseFloat(modifiedBreakdown.final_amount) || 0;
                totalTips += parseFloat(modifiedBreakdown.final_tips) || 0;
            } else {
                // Use original values (final if exists, otherwise system)
                totalSales += parseInt(breakdown.final_sales ?? breakdown.system_sales) || 0;
                totalAmount += parseFloat(breakdown.final_amount ?? breakdown.system_amount) || 0;
                totalTips += parseFloat(breakdown.final_tips ?? breakdown.system_tips) || 0;
            }
        });
        
        setValue('final_total_sales', totalSales);
        setValue('final_total_amount', totalAmount.toFixed(2));
        setValue('final_total_tips', totalTips.toFixed(2));
    };

    return (
        <Box>
            {statusMessage && (
                <Alert severity={statusMessage.type} sx={{ mb: 2 }}>
                    {statusMessage.message}
                </Alert>
            )}

            <Grid container spacing={2}>
                {/* System and Final Totals - Horizontal Layout */}
                <Grid size={12}>
                    <Card>
                        <CardContent sx={{ py: 2 }}>
                            <Grid container spacing={3}>
                                {/* System Totals */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant="h6" gutterBottom sx={{ mb: 1 }} color="textSecondary">
                                        {translate('cashcount.system_calculated_totals', { _: 'System Calculated Totals' })}
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid size={4}>
                                            <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                                                {translate('cashcount.sales_count_short', { _: 'Sales' })}
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                                                {record?.system_total_sales || 0}
                                            </Typography>
                                        </Grid>
                                        <Grid size={4}>
                                            <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                                                {translate('cashcount.amount', { _: 'Amount' })}
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                                                {formatCurrencyBridge(record?.system_total_amount, record?.currency)}
                                            </Typography>
                                        </Grid>
                                        <Grid size={4}>
                                            <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                                                {translate('cashcount.tips', { _: 'Tips' })}
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                                                {formatCurrencyBridge(record?.system_total_tips, record?.currency)}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Grid>

                                {/* Final Totals */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                                        <Typography variant="h6">
                                            {translate('cashcount.final_totals', { _: 'Final Totals' })}
                                        </Typography>
                                        {hasCorrections && (
                                            <Chip label={translate('cashcount.modified', { _: 'Modified' })} color="warning" size="small" />
                                        )}
                                    </Box>

                                    <Grid container spacing={2}>
                                        <Grid size={4}>
                                            <TextField
                                                label={translate('cashcount.sales_count_short', { _: 'Sales' })}
                                                type="number"
                                                size="small"
                                                fullWidth
                                                disabled={!canEdit && !isDraft}
                                                {...register('final_total_sales')}
                                                defaultValue={finalSales}
                                                sx={{ '& .MuiInputBase-input': { fontSize: '0.875rem' } }}
                                            />
                                        </Grid>
                                        <Grid size={4}>
                                            <FormattedPrice
                                                name="final_total_amount"
                                                label={translate('cashcount.amount', { _: 'Amount' })}
                                                currency={record?.currency}
                                                control={control}
                                                disabled={!canEdit && !isDraft}
                                                defaultValue={finalAmount}
                                                textFieldProps={{ 
                                                    size: 'small',
                                                    sx: { '& .MuiInputBase-input': { fontSize: '0.875rem' } }
                                                }}
                                            />
                                        </Grid>
                                        <Grid size={4}>
                                            <FormattedPrice
                                                name="final_total_tips"
                                                label={translate('cashcount.tips', { _: 'Tips' })}
                                                currency={record?.currency}
                                                control={control}
                                                disabled={!canEdit && !isDraft}
                                                defaultValue={finalTips}
                                                textFieldProps={{ 
                                                    size: 'small',
                                                    sx: { '& .MuiInputBase-input': { fontSize: '0.875rem' } }
                                                }}
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* POS Breakdowns (Editable) */}
                {record?.point_of_sale_breakdowns && record.point_of_sale_breakdowns.length > 0 && (
                    <Grid size={12}>
                        <Card>
                            <CardContent sx={{ py: 2 }}>
                                <Typography variant="h6" gutterBottom sx={{ mb: 1 }}>
                                    {translate('cashcount.pos_breakdown', { _: 'Point of Sale Breakdown' })}
                                </Typography>
                                <Typography variant="body2" color="textSecondary" gutterBottom sx={{ mb: 2 }}>
                                    {translate('cashcount.pos_breakdown_description', { _: 'Adjust individual location totals. Main totals will be recalculated automatically.' })}
                                </Typography>
                                
                                <TableContainer component={Paper}>
                                    <Table size="small" sx={{ '& .MuiTableCell-root': { py: 0.5 } }}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>{translate('cashcount.location', { _: 'Location' })}</TableCell>
                                                <TableCell align="center" colSpan={3}>
                                                    <Typography variant="subtitle2" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                                                        {translate('cashcount.system_values', { _: 'System Values' })}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center" colSpan={3}>
                                                    <Typography variant="subtitle2" color="primary" sx={{ fontSize: '0.75rem' }}>
                                                        {translate('cashcount.final_values', { _: 'Final Values' })}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">{translate('cashcount.status', { _: 'Status' })}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell></TableCell>
                                                <TableCell align="center" sx={{ fontSize: '0.7rem', color: 'text.secondary', py: 0.5 }}>
                                                    {translate('cashcount.sales_count_short', { _: 'Sales' })}
                                                </TableCell>
                                                <TableCell align="center" sx={{ fontSize: '0.7rem', color: 'text.secondary', py: 0.5 }}>
                                                    {translate('cashcount.amount', { _: 'Amount' })}
                                                </TableCell>
                                                <TableCell align="center" sx={{ fontSize: '0.7rem', color: 'text.secondary', py: 0.5 }}>
                                                    {translate('cashcount.tips', { _: 'Tips' })}
                                                </TableCell>
                                                <TableCell align="center" sx={{ fontSize: '0.7rem', color: 'primary.main', py: 0.5 }}>
                                                    {translate('cashcount.sales_count_short', { _: 'Sales' })}
                                                </TableCell>
                                                <TableCell align="center" sx={{ fontSize: '0.7rem', color: 'primary.main', py: 0.5 }}>
                                                    {translate('cashcount.amount', { _: 'Amount' })}
                                                </TableCell>
                                                <TableCell align="center" sx={{ fontSize: '0.7rem', color: 'primary.main', py: 0.5 }}>
                                                    {translate('cashcount.tips', { _: 'Tips' })}
                                                </TableCell>
                                                <TableCell align="center"></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {record.point_of_sale_breakdowns.map((breakdown: any) => {
                                                const currentBreakdowns = watch('pos_breakdowns') || [];
                                                const currentBreakdown = currentBreakdowns.find(
                                                    (b: any) => b.point_of_sale_id === breakdown.point_of_sale_id
                                                );
                                                
                                                const currentSales = currentBreakdown?.final_sales ?? breakdown.final_sales ?? breakdown.system_sales;
                                                const currentAmount = currentBreakdown?.final_amount ?? breakdown.final_amount ?? breakdown.system_amount;
                                                const currentTips = currentBreakdown?.final_tips ?? breakdown.final_tips ?? breakdown.system_tips;
                                                
                                                const hasPosCorrections = 
                                                    currentSales !== breakdown.system_sales ||
                                                    currentAmount !== breakdown.system_amount ||
                                                    currentTips !== breakdown.system_tips;
                                                
                                                return (
                                                    <TableRow key={breakdown.point_of_sale_id}>
                                                        <TableCell>
                                                            <Typography variant="body2" fontWeight="medium" sx={{ fontSize: '0.875rem' }}>
                                                                {breakdown.point_of_sale?.name || translate('cashcount.unknown_location', { _: 'Unknown Location' })}
                                                            </Typography>
                                                        </TableCell>
                                                        
                                                        {/* System Values (Read-only) */}
                                                        <TableCell align="center">
                                                            <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.875rem' }}>
                                                                {breakdown.system_sales}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.875rem' }}>
                                                                {formatCurrencyBridge(breakdown.system_amount, record?.currency)}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.875rem' }}>
                                                                {formatCurrencyBridge(breakdown.system_tips, record?.currency)}
                                                            </Typography>
                                                        </TableCell>
                                                        
                                                        {/* Final Values (Editable) */}
                                                        <TableCell align="center">
                                                            <TextField
                                                                type="number"
                                                                size="small"
                                                                disabled={!canEdit && !isDraft}
                                                                value={currentSales}
                                                                onChange={(e) => handlePosBreakdownChange(
                                                                    breakdown.point_of_sale_id,
                                                                    'final_sales',
                                                                    parseInt(e.target.value) || 0
                                                                )}
                                                                sx={{ 
                                                                    width: 70,
                                                                    '& .MuiInputBase-input': {
                                                                        color: hasPosCorrections && currentSales !== breakdown.system_sales ? 'warning.main' : 'inherit',
                                                                        fontSize: '0.875rem',
                                                                        py: 0.5
                                                                    }
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <FormattedPrice
                                                                name={`pos_amount_${breakdown.point_of_sale_id}`}
                                                                currency={record?.currency}
                                                                disabled={!canEdit && !isDraft}
                                                                defaultValue={currentAmount}
                                                                onChange={(value) => handlePosBreakdownChange(
                                                                    breakdown.point_of_sale_id,
                                                                    'final_amount',
                                                                    value
                                                                )}
                                                                textFieldProps={{ 
                                                                    size: 'small', 
                                                                    sx: { 
                                                                        width: 100,
                                                                        '& .MuiInputBase-input': {
                                                                            color: hasPosCorrections && currentAmount !== breakdown.system_amount ? 'warning.main' : 'inherit',
                                                                            fontSize: '0.875rem',
                                                                            py: 0.5
                                                                        }
                                                                    }
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <FormattedPrice
                                                                name={`pos_tips_${breakdown.point_of_sale_id}`}
                                                                currency={record?.currency}
                                                                disabled={!canEdit && !isDraft}
                                                                defaultValue={currentTips}
                                                                                                onChange={(value) => handlePosBreakdownChange(
                                                                    breakdown.point_of_sale_id,
                                                                    'final_tips',
                                                                    value
                                                                )}
                                                                textFieldProps={{ 
                                                                    size: 'small', 
                                                                    sx: { 
                                                                        width: 100,
                                                                        '& .MuiInputBase-input': {
                                                                            color: hasPosCorrections && currentTips !== breakdown.system_tips ? 'warning.main' : 'inherit',
                                                                            fontSize: '0.875rem',
                                                                            py: 0.5
                                                                        }
                                                                    }
                                                                }}
                                                            />
                                                        </TableCell>
                                                        
                                                        <TableCell align="center">
                                                            {hasPosCorrections ? (
                                                                <Chip 
                                                                    label={translate('cashcount.modified', { _: 'Modified' })} 
                                                                    color="warning" 
                                                                    size="small" 
                                                                    sx={{ fontSize: '0.7rem', height: 20 }}
                                                                />
                                                            ) : (
                                                                <Chip 
                                                                    label={translate('cashcount.system', { _: 'System' })} 
                                                                    color="default" 
                                                                    size="small" 
                                                                    sx={{ fontSize: '0.7rem', height: 20 }}
                                                                />
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                        
                                        {/* Summary Row */}
                                        <TableBody>
                                            <TableRow sx={{ backgroundColor: 'grey.50' }}>
                                                <TableCell>
                                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '0.875rem' }}>
                                                        {translate('cashcount.totals', { _: 'TOTALS' })}
                                                    </Typography>
                                                </TableCell>
                                                
                                                {/* System Totals */}
                                                <TableCell align="center">
                                                    <Typography variant="subtitle2" color="textSecondary" sx={{ fontSize: '0.875rem' }}>
                                                        {record?.system_total_sales || 0}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Typography variant="subtitle2" color="textSecondary" sx={{ fontSize: '0.875rem' }}>
                                                        {formatCurrencyBridge(record?.system_total_amount, record?.currency)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Typography variant="subtitle2" color="textSecondary" sx={{ fontSize: '0.875rem' }}>
                                                        {formatCurrencyBridge(record?.system_total_tips, record?.currency)}
                                                    </Typography>
                                                </TableCell>
                                                
                                                {/* Final Totals */}
                                                <TableCell align="center">
                                                    <Typography 
                                                        variant="subtitle2" 
                                                        fontWeight="bold"
                                                        color={finalSales !== record?.system_total_sales ? 'warning.main' : 'primary.main'}
                                                        sx={{ fontSize: '0.875rem' }}
                                                    >
                                                        {finalSales}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Typography 
                                                        variant="subtitle2" 
                                                        fontWeight="bold"
                                                        color={finalAmount !== record?.system_total_amount ? 'warning.main' : 'primary.main'}
                                                        sx={{ fontSize: '0.875rem' }}
                                                    >
                                                        {formatCurrencyBridge(finalAmount, record?.currency)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Typography 
                                                        variant="subtitle2" 
                                                        fontWeight="bold"
                                                        color={finalTips !== record?.system_total_tips ? 'warning.main' : 'primary.main'}
                                                        sx={{ fontSize: '0.875rem' }}
                                                    >
                                                        {formatCurrencyBridge(finalTips, record?.currency)}
                                                    </Typography>
                                                </TableCell>
                                                
                                                <TableCell align="center">
                                                    {hasCorrections ? (
                                                        <Chip 
                                                            label={translate('cashcount.modified', { _: 'Modified' })} 
                                                            color="warning" 
                                                            size="small" 
                                                            sx={{ fontSize: '0.7rem', height: 20 }}
                                                        />
                                                    ) : (
                                                        <Chip 
                                                            label={translate('cashcount.system', { _: 'System' })} 
                                                            color="default" 
                                                            size="small" 
                                                            sx={{ fontSize: '0.7rem', height: 20 }}
                                                        />
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                )}

                {/* Notes */}
                <Grid size={12}>
                    <Card>
                        <CardContent sx={{ py: 2 }}>
                            <TextField
                                label={translate('cashcount.notes', { _: 'Notes' })}
                                multiline
                                rows={2}
                                fullWidth
                                disabled={isClosed}
                                {...register('notes')}
                                defaultValue={record?.notes || ''}
                                placeholder={translate('cashcount.notes_placeholder', { _: 'Add any notes about corrections or observations...' })}
                                helperText={hasCorrections ? 
                                    translate('cashcount.notes_corrections_help', { _: 'Please explain the reason for the corrections above.' }) : 
                                    translate('cashcount.notes_help', { _: 'Optional notes about this cash count.' })
                                }
                                sx={{ '& .MuiInputBase-input': { fontSize: '0.875rem' } }}
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};


const CashCountTotals = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
    switch (method) {
        case "edit":
        case "create":
            return <EditComponent attribute={attribute} method={method} resourceConfig={resourceConfig} />;
        case "view":
            return <ViewComponent attribute={attribute} method={method} resourceConfig={resourceConfig} />;
        case "list":
            return <ListComponent attribute={attribute} method={method} resourceConfig={resourceConfig} />;
        default:
            return <>-</>;
    }
};

export default CashCountTotals;
