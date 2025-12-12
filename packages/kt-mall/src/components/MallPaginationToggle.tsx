import React from 'react';
import { useTranslate } from 'react-admin';
import { 
    Box, 
    ToggleButton, 
    ToggleButtonGroup,
    Tooltip,
    Typography,
} from '@mui/material';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { useMallOrderCreate, PaginationMode } from '../contexts/MallOrderCreateContext';

interface MallPaginationToggleProps {
    showLabel?: boolean;
}

/**
 * MallPaginationToggle - Toggle between horizontal pagination and infinite scroll
 */
export const MallPaginationToggle: React.FC<MallPaginationToggleProps> = ({
    showLabel = false,
}) => {
    const translate = useTranslate();
    const { paginationMode, setPaginationMode } = useMallOrderCreate();

    const handleChange = (
        _event: React.MouseEvent<HTMLElement>,
        newMode: PaginationMode | null
    ) => {
        if (newMode !== null) {
            setPaginationMode(newMode);
        }
    };

    return (
        <Box
            className="kt-mall-pagination-toggle"
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
            }}
        >
            {showLabel && (
                <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ fontWeight: 500 }}
                >
                    {translate('mall.display_mode')}:
                </Typography>
            )}
            
            <ToggleButtonGroup
                value={paginationMode}
                exclusive
                onChange={handleChange}
                size="small"
                sx={{
                    '& .MuiToggleButton-root': {
                        border: 2,
                        borderColor: 'divider',
                        px: 1.5,
                        py: 0.5,
                        '&.Mui-selected': {
                            backgroundColor: 'primary.main',
                            color: 'primary.contrastText',
                            borderColor: 'primary.main',
                            '&:hover': {
                                backgroundColor: 'primary.dark',
                            },
                        },
                    },
                }}
            >
                <ToggleButton value="horizontal">
                    <Tooltip title={translate('mall.horizontal_pagination')}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <ViewCarouselIcon fontSize="small" />
                            {showLabel && (
                                <Typography variant="caption" fontWeight={600}>
                                    {translate('mall.pages')}
                                </Typography>
                            )}
                        </Box>
                    </Tooltip>
                </ToggleButton>
                
                <ToggleButton value="infinite">
                    <Tooltip title={translate('mall.infinite_scroll')}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <ViewModuleIcon fontSize="small" />
                            {showLabel && (
                                <Typography variant="caption" fontWeight={600}>
                                    {translate('mall.scroll')}
                                </Typography>
                            )}
                        </Box>
                    </Tooltip>
                </ToggleButton>
            </ToggleButtonGroup>
        </Box>
    );
};

export default MallPaginationToggle;
