import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    Card,
    CardActionArea,
    Typography,
    Chip,
    Avatar,
    CircularProgress,
} from '@mui/material';
import { Payment as PaymentIcon } from '@mui/icons-material';
import { useTranslate } from 'react-admin';

export interface ICheckoutGateway {
    id: string | number;
    name: string;
    provider?: string;
    icon_url?: string | null;
    is_default?: boolean;
}

interface CheckoutGatewayDialogProps {
    open: boolean;
    gateways: ICheckoutGateway[];
    /** id of the gateway currently being started (shows a spinner on that card) */
    busyGatewayId?: string | number | null;
    onSelect: (id: string | number) => void;
    onClose: () => void;
}

/**
 * Provider-selection screen shown during self-service checkout when a tenant has more than one
 * enabled checkout gateway. The default appears first (highlighted with a "Predeterminado" chip).
 * Tapping a card starts payment with that gateway. The caller skips rendering this when only one
 * gateway is enabled.
 */
const CheckoutGatewayDialog: React.FC<CheckoutGatewayDialogProps> = ({
    open,
    gateways,
    busyGatewayId,
    onSelect,
    onClose,
}) => {
    const translate = useTranslate();
    const busy = busyGatewayId != null;

    return (
        <Dialog open={open} onClose={busy ? undefined : onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ textAlign: 'center', fontWeight: 700 }}>
                {translate('mall.select_payment_method', { _: 'Elige tu medio de pago' })}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, py: 1 }}>
                    {gateways.map((g) => {
                        const isBusy = busyGatewayId === g.id;
                        return (
                            <Card
                                key={g.id}
                                variant="outlined"
                                sx={{
                                    borderColor: g.is_default ? 'success.main' : 'divider',
                                    borderWidth: g.is_default ? 2 : 1,
                                    opacity: busy && !isBusy ? 0.6 : 1,
                                }}
                            >
                                <CardActionArea
                                    onClick={() => !busy && onSelect(g.id)}
                                    disabled={busy}
                                    sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-start' }}
                                >
                                    <Avatar
                                        src={g.icon_url || undefined}
                                        sx={{ bgcolor: 'grey.100', color: 'success.main' }}
                                    >
                                        {!g.icon_url && <PaymentIcon />}
                                    </Avatar>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="subtitle1" fontWeight={600} noWrap>
                                            {g.name}
                                        </Typography>
                                    </Box>
                                    {isBusy ? (
                                        <CircularProgress size={20} color="success" />
                                    ) : (
                                        g.is_default && (
                                            <Chip
                                                size="small"
                                                color="success"
                                                label={translate('mall.default_gateway', { _: 'Predeterminado' })}
                                            />
                                        )
                                    )}
                                </CardActionArea>
                            </Card>
                        );
                    })}
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default CheckoutGatewayDialog;
