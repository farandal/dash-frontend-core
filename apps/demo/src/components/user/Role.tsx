import React, { } from 'react';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import {
  AutocompleteInput,
  ReferenceInput,
  SelectInput,
  useRecordContext,
} from 'react-admin';
import { Box } from '@mui/material';
export type IRoleComponent = IDashAutoAdminCustomFieldComponent;
export const RoleShow: React.FC<IRoleComponent> = (_props) => {
  return <></>;
};
export const RoleEdit: React.FC<IRoleComponent> = ({
  record,
}) => {
  //const [roleId,setRoleId] = useState(record.role_id);
  return (
    <>
      <Box>
        <ReferenceInput
          fullWidth
          source='role_id'
          reference='system/role/forSelect'
        >
          <AutocompleteInput
            onChange={(_event) => {
              //setRoleId(event.target.value);
            }}
            label={'Tipos de Usuarios'}
            optionText={'name'}
            defaultValue={record?.role_id}
          />
        </ReferenceInput>
      </Box>
    </>
  );
};
export const RoleCreate: React.FC<IRoleComponent> = (_props) => {
  //const [roleId,setRoleId] = useState('');
  return (
    <>
      <Box>
        <ReferenceInput
          fullWidth
          source='role_id'
          reference='system/role/forSelect'
        >
          <SelectInput
            onChange={(_event) => {
              //setRoleId(event.target.value);
            }}
            fullWidth
            label={'Tipos de Usuario'}
            optionText={'name'}
          />
        </ReferenceInput>
      </Box>
    </>
  );
};
const Role = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
  const record = useRecordContext();
  switch (method) {
    case 'edit':
      return <RoleEdit attribute={attribute} record={record} method={method} resourceConfig={resourceConfig} />;
    case 'create':
      return <RoleCreate attribute={attribute} method={method} resourceConfig={resourceConfig} />;
    case 'view':
      return <RoleShow attribute={attribute} method={method} resourceConfig={resourceConfig} />;
  }
};
export default Role;
