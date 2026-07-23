import { DashAutoFormTabs, IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import React, { useState, useEffect } from "react";
import { Loading, useRecordContext } from "react-admin";

import { useAxios } from 'dash-axios-hook';
import { useFormContext, useWatch } from "react-hook-form";
import { Tenant } from "dash-admin/src/interfaces/Tenant";
import MUISimpleJsonTable from "dash-admin/src/components/misc/MuiSimpleJsonTable";
import { useSystemRequestsCache } from 'dash-admin/src/contexts/SystemRequestsCache';

/** Wrapper creating a React component boundary so DashAutoFormTabs hooks don't violate Rules of Hooks */
const FormTabsRenderer: React.FC<{schema: any; method: "list" | "create" | "edit" | "view"; label: string}> = ({schema, method, label}) => (
    <>{DashAutoFormTabs({schema, resourceConfig: null, options: {mode: method, label}})}</>
);

export interface ITenantSettings extends IDashAutoAdminCustomFieldComponent {
  tenant: Tenant
}

const TenantSettingsEdit: React.FC<ITenantSettings> = ({ method, attribute, tenant }) => {
  //const tenant: Tenant = useRecordContext();
  const axios = useAxios();
  /*if (!tenant?.settings) return <Loading />*/
  //const [settingsFormats, setSettingsFormats] = useState(null);
  const [settingFormatsSchema, setSettingFormatsSchema] = useState<any>(null);
  /*const formContext = useFormContext();
  const formValues = useWatch({
    control: formContext.control
  });*/

  const { formats: settingsFormats, loading } = useSystemRequestsCache();


  //const redirect = useRedirect();
  //const { axios } = useAxios();

  useEffect(() => {

    if (settingsFormats && settingsFormats.data) {

       const data = settingsFormats.data.setting_formats || settingsFormats.data;
    
       if(!data) { 
        console.log('No setting_formats found in response');
        return; 
      }

      const parsedSchema = data
        .filter((entry) => entry.tab !== 'colors' && entry.visible !== false)
        .map((entry) => {
        const defaultValue =
          (tenant.settings && tenant.settings[entry.attribute]) ||
          entry?.default_value;

        return {
          ...entry,
          .../*method === "edit" &&*/ ((defaultValue !== null ||
            defaultValue !== undefined) && {
            fieldOptions: {
              defaultValue: defaultValue,
              fullWidth: true,
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
  

  }, [settingsFormats])

  /*useEffect(() => {
      if(settingFormatsSchema) { 
          formContext.setValue('settings_schema', settingFormatsSchema); 
      }
  }, [settingFormatsSchema]);*/

  /*const readOnlyComponent = ({...props}) => {
      return <>{props.defaultValue}</>
  }*/
  if (!settingFormatsSchema) return <Loading />
  return <section>
    <FormTabsRenderer schema={settingFormatsSchema} method={method} label="Opciones de configuración" />
  </section>

  //return <>{DashAutoFormGroups(settingFormatsSchema, null, { mode: method, useReadOnlyInputAsTextField: true, label: "Opciones de configuración", meta: {dynamic: true} })}</>


}

const TenantSettingsView: React.FC<ITenantSettings> = ({ method, attribute, tenant }) => {

  /*if (!tenant?.settings) return <Loading />*/
  const axios = useAxios();

  const [settingFormats, setSettingsFormats] = useState(null);
  const [settingFormatsSchema, setSettingFormatsSchema] = useState<any>(null);

  useEffect(() => {
    const fetchSettingFormats = async () => {
      const { data } = await axios.get(
        `tenant/tenant/settings/formats`
      );

      setSettingsFormats(data.data.setting_formats);
    };

    fetchSettingFormats();
  }, [])



  const parseValue = (value) => {
    switch (typeof value) {
      case "boolean":
        return value ? "Sí" : "No";
      case "number":
      case "string":
      default:
        return value
    }
  }

  const [settingFormatsParsedValues, setSettingFormatsParsedValues] = useState<any>(null);

  //const redirect = useRedirect();
  //const { axios } = useAxios();


  useEffect(() => {

    let object = {};
    if (settingFormats && tenant) {

      settingFormats
        .filter((entry) => entry.tab !== 'colors' && entry.visible !== false)
        .forEach((entry) => {
        const defaultValue = tenant.settings && tenant.settings.hasOwnProperty(entry.id) ? tenant.settings[entry.id] : entry?.default_value;

        object[entry.label] = <>{parseValue(defaultValue)}</>;
      });


      console.log("SCHEMA", object);

      setSettingFormatsParsedValues(object);

    }

  }, [settingFormats])


  return settingFormatsParsedValues ? <MUISimpleJsonTable tableData={settingFormatsParsedValues} vertical={true} /> : <Loading />


}

const TenantSettings = ({ method, attribute, resourceConfig, record }: IDashAutoAdminCustomFieldComponent) => {
  // See the identical comment in TenantTheme.tsx: UserAction (dash-auto-admin)
  // passes the record as an explicit PROP, not via context — prefer it, and
  // only fall back to useRecordContext() if the caller didn't supply one.
  const recordFromContext = useRecordContext();
  const tenant: Tenant = (record as Tenant) ?? recordFromContext;
  switch (method) {
    case "edit":
      return <TenantSettingsEdit attribute={attribute} method={method} tenant={tenant} resourceConfig={resourceConfig} />
    case "view":
      return <TenantSettingsView attribute={attribute} method={method} tenant={tenant} resourceConfig={resourceConfig} />
    case "create":
      return <TenantSettingsEdit attribute={attribute} method={method} tenant={tenant} resourceConfig={resourceConfig} />
     case "list":
      return <></>
  }
}

export default TenantSettings