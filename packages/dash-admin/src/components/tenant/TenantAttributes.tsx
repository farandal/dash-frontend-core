import { DashAutoFormGroups, DashAutoFormTabs, IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import React, { useState, useEffect, useContext, createContext, useRef } from "react";
import { useGetList, Loading, useRecordContext } from "react-admin";
import { useAxios } from 'dash-axios-hook';
import { useFormContext, useWatch } from "react-hook-form";
import { Tenant } from "../../interfaces/Tenant";
import MUISimpleJsonTable from "../misc/MuiSimpleJsonTable";
import { useTenantAttributesFormats } from "./TenantAttributesContext";
import { useSystemRequestsCache } from "../../contexts/SystemRequestsCache";

const TenantAttributesEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute, tenant }) => {
  const [attributeFormatsSchema, setAttributeFormatsSchema] = useState<any>(null);
  const formContext = useFormContext();
  const formValues = useWatch({
    control: formContext.control
  });

  const { formats: formatsData, loading } = useSystemRequestsCache();

  useEffect(() => {
    if (formatsData && formatsData.data && formatsData.data.attribute_formats) {
     
      const parsedSchema = formatsData.data.attribute_formats.map((entry) => {
        /*const defaultValue =
          (tenant.attributes && tenant.attributes[entry.attribute]) ||
          entry?.default_value;
*/

        const settingName = entry.attribute ? entry.attribute.replace('attributes.', '') : entry.id;
        
        const defaultValue =
          (tenant.attributes && tenant.attributes[settingName]) ||
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

      console.log('ATTRIBUTES SCHEMA', parsedSchema);

      setAttributeFormatsSchema(parsedSchema);

    }

  }, [formatsData])

  return <section>
  
    {attributeFormatsSchema ? (
      DashAutoFormTabs({schema:attributeFormatsSchema, resourceConfig:null, options: {
        mode: method,
        label: 'Datos de contacto',
      }})
    ) : (
      <></>
    )}
  </section>

}

const TenantAttributesCreate: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
  
  const [attributeFormatsSchema, setAttributeFormatsSchema] = useState<any>(null);
  const formContext = useFormContext();
  const formValues = useWatch({
    control: formContext.control
  });

  const { formats: formatsData, loading } = useSystemRequestsCache();

  useEffect(() => {

    if (!loading && formatsData && formatsData.data && formatsData.data.attribute_formats) {
      const parsedSchema = formatsData.data.attribute_formats.map((entry) => ({
        ...entry,
        ...(method === 'view' && {
          readOnly: true,
        }),
      }));

      setAttributeFormatsSchema(parsedSchema);

    }

  }, [formatsData, loading])

 
  return <section>
  
    {attributeFormatsSchema ? (
      DashAutoFormTabs({schema:attributeFormatsSchema, resourceConfig:null, options: {
        mode: method,
        label: 'Datos de contacto',
      }})
    ) : (
      <></>
    )}
  </section>

}

const TenantAttributesView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute, tenant }) => {

  const { formats: attributeFormats, loading } = useTenantAttributesFormats();
  const [attributeFormatsParsedValues, setAttributeFormatsParsedValues] = useState<any>(null);

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
    if (attributeFormats && tenant) {

      attributeFormats.forEach((entry) => {
        const defaultValue = tenant.attributes && tenant.attributes.hasOwnProperty(entry.id) ? tenant.attributes[entry.id] : entry?.default_value;

        object[entry.label] = <>{parseValue(defaultValue)}</>;
      });

      console.log("ATTRIBUTES SCHEMA", object);

      setAttributeFormatsParsedValues(object);

    }

  }, [attributeFormats, tenant])

  return attributeFormatsParsedValues ? <MUISimpleJsonTable tableData={attributeFormatsParsedValues} vertical={true} /> : <Loading />

}

const TenantAttributes = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
  const tenant: Tenant = useRecordContext();
  switch (method) {
    case "edit":
      return <TenantAttributesEdit attribute={attribute} method={method} tenant={tenant} resourceConfig={resourceConfig} />
    case "view":
      return <TenantAttributesView attribute={attribute} method={method} tenant={tenant} resourceConfig={resourceConfig} />
    case "create":
      return <TenantAttributesCreate attribute={attribute} method={method} resourceConfig={resourceConfig} />
    case "list":
      return <></>
  }
}

export default TenantAttributes;
