import React from 'react';
import {
    Box,
    Typography,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Paper,
    Card,
    CardContent
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    RadioButtonUnchecked as PendingIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';
import { useRecordContext, useTranslate } from 'react-admin';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';

/**
 * SelfServiceOrderTimeline
 * 
 * Displays the progress of an order using a vertical stepper.
 * Shows timestamps for completed steps.
 */
const SelfServiceOrderTimeline: React.FC<IDashAutoAdminCustomFieldComponent> = () => {
    const record = useRecordContext();
    const translate = useTranslate();

    if (!record) return null;

    // Define the sequence of status steps
    const steps = [
        {
            id: 'CREATED',
            label: translate('tab.status.created', { _: 'Creado' }),
            dateField: 'date_created',
            fallbackDateField: 'created_at' // Fallback to standard timestamp 
        },
        {
            id: 'CONFIRMED',
            label: translate('tab.status.confirmed', { _: 'Confirmado' }),
            dateField: 'date_confirmed'
        },
        {
            id: 'IN_PREPARATION',
            label: translate('tab.status.in_preparation', { _: 'En preparación' }),
            dateField: 'date_in_preparation'
        },
        {
            id: 'PREPARED',
            label: translate('tab.status.prepared', { _: 'Preparado' }),
            dateField: 'date_prepared'
        },
        {
            id: 'DELIVERED',
            label: translate('tab.status.delivered', { _: 'Entregado' }),
            dateField: 'date_delivered'
        },
        {
            id: 'CLOSED',
            label: translate('tab.status.closed', { _: 'Cerrado' }),
            dateField: 'date_closed'
        }
    ];

    // Determine current step index
    // If CANCELLED, we handle it separately or show it as a final failed state
    const currentStatus = record.status;
    let activeStep = -1;

    if (currentStatus === 'CANCELLED') {
        // Special case for cancelled?
        // Maybe show all steps as inactive and a cancelled message
    } else {
        // Find the index of the current status
        const statusMap: Record<string, number> = {
            'CREATED': 0,
            'CONFIRMED': 1,
            'IN_PREPARATION': 2,
            'PREPARED': 3,
            'DELIVERED': 4,
            'CLOSED': 5
        };
        activeStep = statusMap[currentStatus] ?? -1;
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleString();
    };

    return (
        <Box sx={{ width: '100%', mb: 2 }}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        {translate('selfservice.timeline.title')}
                    </Typography>
                    
                    {currentStatus === 'CANCELLED' ? (
                         <Box sx={{ p: 2, bgcolor: '#ffebee', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CancelIcon color="error" />
                            <Typography color="error.main" fontWeight="bold">
                                {translate('tab.status.cancelled')}
                            </Typography>
                         </Box>
                    ) : (
                        <Stepper activeStep={activeStep} orientation="vertical">
                            {steps.map((step, index) => {
                                const isCompleted = index <= activeStep;
                                const isCurrent = index === activeStep;
                                // @ts-ignore
                                const dateValue = record[step.dateField] || (step.fallbackDateField ? record[step.fallbackDateField] : null);

                                return (
                                    <Step key={step.id} expanded={true} active={isCurrent} completed={isCompleted && !isCurrent}>
                                        <StepLabel
                                            optional={
                                                dateValue ? (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatDate(dateValue)}
                                                    </Typography>
                                                ) : null
                                            }
                                            error={currentStatus === 'CANCELLED'} // Just in case
                                        >
                                            <Typography 
                                                variant={isCurrent ? "subtitle2" : "body2"}
                                                fontWeight={isCurrent ? "bold" : "normal"}
                                            >
                                                {step.label}
                                            </Typography>
                                        </StepLabel>
                                        <StepContent>
                                            {/* Optional content for active step */}
                                            {/* <Typography variant="body2" color="text.secondary">{step.description}</Typography> */}
                                        </StepContent>
                                    </Step>
                                );
                            })}
                        </Stepper>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default SelfServiceOrderTimeline;
