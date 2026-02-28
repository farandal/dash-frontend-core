import { IDashAutoAdminDataGrid } from "dash-auto-admin";
import { ITab } from "./interfaces/ITab";
import {
    Box,
    Chip,
    IconButton,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    InputAdornment,
    Button,
    Typography,
    Radio,
    Alert} from "@mui/material";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import React, { useContext, useEffect, useState, useCallback, useMemo } from "react";
import {
    useDataProvider,
    useRefresh,
    useTranslate,
    useUpdate,
    WithListContext} from "react-admin";
import { useAxios } from 'dash-axios-hook';
import { Clear } from "@mui/icons-material";
import DASHModal from "dash-modal";
import LaravelEchoContext from 'dash-admin/src/contexts/com/LaravelEchoContext';
import type { ILaravelEchoContext } from 'dash-admin/src/contexts/com/LaravelEchoContext';
import type { IDashNotificationPayloadBase as INotificationPayload } from 'dash-admin/src/interfaces/communication/INotification';
import { useAuthContext } from 'dash-admin/src/contexts/auth/AuthContext';
import { ITabStatusChange } from "./interfaces/ITabNotificationFormat";
import QueueStatusIndicator from './Queue/QueueStatusIndicator';
import { IOperationQueue, OperationQueue } from "./Queue/OperationQueue";
import TabListItem from "./Tab/TabListItem";
import { useTabActions } from "./tab2/hooks/useTabActions";
import { calculateServiceFee } from "./tab2/utils";
import { useDraggableCarousel, UseDraggableCarouselOptions } from "./hooks/useDraggableCarousel";
import { useTheme, useMediaQuery } from '@mui/material';

/** Carousel configuration for TabsList - can be customized */
const TABS_CAROUSEL_CONFIG: UseDraggableCarouselOptions = {
    itemsPerPageXs: 2,
    itemsPerPageSm: 2,
    itemsPerPageMd: 3,
    itemsPerPageLg: 4,
    itemsPerPageXl: 6,
    gap: 8,
};

export type ScrollMethod = 'browser_scroll' | 'dragging_scroll';

interface TabsListProps extends IDashAutoAdminDataGrid {
    scrollMethod?: ScrollMethod;
}

