import React, { createContext, useContext, useState } from 'react';
import RunActionDialog from './RunActionDialog';

const OpenAction = createContext<((device: any) => void) | null>(null);

/**
 * Owns the "run an action" dialog ABOVE the list. A row's own state would be lost the moment the list
 * refreshes (and it does, when the device answers), taking the answer — "the door opened" — with it.
 */
export const DeviceActionHost: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [device, setDevice] = useState<any>(null);

    return (
        <OpenAction.Provider value={setDevice}>
            {children}
            <RunActionDialog device={device} open={!!device} onClose={() => setDevice(null)} />
        </OpenAction.Provider>
    );
};

export const useOpenDeviceAction = () => useContext(OpenAction);
