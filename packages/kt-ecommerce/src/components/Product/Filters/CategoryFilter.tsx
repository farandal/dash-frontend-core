import React, { useEffect } from 'react';
import { useInput, InputProps } from 'react-admin';
import SearchableSelectChips from '../../RASearchableSelectChips';
import { Category } from '../interfaces/Category';

interface CategoryFilterProps extends InputProps {
    source: string;
    label: string;
    multiple?: boolean;
    alwaysOn?: boolean;
    minOptions?: number;
    searchResults?: number;
    resource?: string;
    viewAttribute?: string;
    valueKeyId?: string;
    renderText?: (option: Category, caller: string) => string;
    isOptionEqualToValue?: (option: Category, value: Category) => boolean;
    queryFilter?: string;
    filter?: { [key: string]: any };
    placeholder?: string;
    minSearch?: number;
    timerSearch?: number;
    enableMixedResults?: boolean;
    mixedResultsMinOptions?: number;
    // 🔥 NEW: Add filter submit mode support
    filterWithSubmit?: boolean;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
    source,
    label,
    multiple = false,
    alwaysOn = false,
    minOptions = 10,
    searchResults = 50,
    resource,
    viewAttribute = "breadcrumbed_name",
    valueKeyId = "id",
    renderText,
    isOptionEqualToValue,
    queryFilter = "q",
    filter = { flat: true, pagination: false },
    placeholder,
    minSearch = 1,
    timerSearch = 300,
    enableMixedResults = false,
    mixedResultsMinOptions,
    filterWithSubmit = false,
    ...props
}) => {
    const {
        field: { onChange, value },
        fieldState: { error },
    } = useInput({ source, ...props });

    const FORCED_RESOURCE = "ecommerce/category";

    useEffect(() => {
        console.log('🏷️ CategoryFilter DEBUG - Component initialized:', {
            source,
            label,
            filterWithSubmit,
            value,
            timestamp: new Date().toISOString()
        });
    }, []);

    // 🔥 FIXED: Always call onChange - React Admin's FilterForm will handle the submit logic
    const handleChange = (newValue: any) => {
        console.log('🎯 CategoryFilter DEBUG - handleChange called:', {
            source,
            newValue,
            filterWithSubmit,
            timestamp: new Date().toISOString()
        });

        // Always process the value and call onChange
        // React Admin's FilterForm component will decide when to actually apply the filters
        if (multiple) {
            let ids: any[] = [];
            
            if (Array.isArray(newValue)) {
                ids = newValue.map(item => typeof item === 'object' ? item[valueKeyId] : item);
            } else if (newValue) {
                ids = [typeof newValue === 'object' ? newValue[valueKeyId] : newValue];
            }
            
            console.log('🔄 CategoryFilter DEBUG - Multiple mode, setting IDs:', ids);
            onChange(ids);
        } else {
            const id = newValue ? (typeof newValue === 'object' ? newValue[valueKeyId] : newValue) : undefined;
            console.log('🔄 CategoryFilter DEBUG - Single mode, setting ID:', id);
            onChange(id);
        }
    };
    
    const defaultRenderText = (option: Category, caller: string) => {
        if (!option) return '';
        return option.breadcrumbed_name || option.name || '';
    };

    const defaultIsOptionEqualToValue = (option: Category, value: Category) => {
        if (!option || !value) return false;
        return option.id === value.id;
    };

    const defaultPlaceholder = multiple ? "Buscar categorías..." : "Buscar categoría...";

    const finalProps = {
        resource: FORCED_RESOURCE,
        selectLabel: label,
        value,
        onChange: handleChange,
        isMultiple: multiple,
        viewAttribute,
        valueKeyId,
        renderText: renderText || defaultRenderText,
        isOptionEqualToValue: isOptionEqualToValue || defaultIsOptionEqualToValue,
        queryFilter,
        filter: { ...filter },
        placeholder: placeholder || defaultPlaceholder,
        minSearch,
        timerSearch,
        minOptions,
        searchResults,
        enableMixedResults,
        mixedResultsMinOptions: minOptions,
        // 🔥 REMOVED: Don't pass filterWithSubmit to SearchableSelectChips
        // The submit logic should be handled at the FilterForm level, not the individual field level
    };

    console.log('🚀 CategoryFilter DEBUG - Rendering:', {
        filterWithSubmit,
        value,
        finalProps: {
            resource: finalProps.resource,
            value: finalProps.value,
        },
        timestamp: new Date().toISOString()
    });

    return (
        <SearchableSelectChips
            {...finalProps}
        />
    );
};

export default CategoryFilter;
