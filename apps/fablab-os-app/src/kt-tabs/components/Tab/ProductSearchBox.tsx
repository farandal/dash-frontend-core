import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useTranslate } from 'react-admin';
import {
    Box,
    TextField,
    InputAdornment,
    IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import { useTabManagerOptional } from '../contexts/TabManagerContext';

// Debounce hook
const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

export interface IProductSearchBoxProps extends IDashAutoAdminCustomFieldComponent {
    debounceMs?: number;
    placeholder?: string;
    componentProps?: {
        debounceMs?: number;
        placeholder?: string;
    };
}

/**
 * ProductSearchBoxInput - The actual search input component (memoized)
 */
const ProductSearchBoxInput: React.FC<IProductSearchBoxProps> = memo((props) => {
    const {
        componentProps,
        debounceMs: directDebounceMs,
        placeholder: directPlaceholder,
    } = props;
    
    // Extract props from componentProps or use direct props
    const debounceMs = componentProps?.debounceMs ?? directDebounceMs ?? 300;
    const placeholder = componentProps?.placeholder ?? directPlaceholder;
    
    const translate = useTranslate();
    const inputRef = useRef<HTMLInputElement>(null);
    
    // Get TabManager context
    const tabManager = useTabManagerOptional();
    
    console.log('[ProductSearchBox] Rendering ProductSearchBoxInput, tabManager:', tabManager ? 'available' : 'null');
    
    // Local state for the search input
    const [localFilter, setLocalFilter] = useState(tabManager?.filter || '');
    
    // Debounce the local filter
    const debouncedFilter = useDebounce(localFilter, debounceMs);
    
    // Sync debounced value to context
    useEffect(() => {
        if (tabManager && debouncedFilter !== tabManager.filter) {
            tabManager.setFilter(debouncedFilter);
        }
    }, [debouncedFilter, tabManager]);
    
    // Sync context filter to local state (only when context filter changes externally)
    useEffect(() => {
        if (tabManager && tabManager.filter !== localFilter && !inputRef.current?.matches(':focus')) {
            setLocalFilter(tabManager.filter);
        }
    }, [tabManager?.filter]);
    
    // Handle input change - update local state immediately
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalFilter(e.target.value);
    }, []);
    
    // Handle clear button
    const handleClear = useCallback(() => {
        setLocalFilter('');
        // Immediately clear in context as well
        if (tabManager) {
            tabManager.setFilter('');
        }
        // Refocus the input
        inputRef.current?.focus();
    }, [tabManager]);
    
    // If not in TabManagerProvider context, don't render
    if (!tabManager) {
        console.log('[ProductSearchBox] No tabManager context, returning null');
        return null;
    }
    
    console.log('[ProductSearchBox] Context available, rendering search box');
    
    const defaultPlaceholder = translate('tab.products.search.label', { defaultValue: 'Buscar productos...' });
    
    return (
        <Box sx={{ width: '100%' }}>
            <TextField
                inputRef={inputRef}
                fullWidth
                size="small"
                placeholder={placeholder || defaultPlaceholder}
                value={localFilter}
                onChange={handleChange}
                autoComplete="off"
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon color="action" fontSize="small" />
                        </InputAdornment>
                    ),
                    endAdornment: localFilter && (
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="Limpiar búsqueda"
                                onClick={handleClear}
                                edge="end"
                                size="small"
                            >
                                <ClearIcon fontSize="small" />
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                    },
                }}
            />
        </Box>
    );
});

ProductSearchBoxInput.displayName = 'ProductSearchBoxInput';

/**
 * ProductSearchBoxEdit - Search box for edit mode
 */
const ProductSearchBoxEdit: React.FC<IProductSearchBoxProps> = (props) => {
    return <ProductSearchBoxInput {...props} />;
};

/**
 * ProductSearchBoxCreate - Search box for create mode
 */
const ProductSearchBoxCreate: React.FC<IProductSearchBoxProps> = (props) => {
    return <ProductSearchBoxInput {...props} />;
};

/**
 * ProductSearchBoxView - Search box for view mode (hidden)
 */
const ProductSearchBoxView: React.FC<IProductSearchBoxProps> = (props) => {
    // Don't render search in view mode
    return null;
};

/**
 * ProductSearchBoxList - Search box for list mode (hidden)
 */
const ProductSearchBoxList: React.FC<IProductSearchBoxProps> = (props) => {
    // Don't render search in list mode
    return null;
};

/**
 * ProductSearchBox - Main component that switches based on method
 * 
 * This component maintains its own local state to prevent losing focus
 * when the parent context updates. It debounces changes before propagating
 * them to the TabManagerContext.
 */
const ProductSearchBox = ({ 
    method, 
    attribute, 
    resourceConfig, 
    ...props 
}: IProductSearchBoxProps) => {
    
    console.log('[ProductSearchBox] Main component rendering, method:', method);
    
    switch (method) {
        case "edit":
            return (
                <ProductSearchBoxEdit 
                    attribute={attribute} 
                    method={method} 
                    resourceConfig={resourceConfig} 
                    {...props} 
                />
            );
        case "view":
            return (
                <ProductSearchBoxView 
                    attribute={attribute} 
                    method={method} 
                    resourceConfig={resourceConfig} 
                    {...props} 
                />
            );
        case "create":
            return (
                <ProductSearchBoxCreate 
                    attribute={attribute} 
                    method={method} 
                    resourceConfig={resourceConfig} 
                    {...props} 
                />
            );
        case "list":
            return (
                <ProductSearchBoxList 
                    attribute={attribute} 
                    method={method} 
                    resourceConfig={resourceConfig} 
                    {...props} 
                />
            );
        default:
            return null;
    }
};

export default ProductSearchBox;
