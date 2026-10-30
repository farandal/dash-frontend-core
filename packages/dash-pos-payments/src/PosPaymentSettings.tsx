import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert, Button, Card, CardContent, Chip, CircularProgress, createTheme, FormControlLabel, MenuItem, Stack, Switch, TextField,
    ThemeProvider, ToggleButton, ToggleButtonGroup, Typography, useTheme,
} from '@mui/material';
import { usePosPayments } from './core/context';
import { posErrorMessage } from './core/api';
import type { Connector, ParamFormat, PaymentConfig, RefundMode, Terminal } from './core/types';

const MANUAL = '__manual__';

const toBool = (value: unknown) => value === true || value === 1 || ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());

/** Fields that only a venue's own Mercado Pago application needs (with "Connect" the platform's apply). */
const OWN_APP_FIELDS = ['access_token', 'webhook_secret'];

/** The page to come back to after Mercado Pago, without a previous outcome in its query. */
const currentPageWithoutOutcome = () => {
    const url = new URL(window.location.href);
    ['mp_oauth', 'reason', 'point_of_sale_id'].forEach((k) => url.searchParams.delete(k));
    return url.toString();
};

/**
 * How a point of sale takes card payments: no integration (staff register cash by hand) or a
 * terminal connector with its credentials. Secrets are never shown again: a saved one reads
 * "saved", and leaving it empty keeps it. For Mercado Pago, the terminal can be picked from the
 * account once the access token is saved.
 *
 * Mercado Pago accounts connect two ways (doc §14.6): "Connect Mercado Pago" (the venue authorises
 * the platform's application; offered when the backend has it set up) or the access token of the
 * venue's own application. Coming back from Mercado Pago, the page carries ?mp_oauth=connected|error.
 */
