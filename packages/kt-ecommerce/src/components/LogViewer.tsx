import { Button, FormControlLabel, Switch } from '@mui/material';
import { Product } from '../interfaces/Product';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';;
import React, { Fragment, useEffect, useState } from 'react'
import { TextInput } from 'react-admin';
import { useRecordContext } from "react-admin";
import { useGetList } from 'react-admin';

export interface ILogViewerComponent {
  log: any
}
export const LogViewerComponent: React.FC<ILogViewerComponent> = ({ log }) => {

  return (<><h1>Log</h1></>)
}

const LogViewerEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {

  const log = useRecordContext();

  return (
    <>{log &&
      <LogViewerComponent log={log} />
    }</>
  )
}

const LogViewerView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
  const log: Product = useRecordContext();
  return (
    <>{log &&
      <LogViewerComponent log={log} />
    }</>
  )
}


const LogViewer = ({ method, attribute }: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case "edit":
    case "create":
      return <LogViewerEdit attribute={attribute} method={method} />
    case "view":
      return <LogViewerView attribute={attribute} method={method} />
  }
}


export default LogViewer;
