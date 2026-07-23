import React, { useState, useCallback, useEffect } from 'react';
import { useTranslate } from 'react-admin';
import { 
    Box, 
    TextField,
    InputAdornment,
    IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useSelfServiceOrderCreate } from '../contexts/SelfServiceOrderCreateContext';

/**
 * SelfServiceSearchBox - Search input for filtering products in self-service kiosk
 */
export const SelfServiceSearchBox: React.FC = () => {
    const translate = useTranslate();
    const { searchQuery, setSearchQuery } = useSelfServiceOrderCreate();
    const [localValue, setLocalValue] = useState(searchQuery);
    
    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchQuery(localValue);
        }, 300);
        
        return () => clearTimeout(timer);
    }, [localValue, setSearchQuery]);
    
    // Sync with external changes
    useEffect(() => {
        setLocalValue(searchQuery);
    }, [searchQuery]);

    const handleClear = useCallback(() => {
        setLocalValue('');
        setSearchQuery('');
    }, [setSearchQuery]);

    return (
        <Box
            className="kt-selfservice-search-box"
            sx={{
                flex: 1, 
                mr: 2,
            }}
        >
            <TextField
                fullWidth
                size="small"
                placeholder={translate('mall.search_products')}
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon color="action" />
                        </InputAdornment>
                    ),
                    endAdornment: localValue && (
                        <InputAdornment position="end">
                            <IconButton
                                size="small"
                                onClick={handleClear}
                                edge="end"
                            >
                                <ClearIcon fontSize="small" />
                            </IconButton>
                        </InputAdornment>
                    ),
                    sx: {
                        borderRadius: 2,
                        '& fieldset': {
                            borderWidth: 2,
                        },
                        '&:hover fieldset': {
                            borderColor: 'primary.main',
                        },
                    },
                }}
            />
        </Box>
    );
};

export default SelfServiceSearchBox;
