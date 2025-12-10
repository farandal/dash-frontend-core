import React from 'react';
import { useInput, InputProps } from 'react-admin';
import SearchableSelectCheckboxes from '../../RASearchableSelectCheckboxes';
import { Category } from '../../../interfaces';

interface CategoryFilterCheckboxesProps extends InputProps {
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
    maxHeight?: number;
    showSelectAll?: boolean;
    showSelectedCount?: boolean;
    fullWidth?: boolean;
}

const CategoryFilterCheckboxes: React.FC<CategoryFilterCheckboxesProps> = ({ 
    source, 
    label, 
    multiple = true, // Default to true for checkbox version
    alwaysOn = false,
    minOptions = 10,
    searchResults = 50,
    resource = "ecommerce/category",
    viewAttribute = "breadcrumbed_name",
    valueKeyId = "id",
    renderText,
    isOptionEqualToValue,
    queryFilter = "q",
    filter = { flat: true, pagination: false },
    placeholder,
    minSearch = 1,
    timerSearch = 300,
    maxHeight = 300,
    showSelectAll = true,
    showSelectedCount = true,
    fullWidth = true,
    ...props 
}) => {
    const {
        field: { onChange, value },
        fieldState: { error },
    } = useInput({ source, ...props });

    const handleChange = (newValue: any) => {
        if (multiple) {
            // For multiple selection, send array of IDs
            const ids = Array.isArray(newValue) 
                ? newValue.map(item => typeof item === 'object' ? item[valueKeyId] : item)
                : [];
            onChange(ids.length > 0 ? ids : undefined);
        } else {
            // For single selection, send single ID
            const id = newValue ? (typeof newValue === 'object' ? newValue[valueKeyId] : newValue) : undefined;
            onChange(id);
        }
    };

    // Default renderText function
    const defaultRenderText = (option: Category, caller: string) => {
        if (!option) return '';
        return option.breadcrumbed_name || option.name || '';
    };

    // Default isOptionEqualToValue function
    const defaultIsOptionEqualToValue = (option: Category, value: Category) => {
        if (!option || !value) return false;
        return option.id === value.id;
    };

    // Default placeholder
    const defaultPlaceholder = multiple ? "Seleccionar categorías..." : "Seleccionar categoría...";

    return (
        <SearchableSelectCheckboxes
            resource={resource}
            selectLabel={label}
            value={value}
            onChange={handleChange}
            isMultiple={multiple}
            viewAttribute={viewAttribute}
            valueKeyId={valueKeyId}
            renderText={renderText || defaultRenderText}
            isOptionEqualToValue={isOptionEqualToValue || defaultIsOptionEqualToValue}
            queryFilter={queryFilter}
            filter={filter}
            placeholder={placeholder || defaultPlaceholder}
            minSearch={minSearch}
            timerSearch={timerSearch}
            minOptions={minOptions}
            searchResults={searchResults}
            maxHeight={maxHeight}
            showSelectAll={showSelectAll}
            showSelectedCount={showSelectedCount}
            fullWidth={fullWidth}
        />
    );
};

export default CategoryFilterCheckboxes;