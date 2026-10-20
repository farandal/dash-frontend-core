import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert, Button, Card, CardContent, Chip, CircularProgress, FormControlLabel, MenuItem, Stack, Switch, TextField, Typography,
} from '@mui/material';
import { usePosPayments } from './core/context';
import { posErrorMessage } from './core/api';
import type { Connector, ParamFormat, PaymentConfig, RefundMode, Terminal } from './core/types';

const MANUAL = '__manual__';

const toBool = (value: unknown) => value === true || value === 1 || ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());

/**
 * How a point of sale takes card payments: no integration (staff register cash by hand) or a
 * terminal connector with its credentials. Secrets are never shown again: a saved one reads
 * "saved", and leaving it empty keeps it. For Mercado Pago, the terminal can be picked from the
 * account once the access token is saved.
 */
export const PosPaymentSettings: React.FC<{ pointOfSaleId: number | string; onSaved?: (config: PaymentConfig) => void }> = ({ pointOfSaleId, onSaved }) => {
    const { api, translate, notify } = usePosPayments();
    const [connectors, setConnectors] = useState<Connector[]>([]);
    const [config, setConfig] = useState<PaymentConfig | null>(null);
    const [selected, setSelected] = useState<string>(MANUAL);
    const [values, setValues] = useState<Record<string, unknown>>({});
    const [refundMode, setRefundMode] = useState<RefundMode>('connector');
    const [terminals, setTerminals] = useState<Terminal[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let alive = true;
        setLoading(true);
        Promise.all([api.connectors(), api.payment(pointOfSaleId)])
            .then(([list, current]) => {
                if (!alive) return;
                setConnectors(Array.isArray(list) ? list : []);
                setConfig(current);
                setSelected(current.connector ?? MANUAL);
                setValues(current.values ?? {});
                setRefundMode(current.settings?.refund_mode === 'manual' ? 'manual' : 'connector');
            })
            .catch((e) => notify(posErrorMessage(e), { type: 'error' }))
            .finally(() => alive && setLoading(false));

        return () => {
            alive = false;
        };
    }, [api, notify, pointOfSaleId]);

    const connector = useMemo(() => connectors.find((c) => c.key === selected) ?? null, [connectors, selected]);
    const form: ParamFormat[] = connector?.form ?? [];
    const sameAsSaved = connector && config?.connector === connector.key;

    const setField = (id: string, value: unknown) => setValues((v) => ({ ...v, [id]: value }));

    const save = async () => {
        setSaving(true);
        try {
            const saved = await api.configure(pointOfSaleId, connector
                ? { connector: connector.key, params: values, settings: { refund_mode: refundMode }, verify: true }
                : { connector: null });
            setConfig(saved);
            setValues(saved.values ?? {});
            if (!connector) notify(translate('pos_payments.saved_manual'), { type: 'success' });
            else notify(translate(saved.verified ? 'pos_payments.verified' : 'pos_payments.not_verified'), { type: saved.verified ? 'success' : 'warning' });
            onSaved?.(saved);
        } catch (e) {
            notify(posErrorMessage(e), { type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const loadTerminals = async () => {
        try {
            setTerminals(await api.terminals(pointOfSaleId));
        } catch (e) {
            notify(posErrorMessage(e), { type: 'error' });
            setTerminals([]);
        }
    };

    const label = (f: ParamFormat) => translate(f.label ?? f.id);

    const renderField = (f: ParamFormat) => {
        const required = String(f.rules ?? '').includes('required');
        const help = f.description ? translate(f.description) : undefined;

        if (f.secret) {
            const saved = sameAsSaved && config?.secrets_set?.[f.id];
            return (
                <TextField
                    key={f.id} size="small" type="password" autoComplete="new-password" label={label(f)}
                    required={required && !saved} value={(values[f.id] as string) ?? ''}
                    onChange={(e) => setField(f.id, e.target.value)}
                    helperText={saved ? translate('pos_payments.secret_saved') : help}
                />
            );
        }

        if (f.type === 'select') {
            return (
                <TextField key={f.id} size="small" select label={label(f)} value={(values[f.id] as string) ?? ''} onChange={(e) => setField(f.id, e.target.value)} helperText={help}>
                    {!required && <MenuItem value="">—</MenuItem>}
                    {(f.choices ?? []).map((c) => <MenuItem key={c.id} value={c.id}>{translate(`pos_payments.choices.${c.id}`, { _: c.name ?? c.id })}</MenuItem>)}
                </TextField>
            );
        }

        if (f.type === 'boolean') {
            return <FormControlLabel key={f.id} control={<Switch checked={toBool(values[f.id])} onChange={(e) => setField(f.id, e.target.checked)} />} label={label(f)} />;
        }

        const field = (
            <TextField key={f.id} size="small" fullWidth label={label(f)} required={required} value={(values[f.id] as string) ?? ''} onChange={(e) => setField(f.id, e.target.value)} helperText={help} />
        );

        // The terminal id is hard to type: offer the account's terminals once the token is saved.
        if (f.id === 'terminal_id' && sameAsSaved) {
            return (
                <Stack key={f.id} spacing={1}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                        {field}
                        <Button size="small" sx={{ whiteSpace: 'nowrap', mt: 0.5 }} onClick={loadTerminals}>{translate('pos_payments.pick_terminal')}</Button>
                    </Stack>
                    {terminals && terminals.length === 0 && <Alert severity="warning">{translate('pos_payments.no_terminals')}</Alert>}
                    {terminals && terminals.length > 0 && (
                        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                            {terminals.map((t) => {
                                const pdv = String(t.operating_mode ?? '').toUpperCase() === 'PDV';
                                return (
                                    <Chip
                                        key={t.id} clickable color={values.terminal_id === t.id ? 'primary' : 'default'} variant={pdv ? 'filled' : 'outlined'}
                                        label={pdv ? t.id : `${t.id} · ${translate('pos_payments.not_pdv')}`}
                                        onClick={() => setField('terminal_id', t.id)}
                                    />
                                );
                            })}
                        </Stack>
                    )}
                </Stack>
            );
        }

        return field;
    };

    if (loading) return <CircularProgress size={24} />;

    return (
        <Card variant="outlined">
            <CardContent>
                <Stack spacing={2}>
                    <Typography variant="h6">{translate('pos_payments.integration')}</Typography>

                    <TextField size="small" select label={translate('pos_payments.connector')} value={selected} onChange={(e) => setSelected(e.target.value)}>
                        <MenuItem value={MANUAL}>{translate('pos_payments.manual')}</MenuItem>
                        {connectors.map((c) => <MenuItem key={c.key} value={c.key}>{translate(c.label, { _: c.key })}</MenuItem>)}
                    </TextField>

                    {form.map(renderField)}

                    {connector && (
                        <TextField size="small" select label={translate('pos_payments.refund_mode')} value={refundMode} onChange={(e) => setRefundMode(e.target.value as RefundMode)}>
                            <MenuItem value="connector">{translate('pos_payments.refund_modes.connector')}</MenuItem>
                            <MenuItem value="manual">{translate('pos_payments.refund_modes.manual')}</MenuItem>
                        </TextField>
                    )}

                    <Stack direction="row">
                        <Button variant="contained" onClick={save} disabled={saving} startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}>
                            {translate('pos_payments.save_verify')}
                        </Button>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default PosPaymentSettings;
