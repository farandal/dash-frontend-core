import React from 'react';
import {
    Datagrid,
    TextField,
    DateField,
    NumberField,
    BooleanField,
    FunctionField,
    useListContext,
    TopToolbar,
    CreateButton,
    ExportButton,
    Button
} from 'react-admin';
import { Chip, Box } from '@mui/material';
import { Assessment, Refresh } from '@mui/icons-material';
import { formatCurrency } from 'kt-ecommerce';

const CashCountListActions = () => (
    <TopToolbar>
        <CreateButton />
        <Button
            startIcon={<Assessment />}
            label="Generate Report"
            onClick={() => {
                // Handle bulk report generation
            }}
        />
    </TopToolbar>
);

const StatusField = ({ record }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'draft': return 'default';
            case 'preview': return 'warning';
            case 'closed': return 'success';
            default: return 'default';
        }
    };
    
    return (
        <Chip 
            label={record.status_label || record.status} 
            color={getStatusColor(record.status)}
            size="small"
        />
    );
};

const CurrencyField = ({ record }) => {
 
    
    return <span>{formatCurrency(record.final_total_amount || record.system_total_amount)}</span>;
};

const CashCountList = () => {
    return (
        <Box>
            <Datagrid
                rowClick="show"
                bulkActionButtons={false}
            >
                <TextField source="id" label="ID" />
                <FunctionField 
                    source="status" 
                    label="Status" 
                    render={StatusField}
                />
                <DateField 
                    source="period_start" 
                    label="Period Start"
                    showTime
                />
                <DateField 
                    source="period_end" 
                    label="Period End"
                    showTime
                />
                <TextField 
                    source="period_duration" 
                    label="Duration"
                />
                <NumberField 
                    source="system_total_sales" 
                    label="Sales Count"
                />
                <FunctionField 
                    source="system_total_amount" 
                    label="Total Amount"
                    render={CurrencyField}
                />
                <BooleanField 
                    source="has_corrections" 
                    label="Corrected"
                />
                <TextField 
                    source="user.name" 
                    label="Created By"
                />
                <DateField 
                    source="created_at" 
                    label="Created"
                    showTime
                />
            </Datagrid>
        </Box>
    );
};

export default CashCountList;