export const PosPaymentSettings: React.FC<{ pointOfSaleId: number | string; onSaved?: (config: PaymentConfig) => void }> = ({ pointOfSaleId, onSaved }) => {
    const { api, translate, notify } = usePosPayments();
    const [connectors, setConnectors] = useState<Connector[]>([]);
    const [config, setConfig] = useState<PaymentConfig | null>(null);
    const [selected, setSelected] = useState<string>(MANUAL);
    const [values, setValues] = useState<Record<string, unknown>>({});
    const [refundMode, setRefundMode] = useState<RefundMode>('connector');
    // Payment test mode: the terminal is charged a small fixed amount, and that is what is booked.
    const [testMode, setTestMode] = useState(false);
    const [testAmount, setTestAmount] = useState('');
    const [terminals, setTerminals] = useState<Terminal[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    // 'platform' = "Connect Mercado Pago"; 'own' = the venue's own application (pasted token).
    const [account, setAccount] = useState<'platform' | 'own'>('own');
    const [connecting, setConnecting] = useState(false);

    // The drawer this renders inside always gives it a light (near-white) card surface, in both
    // of the app's dark/light modes — but Typography/FormHelperText/Select text color follows the
    // app's CURRENT mode, which (in dark mode) is meant for a dark surface and is unreadable here.
    // A self-contained light theme keeps this card legible regardless of the app's mode, while
    // still picking up the app's own brand colors so buttons/focus rings stay on-brand.
    const ambientTheme = useTheme();
    const lightTheme = useMemo(() => createTheme({
        palette: { mode: 'light', primary: ambientTheme.palette.primary, secondary: ambientTheme.palette.secondary },
        typography: ambientTheme.typography,
        shape: ambientTheme.shape,
    }), [ambientTheme]);

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
                setTestMode(!!current.settings?.test_mode);
                setTestAmount(String(current.settings?.test_amount ?? ''));
                const oauth = current.oauth;
                setAccount(oauth?.connected || (oauth?.available && !current.secrets_set?.access_token) ? 'platform' : 'own');
            })
            .catch((e) => notify(posErrorMessage(e), { type: 'error' }))
            .finally(() => alive && setLoading(false));

        return () => {
            alive = false;
        };
    }, [api, notify, pointOfSaleId]);

    // Back from Mercado Pago: say how it went once, and drop the outcome from the address.
    useEffect(() => {
        const url = new URL(window.location.href);
        const outcome = url.searchParams.get('mp_oauth');
        if (!outcome || String(url.searchParams.get('point_of_sale_id')) !== String(pointOfSaleId)) return;
        notify(translate(outcome === 'connected' ? 'pos_payments.oauth.connected' : 'pos_payments.oauth.failed'), { type: outcome === 'connected' ? 'success' : 'error' });
        window.history.replaceState(window.history.state, '', currentPageWithoutOutcome());
    }, [notify, pointOfSaleId, translate]);

    const connector = useMemo(() => connectors.find((c) => c.key === selected) ?? null, [connectors, selected]);
    const oauthOffered = !!connector?.capabilities?.oauth && !!config?.oauth?.available;
    const usesPlatform = oauthOffered && account === 'platform';
    const form: ParamFormat[] = (connector?.form ?? [])
        .filter((f) => !f.internal)
        .filter((f) => !(usesPlatform && OWN_APP_FIELDS.includes(f.id)));
    const oauthConnected = !!config?.oauth?.connected && config?.connector === connector?.key;

    const connectMercadoPago = async () => {
        setConnecting(true);
        try {
            const { url } = await api.mercadoPagoOAuthUrl(pointOfSaleId, currentPageWithoutOutcome());
            window.location.assign(url);
        } catch (e) {
            notify(posErrorMessage(e), { type: 'error' });
            setConnecting(false);
        }
    };
    const sameAsSaved = connector && config?.connector === connector.key;

    const setField = (id: string, value: unknown) => setValues((v) => ({ ...v, [id]: value }));

    const save = async () => {
        setSaving(true);
        try {
            const saved = await api.configure(pointOfSaleId, connector
                ? {
                    connector: connector.key, params: values, verify: true,
                    settings: { refund_mode: refundMode, test_mode: testMode, ...(testAmount ? { test_amount: testAmount } : {}) },
                }
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
        <ThemeProvider theme={lightTheme}>
            <Card variant="outlined">
                <CardContent>
                <Stack spacing={2}>
                    <Typography variant="h6">{translate('pos_payments.integration')}</Typography>

                    <TextField size="small" select label={translate('pos_payments.connector')} value={selected} onChange={(e) => setSelected(e.target.value)}>
                        <MenuItem value={MANUAL}>{translate('pos_payments.manual')}</MenuItem>
                        {connectors.map((c) => <MenuItem key={c.key} value={c.key}>{translate(c.label, { _: c.key })}</MenuItem>)}
                    </TextField>

                    {oauthOffered && (
                        <Stack spacing={1}>
                            <ToggleButtonGroup size="small" exclusive value={account} onChange={(_, v) => v && setAccount(v)}>
                                <ToggleButton value="platform">{translate('pos_payments.oauth.platform')}</ToggleButton>
                                <ToggleButton value="own">{translate('pos_payments.oauth.own')}</ToggleButton>
                            </ToggleButtonGroup>
                            {usesPlatform && (
                                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                    {oauthConnected && !config?.oauth?.error && (
                                        <Chip color="success" label={translate('pos_payments.oauth.connected_as', { account: config?.oauth?.mp_user_id ?? '' })} />
                                    )}
                                    <Button variant={oauthConnected ? 'outlined' : 'contained'} onClick={connectMercadoPago} disabled={connecting}>
                                        {translate(oauthConnected ? 'pos_payments.oauth.reconnect' : 'pos_payments.oauth.connect')}
                                    </Button>
                                </Stack>
                            )}
                            {usesPlatform && config?.oauth?.error && <Alert severity="warning">{translate('pos_payments.oauth.expired')}</Alert>}
                            {usesPlatform && !oauthConnected && <Typography variant="body2" color="text.secondary">{translate('pos_payments.oauth.help')}</Typography>}
                        </Stack>
                    )}

                    {form.map(renderField)}

                    {connector && (
                        <TextField size="small" select label={translate('pos_payments.refund_mode')} value={refundMode} onChange={(e) => setRefundMode(e.target.value as RefundMode)}>
                            <MenuItem value="connector">{translate('pos_payments.refund_modes.connector')}</MenuItem>
                            <MenuItem value="manual">{translate('pos_payments.refund_modes.manual')}</MenuItem>
                        </TextField>
                    )}

                    {connector && (
                        <Stack spacing={1}>
                            <FormControlLabel
                                control={<Switch checked={testMode} onChange={(e) => setTestMode(e.target.checked)} />}
                                label={translate('pos_payments.test_mode.label')}
                            />
                            {testMode && (
                                <TextField
                                    size="small" type="number" label={translate('pos_payments.test_mode.amount')} value={testAmount}
                                    onChange={(e) => setTestAmount(e.target.value)} helperText={translate('pos_payments.test_mode.amount_help')}
                                />
                            )}
                            {testMode && <Alert severity="warning">{translate('pos_payments.test_mode.active', { amount: testAmount || config?.settings?.test_amount || '' })}</Alert>}
                            <Typography variant="body2" color="text.secondary">{translate('pos_payments.test_mode.help')}</Typography>
                        </Stack>
                    )}
                    <Stack direction="row">
                        <Button variant="contained" onClick={save} disabled={saving || (usesPlatform && !oauthConnected)} startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}>
                            {translate('pos_payments.save_verify')}
                        </Button>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
        </ThemeProvider>
    );
};

export default PosPaymentSettings;
