/**
 * Standalone SearchableSelectChips for filters and other uses
 * @author  Francisco Aranda <francisco.aranda@sudo.cl> <faranda@gmail.com>
 */

import {
  Autocomplete,
  Box,
  Chip,
  CircularProgress,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useGetList } from "react-admin";
import { isArray } from "lodash";
import { LoadingIndicator } from "react-admin";

interface ISearchableSelectChips {
  name?: string;
  resource?: string;
  selectLabel?: string;
  title?: string;
  renderText: (option: any, caller: string) => any;
  transformData?: (val: any) => any;
  defaultValues?: any;
  value?: any;
  onChange?: (value: any) => void;
  isMultiple?: boolean;
  minSearch?: number;
  searchResults?: number;
  minOptions?: number; // Minimum options to show
  timerSearch?: number;
  isEmpty?: boolean;
  filter?: { [x: string]: any };
  queryFilter?: string;
  isOptionEqualToValue: (option: any, value: any) => boolean;
  viewAttribute: string;
  valueKeyId?: string;
  transformOption?: (
    option: any,
    parsedOptions: any[],
    caller?: string
  ) => boolean;
  disabled?: boolean;
  placeholder?: string;
  emptyText?: string;
  fullWidth?: boolean;
  // 🔥 NEW: Enable mixed results feature
  enableMixedResults?: boolean;
}

