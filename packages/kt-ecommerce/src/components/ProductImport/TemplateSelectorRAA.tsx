import React, { useEffect, useRef, useState } from "react";
import TemplateSelector, {
  TTemplateSelectorHandlers,
} from "../Product/TemplateSelector";

import { useGetList } from "react-admin";
import { Autocomplete, Box, CircularProgress, TextField, Alert } from "@mui/material";
import { useRecordContext } from "react-admin";
import ProductTemplateShow from "../Product/ProductTemplateShow";
import { IProductTemplate } from "../../interfaces";
import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import { useAxios } from 'dash-axios-hook';
import { useController, useWatch } from "react-hook-form";

const TemplateSelectorRAAEdit: React.FC<IDashAutoAdminCustomFieldComponent> = ({
  method,
  attribute,
}) => {
  const axios = useAxios();
  const [q, setQ] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<IProductTemplate>(null);
  const [template, setTemplate] = useState<IProductTemplate>(null);

  const selectLabel = "Seleccionar Plantilla";
  const productTemplateField = useController({ name: "product_template" });
  const productTemplateId = useController({ name: "product_template_id" });
  
  // Watch import type to conditionally show template selector
  const importType = useWatch({ name: 'import_type', defaultValue: 'normalized' });

  useEffect(() => {
    const getOne = async (selectedTemplate: IProductTemplate) => {
      const { data } = await axios.get(
        `ecommerce/product_template/${selectedTemplate.id}`
      );
      setTemplate(data);
    };
    if (selectedTemplate) {
      getOne(selectedTemplate);
    }
  }, [selectedTemplate]);

  const {
    data: templates,
    total,
    isLoading,
    error: templatesError,
  } = useGetList(
    "ecommerce/product_template",
    {
      //pagination: false,
      filter: { q: q },
    },
    { refetchOnWindowFocus: false }
  );

  const handleSearch = (search) => {
    setQ(search);
  };

  const autocompleteOptionChange = (event: any, value: IProductTemplate) => {
    setSelectedTemplate(value);
    productTemplateId.field.onChange(value?.id || null);
    productTemplateField.field.onChange(value);
  };

  const [open, setOpen] = React.useState(false);

  // Don't show template selector for normalized imports
  if (importType === 'normalized') {
    return (
      <Alert severity="info" sx={{m:1}}>
        La importación normalizada no requiere plantilla. Se utilizará el formato estándar.
      </Alert>
    );
  }

  return (
    <>
      <Autocomplete
        fullWidth
        loading={isLoading && open}
        sx={{ width: 300 }}
        options={templates ? (templates as IProductTemplate[]) : []}
        open={open}
        onOpen={() => {
          setOpen(true);
        }}
        onClose={() => {
          setOpen(false);
        }}
        autoHighlight
        getOptionLabel={(option: IProductTemplate) => option.name}
        renderOption={(props, option: IProductTemplate) => (
          <Box
            component="li"
            sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
            {...props}
          >
            {option.name}
          </Box>
        )}
        onChange={autocompleteOptionChange}
        renderInput={(params) => (
          <TextField
          fullWidth
            {...params}
            label={selectLabel}
            variant="outlined"
            onChange={(ev) => {
              if (
                ev.target.value !== "" ||
                ev.target.value !== null
              ) {
                handleSearch(ev.target.value);
              }
            }}
            InputProps={{
              ...params.InputProps,
              autoComplete: "new-password",
              endAdornment: (
                <>
                  {isLoading ? (
                    <CircularProgress
                      color="inherit"
                      size={20}
                    />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />

      {template && <ProductTemplateShow record={template} />}
    </>
  );
};

const TemplateSelectorRAAView: React.FC<IDashAutoAdminCustomFieldComponent> = ({
  method,
  attribute,
}) => {
  const record = useRecordContext();
  const importType = record.import_type || (record.product_template_id ? 'template' : 'normalized');
  
  if (importType === 'normalized') {
    return (
      <Alert severity="info">
        Importación normalizada - No requiere plantilla
      </Alert>
    );
  }
  
  return (
    <>
      {record.productTemplate && (
        <ProductTemplateShow record={record.productTemplate} />
      )}
    </>
  );
};

const TemplateSelectorRAA = ({
  method,
  attribute,
  resourceConfig
}: IDashAutoAdminCustomFieldComponent) => {
  switch (method) {
    case "edit":
    case "create":
      return (
        <TemplateSelectorRAAEdit
          attribute={attribute}
          method={method}
          resourceConfig={resourceConfig}
        />
      );
    case "view":
      return (
        <TemplateSelectorRAAView
          attribute={attribute}
          method={method}
            resourceConfig={resourceConfig}
        />
      );
  }
};

export default TemplateSelectorRAA;