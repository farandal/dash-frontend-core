import React from 'react'
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import { useRecordContext } from "react-admin";

interface IData {
  [key: string]: any;
}

const ComponentView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {

  const data: IData = useRecordContext();

  return (<></>)
}

const ComponentEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {

  const data: IData = useRecordContext();

  return (<></>)
}


const ComponentSample = ({ method, attribute }: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case "edit":
    case "create":
      return <ComponentEdit attribute={attribute} method={method} />
    case "view":
      return <ComponentView attribute={attribute} method={method} />
  }
}


export default ComponentSample;