const KitchenTabsList: React.FC<TabsListProps> = ({ resourceConfig, scrollMethod = 'browser_scroll' }) => {
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.only('xs'));
    const isSm = useMediaQuery(theme.breakpoints.only('sm'));
    const isMd = useMediaQuery(theme.breakpoints.only('md'));
    const isLg = useMediaQuery(theme.breakpoints.only('lg'));
    const refresh = useRefresh();
    const dataProvider = useDataProvider();
    const translate = useTranslate();
    
    // Get auth context with system values
    const { user, auth } = useAuthContext();
    const { events, lastEvent } = useContext<ILaravelEchoContext>(LaravelEchoContext);
    
    // State to store our own list data
    const [listData, setListData] = useState<any[]>([]);
    
    // Replace hardcoded status labels with translations
    const [statusLabel, setStatusLabel] = useState({
        'CREATED': translate('tab.status.created'),
        'CONFIRMED': translate('tab.status.confirmed'),
        'IN_PREPARATION': translate('tab.status.in_preparation'),
        'PREPARED': translate('tab.status.prepared'),
        'DELIVERED': translate('tab.status.delivered'),
        'CLOSED': translate('tab.status.closed'),
        'CANCELLED': translate('tab.status.cancelled')
    });

    // Dialog state
    const [selectedTab, setSelectedTab] = useState<ITab | null>(null);
    const [closeDialogOpen, setCloseDialogOpen] = useState(false);
    const [closeTabDialogOpen, setCloseTabDialogOpen] = useState(false);
    const [closingStatus, setClosingStatus] = useState<string>("CLOSED");
    
    const [simpleCloseDialogOpen, setSimpleCloseDialogOpen] = useState(false);
    const [tabToClose, setTabToClose] = useState<ITab | null>(null);


    // Payment method state for dialogs
    const [paymentMethod, setPaymentMethod] = useState<string>("");
    const [serviceFeeValue, setServiceFeeValue] = useState(0);
    const [closeDialogPaymentMethod, setCloseDialogPaymentMethod] = useState<string>("");
    const [closeDialogServiceFeeValue, setCloseDialogServiceFeeValue] = useState(0);
    
    // Queue state
    const [queueSize, setQueueSize] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    const axios = useAxios();
    const [update] = useUpdate();

    // Function to remove a tab from the list data
    const removeTabFromList = useCallback((tabId: number) => {
        setListData(prevData => {
            const updatedData = prevData.filter(item => item.id !== tabId);
            return updatedData;
        });
    }, []);

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
        updatePayment,
        closeTabWithPayment,
        showMessage,
        showError,
        closeTabWithStatus
    } = useTabActions(removeTabFromList);

    // Update status labels when language changes
    useEffect(() => {
        setStatusLabel({
            'CREATED': translate('tab.status.created'),
            'CONFIRMED': translate('tab.status.confirmed'),
            'IN_PREPARATION': translate('tab.status.in_preparation'),
            'PREPARED': translate('tab.status.prepared'),
            'DELIVERED': translate('tab.status.delivered'),
            'CLOSED': translate('tab.status.closed'),
            'CANCELLED': translate('tab.status.cancelled')
        });
    }, [translate]);

    useEffect(() => {
        if (!lastEvent) return;
        if (lastEvent?.model === "Domain\\App\\Models\\Tab\\Tab" && (lastEvent as INotificationPayload<ITabStatusChange>).data.user !== user.id) {
            showMessage(translate('tab.status_change_notification', {
                old: translate(`tab.status.${(lastEvent as INotificationPayload<ITabStatusChange>).data.old?.toLowerCase() ?? ''}`),
                new: translate(`tab.status.${(lastEvent as INotificationPayload<ITabStatusChange>).data.new?.toLowerCase() ?? ''}`),
            }));
            refresh();
        } else {
            refresh();
        }
    }, [lastEvent, translate, user, refresh, showMessage]);



     // New simple close handler that shows status selection dialog
    const handleSimpleClose = useCallback((tab: ITab) => {
        setTabToClose(tab);
        setSimpleCloseDialogOpen(true);
    }, []);

    // Handle the actual close with selected status
    const handleConfirmSimpleClose = useCallback((status: 'CLOSED' | 'CANCELLED') => {
      
        if (tabToClose) {
            closeTabWithStatus(tabToClose.id, status);
        }
        setSimpleCloseDialogOpen(false);
        setTabToClose(null);
    }, [tabToClose, closeTabWithStatus]);


    // Create operation queue with callback to update queue state
    const operationQueue: IOperationQueue = useMemo(() => new OperationQueue(
        500, // 500ms delay between operations
        (queueSize: number) => {
            setQueueSize(queueSize);
            setIsProcessing(queueSize > 0);
        }
    ), []);

    // Queue the status update operation with pessimistic mutation
    const queueStatusUpdate = useCallback((tabId: number, status: string) => {
        showMessage(translate('tab.queue.status_update', { id: tabId, status: translate(`tab.status.${status.toLowerCase()}`) }));
        
        return operationQueue.add(async () => {
            try {
                // Return a promise that resolves when both update and refresh are complete
                const updatePromise = update(
                    'tab/tab',
                    { 
                        id: tabId,
                        data: { status },
                        previousData: undefined 
                    },
                    {
                        mutationMode: 'pessimistic',
                        onSuccess: () => {
                            showMessage(translate('tab.status_update.success', { 
                                id: tabId, 
                                status: translate(`tab.status.${status.toLowerCase()}`) 
                            }));
                            // Don't refresh here, we'll do it after
                        },
                        onError: (error) => {
                            showError(translate('tab.status_update.error', { 
                                id: tabId, 
                                error: error?.message || translate('common.unknown_error') 
                            }));
                            throw error; // Propagate error to catch block
                        }
                    }
                );

                // Wait for both update and refresh
                await updatePromise;
                await new Promise(resolve => setTimeout(resolve, 300)); // Small delay to ensure server state
                await refresh();
                
                return Promise.resolve();
            } catch (error) {
                showError(translate('tab.status_update.error', { 
                    id: tabId, 
                    error: error?.message || translate('common.unknown_error') 
                }));
                return Promise.reject(error);
            }
        });
    }, [update, operationQueue, translate, showMessage, showError, refresh]);

    const getNextStatus = (currentStatus: string) => {
        const nextStatusMap = {
            'CREATED': 'CONFIRMED',
            'CONFIRMED': 'IN_PREPARATION',
            'IN_PREPARATION': 'PREPARED',
            'PREPARED': 'DELIVERED',
            'DELIVERED': 'CLOSED'
        };
        return nextStatusMap[currentStatus];
    }

    const handleOpenCloseDialog = useCallback((tab: ITab) => {
        setSelectedTab(tab);
        setClosingStatus(availableClosingStatuses[0]?.value || tab.status);
        
        if (paymentMethods.length > 0) {
            const defaultMethod = getDefaultPaymentMethod(paymentMethods);
            
            if (defaultMethod) {
                setCloseDialogPaymentMethod(defaultMethod.name);
                console.log('✅ Set close dialog default payment method:', defaultMethod.name);
            } else {
                const firstMethod = paymentMethods[0];
                setCloseDialogPaymentMethod(firstMethod.value);
                console.log('⚠️ Using first available payment method as fallback:', firstMethod.name);
            }
        }

        const existingPaymentMethod = tab.order?.payment_method;
        if (existingPaymentMethod) {
            const existingMethod = getPaymentMethodByValue(existingPaymentMethod);
            if (existingMethod) {
                setCloseDialogPaymentMethod(existingMethod.value);
            }
        }
        
        const calculatedServiceFee = tab.order?.service_fee ? 
            Number(tab.order.service_fee) : 
            calculateServiceFee(
                Number(tab.order?.total_amount) || 0, 
                defaultServiceFeePercentage
            );
        setCloseDialogServiceFeeValue(calculatedServiceFee);
        
        setCloseTabDialogOpen(true);
    }, [availableClosingStatuses, defaultServiceFeePercentage, paymentMethods, getPaymentMethodByValue, getDefaultPaymentMethod]);

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
        
        setCloseDialogOpen(true);
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

    return <>

    <DASHModal
            variant={"danger"}
            title={translate('tab.modal.close_status.title')}
            content={
                <Box>
                    <Typography sx={{ mb: 3 }}>
                        {translate('tab.modal.close_status.message')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                        <Button
                            variant="contained"
                            color="success"
                            onClick={() => handleConfirmSimpleClose('CLOSED')}
                            sx={{ minWidth: 120 }}
                        >
                            {translate('tab.status.closed')}
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => handleConfirmSimpleClose('CANCELLED')}
                            sx={{ minWidth: 120 }}
                            >
                                {translate('tab.status.cancelled')}
                        </Button>
                    </Box>
                </Box>
            }
            open={simpleCloseDialogOpen}
            showCancelButton={true}
            showConfirmButton={false} // We handle buttons in content
            cancelText={translate('common.cancel')}
            onClose={() => setSimpleCloseDialogOpen(false)}
            onCancel={() => setSimpleCloseDialogOpen(false)}
        />

        {/* Enhanced Payment Modal */}
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

                    {/* Closing Status Selection */}
                    {availableClosingStatuses && availableClosingStatuses.length ? <FormControl fullWidth sx={{ mt: 2 }}>
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
                    </FormControl> :<></>}
                </Box>
            }
            open={closeDialogOpen}
            showCancelButton={true}
            cancelText={translate('common.cancel')}
            onClose={() => { setCloseDialogOpen(false); }}
            onCancel={() => { setCloseDialogOpen(false); }}
            onConfirm={() => {
                setCloseDialogOpen(false);
                if (selectedTab && paymentMethods.length > 0) {
                    updatePayment(selectedTab.id, {
                        payment_method: paymentMethod,
                        service_fee: serviceFeeValue
                    });
                }
            }}
        />

        {/* Enhanced Close Tab Modal with Payment Integration */}
        <DASHModal
            variant={"info"}
            title={translate('tab.modal.close.title')}
            content={
                <Box>
                    <Typography sx={{ mb: 2 }}>
                        {translate('tab.modal.close.confirmation')}
                    </Typography>

                    {/* Closing Status Selection */}
                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {availableClosingStatuses.map((status, index) => (
                            <Box
                                key={status.value}
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    position: 'relative',
                                    '&:not(:last-child)::after': {
                                        content: '""',
                                        position: 'absolute',
                                        right: '-50%',
                                        top: '20px',
                                        width: '100%',
                                        height: '2px',
                                        backgroundColor: 'grey.300',
                                        zIndex: 0
                                    }
                                }}
                            >
                                <Radio
                                    checked={closingStatus === status.value}
                                    onChange={() => setClosingStatus(status.value)}
                                    sx={{
                                        backgroundColor: 'background.paper',
                                        zIndex: 1
                                    }}
                                />
                                <Typography variant="caption" sx={{ textAlign: 'center', mt: 1 }}>
                                    {translate(`tab.status.${status.value.toLowerCase()}`)}
                                </Typography>
                            </Box>
                        ))}
                    </Box>

                    {/* Payment Options */}
                    <Box sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2 }}>
                            {translate('tab.modal.payment.details')}
                        </Typography>

                        <TextField
                            label={translate('tab.modal.payment.tip')}
                            fullWidth
                            type="number"
                            value={closeDialogServiceFeeValue}
                            onChange={(e) => {
                                setCloseDialogServiceFeeValue(Number(e.target.value))
                            }}
                            sx={{ mb: 2 }}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setCloseDialogServiceFeeValue(0)}
                                            >
                                                <Clear />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />

                        <PaymentMethodSelector
                            value={closeDialogPaymentMethod}
                            onChange={setCloseDialogPaymentMethod}
                        />

                        {/* Show deferred payment info if applicable */}
                        {(() => {
                            const selectedMethod = getPaymentMethodByValue(closeDialogPaymentMethod);
                            return selectedMethod && isPaymentMethodDeferred(selectedMethod) ? (
                                <Box sx={{ mt: 2, p: 1, backgroundColor: 'info.light', borderRadius: 1 }}>
                                    <Typography variant="caption" color="info.contrastText">
                                        {translate('tab.payment.deferred_info')}
                                    </Typography>
                                </Box>
                            ) : null;
                        })()}
                    </Box>
                </Box>
            }
            open={closeTabDialogOpen}
            showCancelButton={true}
            cancelText={translate('common.cancel')}
            onClose={() => { setCloseTabDialogOpen(false); }}
            onCancel={() => { setCloseTabDialogOpen(false); }}
            onConfirm={() => {
                setCloseTabDialogOpen(false);
                if (selectedTab && paymentMethods.length > 0) {
                    const paymentData = {
                        payment_method: closeDialogPaymentMethod,
                        service_fee: closeDialogServiceFeeValue
                    };
                    closeTabWithPayment(selectedTab.id, closingStatus, paymentData);
                }
            }}
        />

        <WithListContext render={({ isPending, data }) => {
            // Update our local list data when the data from the context changes
            useEffect(() => {
                if (data) {
                    setListData(data);
                }
            }, [data]);

            // Determine items per page based on screen size (for both modes)
            const itemsPerPage = isXs ? TABS_CAROUSEL_CONFIG.itemsPerPageXs! :
                                 isSm ? TABS_CAROUSEL_CONFIG.itemsPerPageSm! :
                                 isMd ? TABS_CAROUSEL_CONFIG.itemsPerPageMd! :
                                 isLg ? TABS_CAROUSEL_CONFIG.itemsPerPageLg! :
                                 TABS_CAROUSEL_CONFIG.itemsPerPageXl!;
            
            const gap = TABS_CAROUSEL_CONFIG.gap!;
            const totalGaps = (itemsPerPage - 1) * gap;
            const itemWidthCalc = `calc((100% - ${totalGaps}px) / ${itemsPerPage})`;

            // Use draggable carousel only if scrollMethod is 'dragging_scroll'
            const carousel = scrollMethod === 'dragging_scroll' 
                ? useDraggableCarousel<ITab>(listData || [], TABS_CAROUSEL_CONFIG)
                : null;

            // Browser scroll mode rendering
            if (scrollMethod === 'browser_scroll') {
                return (
                    <Box sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}>
                        {/* Add the Queue Status Indicator component */}
                        <QueueStatusIndicator queueSize={queueSize} isProcessing={isProcessing} />

                        <Box
                            sx={{
                                display: 'flex',
                                overflowX: 'auto',
                                overflowY: 'hidden',
                                gap: `${gap}px`,
                                padding: '8px',
                                flexGrow: 1,
                                '&::-webkit-scrollbar': {
                                    height: '8px',
                                },
                                '&::-webkit-scrollbar-track': {
                                    backgroundColor: 'rgba(0,0,0,0.05)',
                                    borderRadius: '4px',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    backgroundColor: 'rgba(0,0,0,0.2)',
                                    borderRadius: '4px',
                                    '&:hover': {
                                        backgroundColor: 'rgba(0,0,0,0.3)',
                                    },
                                },
                            }}
                        >
                            {(listData || []).map((record: ITab) => {
                                const nextStatus = getNextStatus(record.status);
                                const nextStatusLabel = nextStatus ? translate(`tab.action.${nextStatus.toLowerCase()}`) : null;

                                return (
                                    <Box
                                        key={record.id}
                                        sx={{
                                            flex: `0 0 ${itemWidthCalc}`,
                                            minWidth: itemWidthCalc,
                                            height: '100%',
                                        }}
                                    >
                                        <TabListItem
                                            record={record}
                                            resourceConfig={resourceConfig}
                                            statusLabel={statusLabel}
                                            translate={translate}
                                            onClose={(tab: ITab) => handleOpenCloseDialog(tab)}
                                            onSimpleClose={(tab: ITab) => handleSimpleClose(tab)}
                                            onPrint={(id: number) => printTab(id)}
                                            onDownload={(id: number) => downloadTab(id)}
                                            onPayment={(tab: ITab) => handleOpenPaymentDialog(tab)}
                                            onStatusUpdate={(id: number, status: string) => queueStatusUpdate(id, status)}
                                            removeTabFromList={removeTabFromList}
                                        />
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>
                );
            }

            // Dragging scroll mode rendering (original implementation)
            return (
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    {/* Add the Queue Status Indicator component */}
                    <QueueStatusIndicator queueSize={queueSize} isProcessing={isProcessing} />

                    {/* Swipeable Container */}
                    <Box
                        ref={carousel.containerRef}
                        sx={{
                            flexGrow: 1,
                            overflow: 'hidden',
                            position: 'relative',
                            cursor: carousel.isDragging ? 'grabbing' : 'grab',
                            userSelect: 'none',
                            touchAction: 'pan-y pinch-zoom',
                        }}
                        onTouchStart={carousel.handleTouchStart}
                        onTouchMove={carousel.handleTouchMove}
                        onTouchEnd={carousel.handleTouchEnd}
                        onMouseDown={carousel.handleMouseDown}
                        onMouseMove={carousel.handleMouseMove}
                        onMouseUp={carousel.handleMouseUp}
                        onMouseLeave={carousel.handleMouseLeave}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                height: '100%',
                                transform: `translateX(calc(-${carousel.currentPage * 100}% + ${carousel.translateX}px))`,
                                transition: carousel.isDragging ? 'none' : 'transform 0.3s ease-out',
                            }}
                        >
                            {carousel.pages.map((pageItems, pageIndex) => (
                                <Box
                                    key={pageIndex}
                                    sx={{
                                        flex: '0 0 100%',
                                        minWidth: 0,
                                        height: '100%',
                                        px: `${carousel.gap}px`,
                                        py: 1,
                                        display: 'flex',
                                        gap: `${carousel.gap}px`,
                                        boxSizing: 'border-box',
                                    }}
                                >
                                    {pageItems.map((record: ITab) => {
                                        const nextStatus = getNextStatus(record.status);
                                        const nextStatusLabel = nextStatus ? translate(`tab.action.${nextStatus.toLowerCase()}`) : null;

                                        return (
                                            <Box
                                                key={record.id}
                                                sx={{
                                                    flex: `0 0 ${itemWidthCalc}`,
                                                    width: itemWidthCalc,
                                                    minWidth: 0,
                                                    height: '100%',
                                                }}
                                            >
                                                
                                                <TabListItem
                                                    record={record}
                                                    resourceConfig={resourceConfig}
                                                    statusLabel={statusLabel}
                                                    translate={translate}
                                                    onClose={(tab: ITab) => handleOpenCloseDialog(tab)}
                                                    onSimpleClose={(tab: ITab) => handleSimpleClose(tab)}
                                                    onPrint={(id: number) => printTab(id)}
                                                    onDownload={(id: number) => downloadTab(id)}
                                                    onPayment={(tab: ITab) => handleOpenPaymentDialog(tab)}
                                                    onStatusUpdate={(id: number, status: string) => queueStatusUpdate(id, status)}
                                                    removeTabFromList={removeTabFromList}
                                                />
                                            </Box>
                                        );
                                    })}
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    {/* Side Navigation Arrows */}
                    <IconButton
                        onClick={carousel.scrollPrev}
                        disabled={!carousel.canScrollPrev || carousel.isAnimating}
                        sx={{
                            position: 'absolute',
                            left: 4,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            height: 80,
                            width: 48,
                            borderRadius: '0 16px 16px 0',
                            backgroundColor: 'primary.main',
                            color: 'primary.contrastText',
                            opacity: carousel.canScrollPrev ? 0.9 : 0,
                            pointerEvents: carousel.canScrollPrev ? 'auto' : 'none',
                            transition: 'opacity 0.2s',
                            '&:hover': { backgroundColor: 'primary.dark', opacity: 1 },
                            boxShadow: 3,
                            zIndex: 10,
                        }}
                    >
                        <ChevronLeftIcon sx={{ fontSize: 32 }} />
                    </IconButton>

                    <IconButton
                        onClick={carousel.scrollNext}
                        disabled={!carousel.canScrollNext || carousel.isAnimating}
                        sx={{
                            position: 'absolute',
                            right: 4,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            height: 80,
                            width: 48,
                            borderRadius: '16px 0 0 16px',
                            backgroundColor: 'primary.main',
                            color: 'primary.contrastText',
                            opacity: carousel.canScrollNext ? 0.9 : 0,
                            pointerEvents: carousel.canScrollNext ? 'auto' : 'none',
                            transition: 'opacity 0.2s',
                            '&:hover': { backgroundColor: 'primary.dark', opacity: 1 },
                            boxShadow: 3,
                            zIndex: 10,
                        }}
                    >
                        <ChevronRightIcon sx={{ fontSize: 32 }} />
                    </IconButton>

                    {/* Bottom Centered Pagination */}
                    {carousel.totalPages > 1 && (
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                py: 1.5,
                                borderTop: 1,
                                borderColor: 'divider',
                                backgroundColor: 'background.paper',
                            }}
                        >
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                {carousel.pages.map((_, index) => (
                                    <Box
                                        key={index}
                                        onClick={() => carousel.scrollTo(index)}
                                        sx={{
                                            height: 12,
                                            width: index === carousel.currentPage ? 32 : 12,
                                            borderRadius: 6,
                                            backgroundColor: index === carousel.currentPage ? 'primary.main' : 'action.disabled',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                backgroundColor: index === carousel.currentPage ? 'primary.main' : 'action.hover',
                                            },
                                        }}
                                    />
                                ))}
                            </Box>
                        </Box>
                    )}
                </Box>
            );
        }} />
    </>
}

export default KitchenTabsList;
