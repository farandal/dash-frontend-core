import * as React from 'react';

export interface IAppMenu {
  //hasDashboard: boolean;
  children?: React.ReactNode;
  autoHideScroll?: boolean;
  [key: string]: any;
}

// Group icons
export const AppMenu: React.FC<IAppMenu> = ({
  hasDashboard,
  autoHideScroll = false,
  children,
}) => {
  
  return (
    <>
      Deprecated
    </>
  );
};
