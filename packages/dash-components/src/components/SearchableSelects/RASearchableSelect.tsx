/**
 * ISearchableSelect for AutoAdmin for ReactAdmin
 * @author  Franisco Aranda <francisco.aranda@sudo.cl> <faranda@gmail.com>
 */

import {
  Autocomplete,
  Box,
  CircularProgress,
  InputLabel,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useController } from "react-hook-form";
import { useGetList } from "react-admin";

import { useRecordContext } from "react-admin";
import { Loading } from "react-admin";
import { isArray } from "lodash";
import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";

interface ISearchableSelect extends IDashAutoAdminCustomFieldComponent {
  name?: string;
  resource?: string;
  selectLabel?: string;
  title?: string;
  renderText?: (object: any) => any;
  transformData?: (val: string) => any;
  defaultValues?: any;
  isMultiple?: boolean;
  //pagination?: boolean,
  minSearch?: number;
  searchResults?: number;
  timerSearch?: number;
  isEmpty?: boolean;
  filter?: { [x: string]: any };
  queryFilter?: string;
  isOptionEqualToValue?: (option, value) => boolean;
  viewAttribute: string;
  elementKeyId?: string;
}

const SearchableSelect: React.FC<ISearchableSelect> = ({
  method,
  attribute,
  isMultiple = false,
  //pagination = true,
  searchResults = 50,
  minSearch = 3,
  timerSearch = 500,
  resource,
  selectLabel,
  renderText,
  transformData,
  queryFilter = "q",
  defaultValues = undefined,
  isEmpty = false,
  filter,
  isOptionEqualToValue = undefined,
  viewAttribute = null,
  elementKeyId = "id",
}) => {
  //const element_key = "system_marketplace_category_id";
  const [open, setOpen] = useState(true);
  /* parsedOptions se setea null, esto para que el control no aparezca hasta que se obtenga la data */
  const [parsedOptions, setParsedOptions] = useState(null);
  const [q, setQ] = useState("");
  const record = useRecordContext();
  const field = useController({
    name: attribute.attribute,
    defaultValue: record ? record[attribute.attribute] : null,
  });

  const includes =
    record &&
      record[attribute.attribute] &&
      isArray(record[attribute.attribute])
      ? record[attribute.attribute].map((element) =>
        element.hasOwnProperty(elementKeyId)
          ? element[elementKeyId]
          : element
      )
      : record[attribute.attribute];

  const {
    data: resourceData,
    total,
    isLoading,
    error,
  } = useGetList(
    resource,
    {
      filter: { [queryFilter]: q, ...filter, includes: includes },
    },
    { refetchOnWindowFocus: false }
  );

  useEffect(() => {
    if (resourceData && !isLoading) {
      //Le agrega el key, para evitar el warning de react.
      //setParsedOptions([...parsedOptions,...resourceData.map(ele => { return {...ele,key:"option"+ele.id}})])
      if (parsedOptions)
        setParsedOptions([
          ...parsedOptions,
          ...resourceData.map((ele) => {
            return { ...ele, key: "option" + ele.id };
          }),
        ]);
      setParsedOptions(
        resourceData.map((ele) => {
          return { ...ele, key: "option" + ele.id };
        })
      );
    } /*else {
            // Setea la data a un arreglo vacío, ya que si es null, se ocultará el componente.
            //setParsedOptions([]);
       }*/
    return () => setParsedOptions([]);
    // TODO! reset callback, empty parsedOptions.
  }, [resourceData, isLoading]);

  const [timeOutSearch, setTimeOutSearch] = useState(undefined);

  const debounce = (fn: Function, delay = 500) => {
    clearTimeout(timeOutSearch);
    setTimeOutSearch(
      setTimeout(() => {
        fn();
      }, delay)
    );
  };

  return (
    <>
      {parsedOptions && (
        <Autocomplete
          key={"autocomplete-" + attribute.attribute}
          multiple={isMultiple}
          loading={isLoading && open}
          //sx={{ width: 373 }}
          fullWidth
          freeSolo={true}
          //options={!resourceData ? [] : !defaultValues ? resourceData : resourceData}
          //options={resourceData ? resourceData.map(ele => { return {...ele,key:ele.id}} ) : []}
          options={parsedOptions}
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          /*defaultValue={field.field?.value && field.field.value.map(item => parsedOptions.find(
          (element) => { 
              
              return element.id === item.id
          }))}*/
          //value={isOptionEqualToValue && parsedOptions ? parsedOptions.find(ele => isOptionEqualToValue(ele,field.field.value))[viewAttribute] : field.field.value}

          defaultValue={field.field?.value}
          //value={field.field.value}

          isOptionEqualToValue={isOptionEqualToValue}
          autoHighlight
          //{...(!isEmpty && { value: field.field.value })}
          //{...(isEmpty && { renderTags: (value, getTagProps) => <></> })}
          // 8

          getOptionLabel={(option: any) => {
            const _option = !Array.isArray(option) // si es un numero como 'id', busca la opción en los valores con isOptionEqualToValue, sino devuelve el objeto original.
              ? parsedOptions &&
              parsedOptions.find((ele) =>
                isOptionEqualToValue(ele, field.field.value)
              )
              : option;
            if (!_option) return q; //es posbile que no se haya encontrado en parsedOptions o que parsedOptions aún no esté definido.
            const r =
              viewAttribute && !renderText
                ? _option[viewAttribute]
                : renderText(_option);
            console.log(
              "getOptionLabel",
              parsedOptions.find((ele) =>
                isOptionEqualToValue(ele, field.field.value)
              ),
              r
            );
            if (!r) return q;
            return r;
          }}
          //getOptionLabel={(option: any) => option}

          renderOption={(props, option: any) => {
            const { key, ...newProps } = props as any;

            return (
              <Box
                key={option.key}
                component="li"
                sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
                {...newProps}
              >
                {viewAttribute && !renderText
                  ? option[viewAttribute]
                  : renderText(option)}
              </Box>
            );
          }}
          onChange={(event: any, rawValue) => {
            console.log("onChange", event, rawValue);
            let newValue = rawValue;

            if (Array.isArray(rawValue)) {
              newValue = isEmpty
                ? [...rawValue, ...field.field.value]
                : [
                  ...new Map(
                    newValue.map((v) => [v.id, v])
                  ).values(),
                ];
            }
            transformData
              ? field.field.onChange(transformData(newValue))
              : field.field.onChange(newValue);
          }}
          renderInput={(params) => {
            console.log("renderInput", params.id);
            return (
              <TextField
                key={params.id}
                {...params}
                label={selectLabel}
                variant="outlined"
                onChange={(ev) => {
                  // dont fire API if the user delete or not entered anything
                  let searchValue = ev.target.value;
                  //onSearch={(searchValue) => {}

                  if (
                    searchValue &&
                    searchValue !== "" &&
                    searchValue.length >= minSearch
                  )
                    debounce(
                      () => setQ(searchValue),
                      timerSearch
                    );

                  /*if (ev.target.value !== "" || ev.target.value !== null) {
              setQ(ev.target.value);
          }*/
                }}
                slotProps={{
                  ...params.slotProps,

                  input: {
                    ...params.slotProps.input,
                    autoComplete: "new-password",
                    endAdornment: (
                      <>
                        {isLoading ? (
                          <CircularProgress
                            color="inherit"
                            size={20}
                          />
                        ) : null}
                        {params.slotProps.input.endAdornment}
                      </>
                    ),
                  }
                }}
              />
            );
          }}
        />
      )}
    </>
  );
};

const RASearchableSelect = ({
  method,
  attribute,
  ...props
}: ISearchableSelect) => {
  switch (method) {
    case "edit":
    case "create":
      return (
        <SearchableSelect
          attribute={attribute}
          method={method}
          {...props}
        />
      );
    case "view":
      return (
        <SearchableSelect
          attribute={attribute}
          method={method}
          {...props}
        />
      );
  }
};

export default RASearchableSelect;
