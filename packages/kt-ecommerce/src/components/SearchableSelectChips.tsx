/**
 * ISearchableSelect for AutoAdmin for ReactAdmin
 * @author  Franisco Aranda <francisco.aranda@sudo.cl> <faranda@gmail.com>
 * @author  Omar Muñoz <omar.munoz@sudo.cl>
 */

import {
  Autocomplete,
  Box,
  Chip,
  CircularProgress,
  InputLabel,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useController, useFormContext } from "react-hook-form";
import { useGetList } from "react-admin";
import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";
import { useRecordContext } from "react-admin";
import { Loading } from "react-admin";
import { isArray } from "lodash";
import { LoadingIndicator } from "react-admin";

interface ISearchableSelectChipsControl {
  name?: string;
  resource?: string;
  label?: string;
  metadata?: any;
  processDefaultValue?: (value: any) => any;
  renderText: (option: any, caller: string) => any;
  transformData?: (val: any) => any; // onChange transformData from the search result item object to the field value (it usually needs to store the id)
  defaultValues?: any;
  isMultiple?: boolean;
  //pagination?: boolean,
  minSearch?: number;
  searchResults?: number;
  timerSearch?: number;
  isEmpty?: boolean;
  filter?: { [x: string]: any };
  queryFilter?: string;
  isOptionEqualToValue: (option: any, value: any) => boolean;
  //_transformOptionEqualToValue?:  (option: any, value: any) => boolean
  viewAttribute: string;
  valueKeyId?: string;
  useBaseAttributeName?: boolean;
  transformOption?: (
    option: any,
    metadata: any,
    parsedOptions: any[],
    caller?: string
  ) => any;
  record?: any;
  onChange?: (value: any) => any;
}

const getDescendantProp = (obj, desc) => {
  var arr = desc.split(".");
  while (arr.length && (obj = obj[arr.shift()]));
  return obj;
};

