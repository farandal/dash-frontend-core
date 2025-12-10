import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import React, { } from 'react'
import { useRecordContext } from "react-admin";
import JSONViewer from 'react-json-viewer';

const OrderDetailView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {

  const record = useRecordContext();
  return <>
    <JSONViewer
      json={record.products}
    />
  </>

}

const OrderDetail = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case "edit":
    case "create":
      return <>edit</>
    case "view":
      return <OrderDetailView attribute={attribute} method={method} resourceConfig={resourceConfig} />
  }
}

export default OrderDetail;
