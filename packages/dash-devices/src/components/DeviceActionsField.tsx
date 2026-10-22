import { useState } from 'react';
import { Button } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useRecordContext, useTranslate } from 'react-admin';
import RunActionDialog from './RunActionDialog';
import { useOpenDeviceAction } from './DeviceActionHost';

/** The row's "run an action" button — only for devices that announced actions (an actuator). */
export const DeviceActionsField = () => {
    const record = useRecordContext<any>();
    const translate = useTranslate();
    const openInHost = useOpenDeviceAction();
    const [open, setOpen] = useState(false);

    if (!record || !(record.capabilities?.actions ?? []).length) return null;

    return (
        <>
            <Button
                size="small"
                startIcon={<PlayArrowIcon />}
                onClick={(e) => {
                    e.stopPropagation();
                    // Under a <DeviceActionHost> the dialog outlives list refreshes; without one it is the row's own.
                    openInHost ? openInHost(record) : setOpen(true);
                }}
            >
                {translate('dash_devices.action.run', { _: 'Run an action' })}
            </Button>
            {!openInHost && <RunActionDialog device={record} open={open} onClose={() => setOpen(false)} />}
        </>
    );
};

export default DeviceActionsField;
