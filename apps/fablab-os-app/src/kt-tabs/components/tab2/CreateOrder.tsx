import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import { OrderProductsList, OrderSummary } from '.';
import DiscountSection from './components/DiscountSection';
import { useTabManager } from '../contexts/TabManagerContext';
import TabAgentToolbar from '../Tab/TabAgentToolbar';

export interface ICreateOrderComponent extends IDashAutoAdminCustomFieldComponent {
    productsResource?: string;
    enableVoiceOrders?: boolean;
    enableImageOrders?: boolean;
    enableServiceFee?: boolean;
}

const CreateOrder: React.FC<ICreateOrderComponent> = ({
    enableVoiceOrders = false,
    enableImageOrders = false,
    enableServiceFee = true
}) => {
    // Use the centralized tab manager
    const {
        isProcessingVoiceActions,
    } = useTabManager();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 0, m: 0 }}>
            {/* AI Agent Toolbar - Compact single row */}
            {(enableVoiceOrders || enableImageOrders) && (
                <TabAgentToolbar 
                    config={{
                        enableVoice: enableVoiceOrders,
                        enableImage: enableImageOrders,
                        autoApply: true,
                        compact: true,
                        showStatus: true,
                    }}
                />
            )}

            <Box sx={{ display: 'flex', gap: 2, p: 0, m: 0 }}>
                <Box sx={{ flex: 1, p: 0, m: 0 }}>
                    {isProcessingVoiceActions && (
                        <Box sx={{ mb: 2, p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CircularProgress size={16} />
                                <Typography variant="body2">
                                    Aplicando comandos de voz...
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    {/* Simplified - only passing UI customization props */}
                    <OrderProductsList 
                        disabled={isProcessingVoiceActions}
                    />

                    {/* Discount Section */}
                    <DiscountSection method="create" />

                    <OrderSummary 
                        enableServiceFee={enableServiceFee}
                    />
                </Box>
            </Box>
        </Box>
    );
};

export default CreateOrder;