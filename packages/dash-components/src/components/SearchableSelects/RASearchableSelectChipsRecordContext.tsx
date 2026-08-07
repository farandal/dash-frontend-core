/**
 * ISearchableSelect for AutoAdmin for ReactAdmin
 * @author  Franisco Aranda <faranda@gmail.com>
 */

import {
  Autocomplete,
  Box,
  Chip,
  CircularProgress,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useGetList } from "react-admin";

import { useRecordContext } from "react-admin";
import { isArray } from "lodash";
import { LoadingIndicator } from "react-admin";
import { IDashAutoAdminCustomFieldComponent } from "dash-auto-admin";

/* NOTES: use defaultValues = null, to infer record attribute */
interface ISearchableSelectChipsControlRecordContext {
  name?: string;
  resource?: string;
  selectLabel?: string;
  title?: string;
  renderText: (option: any, caller: string) => any;
  transformData?: (val: any) => any;
  defaultValues?: any;
  isMultiple?: boolean;
  minSearch?: number;
  searchResults?: number;
  timerSearch?: number;
  isEmpty?: boolean;
  filter?: { [x: string]: any };
  queryFilter?: string;
  isOptionEqualToValue: (option: any, value: any) => boolean;
  viewAttribute: string;
  valueKeyId?: string;
  useBaseAttributeName?: boolean;
  useListAttributeForController?: boolean;
  transformOption?: (
    option: any,
    parsedOptions: any[],
    caller?: string
  ) => boolean;
}

export const SearchableSelectChipsControlRecordContextEdit: React.FC<
  ISearchableSelectChipsControlRecordContext & IDashAutoAdminCustomFieldComponent
