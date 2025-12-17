// TabListItem.tsx
import React, { useState, useEffect, memo, useMemo, useCallback } from 'react';
import { 
    Box, 
    Card, 
    CardContent, 
    CardHeader, 
    Chip, 
    IconButton, 
    ButtonGroup, 
    Typography, 
    Button,
    Stack,
    ListItemAvatar,
    Avatar,
    CircularProgress
} from "@mui/material";
import { ArrowForward, AccessTime, Fastfood, AttachMoney } from "@mui/icons-material";
import { useTranslate } from 'react-admin';
import { ITab } from '../interfaces/ITab';
import TabTimerClock from '../Misc/TabTimerClock';
import TabActionButtonsField from '../tab2/components/TabActionButtonsField';
import { formatPrice, getProductImage } from '../helpers/product';

interface TabListItemProps {
    record: ITab;
    resourceConfig: any;
    statusLabel: Record<string, string>;
    translate: (key: string) => string;
    onClose: (tab: ITab) => void; // This is for close with payment
    onSimpleClose?: (tab: ITab) => void; // Add this new optional prop for simple close
    onPrint: (id: number) => void;
    onDownload: (id: number) => void;
    onPayment: (tab: ITab) => void;
    onStatusUpdate: (id: number, status: string) => void;
    removeTabFromList: (id: number) => void;
}

