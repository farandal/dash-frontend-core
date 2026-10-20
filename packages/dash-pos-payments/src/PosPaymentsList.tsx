import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem,
    Paper, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField,
    Tooltip, Typography,
} from '@mui/material';
import { usePosPayments } from './core/context';
import { posErrorMessage } from './core/api';
import type { PosPointOfSaleOption, PosTransaction, PosTransactionFilters } from './core/types';
import { PosChargeDialog } from './PosChargeDialog';

const money = (amount: string | number | undefined, currency: string) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency, maximumFractionDigits: currency === 'CLP' ? 0 : 2 }).format(Number(amount ?? 0));

const when = (iso: string | null | undefined) => (iso ? new Date(iso).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' }) : '—');

const STATUSES = ['pending', 'approved', 'declined', 'timeout', 'cancelled', 'error'] as const;

const statusColor = (tx: PosTransaction): 'default' | 'success' | 'warning' | 'error' | 'info' =>
    tx.status === 'approved' ? 'success' : tx.status === 'pending' ? (tx.needs_attention ? 'warning' : 'info') : tx.status === 'cancelled' ? 'default' : 'error';

/**
 * The payments of the points of sale this user sees (core PosPaymentCore): every charge, by hand
 * or on a terminal. Filters by point of sale, status, dates, "needs checking" and late results.
 * Pending charges open the charge dialog (cancel / confirm); administrators refund a card charge,
 * whole or in part, unless its product refunds it through its own flow (the row says how).
 *
 * `renderReference` lets the product show what was paid (a tab, a booking) as it likes.
 */
export const PosPaymentsList: React.FC<{
    renderReference?: (transaction: PosTransaction) => React.ReactNode;
    defaultFilters?: PosTransactionFilters;
    perPage?: number;
}> = ({ renderReference, defaultFilters = {}, perPage = 25 }) => {
    const { api, translate: t, notify } = usePosPayments();
    const [pointOfSales, setPointOfSales] = useState<PosPointOfSaleOption[]>([]);
    const [filters, setFilters] = useState<PosTransactionFilters>({ per_page: perPage, page: 1, ...defaultFilters });
    const [rows, setRows] = useState<PosTransaction[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [following, setFollowing] = useState<string | null>(null);
    const [detail, setDetail] = useState<PosTransaction | null>(null);
    const [refunding, setRefunding] = useState<PosTransaction | null>(null);

    useEffect(() => {
        api.pointOfSales().then(setPointOfSales).catch(() => setPointOfSales([]));
    }, [api]);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const page = await api.transactions(filters);
            setRows(page.data ?? []);
            setTotal(page.total ?? 0);
        } catch (e) {
            setError(posErrorMessage(e));
        } finally {
            setLoading(false);
        }
    }, [api, filters]);

    useEffect(() => {
        load();
    }, [load]);

    const set = (patch: PosTransactionFilters) => setFilters((current) => ({ ...current, page: 1, ...patch }));

    return (
        <Stack spacing={2}>
            {/* Wraps by width, not by breakpoint: host themes define their own breakpoints. */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', '& > .MuiFormControl-root, & > .MuiTextField-root': { flex: '1 1 170px', maxWidth: 240 } }}>
                <FormControl size="small">
                    <InputLabel>{t('pos_payments.list.point_of_sale')}</InputLabel>
                    <Select
                        label={t('pos_payments.list.point_of_sale')}
                        value={filters.point_of_sale_id ?? ''}
                        onChange={(e) => set({ point_of_sale_id: e.target.value === '' ? undefined : (e.target.value as string) })}
                    >
                        <MenuItem value="">{t('pos_payments.list.all')}</MenuItem>
                        {pointOfSales.map((pos) => (
                            <MenuItem key={pos.id} value={pos.id}>
                                {pos.name}{pos.connector ? ` · ${t('pos_payments.list.terminal')}` : ''}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl size="small">
                    <InputLabel>{t('pos_payments.list.status')}</InputLabel>
                    <Select label={t('pos_payments.list.status')} value={filters.status ?? ''} onChange={(e) => set({ status: (e.target.value as string) || undefined })}>
                        <MenuItem value="">{t('pos_payments.list.all')}</MenuItem>
                        {STATUSES.map((status) => <MenuItem key={status} value={status}>{t(`pos_payments.list.statuses.${status}`)}</MenuItem>)}
                    </Select>
                </FormControl>
                <TextField size="small" type="date" label={t('pos_payments.list.from')} slotProps={{ inputLabel: { shrink: true } }} value={filters.from ?? ''} onChange={(e) => set({ from: e.target.value || undefined })} />
                <TextField size="small" type="date" label={t('pos_payments.list.to')} slotProps={{ inputLabel: { shrink: true } }} value={filters.to ?? ''} onChange={(e) => set({ to: e.target.value || undefined })} />
                <TextField size="small" label={t('pos_payments.list.reference')} value={filters.reference ?? ''} onChange={(e) => set({ reference: e.target.value || undefined })} />
                <Chip
                    label={t('pos_payments.list.attention')}
                    color={filters.attention ? 'warning' : 'default'}
                    variant={filters.attention ? 'filled' : 'outlined'}
                    onClick={() => set({ attention: !filters.attention })}
                />
                <Chip
                    label={t('pos_payments.list.late')}
                    color={filters.late ? 'error' : 'default'}
                    variant={filters.late ? 'filled' : 'outlined'}
                    onClick={() => set({ late: !filters.late })}
                />
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>{t('pos_payments.list.date')}</TableCell>
                            <TableCell>{t('pos_payments.list.point_of_sale')}</TableCell>
                            <TableCell>{t('pos_payments.list.reference')}</TableCell>
                            <TableCell align="right">{t('pos_payments.list.amount')}</TableCell>
                            <TableCell>{t('pos_payments.list.status')}</TableCell>
                            <TableCell>{t('pos_payments.list.card')}</TableCell>
                            <TableCell align="right" />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7}>
                                    <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                                        {loading ? t('pos_payments.list.loading') : t('pos_payments.list.empty')}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                        {rows.map((tx) => (
                            <TableRow key={tx.id} hover>
                                <TableCell>{when(tx.created_at)}</TableCell>
                                <TableCell>{tx.point_of_sale_name ?? tx.point_of_sale_id}</TableCell>
                                <TableCell>{renderReference ? renderReference(tx) : tx.reference}</TableCell>
                                <TableCell align="right">
                                    {money(tx.amount, tx.currency)}
                                    {Number(tx.refunded_amount ?? 0) > 0 && (
                                        <Typography variant="caption" color="error.main" sx={{ display: 'block' }}>
                                            {t('pos_payments.list.refunded', { amount: money(tx.refunded_amount, tx.currency) })}
                                        </Typography>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                                        <Chip size="small" color={statusColor(tx)} label={t(tx.needs_attention ? 'pos_payments.list.statuses.attention' : `pos_payments.list.statuses.${tx.status}`)} />
                                        {tx.provider === 'manual' && <Chip size="small" variant="outlined" label={t('pos_payments.list.manual')} />}
                                        {!!tx.late_results_count && <Chip size="small" color="error" variant="outlined" label={t('pos_payments.list.late_short')} />}
                                    </Stack>
                                </TableCell>
                                <TableCell>
                                    {[tx.card_brand, tx.masked_pan].filter(Boolean).join(' ') || '—'}
                                    {tx.auth_code && <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{tx.auth_code}</Typography>}
                                </TableCell>
                                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                    {tx.status === 'pending' && <Button size="small" onClick={() => setFollowing(tx.id)}>{t('pos_payments.list.follow')}</Button>}
                                    {tx.refund?.allowed && <Button size="small" color="error" onClick={() => setRefunding(tx)}>{t('pos_payments.list.refund')}</Button>}
                                    {!tx.refund?.allowed && tx.refund?.hint && tx.provider !== 'manual' && tx.approved && Number(tx.refundable_amount ?? 0) > 0 && (
                                        <Tooltip title={tx.refund.hint}><span><Button size="small" disabled>{t('pos_payments.list.refund')}</Button></span></Tooltip>
                                    )}
                                    <Button size="small" onClick={() => setDetail(tx)}>{t('pos_payments.list.detail')}</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={total}
                    page={(filters.page ?? 1) - 1}
                    rowsPerPage={filters.per_page ?? perPage}
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    onPageChange={(_, page) => setFilters((current) => ({ ...current, page: page + 1 }))}
                    onRowsPerPageChange={(e) => set({ per_page: Number(e.target.value) })}
                    labelRowsPerPage={t('pos_payments.list.per_page')}
                    labelDisplayedRows={({ from, to, count }) => t('pos_payments.list.displayed', { from, to, count })}
                />
            </TableContainer>

            <PosChargeDialog
                transactionId={following}
                open={!!following}
                onClose={() => {
                    setFollowing(null);
                    load();
                }}
            />

            <DetailDialog transaction={detail} onClose={() => setDetail(null)} />

            <RefundDialog
                transaction={refunding}
                onClose={() => setRefunding(null)}
                onRefunded={() => {
                    setRefunding(null);
                    notify(t('pos_payments.list.refund_done'), { type: 'success' });
                    load();
                }}
            />
        </Stack>
    );
};

/** Everything stored about one payment, for reconciliation. */
const DetailDialog: React.FC<{ transaction: PosTransaction | null; onClose: () => void }> = ({ transaction: tx, onClose }) => {
    const { translate: t } = usePosPayments();
    if (!tx) return null;

    const rows: [string, React.ReactNode][] = [
        [t('pos_payments.list.point_of_sale'), tx.point_of_sale_name ?? tx.point_of_sale_id],
        [t('pos_payments.list.reference'), `${tx.reference_type ?? ''} ${tx.reference}`.trim()],
        [t('pos_payments.list.amount'), money(tx.amount, tx.currency)],
        [t('pos_payments.list.status'), `${t(`pos_payments.list.statuses.${tx.status}`)}${tx.provider_status ? ` (${tx.provider_status})` : ''}`],
        [t('pos_payments.list.provider'), tx.provider],
        [t('pos_payments.list.card'), [tx.card_brand, tx.masked_pan].filter(Boolean).join(' ') || '—'],
        [t('pos_payments.charge.auth_code'), tx.auth_code ?? '—'],
        [t('pos_payments.list.acquirer_id'), tx.acquirer_transaction_id ?? '—'],
        [t('pos_payments.list.date'), when(tx.created_at)],
        [t('pos_payments.list.settled_at'), when(tx.settled_at)],
    ];
    if (tx.manual_confirmation) rows.push([t('pos_payments.list.confirmed_by_hand'), tx.note ?? '—']);

    return (
        <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{t('pos_payments.list.detail_title')}</DialogTitle>
            <DialogContent>
                <Table size="small">
                    <TableBody>
                        {rows.map(([label, value]) => (
                            <TableRow key={label}>
                                <TableCell sx={{ color: 'text.secondary', width: '40%' }}>{label}</TableCell>
                                <TableCell>{value}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {!!tx.refunds?.length && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2">{t('pos_payments.list.refunds')}</Typography>
                        {tx.refunds.map((refund, i) => (
                            <Typography key={i} variant="body2">
                                {when(refund.refunded_at)} · {money(refund.amount, tx.currency)}{refund.refund_id ? ` · ${refund.refund_id}` : ''}
                            </Typography>
                        ))}
                    </Box>
                )}
                {!!tx.late_results_count && <Alert severity="warning" sx={{ mt: 2 }}>{t('pos_payments.list.late_help')}</Alert>}
                {tx.error && <Alert severity="error" sx={{ mt: 2 }}>{tx.error}</Alert>}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('pos_payments.charge.close')}</Button>
            </DialogActions>
        </Dialog>
    );
};

/** Refund a card charge through its terminal's connector: what is left, or part of it. */
const RefundDialog: React.FC<{ transaction: PosTransaction | null; onClose: () => void; onRefunded: () => void }> = ({ transaction: tx, onClose, onRefunded }) => {
    const { api, translate: t } = usePosPayments();
    const [amount, setAmount] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setAmount(tx ? String(Number(tx.refundable_amount ?? 0)) : '');
        setError(null);
    }, [tx]);

    if (!tx) return null;

    const left = Number(tx.refundable_amount ?? 0);
    const value = Number(amount);
    const valid = value > 0 && value <= left;

    const submit = async () => {
        setBusy(true);
        setError(null);
        try {
            await api.refund(tx.id, value === left ? undefined : amount);
            onRefunded();
        } catch (e) {
            setError(posErrorMessage(e));
        } finally {
            setBusy(false);
        }
    };

    return (
        <Dialog open onClose={busy ? undefined : onClose} maxWidth="xs" fullWidth>
            <DialogTitle>{t('pos_payments.list.refund_title')}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ pt: 1 }}>
                    <Typography variant="body2">
                        {t('pos_payments.list.refund_help', { charged: money(tx.amount, tx.currency), left: money(left, tx.currency) })}
                    </Typography>
                    <TextField
                        label={t('pos_payments.list.refund_amount')}
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        error={amount !== '' && !valid}
                        slotProps={{ htmlInput: { min: 0, max: left, step: tx.currency === 'CLP' ? 1 : 0.01 } }}
                        autoFocus
                    />
                    {error && <Alert severity="error">{error}</Alert>}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={busy}>{t('pos_payments.charge.close')}</Button>
                <Button variant="contained" color="error" onClick={submit} disabled={!valid || busy}>
                    {t('pos_payments.list.refund_confirm', { amount: valid ? money(value, tx.currency) : '' })}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PosPaymentsList;
