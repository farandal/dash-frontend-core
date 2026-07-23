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
    // TEMP DIAGNOSTIC round 2 — remove once confirmed working.
    console.log('🔍2 tenant.settings.colors present?', !!tenant?.settings?.colors, '| primary-color--light =', tenant?.settings?.colors?.['primary-color--light']);

    if (settingsFormats && settingsFormats.data) {
      // Filter for COLOR settings
      const parsedSchema = settingsFormats.data
        .filter((entry) => entry.tab === 'colors')
        .map((entry) => {
          // entry.attribute is the dot-path into the record, e.g. "settings.colors".
          // The tenant's actual saved value lives at tenant.settings.colors — NOT at
          // tenant.settings["settings.colors"]. Strip the leading "settings." so we
          // read the correct nested key (this was the bug that made the editor always
          // show the config template defaults instead of the tenant's saved colors).
          const settingsKey = String(entry.attribute || '').replace(/^settings\./, '');
          const tenantValue = tenant?.settings ? tenant.settings[settingsKey] : undefined;

          // Merge the tenant's saved values OVER the template defaults so every key
          // is present (a partial saved object still fills gaps from the template),
          // and set it as the entry's default_value. The color component seeds its
          // initial state from attribute.default_value, so injecting the merged
          // tenant colors here makes it show the real colors even if the deep
          // react-admin record context isn't available at its render depth.
          const templateDefault = entry?.default_value;
          const mergedDefault =
            tenantValue && typeof tenantValue === 'object' && typeof templateDefault === 'object'
              ? { ...templateDefault, ...tenantValue }
              : (tenantValue ?? templateDefault);

          return {
            ...entry,
            default_value: mergedDefault,
            fieldOptions: {
              defaultValue: mergedDefault,
              fullWidth: true,
            },
            ...(method === 'view' && {
              readOnly: true,
            }),
          };
        });

      console.log('THEME SCHEMA', parsedSchema);
      setSettingFormatsSchema(parsedSchema);
    }
  }, [settingsFormats, tenant])

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
          // Read the tenant's saved value from the correct nested key derived from
          // entry.attribute (e.g. "settings.colors" -> tenant.settings.colors), not
          // from entry.id ("theme_colors"), which never exists in the settings object.
          const settingsKey = String(entry.attribute || '').replace(/^settings\./, '');
          const defaultValue = tenant?.settings && tenant.settings.hasOwnProperty(settingsKey)
            ? tenant.settings[settingsKey]
            : entry?.default_value;
          object[entry.label] = <>{parseValue(defaultValue)}</>;
        });

      console.log("THEME VIEW SCHEMA", object);
      setSettingFormatsParsedValues(object);
    }
  }, [settingsFormats])

  return settingFormatsParsedValues ? <MUISimpleJsonTable tableData={settingFormatsParsedValues} vertical={true} /> : <Loading />
}

const TenantTheme = ({ method, attribute, resourceConfig, record }: IDashAutoAdminCustomFieldComponent) => {
  // UserAction (dash-auto-admin) passes the record as an explicit PROP, not via a
  // RecordContextProvider — that's precisely so custom components don't have to
  // depend on context being correctly threaded down to this render depth. Prefer
  // the prop; fall back to context only if the caller didn't supply one.
  const recordFromContext = useRecordContext();
  const tenant: Tenant = (record as Tenant) ?? recordFromContext;
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
