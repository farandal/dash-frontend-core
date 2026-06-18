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
import { useMallOrderCreate } from '../contexts/MallOrderCreateContext';

/**
 * MallSearchBox - Search input for filtering products
 */
export const MallSearchBox: React.FC = () => {
    const translate = useTranslate();
    const { searchQuery, setSearchQuery } = useMallOrderCreate();
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
            className="kt-mall-search-box"
            sx={{
                px: { xs: 0, sm: 2 },
                py: { xs: 0, sm: 1 },
                backgroundColor: 'transparent',
                border: 'none',
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
                        //backgroundColor: 'background.paper',
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

export default MallSearchBox;
