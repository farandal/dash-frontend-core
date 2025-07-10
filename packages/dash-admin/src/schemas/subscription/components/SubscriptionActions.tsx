import React, { useState } from 'react';
import { 
    Button, 
    ButtonGroup, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions,
    Typography,
    Alert,
    Box
} from '@mui/material';
import { 
    Cancel as CancelIcon, 
    Refresh as RefreshIcon, 
    Upgrade as UpgradeIcon 
} from '@mui/icons-material';
import { useRecordContext, useDataProvider, useNotify, useRefresh } from 'react-admin';
import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";

const ActionComponent: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute, resourceConfig }) => {
    const record = useRecordContext();
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const refresh = useRefresh();
    const [loading, setLoading] = useState(false);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

    if (!record) return null;

    const handleCancelSubscription = async () => {
        try {
            setLoading(true);
            await dataProvider.create('system/subscription/cancel/subscription', {
                data: { subscription_id: record.id }
            });
            notify('Suscripción cancelada exitosamente', { type: 'success' });
            refresh();
            setCancelDialogOpen(false);
        } catch (error) {
            notify('Error al cancelar la suscripción', { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleReactivateSubscription = async () => {
        try {
            setLoading(true);
            await dataProvider.update('system/subscription',{
                id: record.id,
                data: { status: 'active' },
                previousData: {}
            });
            notify('Suscripción reactivada exitosamente', { type: 'success' });
            refresh();
        } catch (error) {
            notify('Error al reactivar la suscripción', { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const canCancel = ['active', 'trial'].includes(record.status);
    const canReactivate = record.status === 'cancelled';

    return (
        <Box>
            <ButtonGroup variant="outlined" size="small">
                {canCancel && (
                    <Button
                        startIcon={<CancelIcon />}
                        color="error"
                        onClick={() => setCancelDialogOpen(true)}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                )}
                
                {canReactivate && (
                    <Button
                        startIcon={<RefreshIcon />}
                        color="success"
                        onClick={handleReactivateSubscription}
                        disabled={loading}
                    >
                        Reactivar
                    </Button>
                )}
                
                <Button
                    startIcon={<UpgradeIcon />}
                    color="primary"
                    disabled={loading || record.status === 'expired'}
                >
                    Cambiar Plan
                </Button>
            </ButtonGroup>

            <Dialog
                open={cancelDialogOpen}
                onClose={() => setCancelDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Confirmar Cancelación</DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        Esta acción cancelará la suscripción inmediatamente.
                    </Alert>
                    <Typography>
                        ¿Estás seguro de que deseas cancelar la suscripción de{' '}
                        <strong>{record.subscription_plan?.name}</strong>?
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        El usuario perderá acceso a las funcionalidades premium al final del período actual.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => setCancelDialogOpen(false)}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleCancelSubscription}
                        color="error"
                        variant="contained"
                        disabled={loading}
                    >
                        Confirmar Cancelación
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

const SubscriptionActions = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
    switch (method) {
        case "edit":
        case "create":
        case "view":
        case "list":
            return <ActionComponent attribute={attribute} method={method} resourceConfig={resourceConfig} />
        default:
            return <></>;
    }
}

export default SubscriptionActions;