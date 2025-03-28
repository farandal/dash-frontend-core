import LaravelEchoMgr from './LaravelEchoMgr';
import { INotificationPayloadBase } from './components/notificationFormats';
import React, { FC, useEffect } from 'react';

export type ILaravelEchoContext = {
  events: INotificationPayloadBase[];
  lastEvent: INotificationPayloadBase;
  clear: () => void;
};

export interface ILaravelEchoProvider {
  children: React.ReactNode;
  manager?: () => {
    events: INotificationPayloadBase[];
    lastEvent: INotificationPayloadBase;
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

  useEffect(() => {
    console.log(lastEvent, events)
  }, [events, lastEvent])

  return <LaravelEchoContext.Provider
    value={{ events: events, lastEvent: lastEvent, clear: clear }}
  >
    {children}
  </LaravelEchoContext.Provider>
};

export { LaravelEchoContext as default, LaravelEchoProvider };
