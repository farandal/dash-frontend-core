import React, { createContext, useContext } from 'react';

/** The slice of an axios instance this package needs; the host app supplies its own authenticated one. */
export interface DevicesHttp {
    post: (url: string, body?: object) => Promise<{ data: any }>;
}

const DevicesHttpContext = createContext<(() => DevicesHttp) | null>(null);

/** Gives the package's components the host's HTTP client (so no dash-* module is imported from here). */
export const DevicesHttpProvider: React.FC<{ http: () => DevicesHttp; children: React.ReactNode }> = ({ http, children }) => (
    <DevicesHttpContext.Provider value={http}>{children}</DevicesHttpContext.Provider>
);

export const useDevicesHttp = (): DevicesHttp => {
    const http = useContext(DevicesHttpContext);
    if (!http) throw new Error('dash-devices: wrap the screen in <DevicesHttpProvider http={...}>.');

    return http();
};
