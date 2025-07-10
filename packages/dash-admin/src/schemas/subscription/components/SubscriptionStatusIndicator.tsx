import React from 'react';
import { Chip, Box } from '@mui/material';
import { useRecordContext } from 'react-admin';
import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";

const ListComponent: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute, resourceConfig }) => {
    const record = useRecordContext();
    if (!record) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'success';
            case 'trial':
                return 'info';
            case 'cancelled':
                return 'warning';
            case 'expired':
                return 'error';
            default:
                return 'default';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active':
                return 'Activa';
            case 'trial':
                return 'Período de Prueba';
            case 'cancelled':
                return 'Cancelada';
            case 'expired':
                return 'Expirada';
            default:
                return status;
        }
    };

    return (
        <Box>
            <Chip 
                label={getStatusLabel(record.status)}
                color={getStatusColor(record.status)}
                size="small"
            />
            {record.is_on_trial && (
                <Chip 
                    label={`${record.days_until_expiry} días restantes`}
                    color="info"
                    size="small"
                    variant="outlined"
                    style={{ marginLeft: 8 }}
                />
            )}
        </Box>
    );
};

const SubscriptionStatusIndicator = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
    switch (method) {
        case "edit":
        case "create":
        case "view":
        case "list":
            return <ListComponent attribute={attribute} method={method} resourceConfig={resourceConfig} />
        default:
            return <></>;
    }
};

export default SubscriptionStatusIndicator;