import { Autocomplete, Box, CircularProgress, TextField } from "@mui/material";
import React, { useEffect, useImperativeHandle, useState } from "react";
import { useController } from "react-hook-form";
import { useGetList } from "react-admin";
import { IProductTemplate } from "../../interfaces";

import { useAxios } from "dash-axios-hook";
import ProductTemplateShow from "./ProductTemplateShow";

export type TTemplateSelectorHandlers = {
  getSelectedTemplate: () => IProductTemplate;
};

export interface ITemplateSelectorProps {
  selectedTemplateInput?: IProductTemplate;
  [x: string]: any;
}

//const TemplateSelector: React.FC<any> = ({ props }) => {

const TemplateSelector = React.forwardRef<
  TTemplateSelectorHandlers,
  ITemplateSelectorProps
>(({ selectedTemplateInput, ...props }, ref) => {
  const axios = useAxios();
  const [q, setQ] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<IProductTemplate>(
    selectedTemplateInput ?? null
  );
  const [template, setTemplate] = useState<IProductTemplate>(null);

  const selectLabel = "Seleccionar Plantilla";
  const productTemplateField = useController({ name: "product_template_id" });

  useImperativeHandle(ref, () => {
    return {
      getSelectedTemplate: getSelectedTemplate,
    };
  });

  const getSelectedTemplate = () => {
    return template;
  };

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
    console.log(value);
    setSelectedTemplate(value);
    productTemplateField.field.onChange(value);
  };

  const [open, setOpen] = React.useState(false);

  console.log("selectedTemplateInput", selectedTemplateInput);

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
        getOptionLabel={(option) => (option as IProductTemplate).name}
        renderOption={(props, option: IProductTemplate) => (
          <Box
            component="li"
            sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
            {...props}
          >
            {option.name}
          </Box>
        )}
        onChange={(e, val) =>
          autocompleteOptionChange(e, val as IProductTemplate)
        }
        //onChange={handleSearch}
        defaultValue={selectedTemplateInput}
        renderInput={(params) => (
          <TextField
            fullWidth
            {...params}
            label={selectLabel}
            variant="outlined"
            onChange={(ev) => {
              // dont fire API if the user delete or not entered anything
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
});

export default TemplateSelector;
