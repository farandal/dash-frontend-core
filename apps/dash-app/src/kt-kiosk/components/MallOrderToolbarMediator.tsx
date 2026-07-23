import React from 'react';
import { Box, TextField, ToggleButton, ToggleButtonGroup, InputAdornment, IconButton, Tooltip, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { useMallOrderCreate } from '../contexts/MallOrderCreateContext';
import { MallCartSummary } from './MallCartSummary';

/**
 * MallOrderToolbarMediator
 * 
 * A mediator component that provides search box and pagination mode controls.
 * Connects to MallOrderCreateContext to share state with other components.
 * 
 * This component is designed to be placed at the top of the form layout
 * via the schema, ensuring the toolbar is always visible at the top.
 */
const MallOrderToolbarMediator: React.FC = () => {
    const {
        searchQuery,
        setSearchQuery,
        isSearching,
        paginationMode,
        setPaginationMode,
    } = useMallOrderCreate();

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    const handlePaginationModeChange = (
        _event: React.MouseEvent<HTMLElement>,
        newMode: 'horizontal' | 'infinite' | null
    ) => {
        if (newMode !== null) {
            setPaginationMode(newMode);
        }
    };

    return (
        <Box className="kt-mall-client-tab-toolbar">
            {/* Cart Summary */}
           
            <MallCartSummary />

            {/* Search and Pagination Controls */}
            <Box className="kt-mall-client-tab-toolbar-controls">
                {/* Search Box */}
                <TextField
                className="kt-mall-client-tab-search-field"
                variant="outlined"
                size="small"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={handleSearchChange}
                sx={{ 
                    flex: 1, 
                    minWidth: { xs: 120, sm: 200 },
                    maxWidth: { xs: '60%', sm: 'none' }
                }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            {isSearching ? (
                                <CircularProgress size={20} color="inherit" />
                            ) : (
                                <SearchIcon color="action" />
                            )}
                        </InputAdornment>
                    ),
                    endAdornment: searchQuery && (
                        <InputAdornment position="end">
                            <IconButton size="small" onClick={handleClearSearch} edge="end" disabled={isSearching}>
                                <ClearIcon fontSize="small" />
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />

            {/* Pagination Mode Toggle */}
            <ToggleButtonGroup
                value={paginationMode}
                exclusive
                onChange={handlePaginationModeChange}
                size="small"
                aria-label="pagination mode"
            >
                <ToggleButton value="horizontal" aria-label="horizontal carousel">
                    <Tooltip title="Carrusel horizontal">
                        <ViewCarouselIcon />
                    </Tooltip>
                </ToggleButton>
                <ToggleButton value="infinite" aria-label="infinite scroll grid">
                    <Tooltip title="Grilla con scroll infinito">
                        <ViewModuleIcon />
                    </Tooltip>
                </ToggleButton>
            </ToggleButtonGroup>
            </Box>
        </Box>
    );
};

export default MallOrderToolbarMediator;
