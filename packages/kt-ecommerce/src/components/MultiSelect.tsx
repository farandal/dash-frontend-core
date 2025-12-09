import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin'
import React, { } from 'react'

import { ReferenceArrayInput } from 'react-admin';
import { SelectArrayInput } from 'react-admin';
import { ChipField } from 'react-admin';
import { SingleFieldList } from 'react-admin';
import { ReferenceArrayField } from 'react-admin';

const MultiSelectView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
  const inputType = attribute.type as string;
  const [reference, source] = inputType.split('.');

  return <ReferenceArrayField source={attribute.attribute} reference={reference}>
    <SingleFieldList>
      <ChipField source={source} />
    </SingleFieldList>
  </ReferenceArrayField>;
}

const MultiSelectEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
  const inputType = attribute.type as string;
  const [reference, source] = inputType.split('.');

  return (
    <ReferenceArrayInput
      /*allowEmpty*/
      reference={reference}
      source={attribute.attribute}
      queryOptions={{ refetchOnWindowFocus: false }}
    >
      <SelectArrayInput optionText={source} />
    </ReferenceArrayInput>
  )

}

const MultiSelect = ({ method, attribute }: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case "edit":
    case "create":
      return <MultiSelectEdit attribute={attribute} method={method} />
    case "view":
      return <MultiSelectView attribute={attribute} method={method} />
  }
}


export default MultiSelect;
