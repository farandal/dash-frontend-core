import { Button, FormControlLabel, Switch } from '@mui/material';
import { Product } from '..';
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


const LogViewer = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case "edit":
    case "create":
      return <LogViewerEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />
    case "view":
      return <LogViewerView attribute={attribute} method={method} resourceConfig={resourceConfig} />
  }
}


export default LogViewer;