export const SearchableSelectChips: React.FC<ISearchableSelectChips> = ({
  isMultiple = false,
  searchResults = 50,
  minSearch = 2,
  minOptions = 10,
  timerSearch = 500,
  resource,
  selectLabel,
  renderText,
  transformData = (val: any) => val,
  queryFilter = "q",
  defaultValues = undefined,
  value,
  onChange,
  isEmpty = false,
  filter,
  isOptionEqualToValue,
  viewAttribute = null,
  valueKeyId = "id",
  transformOption,
  disabled = false,
  placeholder = "",
  emptyText = "",
  fullWidth = true,
  // 🔥 NEW: Mixed results props
  enableMixedResults = false,
}) => {
  // Component state
  const [open, setOpen] = useState(false);
  const [fullyLoaded, setFullyLoaded] = useState(false);
  const [parsedOptions, setParsedOptions] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<any[]>([]);
  const [timeOutSearch, setTimeOutSearch] = useState<any>(undefined);

  const _transformOption = (option: any, caller: string) => {
    if (typeof transformOption === "function") {
      return transformOption(option, parsedOptions, caller);
    }
    return option;
  };

  // Get includes for the API call
  const getIncludes = () => {
    const currentValue = value || defaultValues;
    if (!currentValue) return [];
    
    if (Array.isArray(currentValue)) {
      return currentValue.map(item => 
        typeof item === 'object' ? item[valueKeyId] : item
      ).filter(Boolean);
    }
    
    const id = typeof currentValue === 'object' ? currentValue[valueKeyId] : currentValue;
    return id ? [id] : [];
  };

  const includes = getIncludes();

  const buildFilterParams = () => {
    const baseFilter = { ...filter };
    
    // Add includes if we have selected values
    if (includes.length > 0) {
      baseFilter.includes = includes;
    }

    console.log('🔧 SearchableSelectChips DEBUG - buildFilterParams called:', {
      resource,
      enableMixedResults,
      searchQuery: q,
      hasSearch: q && q.length >= minSearch,
      timestamp: new Date().toISOString()
    });

    // 🔥 NEW: Mixed results logic with query parameter
    if (enableMixedResults) {
      const mixedResultsValue = minOptions;
      
      // Always add mixedResults parameter when enabled
      baseFilter.mixedResults = mixedResultsValue;
      
      console.log('🔥 SearchableSelectChips DEBUG - Mixed results enabled via query param:', {
        resource,
        mixedResults: mixedResultsValue,
        searchQuery: q,
        hasSearch: q && q.length >= minSearch,
        baseFilter,
        timestamp: new Date().toISOString()
      });

      // Add search query if present
      if (q && q.length >= minSearch) {
        baseFilter[queryFilter] = q;
      }
      
      // Set limit
      baseFilter.limit = searchResults;
      
    } else {
      // 🔥 FALLBACK: Original logic for backward compatibility
      if (q && q.length >= minSearch) {
        baseFilter[queryFilter] = q;
        baseFilter.mixed_results = true;
        baseFilter.min_options = minOptions;
        baseFilter.limit = searchResults;
        
        console.log('🔍 SearchableSelectChips DEBUG - Legacy mixed results enabled:', {
          resource,
          searchQuery: q,
          minOptions,
          searchResults,
          mixed_results: true,
          baseFilter,
          timestamp: new Date().toISOString()
        });
      } else if (q === "") {
        baseFilter.limit = Math.max(minOptions, searchResults);
      } else {
        baseFilter.limit = Math.max(minOptions, searchResults);
      }
    }

    console.log('🚀 SearchableSelectChips DEBUG - Final filter params:', {
      resource,
      filterParams: baseFilter,
      enableMixedResults,
      timestamp: new Date().toISOString()
    });

    return baseFilter;
  };

  const filterParams = buildFilterParams();

  // React Admin useGetList with dynamic filter
  const {
    data: resourceSearchResults,
    isLoading: isResourceSearchLoading,
    error: isResourceSearchErrored,
  } = useGetList(resource, {
    meta: { removeSortFilters: true },
    filter: filterParams,
  });

   // Update parsed options when search results change
  useEffect(() => {
    if (resourceSearchResults) {
      const resultsArray = Array.isArray(resourceSearchResults)
        ? resourceSearchResults
        : Object.values(resourceSearchResults);

      console.log('📊 SearchableSelectChips DEBUG - Processing results:', {
        resource,
        totalResults: resultsArray.length,
        searchQuery: q,
        hasSearch: q && q.length >= minSearch,
        enableMixedResults,
        timestamp: new Date().toISOString()
      });

      let processedOptions = resultsArray.map((ele, index) => {
        // Determine if this is a search match (client-side check for visual indicators)
        const isSearchMatch = q && q.length >= minSearch ? 
          (ele[viewAttribute] && ele[viewAttribute].toLowerCase().includes(q.toLowerCase())) : 
          true;

        return {
          ...ele,
          key: `option-${ele[valueKeyId] || index}`,
          isSearchMatch,
          priority: isSearchMatch ? 1 : 2,
        };
      });

      // Sort by priority (search matches first) and then by name
      processedOptions.sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        const nameA = a[viewAttribute] || a.name || '';
        const nameB = b[viewAttribute] || b.name || '';
        return nameA.localeCompare(nameB);
      });

      // Count search matches vs non-matches
      const searchMatches = processedOptions.filter(opt => opt.isSearchMatch);
      const nonMatches = processedOptions.filter(opt => !opt.isSearchMatch);

      console.log('🎯 SearchableSelectChips DEBUG - Results breakdown:', {
        resource,
        searchQuery: q,
        totalProcessed: processedOptions.length,
        searchMatches: searchMatches.length,
        nonMatches: nonMatches.length,
        enableMixedResults,
        mixedResultsParam: enableMixedResults ? (minOptions) : 'disabled',
        timestamp: new Date().toISOString()
      });

      // Limit results
      if (processedOptions.length > searchResults) {
        processedOptions = processedOptions.slice(0, searchResults);
      }

      setParsedOptions(processedOptions);
    }
  }, [resourceSearchResults, valueKeyId, q, minSearch, viewAttribute, searchResults, minOptions, enableMixedResults]);

  useEffect(() => {
    console.log('🔍 SearchableSelectChips DEBUG - Component initialized with resource:', {
      resource,
      resourceType: typeof resource,
      selectLabel,
      isMultiple,
      minOptions,
      searchResults,
      minSearch,
      timestamp: new Date().toISOString()
    });
  }, []);

  // Initialize selected options from value or defaultValues
  useEffect(() => {
    const currentValue = value !== undefined ? value : defaultValues;
    
    console.log('🎯 SearchableSelectChips DEBUG - Value changed:', {
      resource,
      currentValue,
      valueType: typeof currentValue,
      isArray: Array.isArray(currentValue),
      isMultiple,
      timestamp: new Date().toISOString()
    });
    
    if (currentValue === null || currentValue === undefined) {
      setSelectedOptions([]);
      setFullyLoaded(true);
      return;
    }

    let initialSelectedOptions: any[] = [];

    if (isMultiple) {
      // For multiple, expect array
      if (Array.isArray(currentValue)) {
        initialSelectedOptions = currentValue;
      } else if (currentValue) {
        // Single value in multiple mode - wrap in array
        initialSelectedOptions = [currentValue];
      }
    } else {
      // For single, wrap in array for internal processing
      if (currentValue) {
        initialSelectedOptions = [currentValue];
      }
    }

    console.log('🎯 SearchableSelectChips DEBUG - Selected options set:', {
      resource,
      currentValue,
      initialSelectedOptions,
      isMultiple,
      timestamp: new Date().toISOString()
    });

    setSelectedOptions(initialSelectedOptions);
    setFullyLoaded(true);
  }, [value, defaultValues, isMultiple]);

  // Update selected options when parsedOptions change and we have IDs but no full objects
  useEffect(() => {
    if (parsedOptions.length > 0 && selectedOptions.length > 0) {
      const updatedOptions = selectedOptions.map(selectedOption => {
        // If it's already a full object, keep it
        if (typeof selectedOption === 'object' && selectedOption[viewAttribute]) {
          return selectedOption;
        }
        
        // If it's just an ID, find the full object
        const id = typeof selectedOption === 'object' ? selectedOption[valueKeyId] : selectedOption;
        return parsedOptions.find(option => option[valueKeyId] === id) || selectedOption;
      });

      setSelectedOptions(updatedOptions);
    }
  }, [parsedOptions, viewAttribute, valueKeyId]);

  // Debounced search
  const debounce = (fn: Function, delay = 500) => {
    clearTimeout(timeOutSearch);
    setTimeOutSearch(
      setTimeout(() => {
        fn();
      }, delay)
    );
  };

  // FIXED: Simplified update field value
  const updateFieldValue = (newSelectedOptions: any[]) => {
    setSelectedOptions(newSelectedOptions || []);
    
    if (onChange) {
      if (isMultiple) {
        // For multiple, send the array as-is
        onChange(newSelectedOptions || []);
      } else {
        // For single, send the first item or null
        onChange(newSelectedOptions && newSelectedOptions.length > 0 ? newSelectedOptions[0] : null);
      }
    }
  };

  if (!fullyLoaded) return <LoadingIndicator />;

  return (
    <Autocomplete
      multiple={isMultiple}
      loading={isResourceSearchLoading}
      fullWidth={fullWidth}
      freeSolo={false}
      options={parsedOptions}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      value={isMultiple ? selectedOptions : (selectedOptions[0] || null)}
      isOptionEqualToValue={isOptionEqualToValue}
      autoHighlight
      disabled={disabled}
      getOptionLabel={(option: any) => {
        if (!option) return '';
        return renderText(_transformOption(option, "optionlabel"), "optionlabel") || '';
      }}
      renderOption={(props, option: any) => {
        const { key, ...newProps } = props as any;
        const isSearchMatch = option.isSearchMatch;
        const hasSearchQuery = q && q.length >= minSearch;
        
        return (
          <Box
            key={option.key || `option-${option[valueKeyId]}`}
            component="li"
            sx={{ 
              "& > img": { mr: 2, flexShrink: 0 },
              // 🔥 ENHANCED: Better visual distinction for mixed results
              fontWeight: hasSearchQuery && isSearchMatch ? 'bold' : 'normal',
              opacity: hasSearchQuery && !isSearchMatch ? 0.7 : 1,
              borderLeft: hasSearchQuery && isSearchMatch ? '3px solid #1976d2' : 'none',
              paddingLeft: hasSearchQuery && isSearchMatch ? 1 : 2,
              backgroundColor: hasSearchQuery && isSearchMatch ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
              // 🔥 NEW: Add subtle separator between search matches and other options
              borderTop: hasSearchQuery && !isSearchMatch && option.priority === 2 ? '1px solid rgba(0,0,0,0.1)' : 'none',
              marginTop: hasSearchQuery && !isSearchMatch && option.priority === 2 ? 0.5 : 0,
            }}
            {...newProps}
          >
            {/* 🔥 ENHANCED: Show section headers for mixed results */}
            {hasSearchQuery && option.priority === 2 && parsedOptions.indexOf(option) === parsedOptions.findIndex(opt => opt.priority === 2) && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -20,
                  left: 0,
                  right: 0,
                  fontSize: '0.7rem',
                  color: 'text.secondary',
                  backgroundColor: 'background.paper',
                  padding: '2px 8px',
                  borderBottom: '1px solid rgba(0,0,0,0.1)',
                  fontWeight: 'bold',
                }}
              >
                Otras opciones
              </Box>
            )}
            
            {renderText(_transformOption(option, "option"), "option")}
            
            {/* 🔥 ENHANCED: Better indicators for search matches */}
            {hasSearchQuery && isSearchMatch && (
              <Box 
                component="span" 
                sx={{ 
                  ml: 'auto', 
                  fontSize: '0.75rem', 
                  color: '#1976d2',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                <Box
                  component="span"
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: '#1976d2',
                  }}
                />
                Coincidencia
              </Box>
            )}
          </Box>
        );
      }}
      // FIXED: Use modern renderValue instead of deprecated renderTags
      renderValue={(tagValue, getTagProps) => {
        return tagValue.map((option, index) => {
          const chipProps = getTagProps({ index });
          return (
            <Chip
              key={`chip-${option[valueKeyId] || index}`}
              label={renderText(_transformOption(option, "chip"), "chip")}
              {...chipProps}
            />
          );
        });
      }}
      onChange={(event: any, rawValue) => {
        console.log('🔄 SearchableSelectChips DEBUG - Autocomplete onChange:', {
          resource,
          rawValue,
          isMultiple,
          timestamp: new Date().toISOString()
        });
        
        // FIXED: Simple handling - let Autocomplete handle the value format
        if (isMultiple) {
          updateFieldValue(Array.isArray(rawValue) ? rawValue : []);
        } else {
          updateFieldValue(rawValue ? [rawValue] : []);
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={selectLabel}
          variant="outlined"
          placeholder={placeholder}
          onChange={(ev) => {
            const searchValue = ev.target.value;
            
            console.log('🔍 SearchableSelectChips DEBUG - Search input changed:', {
              resource,
              searchValue,
              searchLength: searchValue.length,
              minSearch,
              willTriggerSearch: searchValue.length >= minSearch,
              timestamp: new Date().toISOString()
            });
            
            if (
              searchValue &&
              searchValue !== "" &&
              searchValue.length >= minSearch
            ) {
              debounce(() => {
                console.log('🚀 SearchableSelectChips DEBUG - Triggering search:', {
                  resource,
                  searchValue,
                  minOptions,
                  searchResults,
                  timestamp: new Date().toISOString()
                });
                setQ(searchValue);
              }, timerSearch);
            } else if (searchValue === "") {
              console.log('🔄 SearchableSelectChips DEBUG - Clearing search:', {
                resource,
                timestamp: new Date().toISOString()
              });
              setQ("");
            }
          }}
          // FIXED: Use modern slotProps instead of deprecated InputProps
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
      slotProps={{
        listbox: {
          sx: {
            maxHeight: 400,
            '& .MuiAutocomplete-option': {
              position: 'relative',
            }
          }
        }
      }}
    />
  );
};

export default SearchableSelectChips;
