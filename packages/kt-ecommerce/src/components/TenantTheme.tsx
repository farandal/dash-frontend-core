import { DashAutoFormTabs, IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import React, { useState, useEffect } from "react";
import { Loading, useRecordContext } from "react-admin";
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

const TenantThemeEdit: React.FC<ITenantSettings> = ({ method, attribute, tenant }) => {
  const [settingFormatsSchema, setSettingFormatsSchema] = useState<any>(null);
  /*const formContext = useFormContext();
  const formValues = useWatch({
    control: formContext.control
  });*/

  const { formats: settingsFormats, loading } = useSystemRequestsCache();

  useEffect(() => {
    if (settingsFormats && settingsFormats.data) {
      // Filter for COLOR settings
      const parsedSchema = settingsFormats.data
        .filter((entry) => entry.tab === 'colors')
        .map((entry) => {
          const defaultValue =
            (tenant.settings && tenant.settings[entry.attribute]) ||
            entry?.default_value;

          return {
            ...entry,
            ...((defaultValue !== null ||
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

      console.log('THEME SCHEMA', parsedSchema);
      setSettingFormatsSchema(parsedSchema);
    }
  }, [settingsFormats])

  if (!settingFormatsSchema) return <Loading />
  return <section>
    <FormTabsRenderer schema={settingFormatsSchema} method={method} label="Tema y Colores" />
  </section>
}

const TenantThemeView: React.FC<ITenantSettings> = ({ method, attribute, tenant }) => {
  const [settingFormatsParsedValues, setSettingFormatsParsedValues] = useState<any>(null);
  const { formats: settingsFormats, loading } = useSystemRequestsCache();

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

  useEffect(() => {
    let object = {};
    if (settingsFormats && settingsFormats.data && tenant) {
      settingsFormats.data
        .filter((entry) => entry.tab === 'colors')
        .forEach((entry) => {
          const defaultValue = tenant.settings && tenant.settings.hasOwnProperty(entry.id) ? tenant.settings[entry.id] : entry?.default_value;
          object[entry.label] = <>{parseValue(defaultValue)}</>;
        });

      console.log("THEME VIEW SCHEMA", object);
      setSettingFormatsParsedValues(object);
    }
  }, [settingsFormats])

  return settingFormatsParsedValues ? <MUISimpleJsonTable tableData={settingFormatsParsedValues} vertical={true} /> : <Loading />
}

const TenantTheme = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
  const tenant: Tenant = useRecordContext();
  switch (method) {
    case "edit":
      return <TenantThemeEdit attribute={attribute} method={method} tenant={tenant} resourceConfig={resourceConfig} />
    case "view":
      return <TenantThemeView attribute={attribute} method={method} tenant={tenant} resourceConfig={resourceConfig} />
    case "create":
      return <TenantThemeEdit attribute={attribute} method={method} tenant={tenant} resourceConfig={resourceConfig} />
     case "list":
      return <></>
  }
}

export default TenantTheme
