import React from 'react'
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import { useRecordContext } from "react-admin";
import { Link } from 'react-router-dom';

interface IData {
  [key: string]: any;
}

const CustomLinkComponent: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {

  const data: IData = useRecordContext();
  const link = data[attribute.attribute];

  return link ? <a target='_blank' href={link}>{attribute.label}</a> : <></>
}

const CustomLink = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case "edit":
    case "create":
    case "view":
      return <CustomLinkComponent attribute={attribute} method={method} resourceConfig={resourceConfig} />
  }
}

export default CustomLink;
