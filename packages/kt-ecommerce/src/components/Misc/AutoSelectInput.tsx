import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import React, { } from 'react'
import { useRecordContext } from "react-admin";
import { SelectInput } from 'react-admin';

type SelectInputType = typeof SelectInput;
export interface IAutoSelectInput extends IDashAutoAdminCustomFieldComponent, Partial<SelectInputType> {
}

export const AutoSelectInput: React.FC<IAutoSelectInput> = ({ method, attribute, ...selectProps }) => {

  const record = useRecordContext();

  return <SelectInput {...selectProps} source={attribute.attribute} />

}

export const AutoSelectView: React.FC<IAutoSelectInput> = ({ method, attribute, ...selectProps }) => {

  const record = useRecordContext();

  return <>
    {record[attribute.attribute]}
  </>

}

const AutoSelect = ({ method, attribute, resourceConfig,...selectProps }: IAutoSelectInput) => {

  switch (method) {
    case "edit":
    case "create":
      return <AutoSelectInput method={method} attribute={attribute} resourceConfig={resourceConfig} {...selectProps} />
    case "view":
      return <AutoSelectView method={'view'} attribute={attribute} resourceConfig={resourceConfig} />
  }
}

export default AutoSelect;