const TabListItem = memo<TabListItemProps>(({
    record,
    resourceConfig,
    statusLabel,
    translate,
    onClose,
    onSimpleClose, // Add this
    onPrint,
    onDownload,
    onPayment,
    onStatusUpdate,
    removeTabFromList
}) => {
    // Add loading state
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    // Memoize the next status calculation
    const getNextStatus = useCallback((currentStatus: string) => {
        const nextStatusMap = {
            'CREATED': 'CONFIRMED',
            'CONFIRMED': 'IN_PREPARATION',
            'IN_PREPARATION': 'PREPARED',
            'PREPARED': 'DELIVERED',
            'DELIVERED': 'CLOSED'
        };
        return nextStatusMap[currentStatus];
    }, []);

    const nextStatus = useMemo(() => getNextStatus(record.status), [getNextStatus, record.status]);
    const nextStatusLabel = useMemo(() => 
        nextStatus ? translate(`tab.action.${nextStatus.toLowerCase()}`) : null,
        [nextStatus, translate]
    );

    // Memoize blinking condition
    const shouldBlink = useMemo(() => 
        (record.order?.marketplace_info?.system_marketplace?.name?.toLowerCase().includes('uber') && record.status === 'CREATED') ||
        (record.order?.marketplace_info?.system_marketplace?.name?.toLowerCase().includes('jumpseller') && record.status === 'CONFIRMED'),
        [record.order?.marketplace_info?.system_marketplace?.name, record.status]
    );

    const [isBlinking, setIsBlinking] = useState(shouldBlink);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (shouldBlink) {
            interval = setInterval(() => {
                setIsBlinking(prev => !prev);
            }, 1000);
        } else {
            setIsBlinking(false);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [shouldBlink]);

    // Memoize card style - includes opacity when updating status
    const cardStyle = useMemo(() => ({ 
        padding: '0px',
        position: 'relative' as const, 
        overflow: 'visible' as const,
        backgroundColor: isBlinking ? '#90EE90' : 'inherit',
        transition: 'background-color 0.5s ease, opacity 0.3s ease',
        height: '100%',
        display: 'flex',
        flexDirection: 'column' as const,
        opacity: isUpdatingStatus ? 0.6 : 1,
        pointerEvents: isUpdatingStatus ? 'none' as const : 'auto' as const,
    }), [isBlinking, isUpdatingStatus]);

     // Create a custom close handler that uses onSimpleClose if available
    const handleTabClose = useCallback((tabId: number) => {
        if (onSimpleClose) {
            onSimpleClose(record);
        } else {
            // Fallback to the original close behavior
            onClose(record);
        }
    }, [onSimpleClose, onClose, record]);

    // Memoize callback handlers to prevent re-creation
    const handleStatusUpdate = useCallback(async () => {
        if (nextStatus) {
            setIsUpdatingStatus(true);
            try {
                if (nextStatus === 'CLOSED') {
                    removeTabFromList(record.id);
                }
                await onStatusUpdate(record.id, nextStatus);
            } catch (error) {
                console.error('Failed to update status:', error);
            } finally {
                setIsUpdatingStatus(false);
            }
        }
    }, [nextStatus, onStatusUpdate, removeTabFromList, record.id]);

        // Memoize the status date calculation
    const statusDate = useMemo(() => {
        const dateMap = {
            'CREATED': record.date_created,
            'CONFIRMED': record.date_confirmed,
            'IN_PREPARATION': record.date_in_preparation,
            'PREPARED': record.date_prepared,
            'DELIVERED': record.date_delivered,
            'CLOSED': record.date_closed
        };
        return dateMap[record.status] || record.date_created;
    }, [record.status, record.date_created, record.date_confirmed, record.date_in_preparation, record.date_prepared, record.date_delivered, record.date_closed]);

    // Memoize the formatted date string
    const formattedStatusDate = useMemo(() => 
        new Date(statusDate).toLocaleString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit', 
            day: '2-digit', 
            month: '2-digit' 
        }),
        [statusDate]
    );

    // Memoize the status chip color
    const statusChipColor = useMemo(() => {
        const colorMap = {
            'CREATED': 'default' as const,
            'CONFIRMED': 'primary' as const,
            'IN_PREPARATION': 'warning' as const,
            'PREPARED': 'info' as const,
            'DELIVERED': 'success' as const,
            'CLOSED': 'secondary' as const
        };
        return colorMap[record.status] || 'default' as const;
    }, [record.status]);

    return (
        <Card sx={cardStyle} className="dash-tab-staff">
      
            <Chip label={`#${String(record.id).slice(-6)}`} sx={{ position: 'absolute', top: 4, left: 4}} />                    

            {/* Timer in top right corner */}
            <Box sx={{ position: 'absolute', top: 4, right: 4, alignItems: 'center' }}>
                {(['CONFIRMED', 'IN_PREPARATION'].includes(record.status)) && (
                    <TabTimerClock createdAt={record.date_confirmed} />
                )}
            </Box>

            <CardHeader
                sx={{ pb: 1 }}
                title={
                    <>
                        {record.order?.marketplace_info?.system_marketplace?.icon_url && (
                            <Box sx={{ mt: 1 }}>
                                <img 
                                    src={record.order.marketplace_info.system_marketplace.icon_url}
                                    alt={record.order.marketplace_info.system_marketplace.name} 
                                    style={{ height: 24 }}
                                />
                            </Box>
                        )}
                    </>
                }
            />
            
            <CardContent sx={{ pt: 0, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Stack spacing={1} sx={{ flex: 1, overflow: 'hidden' }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        
                        <TabActionButtonsField
                            method="list"
                            attribute={null}
                            resourceConfig={resourceConfig}
                            record={record}
                            onTabClosed={removeTabFromList}
                            showPaymentButton={true}
                            showCloseButton={true}
                            showView={true}
                            showEdit={true}
                            showPrint={true}
                            showDownload={true}
                            size="small"
                            // Pass the custom close handler
                            customCloseHandler={handleTabClose}
                        />
                    </Box>
                
                        {!(['CREATED'].includes(record.status)) && (
                             <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip
                                label={`${statusLabel[record.status]} - ${formattedStatusDate}`}
                                size="small"
                                color={statusChipColor}
                            />
                              </Box>
                        )}
                  

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, overflow: 'auto', paddingBottom:"90px"}}>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
                            {record?.note?.length > 50 ? `${record.note.slice(0, 50)}...` : record?.note}
                        </Typography>
                        {record?.order?.items?.map((item) => (
                            <Box key={item.id} sx={{ 
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 2,
                                borderTop: '1px dashed rgba(0, 0, 0, 0.5)',
                                
                                padding: '4px 0'
                            }}>
                                
                                <Avatar
                                    src={getProductImage(item.product)}
                                    alt={item.product_name}
                                    sx={{ width: 30, height: 30 }}
                                >
                                    {!getProductImage(item.product) && <Fastfood />}
                                </Avatar>

                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
                                        x{item.quantity} - {item.product_name}
                                       
                                    </Typography>
                                    {item.note && (
                                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
                                            {translate('tab.list.item.note')}: {item.note}
                                        </Typography>
                                    )}
                                    {item.modifiers && item.modifiers.length > 0 && (
                                        <Box>
                                            {item.modifiers.map((modifier, modIndex) => (
                                                <Typography sx={{ fontSize: '0.8rem', fontWeight: 'bold' }} key={modIndex}>
                                                    {modifier.modifier_option?.name || `${translate('tab.list.item.option')} ${modIndex + 1}`}
                                                </Typography>
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        ))}
                    </Box>
                 
                    {/* Bottom fixed section */}
                    <Box sx={{ 
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        //bgcolor: 'background.paper',
                        borderTop: '1px solid #ddd',
                        p: 2
                    }}>
                        <Box sx={{ 
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 2
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar
                                    sx={{
                                        bgcolor: record.order.is_paid ? 'success.main' : 'error.main',
                                        width: 30,
                                        height: 30,
                                    }}
                                >
                                    <AttachMoney sx={{ color: 'white', fontSize: 24 }} />
                                </Avatar>
                                <Typography sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                                    {formatPrice(record.order.total_amount)}
                                </Typography>
                            </Box>
                        </Box>

                        {nextStatusLabel && (
                            <Button
                                variant="contained"
                                size="small"
                                fullWidth
                                onClick={handleStatusUpdate}
                                endIcon={!isUpdatingStatus && <ArrowForward />}
                                disabled={isUpdatingStatus}
                            >
                                {isUpdatingStatus ? (
                                    <CircularProgress size={20} color="inherit" />
                                ) : (
                                    nextStatusLabel
                                )}
                            </Button>
                        )}
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
});


TabListItem.displayName = 'TabListItem';

export default TabListItem;
