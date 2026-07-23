import React from 'react';
import { SelectInput } from 'react-admin';
import { Box, CircularProgress, Alert } from '@mui/material';
import { usePaymentGatewayCapabilities } from 'dash-web/src/hooks/usePaymentGatewayCapabilities';

/**
 * Billing Cycle Select Input
 * 
 * Dynamically filters billing cycle options based on the active payment gateway's capabilities.
 * This ensures users can only select billing cycles that are supported by their payment gateway.
 */
const BillingCycleSelectInput: React.FC = () => {
    const { supportedBillingCycles, isLoading, gatewayName } = usePaymentGatewayCapabilities();

    // All possible billing cycles with user-friendly labels
    const allBillingCycles = [
        { id: 'daily', name: 'Daily' },
        { id: 'weekly', name: 'Weekly' },
        { id: 'monthly', name: 'Monthly' },
        { id: 'yearly', name: 'Yearly' },
    ];

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
                <CircularProgress size={20} />
                <span>Loading payment gateway capabilities...</span>
            </Box>
        );
    }

    // Filter choices based on gateway capabilities
    const filteredChoices = allBillingCycles.filter(cycle =>
        supportedBillingCycles.includes(cycle.id)
    );

    // Get unsupported cycles for info message
    const unsupportedCycles = allBillingCycles
        .filter(cycle => !supportedBillingCycles.includes(cycle.id))
        .map(c => c.name);

    return (
        <Box>
            <SelectInput
                source="billing_cycle"
                label="Billing Cycle"
                choices={filteredChoices}
                fullWidth
                defaultValue="monthly"
                helperText={
                    gatewayName
                        ? `Available cycles for ${gatewayName}`
                        : 'Select billing cycle for this plan'
                }
                validate={(value) => !value ? 'Required' : undefined}
            />
            
            {unsupportedCycles.length > 0 && (
                <Alert severity="info" sx={{ mt: 1 }}>
                    Note: {unsupportedCycles.join(', ')} billing cycle
                    {unsupportedCycles.length > 1 ? 's are' : ' is'} not supported by your current payment gateway ({gatewayName}).
                </Alert>
            )}
        </Box>
    );
};

export default BillingCycleSelectInput;
