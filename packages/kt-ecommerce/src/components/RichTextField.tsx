import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import React, { } from 'react'
import { useRecordContext } from "react-admin";
import { RichTextInput } from 'ra-input-rich-text';
import { RichTextField } from 'react-admin';

const RichTextFieldEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {

  return <RichTextInput label={attribute.label} source={attribute.attribute} />

}

const RichTextFieldWrapper = ({ method, attribute,resourceConfig }: IDashAutoAdminCustomFieldComponent) => {

  switch (method) {
    case "edit":
    case "create":
      return <RichTextFieldEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />
    case "view":
      return <RichTextField source={attribute.attribute} />
  }
}

export default RichTextFieldWrapper;
