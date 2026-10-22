import { useEffect, useState } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material';
import { useTranslate } from 'react-admin';
import { useDevicesHttp } from '../core/context';

interface ActionParam {
    type?: string;
    min?: number;
    max?: number;
}
interface DeviceAction {
    name: string;
    label?: string;
    params?: Record<string, ActionParam>;
}
interface Outcome {
    status: 'acked' | 'failed' | 'sent' | 'timeout' | 'unavailable' | 'invalid';
    ok?: boolean;
    error?: string;
    reason?: string;
}

/**
 * Runs one of the actions a device announced (open a door, kick a drawer) and shows what really happened:
 * the backend holds the call a few seconds for the device's own answer, so "Done" means the lock moved
 * and not only that a command left.
 */
export const RunActionDialog = ({ device, open, onClose }: { device: any; open: boolean; onClose: () => void }) => {
    const http = useDevicesHttp();
    const translate = useTranslate();
    const actions: DeviceAction[] = device?.capabilities?.actions ?? [];
    const [name, setName] = useState('');
    const [args, setArgs] = useState<Record<string, string>>({});
    const [busy, setBusy] = useState(false);
    const [outcome, setOutcome] = useState<Outcome | null>(null);
    const [failure, setFailure] = useState('');

    useEffect(() => {
        if (open) {
            setName(actions[0]?.name ?? '');
            setArgs({});
            setOutcome(null);
            setFailure('');
        }
    }, [open, device?.id]);

    const action = actions.find((a) => a.name === name);

    const run = async () => {
        setBusy(true);
        setOutcome(null);
        setFailure('');
        try {
            const body = Object.fromEntries(
                Object.entries(args)
                    .filter(([, v]) => v !== '')
                    .map(([k, v]) => [k, action?.params?.[k]?.type === 'integer' ? Number(v) : v]),
            );
            const { data } = await http.post(`device/device/${device.id}/action`, { action: name, args: body, wait: true });
            setOutcome((data?.data ?? data) as Outcome);
        } catch (e: any) {
            const errors = e?.response?.data?.errors;
            setFailure((errors && String(Object.values(errors).flat()[0])) || e?.response?.data?.message || e?.message || 'Error');
        } finally {
            setBusy(false);
        }
    };

    const verdict = outcome
        ? {
              severity: outcome.ok ? 'success' : outcome.status === 'sent' || outcome.status === 'timeout' ? 'warning' : 'error',
              text:
                  translate(`dash_devices.action.${outcome.status}`, { _: outcome.status }) +
                  (outcome.status === 'failed' && outcome.error ? `: ${outcome.error}` : outcome.reason && !outcome.ok ? ` (${outcome.reason})` : ''),
          }
        : null;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>{translate('dash_devices.action.title', { name: device?.name ?? '', _: 'Run action' })}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ pt: 1 }}>
                    {actions.length === 0 && <Alert severity="info">{translate('dash_devices.action.no_actions', { _: 'No actions' })}</Alert>}
                    {actions.length > 0 && (
                        <TextField select size="small" label={translate('dash_devices.action.choose', { _: 'Action' })} value={name} onChange={(e) => { setName(e.target.value); setArgs({}); setOutcome(null); }}>
                            {actions.map((a) => (
                                <MenuItem key={a.name} value={a.name}>
                                    {a.label || a.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}
                    {Object.entries(action?.params ?? {}).map(([param, spec]) => (
                        <TextField
                            key={param}
                            size="small"
                            label={param}
                            type={spec.type === 'integer' || spec.type === 'number' ? 'number' : 'text'}
                            slotProps={{ htmlInput: { min: spec.min, max: spec.max } }}
                            value={args[param] ?? ''}
                            onChange={(e) => setArgs({ ...args, [param]: e.target.value })}
                        />
                    ))}
                    {!device?.is_configured || !device?.active ? <Alert severity="warning">{translate('dash_devices.action.not_configured', { _: 'Not configured' })}</Alert> : null}
                    {verdict && <Alert severity={verdict.severity as any}>{verdict.text}</Alert>}
                    {failure && <Alert severity="error">{failure}</Alert>}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{translate('dash_devices.action.close', { _: 'Close' })}</Button>
                <Button variant="contained" onClick={run} disabled={busy || !name}>
                    {translate('dash_devices.action.run_now', { _: 'Run' })}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RunActionDialog;
