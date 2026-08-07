/**
 * Standalone SearchableSelectCheckboxes for filters with checkbox support
 * @author  Francisco Aranda <francisco.aranda@sudo.cl> <faranda@gmail.com>
 */

import {
  Autocomplete,
  Box,
  Checkbox,
  CircularProgress,
  TextField,
  Typography,
  Chip,
  FormControlLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Popper,
  ClickAwayListener,
  InputAdornment,
  IconButton,
} from "@mui/material";
import React, { useEffect, useState, useRef } from "react";
import { useGetList } from "react-admin";
import { LoadingIndicator } from "react-admin";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

interface ISearchableSelectCheckboxes {
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
  minOptions?: number;
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
  maxHeight?: number;
  showSelectAll?: boolean;
  showSelectedCount?: boolean;
}

export const SearchableSelectCheckboxes: React.FC<ISearchableSelectCheckboxes> = ({
  isMultiple = true, // Default to true for checkbox version
  searchResults = 50,
  minSearch = 1,
  minOptions = 10,
  timerSearch = 300,
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
  maxHeight = 300,
  showSelectAll = true,
  showSelectedCount = true,
}) => {
  // Component state
  const [open, setOpen] = useState(false);
  const [fullyLoaded, setFullyLoaded] = useState(false);
  const [parsedOptions, setParsedOptions] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<any[]>([]);
  const [timeOutSearch, setTimeOutSearch] = useState<any>(undefined);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [searchInputValue, setSearchInputValue] = useState("");

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

  // Build filter parameters for mixed results
  const buildFilterParams = () => {
    const baseFilter = { ...filter };
    
    // Add includes if we have selected values
    if (includes.length > 0) {
      baseFilter.includes = includes;
    }

    // If we have a search query, enable mixed results
    if (q && q.length >= minSearch) {
      baseFilter[queryFilter] = q;
      baseFilter.mixed_results = true;
      baseFilter.min_options = minOptions;
      baseFilter.limit = searchResults;
    } else {
      // No search, just get default options with minimum count
      baseFilter.limit = Math.max(minOptions, searchResults);
    }

    return baseFilter;
  };

  // React Admin useGetList with dynamic filter
  const {
    data: resourceSearchResults,
    isLoading: isResourceSearchLoading,
    error: isResourceSearchErrored,
  } = useGetList(resource, {
    meta: { removeSortFilters: true },
    filter: buildFilterParams(),
  });

  // Update parsed options when search results change
  useEffect(() => {
    if (resourceSearchResults) {
      const resultsArray = Array.isArray(resourceSearchResults)
        ? resourceSearchResults
        : Object.values(resourceSearchResults);

      let processedOptions = resultsArray.map((ele, index) => {
        // Determine if this is a search match
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

      // Limit results
      if (processedOptions.length > searchResults) {
        processedOptions = processedOptions.slice(0, searchResults);
      }

      setParsedOptions(processedOptions);
    }
  }, [resourceSearchResults, valueKeyId, q, minSearch, viewAttribute, searchResults]);

  // Initialize selected options from value or defaultValues
  useEffect(() => {
    const currentValue = value !== undefined ? value : defaultValues;
    
    if (currentValue === null || currentValue === undefined) {
      setSelectedOptions([]);
      setFullyLoaded(true);
      return;
    }

    let initialSelectedOptions: any[] = [];

    if (Array.isArray(currentValue)) {
      initialSelectedOptions = currentValue;
    } else if (currentValue) {
      initialSelectedOptions = [currentValue];
    }

    setSelectedOptions(initialSelectedOptions);
    setFullyLoaded(true);
  }, [value, defaultValues]);

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
  const debounce = (fn: Function, delay = 300) => {
    clearTimeout(timeOutSearch);
    setTimeOutSearch(
      setTimeout(() => {
        fn();
      }, delay)
    );
  };

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value;
    setSearchInputValue(searchValue);
    
    if (searchValue && searchValue !== "" && searchValue.length >= minSearch) {
      debounce(() => setQ(searchValue), timerSearch);
    } else if (searchValue === "") {
      setQ("");
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchInputValue("");
    setQ("");
  };

  // Check if option is selected
  const isOptionSelected = (option: any) => {
    return selectedOptions.some(selected => {
      const selectedId = typeof selected === 'object' ? selected[valueKeyId] : selected;
      const optionId = typeof option === 'object' ? option[valueKeyId] : option;
      return selectedId === optionId;
    });
  };

  // Handle option toggle
  const handleOptionToggle = (option: any) => {
    const isSelected = isOptionSelected(option);
    let newSelectedOptions: any[];

    if (isSelected) {
      // Remove option
      newSelectedOptions = selectedOptions.filter(selected => {
        const selectedId = typeof selected === 'object' ? selected[valueKeyId] : selected;
        const optionId = typeof option === 'object' ? option[valueKeyId] : option;
        return selectedId !== optionId;
      });
    } else {
      // Add option
      newSelectedOptions = [...selectedOptions, option];
    }

    setSelectedOptions(newSelectedOptions);
    
    if (onChange) {
      onChange(newSelectedOptions);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    const allSelected = parsedOptions.every(option => isOptionSelected(option));
    
    if (allSelected) {
      // Deselect all visible options
      const visibleIds = parsedOptions.map(option => 
        typeof option === 'object' ? option[valueKeyId] : option
      );
      const newSelectedOptions = selectedOptions.filter(selected => {
        const selectedId = typeof selected === 'object' ? selected[valueKeyId] : selected;
        return !visibleIds.includes(selectedId);
      });
      setSelectedOptions(newSelectedOptions);
      if (onChange) {
        onChange(newSelectedOptions);
      }
    } else {
      // Select all visible options
      const newOptions = parsedOptions.filter(option => !isOptionSelected(option));
      const newSelectedOptions = [...selectedOptions, ...newOptions];
      setSelectedOptions(newSelectedOptions);
      if (onChange) {
        onChange(newSelectedOptions);
      }
    }
  };

  // Get display text for selected items
  const getSelectedDisplayText = () => {
    if (selectedOptions.length === 0) {
      return placeholder || "Seleccionar opciones...";
    }
    
    if (showSelectedCount && selectedOptions.length > 2) {
      return `${selectedOptions.length} elementos seleccionados`;
    }
    
    return selectedOptions
      .slice(0, 2)
      .map(option => renderText(_transformOption(option, "display"), "display"))
      .join(", ") + (selectedOptions.length > 2 ? `, +${selectedOptions.length - 2} más` : "");
  };

  // Check if all visible options are selected
  const allVisibleSelected = parsedOptions.length > 0 && parsedOptions.every(option => isOptionSelected(option));
  const someVisibleSelected = parsedOptions.some(option => isOptionSelected(option));

  if (!fullyLoaded) return <LoadingIndicator />;

  return (
    <Box ref={anchorRef} sx={{ position: 'relative', width: fullWidth ? '100%' : 'auto' }}>
      {/* Main Input Field */}
      <TextField
        fullWidth={fullWidth}
        label={selectLabel}
        value={getSelectedDisplayText()}
        onClick={() => setOpen(!open)}
        disabled={disabled}
        variant="outlined"
        sx={{
          cursor: 'pointer',
          '& .MuiInputBase-input': {
            cursor: 'pointer',
          }
        }}
        slotProps={{
          input: {
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(!open);
                  }}
                  edge="end"
                  size="small"
                >
                  {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }
        }}
      />

      {/* Selected Items Chips */}
      {selectedOptions.length > 0 && (
        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {selectedOptions.slice(0, 5).map((option, index) => (
            <Chip
              key={`chip-${option[valueKeyId] || index}`}
              label={renderText(_transformOption(option, "chip"), "chip")}
              size="small"
              onDelete={() => handleOptionToggle(option)}
              disabled={disabled}
            />
          ))}
          {selectedOptions.length > 5 && (
            <Chip
              label={`+${selectedOptions.length - 5} más`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>
      )}

      {/* Dropdown Popper */}
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-start"
        style={{ zIndex: 1300, width: anchorRef.current?.offsetWidth }}
      >
        <ClickAwayListener onClickAway={() => setOpen(false)}>
          <Paper
            elevation={8}
            sx={{
              maxHeight: maxHeight + 100,
              width: '100%',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Search Input */}
            <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar..."
                value={searchInputValue}
                onChange={handleSearchChange}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: searchInputValue && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={handleClearSearch}
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
          }
                }}
              />
            </Box>

            {/* Select All Option */}
            {showSelectAll && parsedOptions.length > 0 && (
              <Box sx={{ borderBottom: '1px solid #e0e0e0' }}>
                <ListItem disablePadding>
                  <ListItemButton onClick={handleSelectAll} dense>
                    <ListItemIcon>
                      <Checkbox
                        checked={allVisibleSelected}
                        indeterminate={someVisibleSelected && !allVisibleSelected}
                        size="small"
                      />
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Typography variant="body2" sx={{
                          fontWeight: "bold"
                        }}>
                          {allVisibleSelected ? "Deseleccionar todo" : "Seleccionar todo"}
                          {q && ` (${parsedOptions.length} resultados)`}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              </Box>
            )}

            {/* Loading State */}
            {isResourceSearchLoading && (
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress size={20} />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  Cargando opciones...
                </Typography>
              </Box>
            )}

            {/* Options List */}
            {!isResourceSearchLoading && (
              <List
                sx={{
                  maxHeight: maxHeight,
                  overflow: 'auto',
                  py: 0,
                }}
              >
                {parsedOptions.length === 0 ? (
                  <ListItem>
                    <ListItemText 
                      primary={
                        <Typography
                          variant="body2"
                          sx={{
                            color: "text.secondary",
                            textAlign: "center"
                          }}>
                          {q ? "No se encontraron resultados" : "No hay opciones disponibles"}
                        </Typography>
                      }
                    />
                  </ListItem>
                ) : (
                  parsedOptions.map((option, index) => {
                    const isSelected = isOptionSelected(option);
                    const isSearchMatch = option.isSearchMatch;
                    const hasSearchQuery = q && q.length >= minSearch;

                    return (
                      <ListItem key={option.key || `option-${index}`} disablePadding>
                        <ListItemButton
                          onClick={() => handleOptionToggle(option)}
                          dense
                          sx={{
                            // Style search matches differently
                            backgroundColor: hasSearchQuery && isSearchMatch 
                              ? 'rgba(25, 118, 210, 0.04)' 
                              : 'transparent',
                            borderLeft: hasSearchQuery && isSearchMatch 
                              ? '3px solid #1976d2' 
                              : 'none',
                            paddingLeft: hasSearchQuery && isSearchMatch ? 1 : 2,
                            '&:hover': {
                              backgroundColor: hasSearchQuery && isSearchMatch 
                                ? 'rgba(25, 118, 210, 0.08)' 
                                : 'rgba(0, 0, 0, 0.04)',
                            },
                          }}
                        >
                          <ListItemIcon>
                            <Checkbox
                              checked={isSelected}
                              size="small"
                              tabIndex={-1}
                              disableRipple
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: hasSearchQuery && isSearchMatch ? 'bold' : 'normal',
                                    opacity: hasSearchQuery && !isSearchMatch ? 0.7 : 1,
                                  }}
                                >
                                  {renderText(_transformOption(option, "option"), "option")}
                                </Typography>
                                {/* Search match indicator */}
                                {hasSearchQuery && isSearchMatch && (
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: '#1976d2',
                                      fontWeight: 'bold',
                                      fontSize: '0.75rem',
                                    }}
                                  >
                                    ✓
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })
                )}
              </List>
            )}

            {/* Footer with selection count */}
            {showSelectedCount && selectedOptions.length > 0 && (
              <Box 
                sx={{ 
                  p: 1, 
                  borderTop: '1px solid #e0e0e0', 
                  backgroundColor: '#f5f5f5' 
                }}
              >
                <Typography variant="caption" sx={{
                  color: "text.secondary"
                }}>
                  {selectedOptions.length} elemento{selectedOptions.length !== 1 ? 's' : ''} seleccionado{selectedOptions.length !== 1 ? 's' : ''}
                </Typography>
              </Box>
            )}
          </Paper>
        </ClickAwayListener>
      </Popper>
    </Box>
  );
};

export default SearchableSelectCheckboxes;