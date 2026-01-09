import React, { useEffect, useState } from 'react';
import { useTranslate } from 'react-admin';
import { 
    Box, 
    Button, 
    CircularProgress,
    Typography,
} from '@mui/material';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useMallOrderCreate } from '../contexts/MallOrderCreateContext';
import { MallAssistanceSuccessDialog } from './MallAssistanceSuccessDialog';

/**
 * MallAssistanceButton - Button to request assistance from the selected store
 * 
 * Only visible when a specific store is selected
 * Includes cooldown timer and success dialog
 */
export const MallAssistanceButton: React.FC = () => {
    const translate = useTranslate();
    const { 
        selectedStore, 
        isAssistanceLoading, 
        requestAssistance,
        isAssistanceDialogOpen,
        assistanceDialogData,
        closeAssistanceDialog,
        getAssistanceCooldownRemaining,
    } = useMallOrderCreate();
    
    // Cooldown timer state
    const [cooldownRemaining, setCooldownRemaining] = useState(0);
    
    // Update cooldown timer every second
    useEffect(() => {
        if (!selectedStore) return;
        
        const updateCooldown = () => {
            const remaining = getAssistanceCooldownRemaining(selectedStore.id);
            setCooldownRemaining(remaining);
        };
        
        // Initial update
        updateCooldown();
        
        // Update every second while cooldown is active
        const interval = setInterval(updateCooldown, 1000);
        
        return () => clearInterval(interval);
    }, [selectedStore, getAssistanceCooldownRemaining]);
    
    // Format cooldown as MM:SS
    const formatCooldown = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Don't show if no store is selected
    if (!selectedStore) {
        return null;
    }
    
    const isOnCooldown = cooldownRemaining > 0;

    return (
        <>
            <Box
                className="kt-mall-assistance-button"
                sx={{
                    px: 2,
                    py: 1,
                    borderBottom: 1,
                    borderColor: 'divider',
                }}
            >
                <Button
                    variant="outlined"
                    color={isOnCooldown ? 'inherit' : 'secondary'}
                    fullWidth
                    startIcon={
                        isAssistanceLoading ? (
                            <CircularProgress size={18} color="inherit" />
                        ) : isOnCooldown ? (
                            <AccessTimeIcon />
                        ) : (
                            <SupportAgentIcon />
                        )
                    }
                    onClick={requestAssistance}
                    disabled={isAssistanceLoading || isOnCooldown}
                    sx={{
                        borderRadius: 2,
                        py: 1,
                        borderWidth: 2,
                        fontWeight: 600,
                        textTransform: 'none',
                        opacity: isOnCooldown ? 0.7 : 1,
                        '&:hover': {
                            borderWidth: 2,
                            backgroundColor: isOnCooldown ? 'transparent' : 'secondary.main',
                            color: isOnCooldown ? 'inherit' : 'secondary.contrastText',
                        },
                    }}
                >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {isOnCooldown 
                                ? translate('tab.assistance.cooldown_remaining', { time: formatCooldown(cooldownRemaining) })
                                : translate('tab.assistance.request_help')
                            }
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            {selectedStore.name}
                        </Typography>
                    </Box>
                </Button>
            </Box>
            
            {/* Success Dialog */}
            <MallAssistanceSuccessDialog
                open={isAssistanceDialogOpen}
                onClose={closeAssistanceDialog}
                data={assistanceDialogData}
            />
        </>
    );
};

export default MallAssistanceButton;
