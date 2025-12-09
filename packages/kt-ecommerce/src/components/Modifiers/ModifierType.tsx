import React from "react";
import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import { Loading, useEditContext, useRecordContext, useShowContext, SelectInput } from "react-admin";

const Edit: React.FC<IDashAutoAdminCustomFieldComponent> = (props) => {
    const { record, isPending } = useEditContext();
    if (!record || isPending) {
      return <Loading />;
    }
    return <EditComponent {...props} record={record} />;
};

const Create: React.FC<IDashAutoAdminCustomFieldComponent> = (props) => {
    return <EditComponent {...props} record={null} />;
};

const EditComponent: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute, resourceConfig, record }) => {
  
    return (
      <SelectInput
        source={attribute.attribute}
        choices={[
          { id: 'SINGLE', name: 'Selección Única' },
          { id: 'MULTIPLE', name: 'Selección Múltiple' }
        ]}
      
      />
    );
};

const View: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute, resourceConfig }) => {
    const { record, isPending } = useShowContext();
    if (!record || isPending) {
      return <Loading />;
    }
    return null;
};

const List: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute, resourceConfig }) => {
    const record = useRecordContext();
    return null;
};

const Component: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute, resourceConfig }) => {
    switch (method) {
      case "edit":
        return <Edit attribute={attribute} method={method} resourceConfig={resourceConfig} />;
      case "create":
        return <Create attribute={attribute} method={method} resourceConfig={resourceConfig} />;
      case "view":
        return <View attribute={attribute} method={method} resourceConfig={resourceConfig} />;
      case "list":
        return <List attribute={attribute} method={method} resourceConfig={resourceConfig} />;
      default:
        return null;
    }
};

export default Component;