> = ({
  method,
  attribute,
  isMultiple = false,
  searchResults = 50,
  minSearch = 3,
  timerSearch = 500,
  resource,
  selectLabel,
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
  useListAttributeForController = false,
  transformOption,
}) => {
  const { setValue, watch } = useFormContext();
  const record = useRecordContext();

  // Get the correct attribute names
  const saveAttributeName = attribute.attribute; // e.g., 'category_ids' - what gets saved
  const displayAttributeName = attribute.listAttribute || attribute.attribute; // e.g., 'categories' - what gets displayed

  console.log('Attribute config:', {
    saveAttributeName,
    displayAttributeName,
    record: record ? {
      [saveAttributeName]: record[saveAttributeName],
      [displayAttributeName]: record[displayAttributeName]
    } : null
  });

  // Component state
  const [open, setOpen] = useState(false);
  const [fullyLoaded, setFullyLoaded] = useState(false);
  const [parsedOptions, setParsedOptions] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<any[]>([]);
  const [timeOutSearch, setTimeOutSearch] = useState<any>(undefined);

  // Watch current form value (the IDs that get saved)
  const currentFormValue = watch(saveAttributeName);

  const _transformOption = (option: any, caller: string) => {
    if (typeof transformOption === "function") {
      return transformOption(option, parsedOptions, caller);
    }
    return option;
  };

  // Get includes for the API call - use the save attribute (IDs)
  const getIncludes = () => {
    let recordValue = record?.[saveAttributeName]; // category_ids
    
    if (!recordValue) return [];
    
    if (!Array.isArray(recordValue)) {
      recordValue = [recordValue];
    }
    
    return recordValue.filter(Boolean);
  };

  const includes = getIncludes();

  // React Admin useGetList
  const {
    data: resourceSearchResults,
    total: totalSearchResults,
    isLoading: isResourceSearchLoading,
    error: isResourceSearchErrored,
  } = useGetList(resource, {
    meta: { removeSortFilters: true },
    filter: { [queryFilter]: q, ...filter, includes: includes },
  });

  // Update parsed options when search results change
  useEffect(() => {
    if (resourceSearchResults) {
      const resultsArray = Array.isArray(resourceSearchResults)
        ? resourceSearchResults
        : Object.values(resourceSearchResults);

      const _parsedOptions = resultsArray.map((ele, index) => ({
        ...ele,
        key: `option-${ele[valueKeyId] || index}`,
      }));

      setParsedOptions(_parsedOptions);
    }
  }, [resourceSearchResults, valueKeyId]);

  // Initialize default values
  useEffect(() => {
    if (fullyLoaded) return;

    console.log('Initializing default values...');

    let initialSelectedOptions: any[] = [];
    let initialFormValue: any = isMultiple ? [] : null;

    if (defaultValues === null && record) {
      // Try to get full objects from listAttribute first (e.g., 'categories')
      if (record[displayAttributeName] && Array.isArray(record[displayAttributeName])) {
        initialSelectedOptions = record[displayAttributeName];
        initialFormValue = record[displayAttributeName].map((item: any) => item[valueKeyId]);
      }
      // Fallback to IDs from saveAttribute (e.g., 'category_ids')
      else if (record[saveAttributeName]) {
        const ids = Array.isArray(record[saveAttributeName]) 
          ? record[saveAttributeName] 
          : [record[saveAttributeName]];
        initialFormValue = isMultiple ? ids : ids[0];
        // selectedOptions will be set when parsedOptions are loaded
      }
    } else if (defaultValues !== undefined && defaultValues !== null) {
      if (Array.isArray(defaultValues)) {
        initialSelectedOptions = defaultValues;
        initialFormValue = defaultValues.map((item: any) => 
          typeof item === 'object' ? item[valueKeyId] : item
        );
      } else {
        initialSelectedOptions = [defaultValues];
        initialFormValue = typeof defaultValues === 'object' ? defaultValues[valueKeyId] : defaultValues;
      }
    }

    console.log('Initial values:', {
      initialSelectedOptions,
      initialFormValue
    });

    setSelectedOptions(initialSelectedOptions);
    setValue(saveAttributeName, initialFormValue);
    setFullyLoaded(true);
  }, [record, defaultValues, fullyLoaded, saveAttributeName, displayAttributeName, valueKeyId, isMultiple]);

  // Update selected options when parsedOptions change and we have form values but no selected options
  useEffect(() => {
    if (parsedOptions.length > 0 && selectedOptions.length === 0 && currentFormValue) {
      const formValueArray = Array.isArray(currentFormValue) ? currentFormValue : [currentFormValue];
      const matchedOptions = formValueArray.map(id => 
        parsedOptions.find(option => option[valueKeyId] === id)
      ).filter(Boolean);
      
      if (matchedOptions.length > 0) {
        console.log('Setting selected options from parsed options:', matchedOptions);
        setSelectedOptions(matchedOptions);
      }
    }
  }, [parsedOptions, selectedOptions, currentFormValue, valueKeyId]);

  // Debounced search
  const debounce = (fn: Function, delay = 500) => {
    clearTimeout(timeOutSearch);
    setTimeOutSearch(
      setTimeout(() => {
        fn();
      }, delay)
    );
  };

  // Update field value
  const updateFieldValue = (newSelectedOptions: any[]) => {
    console.log('Updating field value:', newSelectedOptions);
    
    setSelectedOptions(newSelectedOptions || []);
    
    // Save the IDs to the form
    const idsToSave = (newSelectedOptions || []).map(option => option[valueKeyId]);
    const valueToSave = isMultiple ? idsToSave : (idsToSave[0] || null);
    
    console.log('Saving to form:', { attribute: saveAttributeName, value: valueToSave });
    setValue(saveAttributeName, valueToSave);
  };

  if (!fullyLoaded) return <LoadingIndicator />;

  return (
    <>
      <Autocomplete
        key={`autocomplete-${saveAttributeName}`}
        multiple={isMultiple}
        loading={isResourceSearchLoading}
        fullWidth
        freeSolo={false}
        options={parsedOptions}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        value={isMultiple ? selectedOptions : (selectedOptions[0] || null)}
        isOptionEqualToValue={isOptionEqualToValue}
        autoHighlight
        getOptionLabel={(option: any) => {
          if (!option) return '';
          return renderText(_transformOption(option, "optionlabel"), "optionlabel") || '';
        }}
        renderOption={(props, option: any) => {
          const { key, ...newProps } = props as any;
          return (
            <Box
              key={option.key || `option-${option[valueKeyId]}`}
              component="li"
              sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
              {...newProps}
            >
              {renderText(_transformOption(option, "option"), "option")}
            </Box>
          );
        }}
        renderValue={(tagValue, getItemProps) => {
          return tagValue.map((option, index) => (
            <Chip
              key={`chip-${option[valueKeyId] || index}`}
              label={renderText(_transformOption(option, "chip"), "chip")}
              {...getItemProps({ index })}
            />
          ));
        }}
        onChange={(event: any, rawValue) => {
          const newValue = isMultiple ? rawValue : (rawValue ? [rawValue] : []);
          updateFieldValue(newValue);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={selectLabel}
            variant="outlined"
            onChange={(ev) => {
              const searchValue = ev.target.value;
              if (
                searchValue &&
                searchValue !== "" &&
                searchValue.length >= minSearch
              ) {
                debounce(() => setQ(searchValue), timerSearch);
              }
            }}
            slotProps={{
              ...params.slotProps,

              input: {
                ...params.slotProps.input,
                autoComplete: "new-password",
                endAdornment: (
                  <>
                    {isResourceSearchLoading && (
                      <CircularProgress color="inherit" size={20} />
                    )}
                    {params.slotProps.input.endAdornment}
                  </>
                ),
              }
            }}
          />
        )}
      />
    </>
  );
};

export const SearchableSelectChipsControlRecordContextView: React.FC<IDashAutoAdminCustomFieldComponent> = ({attribute,
   resourceConfig }) => {
    const record = useRecordContext<any>();
    const values = Array.isArray(record[attribute.listAttribute || attribute.attribute]) ? record[attribute.listAttribute || attribute.attribute] : [record[attribute.listAttribute || attribute.attribute]];
    return (<>
        {record && (
                <Box sx={{ width: "100%" }}>
                    {values.map((item: any) => (
                        <Chip
                            key={item.id}
                            label={item.name}
                            sx={{ margin: 0.5 }}
                        />
                    ))}
                </Box>
        )}
    </>);
};


const SearchableSelectChipsControlRecordContext: React.FC<
  IDashAutoAdminCustomFieldComponent & ISearchableSelectChipsControlRecordContext
> = ({ method, attribute, resourceConfig,...props }) => {
  switch (method) {
    case "edit":
    case "create":
      return (
        <SearchableSelectChipsControlRecordContextEdit
        resourceConfig={resourceConfig}
          attribute={attribute}
          method={method}
          {...props}
        />
      );
    case "view":
    case "list":
        return   <SearchableSelectChipsControlRecordContextView
        resourceConfig={resourceConfig}
          attribute={attribute}
          method={method}
          {...props}
        />
    default:
      return null;
  }
};

export default SearchableSelectChipsControlRecordContext;
