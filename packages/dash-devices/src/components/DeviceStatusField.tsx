import { Chip, Tooltip, Stack } from '@mui/material';
import { useRecordContext, useTranslate } from 'react-admin';

const COLORS = { connected: 'success', disconnected: 'default', error: 'error', unknown: 'warning' } as const;

/** The device's live reachability. A last error rides along as a tooltip: it is the most useful thing on the list when a door does not open. */
export const DeviceStatusField = ({ source = 'connection_status' }: { source?: string }) => {
    const record = useRecordContext<any>();
    const translate = useTranslate();
    if (!record) return null;

    const status = (record[source] as keyof typeof COLORS) in COLORS ? (record[source] as keyof typeof COLORS) : 'unknown';
    const chip = (
        <Chip
            size="small"
            color={COLORS[status]}
            variant={status === 'connected' ? 'filled' : 'outlined'}
            label={translate(`dash_devices.status.${status}`, { _: status })}
        />
    );

    return record.last_error ? (
        <Tooltip title={record.last_error}>
            <Stack>{chip}</Stack>
        </Tooltip>
    ) : (
        chip
    );
};

export default DeviceStatusField;
