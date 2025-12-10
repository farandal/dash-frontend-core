import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin'
import React, { } from 'react'
import { useRecordContext } from "react-admin";

import { ImageInput } from 'react-admin';
import { ImageField } from 'react-admin';

const CustomImageInputView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {

  const record = useRecordContext();

  return record ? <img src={record[attribute.listAttribute]} alt="imagen" /> : <></>;
}

const CustomImageInputEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {

  return (
    // @ts-ignore
    <ImageInput fullWidth sortable={false} placeholder={"Arrástre una imágen o haga click aquí para seleccionar"} source={attribute.attribute} label={attribute.label} accept="image/*">
      <ImageField source={/*attribute.listAttribute ||*/`src`} title="title" />
    </ImageInput>
  )

}

const CustomImageInput = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case "edit":
    case "create":
      return <CustomImageInputEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />
    case "view":
      return <CustomImageInputView attribute={attribute} method={method} resourceConfig={resourceConfig} />
  }
}

export default CustomImageInput;
