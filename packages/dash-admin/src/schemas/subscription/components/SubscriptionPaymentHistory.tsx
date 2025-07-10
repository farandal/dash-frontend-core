import React, { useState, useEffect } from 'react';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper, 
    Typography,
    CircularProgress,
    Box
} from '@mui/material';
import { useRecordContext, useDataProvider } from 'react-admin';
import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";

interface Payment {
    id: number;
    amount: number;
    status: string;
    transaction_id: string;
    created_at: string;
}

const PaymentHistoryView: React.FC<IDashAutoAdminCustomFieldComponent> = () => {
    const record = useRecordContext();
    const dataProvider = useDataProvider();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (record?.id) {
            fetchPayments();
        }
    }, [record?.id]);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const { data } = await dataProvider.getList('payments', {
                filter: { subscription_id: record.id },
                sort: { field: 'created_at', order: 'DESC' },
                pagination: { page: 1, perPage: 10 },
            });
            setPayments(data);
        } catch (error) {
            console.error('Error fetching payments:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" p={2}>
                <CircularProgress />
            </Box>
        );
    }

    if (payments.length === 0) {
        return (
            <Typography variant="body2" color="textSecondary">
                No hay historial de pagos disponible
            </Typography>
        );
    }

    return (
        <TableContainer component={Paper} variant="outlined">
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Monto</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell>ID Transacción</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {payments.map((payment) => (
                        <TableRow key={payment.id}>
                            <TableCell>
                                {new Date(payment.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                                ${(payment.amount / 100).toLocaleString()}
                            </TableCell>
                            <TableCell>
                                <Typography 
                                    variant="body2" 
                                    color={payment.status === 'completed' ? 'success.main' : 'error.main'}
                                >
                                    {payment.status === 'completed' ? 'Completado' : 'Fallido'}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2" fontFamily="monospace">
                                    {payment.transaction_id}
                                </Typography>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

const SubscriptionPaymentHistory = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
    switch (method) {
        case "view":
            return <PaymentHistoryView attribute={attribute} method={method} resourceConfig={resourceConfig} />;
        default:
            return <></>;
    }
};

export default SubscriptionPaymentHistory;