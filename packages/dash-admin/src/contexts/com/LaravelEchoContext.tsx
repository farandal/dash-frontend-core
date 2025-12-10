import LaravelEchoMgr from './LaravelEchoMgr';
import { IDashNotificationPayloadBase } from '../../interfaces/communication/INotification';
import React, { FC, useEffect } from 'react';

export type ILaravelEchoContext = {
  events: IDashNotificationPayloadBase[];
  lastEvent: IDashNotificationPayloadBase;
  clear: () => void;
};

export interface ILaravelEchoProvider {
  children: React.ReactNode;
  manager?: () => {
    events: IDashNotificationPayloadBase[];
    lastEvent: IDashNotificationPayloadBase;
    clear: () => void;
  };
}

export const LaravelEchoContext = React.createContext<ILaravelEchoContext>({
  events: [],
  lastEvent: null,
  clear: null,
});

const LaravelEchoProvider: FC<ILaravelEchoProvider> = ({
  manager,
  children,
  ...props
}) => {

  const { events, lastEvent, clear } = manager ? manager() : LaravelEchoMgr();

  return <LaravelEchoContext.Provider
    value={{ events: events, lastEvent: lastEvent, clear: clear }}
  >
    {children}
  </LaravelEchoContext.Provider>
};

export { LaravelEchoContext as default, LaravelEchoProvider };
