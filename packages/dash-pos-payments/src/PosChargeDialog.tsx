import React, { useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { usePosPayments } from './core/context';
import { posErrorMessage } from './core/api';
import type { PosTransaction } from './core/types';

const money = (amount: string | number, currency: string) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency, maximumFractionDigits: currency === 'CLP' ? 0 : 2 }).format(Number(amount));

/**
 * Follows one card charge on a terminal until it settles: waiting, "check the terminal"
 * (Mercado Pago's action_required: staff confirm or cancel), approved, declined, timed out.
 * Polls our backend every few seconds and, now and then, asks it to read the acquirer, so it
 * works with or without the webhook. `onSettled` fires once, with the final transaction.
 */
export const PosChargeDialog: React.FC<{
    transactionId: string | null;
    open: boolean;
    onClose: () => void;
    onSettled?: (transaction: PosTransaction) => void;
    pollMs?: number;
}> = ({ transactionId, open, onClose, onSettled, pollMs = 2500 }) => {
    const { api, translate, notify } = usePosPayments();
    const [tx, setTx] = useState<PosTransaction | null>(null);
    const [busy, setBusy] = useState(false);
    const reported = useRef<string | null>(null);

    useEffect(() => {
        if (!open || !transactionId) return;
        let alive = true;
        let tick = 0;
        setTx(null);
        reported.current = null;

        const poll = async () => {
            try {
                // Every 4th poll asks the acquirer directly (a lost or slow webhook).
                const next = tick++ % 4 === 3 ? await api.refresh(transactionId) : await api.transaction(transactionId);
                if (alive) setTx(next);
                if (next.final) return;
            } catch {
                // A failed poll (network) is retried on the next tick.
            }
            if (alive) timer = window.setTimeout(poll, pollMs);
        };
        let timer = window.setTimeout(poll, 0);

        return () => {
            alive = false;
            window.clearTimeout(timer);
        };
    }, [api, open, pollMs, transactionId]);

    useEffect(() => {
        if (tx?.final && reported.current !== tx.id) {
            reported.current = tx.id;
            onSettled?.(tx);
        }
    }, [onSettled, tx]);

    const act = async (fn: () => Promise<PosTransaction>) => {
        setBusy(true);
        try {
            setTx(await fn());
        } catch (e) {
            notify(posErrorMessage(e), { type: 'error' });
        } finally {
            setBusy(false);
        }
    };

    const status = tx?.status ?? 'pending';
    const attention = !!tx?.needs_attention;
    const severity = status === 'approved' ? 'success' : status === 'pending' ? (attention ? 'warning' : 'info') : 'error';

    return (
        <Dialog open={open} onClose={tx?.final ? onClose : undefined} maxWidth="xs" fullWidth>
            <DialogTitle>{translate('pos_payments.charge.title')}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center', py: 1 }}>
                    {tx && <Typography variant="h4" sx={{ fontWeight: 800 }}>{money(tx.amount, tx.currency)}</Typography>}

                    {status === 'pending' && !attention && (
                        <>
                            <CircularProgress />
                            <Typography sx={{ fontWeight: 600 }}>{translate('pos_payments.charge.waiting')}</Typography>
                            <Typography variant="body2" color="text.secondary">{translate('pos_payments.charge.waiting_help')}</Typography>
                        </>
                    )}

                    {(attention || status !== 'pending') && (
                        <Alert severity={severity} sx={{ width: '100%', textAlign: 'left' }}>
                            <Typography sx={{ fontWeight: 700 }}>
                                {translate(attention ? 'pos_payments.charge.attention' : `pos_payments.charge.${status}`)}
                            </Typography>
                            {attention && <Typography variant="body2">{translate('pos_payments.charge.attention_help')}</Typography>}
                            {tx?.error && status !== 'approved' && <Typography variant="body2">{tx.error}</Typography>}
                        </Alert>
                    )}

                    {status === 'approved' && (tx?.card_brand || tx?.auth_code) && (
                        <Box>
                            {tx?.card_brand && <Typography variant="body2">{translate('pos_payments.charge.card')}: {tx.card_brand} {tx.masked_pan ?? ''}</Typography>}
                            {tx?.auth_code && <Typography variant="body2">{translate('pos_payments.charge.auth_code')}: {tx.auth_code}</Typography>}
                        </Box>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions>
                {status === 'pending' && transactionId && (
                    <Button color="error" disabled={busy} onClick={() => act(() => api.cancel(transactionId))}>{translate('pos_payments.charge.cancel')}</Button>
                )}
                {status === 'pending' && attention && transactionId && (
                    <Button variant="contained" disabled={busy} onClick={() => act(() => api.confirm(transactionId))}>{translate('pos_payments.charge.confirm')}</Button>
                )}
                {tx?.final && <Button variant="contained" onClick={onClose}>{translate('pos_payments.charge.close')}</Button>}
            </DialogActions>
        </Dialog>
    );
};

export default PosChargeDialog;
