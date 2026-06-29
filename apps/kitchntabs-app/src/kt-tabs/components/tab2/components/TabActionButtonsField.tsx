import React, { useCallback, useState } from 'react';
import { Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem, InputAdornment, IconButton, Alert, Chip, Radio, Button } from '@mui/material';
import { useRecordContext, useRefresh, useTranslate } from 'react-admin';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import { Clear } from '@mui/icons-material';
import DASHModal from 'dash-modal';
import TabActionButtons from '../../Tab/TabActionsButtons';
import { calculateServiceFee } from '../utils';
import { ITab } from '../../interfaces/ITab';
import useTabActions from '../hooks/useTabActions';

const TabActionButtonsFieldBase: React.FC<IDashAutoAdminCustomFieldComponent & {
    record?: ITab;
    onTabClosed?: (tabId: number) => void;
    showCloseButton?: boolean;
    showPaymentButton?: boolean;
    showView?: boolean;
    showEdit?: boolean;
    showPrint?: boolean;
    showDownload?: boolean;
    size?: 'small' | 'medium' | 'large';
}> = ({
    method,
    attribute,
    resourceConfig,
    record,
    onTabClosed,
    showCloseButton = true,
    showPaymentButton = true,
    showView = false,
    showEdit = false,
    showPrint = true,
    showDownload = true,
    size = 'large'
}) => {
    const translate = useTranslate();

        // Add state for close dialog
    const [closeDialogOpen, setCloseDialogOpen] = useState(false);
    const [closeTabForDialog, setCloseTabForDialog] = useState<ITab | null>(null);

    // Dialog state - only for payment dialog now
    const [selectedTab, setSelectedTab] = useState<ITab | null>(null);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [closingStatus, setClosingStatus] = useState<string>("CLOSED");

    // Payment method state for payment dialog
    const [paymentMethod, setPaymentMethod] = useState<string>("");
    const [serviceFeeValue, setServiceFeeValue] = useState(0);

    const [actionLoading, setActionLoading] = useState(false);

    // Use the tab actions hook
    const {
        paymentMethods,
        loadingPaymentMethods,
        paymentMethodsError,
        availableClosingStatuses,
        defaultServiceFeePercentage,
        getDefaultPaymentMethod,
        getPaymentMethodByValue,
        isPaymentMethodDeferred,
        downloadTab,
        printTab,
        closeTab, // Simple close function
        updatePayment,
        closeTabWithStatus
    } = useTabActions(onTabClosed);

    // Simple close handler - just closes the tab
    /*const handleClose = useCallback((tab: ITab) => {
        closeTab(tab.id);
    }, [closeTab]);*/
    const handleClose = useCallback((tab: ITab) => {
        //setCloseTabForDialog(tab);
        setCloseDialogOpen(true);
    }, []);

      const handleCancel = useCallback((tab: ITab) => {
         setCloseTabForDialog(tab);
        setCloseDialogOpen(true);
    }, []);

      const handleConfirmClose = useCallback(async (status: 'CLOSED' | 'CANCELLED') => {
        if (closeTabForDialog) {
            setActionLoading(true);
            await closeTabWithStatus(closeTabForDialog.id, status);
            setActionLoading(false);
        }
        setCloseDialogOpen(false);
        setCloseTabForDialog(null);
    }, [closeTabForDialog, closeTabWithStatus]);


    const handleOpenPaymentDialog = useCallback((tab: ITab) => {
        setSelectedTab(tab);

        if (paymentMethods.length > 0) {
            const defaultMethod = getDefaultPaymentMethod(paymentMethods);
            if (defaultMethod) {
                setPaymentMethod(defaultMethod.name);
            } else {
                const firstMethod = paymentMethods[0];
                setPaymentMethod(firstMethod.value);
            }
        }

        const calculatedServiceFee = tab.order?.service_fee ?
            Number(tab.order.service_fee) :
            calculateServiceFee(
                Number(tab.order?.total_amount) || 0,
                defaultServiceFeePercentage
            );
        setServiceFeeValue(calculatedServiceFee);

        setPaymentDialogOpen(true);
    }, [paymentMethods, getDefaultPaymentMethod, defaultServiceFeePercentage]);

    // Payment method selector component
    const PaymentMethodSelector = ({ value, onChange, disabled = false, sx = {} }) => {
        if (loadingPaymentMethods) {
            return <Typography>Loading payment methods...</Typography>;
        }

        if (paymentMethodsError) {
            return (
                <Alert severity="warning" sx={sx}>
                    {paymentMethodsError}
                </Alert>
            );
        }

        if (paymentMethods.length === 0) {
            return (
                <Alert severity="warning" sx={sx}>
                    {translate('tab.payment.no_methods_configured')}
                </Alert>
            );
        }

        return (
            <FormControl fullWidth sx={sx}>
                <InputLabel>{translate('tab.modal.payment.method')}</InputLabel>
                <Select
                    value={value}
                    onChange={(e) => onChange(String(e.target.value))}
                    disabled={disabled}
                >
                    {paymentMethods.map(method => (
                        <MenuItem key={method.id} value={method.value}>
                            {method.name}
                            {method.is_default && (
                                <Chip
                                    label={translate('tab.payment.default')}
                                    size="small"
                                    color="primary"
                                    sx={{ ml: 1 }}
                                />
                            )}
                            {isPaymentMethodDeferred(method) && (
                                <Chip
                                    label={translate('tab.payment.deferred')}
                                    size="small"
                                    sx={{ ml: 1 }}
                                />
                            )}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        );
    };

    if (!record) {
        return null;
    }

    const handlePrintWrapper = async (id: number) => {
        setActionLoading(true);
        await printTab(id);
        setActionLoading(false);
    };

    const handleDownloadWrapper = async (id: number) => {
        setActionLoading(true);
        await downloadTab(id);
        setActionLoading(false);
    };


     return (
        <>
            <Box sx={{ display: 'flex', gap: 1}}>
                <TabActionButtons
                    tab={record}
                    resourceConfig={resourceConfig}
                    onPrint={showPrint ? handlePrintWrapper : undefined}
                    onDownload={showDownload ? handleDownloadWrapper : undefined}
                    onCancel={showCloseButton ? (tab: ITab) => handleCancel(tab) : undefined}
                    onPayment={showPaymentButton ? (tab: ITab) => handleOpenPaymentDialog(tab) : undefined}
                    size={size}
                    showView={showView}
                    showEdit={showEdit}
                    showPrint={showPrint}
                    showDownload={showDownload}
                    showPayment={showPaymentButton}
                    showClose={showCloseButton}
                    showCancel={showCloseButton}
                    loading={actionLoading}
                    disabled={actionLoading}
                />
            </Box>

            {/* Close Status Selection Dialog */}
            <DASHModal
                variant={"info"}
                title={translate('tab.modal.close_status.title')}
                content={
                    <Box>
                        <Typography sx={{ mb: 3 }}>
                            {translate('tab.modal.close_status.message')}
                        </Typography>
                       
                    </Box>
                }
                open={closeDialogOpen}
                showCancelButton={true}
                showConfirmButton={true} // We handle buttons in content

                //onClose={showCloseButton ? (tab: ITab) => handleClose(tab) : undefined}

                onCancel={() => {  handleConfirmClose('CANCELLED'); setCloseDialogOpen(false) }}
                onConfirm={() => {  handleConfirmClose('CLOSED'); setCloseDialogOpen(false) }}
                
                cancelText={translate('tab.modal.cancel')}
                confirmText={translate('tab.modal.close')}
                onClose={() =>  { 
                    setCloseDialogOpen(false)
                    
                }}
             
            />

            {/* Payment Modal - Only for payment updates */}
            <DASHModal
                variant={"success"}
                title={translate('tab.modal.payment.title')}
                content={
                    <Box>
                        <TextField
                            label={translate('tab.modal.payment.tip')}
                            fullWidth
                            value={serviceFeeValue}
                            onChange={(e) => {
                                setServiceFeeValue(Number(e.target.value))
                            }}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setServiceFeeValue(0)}
                                            >
                                                <Clear />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />

                        <PaymentMethodSelector
                            value={paymentMethod}
                            onChange={setPaymentMethod}
                            sx={{ mt: 2 }}
                        />

                        {/* Closing Status Selection - only if available */}
                        {availableClosingStatuses && availableClosingStatuses.length ? (
                            <FormControl fullWidth sx={{ mt: 2 }}>
                                <InputLabel>{translate('tab.modal.payment.closing_status')}</InputLabel>
                                <Select
                                    value={closingStatus}
                                    onChange={(e) => setClosingStatus(String(e.target.value))}
                                >
                                    {availableClosingStatuses.map((status) => (
                                        <MenuItem key={status.value} value={status.value}>
                                            {translate(`tab.status.${status.value.toLowerCase()}`)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        ) : null}
                    </Box>
                }
                open={paymentDialogOpen}
                showCancelButton={true}
                cancelText={translate('common.cancel')}
                onClose={() => { setPaymentDialogOpen(false); }}
                onCancel={() => { setPaymentDialogOpen(false); }}
                onConfirm={async () => {
                    setPaymentDialogOpen(false);
                    if (selectedTab && paymentMethods.length > 0) {
                        setActionLoading(true);
                        await updatePayment(selectedTab.id, {
                            payment_method: paymentMethod,
                            service_fee: serviceFeeValue
                        });
                        setActionLoading(false);
                    }
                }}
            />
        </>
    );
};

const TabActionButtonsFieldEdit: React.FC<IDashAutoAdminCustomFieldComponent> = (props) => {
    const record = useRecordContext<ITab>();
    const refresh = useRefresh();
    const onTabClosed = (tabId: number) => {
        refresh();
    };
    return <>
        <TabActionButtonsFieldBase 
            {...props} 
            record={record} 
            onTabClosed={onTabClosed}
            showCloseButton={true}
            showPaymentButton={true}
            showView={false}
            showEdit={false}
        />
    </>
};

const TabActionButtonsFieldView: React.FC<IDashAutoAdminCustomFieldComponent> = (props) => {
    const record = useRecordContext<ITab>();
    const refresh = useRefresh();
    const onTabClosed = (tabId: number) => {
        refresh();
    };
    return <>
    
        <TabActionButtonsFieldBase 
            {...props} 
            record={record} 
            onTabClosed={onTabClosed}
            showCloseButton={false}
            showPaymentButton={false}
            showView={false}
            showEdit={false}
        /></>
    
};

const TabActionButtonsFieldList: React.FC<IDashAutoAdminCustomFieldComponent & {
    record?: ITab;
    onTabClosed?: (tabId: number) => void;
    showCloseButton?: boolean;
    showPaymentButton?: boolean;
    size?: 'small' | 'medium' | 'large';
    showView?: boolean;
    showEdit?: boolean;
}> = (props) => {
    const { record, onTabClosed, showCloseButton = false, showPaymentButton = true, size = 'large',showEdit,showView } = props;
    
    return <>
        <TabActionButtonsFieldBase 
            {...props} 
            record={record} 
            onTabClosed={onTabClosed}
            showCloseButton={showCloseButton}
            showPaymentButton={showPaymentButton}
            showView={showView}
            showEdit={showEdit}
            size={size}
        />
    </>
};

const TabActionButtonsField = ({ method, attribute, resourceConfig, record, ...props }: IDashAutoAdminCustomFieldComponent & any) => {
  
    switch (method) {
        case "edit":
            return <><TabActionButtonsFieldEdit  {...props} attribute={attribute} method={method} resourceConfig={resourceConfig} /></>;
        case "view":
            return <><TabActionButtonsFieldView  {...props} attribute={attribute} method={method} resourceConfig={resourceConfig} /></>;
        case "create":
            return null; // Don't show action buttons in create mode
        case "list":
            return <TabActionButtonsFieldList {...props} record={record} attribute={attribute} method={method} resourceConfig={resourceConfig} />;
        default:
            return null;
    }
};

export default TabActionButtonsField;
