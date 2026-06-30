import React, { useCallback, useState, useEffect, Suspense } from 'react';
import { Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem, InputAdornment, IconButton, Alert, Chip, Radio, Button } from '@mui/material';
import { useRecordContext, useRefresh, useTranslate } from 'react-admin';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import { Clear } from '@mui/icons-material';
import { useQueryClient } from '@tanstack/react-query';
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
    const [tabActionsError, setTabActionsError] = useState<string | null>(null);

    // Dialog state
    const [closeDialogOpen, setCloseDialogOpen] = useState(false);
    const [closeTabForDialog, setCloseTabForDialog] = useState<ITab | null>(null);
    const [selectedTab, setSelectedTab] = useState<ITab | null>(null);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [closingStatus, setClosingStatus] = useState<string>("CLOSED");
    const [paymentMethod, setPaymentMethod] = useState<string>("");
    const [serviceFeeValue, setServiceFeeValue] = useState(0);
    const [actionLoading, setActionLoading] = useState(false);

    // Check if QueryClient is available
    let queryClientAvailable = false;
    try {
        console.log('[TabActionButtonsField] Checking QueryClient availability...');
        useQueryClient();
        queryClientAvailable = true;
        console.log('[TabActionButtonsField] ✅ QueryClient is available');
    } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error('[TabActionButtonsField] ❌ QueryClient not available:', errorMsg);
        queryClientAvailable = false;
        if (!tabActionsError) {
            setTabActionsError(errorMsg);
        }
    }

    // Try to initialize useTabActions only if QueryClient is available
    let tabActions: any = null;
    if (queryClientAvailable) {
        try {
            console.log('[TabActionButtonsField] Initializing useTabActions...');
            tabActions = useTabActions(onTabClosed);
            console.log('[TabActionButtonsField] ✅ useTabActions initialized successfully');
            // Clear any previous errors
            if (tabActionsError) {
                setTabActionsError(null);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            console.error('[TabActionButtonsField] ❌ Failed to initialize useTabActions:', errorMsg, err);
            if (!tabActionsError) {
                setTabActionsError(errorMsg);
            }
        }
    } else {
        console.log('[TabActionButtonsField] QueryClient not available, using fallback');
    }

    // Provide fallback if initialization failed
    if (!tabActions) {
        tabActions = {
            paymentMethods: [],
            loadingPaymentMethods: false,
            paymentMethodsError: tabActionsError || 'QueryClient not available',
            availableClosingStatuses: [],
            defaultServiceFeePercentage: 0,
            getDefaultPaymentMethod: () => null,
            getPaymentMethodByValue: () => null,
            isPaymentMethodDeferred: () => false,
            downloadTab: async () => {},
            printTab: async () => {},
            closeTab: async () => {},
            updatePayment: async () => {},
            closeTabWithStatus: async () => {},
        };
    }

    const {
        paymentMethods = [],
        loadingPaymentMethods = false,
        paymentMethodsError = null,
        availableClosingStatuses = [],
        defaultServiceFeePercentage = 0,
        getDefaultPaymentMethod = () => null,
        getPaymentMethodByValue = () => null,
        isPaymentMethodDeferred = () => false,
        downloadTab = async () => {},
        printTab = async () => {},
        closeTab = async () => {},
        updatePayment = async () => {},
        closeTabWithStatus = async () => {},
    } = tabActions || {};

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
        console.log('[TabActionButtonsField] No record provided, returning null');
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
            {tabActionsError && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Tab actions temporarily unavailable: {tabActionsError}
                </Alert>
            )}
            <Box sx={{ display: 'flex', gap: 1}}>
                <TabActionButtons
                    tab={record}
                    resourceConfig={resourceConfig}
                    onPrint={showPrint && !tabActionsError ? handlePrintWrapper : undefined}
                    onDownload={showDownload && !tabActionsError ? handleDownloadWrapper : undefined}
                    onCancel={showCloseButton && !tabActionsError ? (tab: ITab) => handleCancel(tab) : undefined}
                    onPayment={showPaymentButton && !tabActionsError ? (tab: ITab) => handleOpenPaymentDialog(tab) : undefined}
                    size={size}
                    showView={showView}
                    showEdit={showEdit}
                    showPrint={showPrint}
                    showDownload={showDownload}
                    showPayment={showPaymentButton}
                    showClose={showCloseButton}
                    showCancel={showCloseButton}
                    loading={actionLoading || !!tabActionsError}
                    disabled={actionLoading || !!tabActionsError}
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
