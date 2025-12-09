import React, { useState, useEffect } from 'react';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import { useController, useWatch } from 'react-hook-form';
import { useRecordContext, Loading } from 'react-admin';
import { Card, Alert, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { useAxios } from 'dash-axios-hook';
import { DashAutoFormGroups } from 'dash-auto-admin';
import MUISimpleJsonTable from '../MuiSimpleJsonTable';

const ImportOptionsSelectorBase: React.FC<IDashAutoAdminCustomFieldComponent & { record?: any; isCreate?: boolean }> = ({ 
  method, 
  attribute, 
  record, 
  isCreate = false 
}) => {
  const axios = useAxios();

  const importType = useWatch({ name: 'import_type', defaultValue: 'normalized' });
  const importOptionsField = useController({ name: 'options', defaultValue: {} });

  const [optionsSchema, setOptionsSchema] = useState<any>(null);
  const [infoSchema, setInfoSchema] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!importType) return;

    const fetchImportOptions = async () => {
      setLoading(true);
      try {
        // Use different endpoints for create vs edit
        const endpoint = isCreate || !record?.id
          ? `/ecommerce/product_import_instances/importOptionsFormats?import_type=${importType}`
          : `/ecommerce/product_import_instances/${record.id}/importOptionsFormats?import_type=${importType}`;
          
        const response = await axios.get(endpoint);
        const data = response.data;
      
        // Build options schema
        const parsedSchema = data.format?.map((entry) => {
          const currentValue = importOptionsField.field.value?.[entry.attribute] ?? entry.default;
        
          return {
            ...entry,
            attribute: `options.${entry.attribute}`,
            readOnly: !entry.editable,
            fieldOptions: {
              defaultValue: currentValue,
              size: "small"
            }
          };
        }) || [];

        setOptionsSchema(parsedSchema);

        // Build info schema
        const infoSchema = data.info?.map((entry) => ({
          ...entry,
          readOnly: true,
          fieldOptions: {
            defaultValue: entry.value,
            size: "small"
          }
        })) || [];

        setInfoSchema(infoSchema);

        // Set default values if options is empty
        if (!importOptionsField.field.value || Object.keys(importOptionsField.field.value).length === 0) {
          importOptionsField.field.onChange(data.defaults || {});
        }

      } catch (error) {
        console.error('Error fetching import options:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImportOptions();
  }, [importType, record?.id, isCreate]);

  if (loading) return <Loading />;

  return (
    <>
      {/*infoSchema && infoSchema.length > 0 && (
        <Card style={{ padding: "8px", marginBottom: "16px" }}>
          {DashAutoFormGroups({
            schema: infoSchema,
            resourceConfig: null,
            options: {
              mode: "view",
              label: "Información del Mecanismo de Importación",
              readOnlyComponent: (props) => (
                <Alert severity="info">
                  <Typography variant="subtitle2">{props.input.label}</Typography>
                  {typeof props.input.value === "string" ? (
                    <div dangerouslySetInnerHTML={{ __html: props.input.value }} />
                  ) : (
                    <MUISimpleJsonTable tableData={props.input.value} vertical={false} />
                  )}
                </Alert>
              )
            }
          })}
        </Card>
      )*/}


      {optionsSchema && optionsSchema.length > 0 && (
        <Card style={{ padding: "8px" }}>
          <Accordion defaultExpanded={false}>
            <AccordionSummary expandIcon={<span>▼</span>}>
              <Typography variant="subtitle1">Configuración Avanzada</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {DashAutoFormGroups({
            schema: optionsSchema,
            resourceConfig: null,
            options: {
              mode: isCreate ? "create" : "edit",
              label: "",
              useReadOnlyInputAsTextField: true
            }
              })}
            </AccordionDetails>
          </Accordion>
        </Card>
      )}

      {(!optionsSchema || optionsSchema.length === 0) && !loading && (
        <Alert severity="info">
          No hay opciones configurables para este tipo de importación.
        </Alert>
      )}
    </>
  );
};

const ImportOptionsSelectorEdit: React.FC<IDashAutoAdminCustomFieldComponent> = (props) => {
  const record = useRecordContext();
  return <ImportOptionsSelectorBase {...props} record={record} isCreate={false} />;
};

const ImportOptionsSelectorCreate: React.FC<IDashAutoAdminCustomFieldComponent> = (props) => {
  // Don't use useRecordContext in create mode
  return <ImportOptionsSelectorBase {...props} record={null} isCreate={true} />;
};

const ImportOptionsSelectorView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method, attribute }) => {
  const record = useRecordContext();
  
  return (
    <Card style={{ padding: "8px" }}>
      <Typography variant="h6" gutterBottom>
        Opciones de Importación ({record.import_type || 'normalized'})
      </Typography>
      <MUISimpleJsonTable 
        vertical 
        tableData={record.options || {}} 
        showKey 
        ignore={["preview_cols", "preview_rows", "productTemplateColumns","product_template"]}
      />
    </Card>
  );
};

const ImportOptionsSelector = ({ method, attribute, resourceConfig }: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case "edit":
      return <ImportOptionsSelectorEdit attribute={attribute} method={method} resourceConfig={resourceConfig} />;
    case "create":
      return <ImportOptionsSelectorCreate attribute={attribute} method={method} resourceConfig={resourceConfig} />;
    case "view":
      return <ImportOptionsSelectorView attribute={attribute} method={method} resourceConfig={resourceConfig} />;
    case "list":
      return <ImportOptionsSelectorView attribute={attribute} method={method} resourceConfig={resourceConfig} />;
  }
};

export default ImportOptionsSelector;
