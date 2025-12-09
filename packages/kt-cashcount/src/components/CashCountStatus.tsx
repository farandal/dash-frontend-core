import React from 'react';
import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import { useRecordContext } from "react-admin";
import { Chip, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useFormContext } from 'react-hook-form';

const ListComponent: React.FC<IDashAutoAdminCustomFieldComponent> = () => {
    const record = useRecordContext();
    
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft': return 'default';
            case 'preview': return 'warning';
            case 'closed': return 'success';
            default: return 'default';
        }
    };
    
    return (
        <Chip 
            label={record?.status_label || record?.status || 'Unknown'} 
            color={getStatusColor(record?.status)}
            size="small"
        />
    );
};

const ViewComponent: React.FC<IDashAutoAdminCustomFieldComponent> = () => {
    const record = useRecordContext();
    
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft': return 'default';
            case 'preview': return 'warning';
            case 'closed': return 'success';
            default: return 'default';
        }
    };
    
    return (
        <Chip 
            label={record?.status_label || record?.status || 'Unknown'} 
            color={getStatusColor(record?.status)}
            size="medium"
        />
    );
};

const EditComponent: React.FC<IDashAutoAdminCustomFieldComponent> = ({ attribute }) => {
    const record = useRecordContext();
    const { register, watch, setValue } = useFormContext();
    const currentStatus = watch(attribute.attribute) || record?.status;
    
    // Only allow status changes for non-closed cash counts
    if (record?.status === 'closed') {
        return <ViewComponent attribute={attribute} method="view" resourceConfig={null} />;
    }
    
    const handleStatusChange = (event: any) => {
        setValue(attribute.attribute, event.target.value);
    };
    
    // Determine available status options based on current status
    const getAvailableStatuses = () => {
        switch (record?.status) {
            case 'draft':
                return [
                    { value: 'draft', label: 'Draft' },
                    { value: 'preview', label: 'Preview' }
                ];
            case 'preview':
                return [
                    { value: 'draft', label: 'Draft' },
                    { value: 'preview', label: 'Preview' },
                    { value: 'closed', label: 'Closed' }
                ];
            default:
                return [
                    { value: 'draft', label: 'Draft' },
                    { value: 'preview', label: 'Preview' }
                ];
        }
    };
    
    return (
        <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
                {...register(attribute.attribute)}
                value={currentStatus || ''}
                onChange={handleStatusChange}
                label="Status"
            >
                {getAvailableStatuses().map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                        {status.label}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

const CreateComponent: React.FC<IDashAutoAdminCustomFieldComponent> = () => {
    // Status is automatically set to 'preview' after creation
    return (
        <Chip 
            label="Will be Preview after creation" 
            color="warning"
            size="small"
        />
    );
};

const CashCountStatus = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
    switch (method) {
        case "edit":
            return <ViewComponent attribute={attribute} method={method} resourceConfig={resourceConfig} />;
            //return <EditComponent attribute={attribute} method={method} resourceConfig={resourceConfig} />;
        case "create":
            //return <CreateComponent attribute={attribute} method={method} resourceConfig={resourceConfig} />;
            return <>-</>;
        case "view":
            return <ViewComponent attribute={attribute} method={method} resourceConfig={resourceConfig} />;
        case "list":
            return <ListComponent attribute={attribute} method={method} resourceConfig={resourceConfig} />;
        default:
            return <>-</>;
    }
};

export default CashCountStatus;