import React, { useEffect, useState } from 'react';
import { Alert, LinearProgress } from '@mui/material';
import { useRecordContext } from 'react-admin';
import { Loading } from 'react-admin';
import { Tenant } from '../../interfaces/Tenant';

import { useGetList } from 'react-admin';

import {
  DashAutoFormGroups,
  IDashAutoAdminCustomFieldComponent,
} from 'dash-auto-admin';
import MUISimpleJsonTable from '../misc/MuiSimpleJsonTable';

const TenantSettingsCreate: React.FC<IDashAutoAdminCustomFieldComponent> = ({
  _method,
  _attribute,
}) => {
  return <Alert severity='info'>Configuración de variables</Alert>;
};

const TenantSettingsEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({
  method,
  _attribute,
}) => {
  const tenant: Tenant = useRecordContext();

  const {
    data: settingFormats,
    isLoading: settingFormatsLoading,
    /* @ts-ignore non used variable */
    //error: settingFormatsError,
  } = useGetList('system/tenant/settingFormats');

  const [settingFormatsSchema, setSettingFormatsSchema] = useState<any>(null);

  //const redirect = useRedirect();
  //const { axios } = useAxios();

  useEffect(() => {
    if (settingFormats && !settingFormatsLoading && tenant) {
      const parsedSchema = settingFormats.map((entry) => {
        const defaultValue =
          (tenant.settings && tenant.settings[entry.attribute]) ||
          entry?.default_value;

        return {
          ...entry,
          .../*method === "edit" &&*/ ((defaultValue !== null ||
            defaultValue !== undefined) && {
            fieldProps: {
              metadata: { defaultValue: defaultValue },
            },
          }),
          ...(method === 'view' && {
            readOnly: true,
          }),
        };
      });

      console.log('SCHEMA', parsedSchema);

      setSettingFormatsSchema(parsedSchema);
    }
  }, [settingFormats, settingFormatsLoading]);

  /*const readOnlyComponent = ({...props}) => {
        return <>{props.defaultValue}</>
    }*/

  if (!tenant?.settings) return <LinearProgress />
  return (
    <section>
      {settingFormatsSchema ? (
        DashAutoFormGroups(settingFormatsSchema, null, {
          mode: method,
					/*useReadOnlyInputAsTextField: true , readOnlyComponent: readOnlyComponent,*/ label:
            'Opciones de configuración',
        })
      ) : (
        <></>
      )}
    </section>
  );
};

const TenantSettingsView: React.FC<IDashAutoAdminCustomFieldComponent> = ({
  _method,
  _attribute,
}) => {
  const tenant: Tenant = useRecordContext();

  /*if (!tenant?.settings) return <Loading />*/

  const {
    data: settingFormats,
    isLoading: settingFormatsLoading,
    /* @ts-ignore non used variable */
    //error: settingFormatsError,
  } = useGetList('system/tenant/settingFormats', {
    pagination: null,
  });

  const parseValue = (value) => {

    switch (typeof value) {
      case 'boolean':
        return value ? 'Sí' : 'No';
      case 'number':
      case 'string':
      default:
        return value;
    }
  };

  const [settingFormatsParsedValues, setSettingFormatsParsedValues] =
    useState<any>(null);

  //const redirect = useRedirect();
  //const { axios } = useAxios();

  useEffect(() => {
    const object = {};
    if (settingFormats && !settingFormatsLoading && tenant) {
      settingFormats.forEach((entry) => {
        const defaultValue =
          tenant.settings && Object.prototype.hasOwnProperty.call(tenant.settings, entry.id)
            ? tenant.settings[entry.id]
            : entry?.default_value;

        object[entry.label] = <>{parseValue(defaultValue)}</>;
      });
      console.log('SCHEMA', object);

      setSettingFormatsParsedValues(object);
    }
  }, [settingFormats, settingFormatsLoading]);

  return settingFormatsParsedValues ? (
    <MUISimpleJsonTable
      tableData={settingFormatsParsedValues}
      vertical={true}
    />
  ) : (
    <Loading />
  );
};

const TenantSettings = ({
  method,
  attribute,
  resourceConfig,
}: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case 'edit':
      return <TenantSettingsEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />;
    case 'view':
      return <TenantSettingsView attribute={attribute} method={method} resourceConfig={resourceConfig} />;
    case 'create':
      return <TenantSettingsCreate attribute={attribute} method={method} resourceConfig={resourceConfig} />;
  }
};

export default TenantSettings;
