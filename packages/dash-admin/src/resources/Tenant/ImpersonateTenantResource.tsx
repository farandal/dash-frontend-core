// in posts.js
import { ReferenceField, Resource, TextField } from 'react-admin';

import { IAppResourceConfig } from '../../interfaces/IAppResourceConfig';
import { FC, useState } from 'react';
import { SaveButton } from 'react-admin';
import { Toolbar } from 'react-admin';
import { SimpleForm } from 'react-admin';
//import { useForm } from 'react-hook-form';
import { Create } from 'react-admin';
import { ReferenceInput } from 'react-admin';
import { AutocompleteInput } from 'react-admin';
import { setCookie, getCookie } from '../../utils/cookies';
import ApplicationLayout from '../../layout/ApplicationLayout';
import { Alert, Card } from '@mui/material';
import { Route } from 'react-router';
import DASHAppConstants from 'dash-constants';

export const ImpersonateTenantComponent: FC<any> = (props) => {

  const { children: children, ...rest } = props;
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);


  const CustomToolbar = (toolbarProps) => {
    return (
      <Toolbar {...toolbarProps}>
        <SaveButton alwaysEnable={true} />
      </Toolbar>
    );
  };

  const validateFn = () => {
    const _errors: any = {};

    /*if(!values.tenant) {
            errors.tenant_id = "Debe seeleccionar un cliente"
        }*/
    return _errors;
  };

  const onSubmit = (data) => {
    localStorage.setItem('tenant_id', selectedTenantId);
    setCookie('tenant_id', selectedTenantId, null);
    window.location.reload();
  };

  //const [tenantId, setTenantId] = useState<string>(getCookie('tenant_id'));

  return (
    <Card title={'Impersonar Tenant'}>
      <SimpleForm
        toolbar={<CustomToolbar {...rest} />}
        validate={validateFn}
        noValidate
        onSubmit={onSubmit}
      >
        Cliente:
        <ReferenceInput label='Tenant' source='id' reference='system/tenant'>
          <AutocompleteInput
            filterToQuery={(search) => ({ q: search })}
            optionValue='id'
            optionText='name'
            onChange={(event, value) => {

              setSelectedTenantId(value["id"])
            }}
          />
        </ReferenceInput>

        <Alert severity="info">Cliente impersonado: {getCookie('tenant_id') && (
          <ReferenceField label="Tenant" source="id" reference="system/tenant" record={{ id: getCookie('tenant_id') }}>
            <TextField source="name" />
          </ReferenceField>
        )}
        </Alert>

      </SimpleForm>
    </Card>
  );
};

export const TenantImpersonateResource = (resourceConfig: IAppResourceConfig) => {

  const _resourceConfig: IAppResourceConfig = {
    ...resourceConfig,
    mainAction: null,
    create: false,
    edit: false,
    view: false,
  };

  return (
    <Route path={_resourceConfig.model + '/impersonate'} element={
      <Resource
        options={{ label: _resourceConfig.label, group: _resourceConfig.group }}
        name={_resourceConfig.model}
        list={() => {
          return (
            <ApplicationLayout resourceConfig={_resourceConfig}>
              <Create>
                <ImpersonateTenantComponent />
              </Create>
            </ApplicationLayout>
          );
        }}
        /* @ts-ignore known issue */
        icon={_resourceConfig.icon}
      />
    } />);
};
export default TenantImpersonateResource;
