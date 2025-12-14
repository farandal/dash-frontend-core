import React from 'react';
import { useTranslate } from 'react-admin';
import { 
    Box, 
    Button, 
    CircularProgress,
    Typography,
} from '@mui/material';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { useMallOrderCreate } from '../contexts/MallOrderCreateContext';

/**
 * MallAssistanceButton - Button to request assistance from the selected store
 * 
 * Only visible when a specific store is selected
 */
export const MallAssistanceButton: React.FC = () => {
    const translate = useTranslate();
    const { 
        selectedStore, 
        isAssistanceLoading, 
        requestAssistance 
    } = useMallOrderCreate();

    // Don't show if no store is selected
    if (!selectedStore) {
        return null;
    }

    return (
        <Box
            className="kt-mall-assistance-button"
            sx={{
                px: 2,
                py: 1,
                //backgroundColor: 'background.default',
                borderBottom: 1,
                borderColor: 'divider',
            }}
        >
            <Button
                variant="outlined"
                color="secondary"
                fullWidth
                startIcon={
                    isAssistanceLoading ? (
                        <CircularProgress size={18} color="inherit" />
                    ) : (
                        <SupportAgentIcon />
                    )
                }
                onClick={requestAssistance}
                disabled={isAssistanceLoading}
                sx={{
                    borderRadius: 2,
                    py: 1,
                    borderWidth: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                        borderWidth: 2,
                        backgroundColor: 'secondary.main',
                        color: 'secondary.contrastText',
                    },
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {translate('mall.request_assistance')}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        {selectedStore.name}
                    </Typography>
                </Box>
            </Button>
        </Box>
    );
};

export default MallAssistanceButton;
