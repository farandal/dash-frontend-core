import React from 'react'
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import { useRecordContext } from "react-admin";
import { TextField } from 'react-admin';
import { FunctionField } from 'react-admin';

interface IData {
  [key: string]: any;
}

const BuyerView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {

  return <FunctionField
    label={attribute.label}
    render={record => `${record[attribute.attribute].first_name} ${record[attribute.attribute].last_name}`}
  />

}



const Buyer = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case "edit":
    case "create":
    case "view":
      return <BuyerView attribute={attribute} method={method} resourceConfig={resourceConfig} />
  }
}


export default Buyer;
