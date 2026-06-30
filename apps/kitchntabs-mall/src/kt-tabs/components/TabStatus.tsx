import { Product } from "../types/ecommerce";
import { CardMedia, CardContent, ListItem, List, IconButton, Typography, Box, Grid, Card, TextField, CardHeader, Chip, CircularProgress, MenuItem } from "@mui/material";

import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import { useState, useEffect } from "react";
import { Loading, useDataProvider, useEditContext, useGetList, useRecordContext, useRefresh } from "react-admin";

import { useFieldArray, useFormContext, useFormState } from "react-hook-form";
import ImagePlaceHolder from 'kt-utils/components/ImagePlaceHolder/ImagePlaceHolder';
import { Add as AddIcon, Remove as RemoveIcon, Delete as DeleteIcon, ArrowForward } from '@mui/icons-material'
import { toast } from 'react-toastify';
import { ITab } from "./interfaces/ITab";
import { ErrorMessage } from "@hookform/error-message"
import { Button } from "@mui/material";
const ItemEdit: React.FC<IDashAutoAdminCustomFieldComponent> = (props) => {
   
    const  {attribute, method, resourceConfig} = props;

    const _r = method === "create" ? {record:{}} : useEditContext();
    const record = _r.record;
    
    // Loading state
    const [loading, setLoading] = useState(false);

    const refresh = useRefresh();
    const dataProvider = useDataProvider();
    const {
        register,
        formState: { errors },
        setValue,
        watch
    } = useFormContext()

    const status = watch('status');

    useEffect(() => {
        if (!status && record?.status) {
            setValue('status', record.status);
        }
    }, [record, setValue, status]);

    const statusLabels = {
        'CREATED': 'Creado',
        'CONFIRMED': 'Confirmado',
        'IN_PREPARATION': 'En preparación',
        'PREPARED': 'Preparado',
        'DELIVERED': 'Entregado',
        'CLOSED': 'Cerrado',
        'CANCELLED': 'Cancelado'
    };

    const updateTabStatus = async (id, status) => {
        setLoading(true);
        try {
            await dataProvider.update(`tab/tab`, {
                id: id,
                data: { status },
                previousData: undefined
            });
            setValue('status', status);
            refresh();
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Error updating status");
        } finally {
            setLoading(false);
        }
    }

    const nextStatus = {
        'CREATED': 'CONFIRMED',
        'CONFIRMED': 'IN_PREPARATION',
        'IN_PREPARATION': 'PREPARED',
        'PREPARED': 'DELIVERED',
        'DELIVERED': 'CLOSED'
    }[status];

    const nextStatusLabel = statusLabels[nextStatus];

    const handleStatusChange = (event) => {
        //setValue('status', event.target.value);
        updateTabStatus(record.id, event.target.value);
    };

    return <>

        {nextStatusLabel && <Button
            variant="contained"
            disabled={loading}
            onClick={() => {
                if (nextStatus) {
                    updateTabStatus(record.id, nextStatus);
                }
            }}
        >
            {loading ? <CircularProgress size={24} color="inherit" /> : <><ArrowForward /> Cambiar estado a {nextStatusLabel}</>}
        </Button>}


        <TextField
            select
            fullWidth
            label="Estado"
            value={status || ''}
            onChange={handleStatusChange}
            disabled={loading}
            sx={{ mt: 2 }}
        >
            {Object.entries(statusLabels).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                    {label}
                </MenuItem>
            ))}
        </TextField>

    </>

};
const ItemView: React.FC<IDashAutoAdminCustomFieldComponent> = () => {
    const tab: ITab = useRecordContext();
    return <Chip label={tab.status ? tab.status : '-'} />
}

const TabStatus = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {

    switch (method) {
        case "edit":
        case "create":
            return <ItemEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />
        case "view":
            return <ItemView attribute={attribute} method={method} resourceConfig={resourceConfig} />
        case "list":
            return <ItemView attribute={attribute} method={method} resourceConfig={resourceConfig} />
        default:
            return <>-</>
    }
}


export default TabStatus;