export const SearchableSelectChipsControl: React.FC<ISearchableSelectChipsControl> =
  ({
    label,
    name,
    metadata = {},
    record,
    isMultiple = false,
    //pagination = true,
    searchResults = 50,
    minSearch = 3,
    timerSearch = 500,
    resource,
    renderText,
    transformData = (val: any) => val,
    queryFilter = "q",
    defaultValues = undefined,
    isEmpty = false,
    filter,
    isOptionEqualToValue = undefined,
    viewAttribute = null,
    valueKeyId = "id",
    useBaseAttributeName = false,
    transformOption,
    processDefaultValue,
    onChange,
  }) => {

    const { setValue } = useFormContext();

    const attributeName = useBaseAttributeName ? name.split(".")[0] : name;
    const recordAttributeValue = useBaseAttributeName
      ? attributeName.split(".")[0]
      : attributeName;


    const [open, setOpen] = useState(false);
    /** parsedOptions: stores the postprocessed list of elements returned from the search query */
    const [parsedOptions, setParsedOptions] = useState(null);
    /** q; the search query */
    const [q, setQ] = useState("");
    /** transform option default function */
    const _transformOption = (
      option: any,
      metadata: any,
      caller: string
    ) => {

      if (typeof transformOption === "function") {
        return transformOption(option, metadata, parsedOptions, caller)
      }
      return option;
    };
    /** _processFieldValue option default function */
    /*const _processFieldValue = (value: any) => {
        return value
            ? isMultiple && Array.isArray(value)
                ? value.map((valItem) =>
                      _transformOption(
                          valItem,
                          metadata,
                          "_processFieldValue"
                      )
                  )
                : _transformOption(value, metadata, "_processFieldValue")
            : isMultiple
            ? []
            : null;
    };*/
    const _processFieldValue = (value: any) => {

      let result = isMultiple ? [] : null;
      if (value) {

        if (isMultiple && Array.isArray(value)) {
          result = value.map((valItem) =>
            _transformOption(valItem, metadata, "_processFieldValue")
          )
        } else {
          result = _transformOption(value, metadata, "_processFieldValue")
        }
      }

      return result;

    };


    /** _processDefaultValue option default function */
    const _processDefaultValue = (value: any) => {
      if (typeof processDefaultValue === "function") {
        return processDefaultValue(value);
      }
      return _processFieldValue(value);
    };

    /** field useController */
    /*const field = useController({
        name: recordAttributeValue 
    });*/

    /** _inc Includes, sends an array of the current selected items of the select, the backend sends those items in the first position of the list. */
    let _inc =
      record && getDescendantProp(record, name)
        ? getDescendantProp(record, name)
        : [];
    _inc = isArray(_inc) ? _inc : [_inc[valueKeyId]];
    const includes = _inc
      .filter((element) => element)
      .map((element) =>
        element.hasOwnProperty(valueKeyId)
          ? element[valueKeyId]
          : element
      );

    /** React Admin useGetList, to perform the search */

    const {
      data: resourceSearchResults,
      total: totalSearchResults,
      isLoading: isResourceSearchLoading,
      error: isResourceSearchErrored,
    } = useGetList(
      resource,
      {
        meta: { removeSortFilters: true },
        filter: { [queryFilter]: q, ...filter, includes: includes },
      },
      { refetchOnWindowFocus: false }
    );
    /** useEffect for when resourceSearchResults are updated  */
    useEffect(() => {
      if (resourceSearchResults /*&& !isResourceSearchLoading*/) {
        const _parsedOptions = resourceSearchResults.map((ele) => {
          return { ...ele, key: "option" + ele.id };
        });
        setParsedOptions(_parsedOptions);
        //updateFieldValue(_parsedOptions);
      }
      // on component unload, set parsedOptions to []
    }, [resourceSearchResults /*, isResourceSearchLoading*/]);

    /** search timeout */
    const [timeOutSearch, setTimeOutSearch] = useState(undefined);

    /** search debounce */
    const debounce = (fn: Function, delay = 500) => {
      clearTimeout(timeOutSearch);
      setTimeOutSearch(
        setTimeout(() => {
          fn();
        }, delay)
      );
    };

    /** updateFieldValue default function */
    const updateFieldValue = (value) => {

      setValue(attributeName, _processFieldValue(value));
    };

    const [defValues, setDefValues] = useState(null);

    useEffect(() => {

      let defValue = isMultiple ? [] : null;

      if (defaultValues === undefined) {
        setDefValues(defValue);
        setValue(attributeName, defValue);

        return;
      }

      if (record && record[recordAttributeValue] && !defaultValues) {
        defValue = _processFieldValue(record[recordAttributeValue]);
        setDefValues(defValue);
        setValue(attributeName, defValue);

        return;
      }
      // By default attempt to get the default value from record.
      if (defaultValues !== undefined) {
        defValue = _processDefaultValue(defaultValues);
        setDefValues(defValue);
        setValue(attributeName, defValue);

        return;
      }


    }, [record, defaultValues]);


    if (!parsedOptions) return <LoadingIndicator />;
    return (
      <>
        <Autocomplete
          key={"autocomplete-" + name}
          multiple={isMultiple}
          loading={isResourceSearchLoading /*&& open*/}
          fullWidth
          freeSolo={true}
          options={parsedOptions}
          open={open}
          onOpen={() => {
            setOpen(true);
          }}
          onClose={() => {
            setOpen(false);
          }}
          defaultValue={defValues}
          isOptionEqualToValue={isOptionEqualToValue}
          autoHighlight
          getOptionLabel={(option: any) => {
            return renderText(
              _transformOption(option, metadata, "optionlabel"),
              "optionlabel"
            );
          }}
          renderOption={(props, option: any) => {
            const { key, ...newProps } = props as any;
            return (
              <Box
                key={option.key}
                component="li"
                sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
                {...newProps}
              >
                {renderText(
                  _transformOption(
                    option,
                    metadata,
                    "option"
                  ),
                  "option"
                )}
              </Box>
            );
          }}
          onChange={(event: any, rawValue) => {
            let processedRawValue = rawValue;
            if (onChange) {
              processedRawValue = onChange(rawValue);
            }
            updateFieldValue(processedRawValue);
            setOpen(false);
          }}
          renderInput={(params) => {
            return (
              <TextField
                key={params.id}
                {...params}
                label={label}
                variant="outlined"
                onChange={(ev) => {
                  let searchValue = ev.target.value;
                  if (
                    searchValue &&
                    searchValue !== "" &&
                    searchValue.length >= minSearch
                  )
                    debounce(
                      () => setQ(searchValue),
                      timerSearch
                    );
                }}
                InputProps={{
                  ...params.InputProps,
                  autoComplete: "new-password",
                  endAdornment: (
                    <>
                      {isResourceSearchLoading ? (
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
            );
          }}
        />

        {!isMultiple && defValues && (
          <>
            <Chip
              label={renderText(
                _transformOption(
                  defValues,
                  metadata,
                  "chip"
                ),
                "chip"
              )}
            />
          </>
        )}
      </>
    );
  };

const SearchableSelectChips: React.FC<ISearchableSelectChipsControl> = ({
  ...props
}) => {
  return <SearchableSelectChipsControl {...props} />;
};

export default SearchableSelectChips;
