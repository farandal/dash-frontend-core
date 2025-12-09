import React from 'react';
import { useListFilterContext } from 'react-admin';
import SearchableSelectChips from '../../RASearchableSelectChips';

interface BrandFilterProps {
    source: string;
    label: string;
    multiple?: boolean;
    alwaysOn?: boolean;
}

const BrandFilter: React.FC<BrandFilterProps> = ({ 
    source, 
    label, 
    multiple = false,
    alwaysOn = false,
    ...props 
}) => {
    const { filterValues, setFilters } = useListFilterContext();
    
    const currentValue = filterValues[source];

    const handleChange = (newValue: any) => {
        const newFilters = { ...filterValues };
        
        if (newValue === null || newValue === undefined || 
            (Array.isArray(newValue) && newValue.length === 0)) {
            delete newFilters[source];
        } else {
            if (multiple) {
                newFilters[source] = Array.isArray(newValue) 
                    ? newValue.map(item => typeof item === 'object' ? item.id : item)
                    : [typeof newValue === 'object' ? newValue.id : newValue];
            } else {
                newFilters[source] = typeof newValue === 'object' ? newValue.id : newValue;
            }
        }
        
        setFilters(newFilters, null, false);
    };

    return (
        <SearchableSelectChips
            {...props}
            resource="ecommerce/brand"
            selectLabel={label}
            value={currentValue}
            onChange={handleChange}
            isMultiple={multiple}
            viewAttribute="name"
            valueKeyId="id"
            renderText={(option: any, caller: string) => {
                if (!option) return '';
                return option.name || '';
            }}
            isOptionEqualToValue={(option: any, value: any) => {
                if (!option || !value) return false;
                return option.id === value.id;
            }}
            queryFilter="q"
            filter={{ pagination: false }}
            placeholder={multiple ? "Buscar marcas..." : "Buscar marca..."}
            minSearch={1}
            timerSearch={300}
        />
    );
};

export default BrandFilter;
