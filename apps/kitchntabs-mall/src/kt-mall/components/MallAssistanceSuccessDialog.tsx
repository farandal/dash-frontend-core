import React from 'react';
import { useTranslate } from 'react-admin';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Divider,
    Chip,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import StorefrontIcon from '@mui/icons-material/Storefront';

export interface AssistanceDialogData {
    store_name: string;
    customer_name: string;
    table_number: string;
    estimated_response_time: string;
    assistance_available: boolean;
    remaining_requests?: number;
}

interface MallAssistanceSuccessDialogProps {
    open: boolean;
    onClose: () => void;
    data: AssistanceDialogData | null;
}

/**
 * MallAssistanceSuccessDialog - Shows success information after requesting assistance
 */
export const MallAssistanceSuccessDialog: React.FC<MallAssistanceSuccessDialogProps> = ({
    open,
    onClose,
    data,
}) => {
    const translate = useTranslate();

    if (!data) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    overflow: 'hidden',
                },
            }}
        >
            {/* Success Header */}
            <Box
                sx={{
                    backgroundColor: 'success.main',
                    color: 'success.contrastText',
                    py: 3,
                    px: 2,
                    textAlign: 'center',
                }}
            >
                <CheckCircleOutlineIcon sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h5" fontWeight="bold">
                    {translate('tab.modal.assistance_dialog.title')}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                    {translate('tab.modal.assistance_dialog.staff_notified')}
                </Typography>
            </Box>

            <DialogContent sx={{ pt: 3 }}>
                {/* Store Info */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <StorefrontIcon sx={{ color: 'primary.main', mr: 1.5 }} />
                    <Box>
                        <Typography variant="caption" color="text.secondary">
                            {translate('tab.modal.assistance_dialog.store_label')}
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                            {data.store_name}
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Customer Details */}
                <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        <PersonIcon sx={{ color: 'text.secondary', mr: 1.5 }} />
                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                {translate('tab.modal.assistance_dialog.customer_label')}
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                                {data.customer_name}
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        <TableRestaurantIcon sx={{ color: 'text.secondary', mr: 1.5 }} />
                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                {translate('tab.modal.assistance_dialog.table_label')}
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                                {data.table_number}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Estimated Time */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccessTimeIcon sx={{ color: 'warning.main', mr: 1.5 }} />
                    <Box>
                        <Typography variant="caption" color="text.secondary">
                            {translate('tab.modal.assistance_dialog.estimated_time_label')}
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                            {data.estimated_response_time}
                        </Typography>
                    </Box>
                </Box>

                {/* Remaining Requests */}
                {data.assistance_available && data.remaining_requests !== undefined && (
                    <Box
                        sx={{
                            mt: 2,
                            p: 2,
                            backgroundColor: 'grey.100',
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            {translate('tab.modal.assistance_dialog.remaining_requests_label')}
                        </Typography>
                        <Chip
                            label={data.remaining_requests}
                            color={data.remaining_requests > 0 ? 'primary' : 'default'}
                            size="small"
                        />
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button
                    onClick={onClose}
                    variant="contained"
                    color="primary"
                    fullWidth
                    startIcon={<SupportAgentIcon />}
                    sx={{
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 600,
                    }}
                >
                    {translate('tab.modal.assistance_dialog.close_button')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default MallAssistanceSuccessDialog;
