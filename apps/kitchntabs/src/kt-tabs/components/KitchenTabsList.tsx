import { IDashAutoAdminCustomFieldComponent, IDashAutoAdminDataGrid } from "dash-auto-admin";
import { ITab } from "./interfaces/ITab";

import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Chip,
    IconButton,
    Button,
    Typography,
    CircularProgress,
    ButtonGroup,
    Paper} from "@mui/material";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import React, { useContext, useEffect, useState } from "react";
import { useDataProvider, useGetIdentity, useGetOne, useRefresh, useTranslate, useUpdate, WithListContext } from "react-admin";
import PrintIcon from '@mui/icons-material/Print';

import DashResourceButton from "dash-auto-admin/src/toolbar/buttons/DashResourceButton";
import { toast } from 'react-toastify';
import { useAxios } from 'dash-axios-hook';
import { ArrowForward } from "@mui/icons-material";
import LaravelEchoContext from 'dash-admin/src/contexts/com/LaravelEchoContext';
import type { ILaravelEchoContext } from 'dash-admin/src/contexts/com/LaravelEchoContext';
import type { IDashNotificationPayloadBase as INotificationPayload } from 'dash-admin/src/interfaces/communication/INotification';
import { useAuthContext } from 'dash-admin/src/contexts/auth/AuthContext';
import { ITabStatusChange } from "./interfaces/ITabNotificationFormat";

import { ImagePlaceHolder as ImagePlaceHolder } from 'kt-utils';
import TabTimerClock from "./Misc/TabTimerClock";
import { useDraggableCarousel, UseDraggableCarouselOptions } from "./hooks/useDraggableCarousel";

/** Carousel configuration for KitchenTabsList - can be customized */
const KITCHEN_CAROUSEL_CONFIG: UseDraggableCarouselOptions = {
    itemsPerPageXs: 2,
    itemsPerPageSm: 4,
    itemsPerPageMd: 4,
    itemsPerPageLg: 6,
    itemsPerPageXl: 8,
    gap: 8,
};

const placeholder = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="

// Create a new component for the timer

const OrderProductsView: React.FC<IDashAutoAdminCustomFieldComponent> = ({ record }) => {
    const tab: ITab = record as ITab;

    const calculateModifierTotal = (modifiers) => {
        if (!modifiers || !Array.isArray(modifiers)) return 0;
        return modifiers.reduce((total, modifier) => {
            return total + (parseFloat(modifier.price_adjustment) || 0);
        }, 0);
    };

    const { data: tabData } = useGetOne('tab/tab', { id: tab.id })

    if (!tabData) return <CircularProgress />;
    return (
        <div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                    {tabData?.order?.items?.map((item) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={{ width: '100px', verticalAlign: 'top' }}>

                                <ImagePlaceHolder
                                    style={{ width: 80 }}

                                    loading={<CircularProgress />}
                                    placeHolder={placeholder}
                                    src={item.product.image_url}
                                />

                            </td>
                            <td style={{  }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>x{item.quantity} - {item.product.name}</div>
                               
                                {item.note && <div>Nota: {item.note}</div>}
                                {item.modifiers && item.modifiers.length > 0 && (
                                    <div>
                                        {item.modifiers.map((modifier, modIndex) => (
                                            <div key={modIndex}>
                                                {modifier.modifier_option?.name || `Opción ${modIndex + 1}`}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}



const KitchenTabsList: React.FC<IDashAutoAdminDataGrid> = ({ resourceConfig }) => {

    //const { identity, isLoading: identityLoading } = useGetIdentity();
    const { user } = useAuthContext();
    const { events, lastEvent } = useContext<ILaravelEchoContext>(LaravelEchoContext);
    const refresh = useRefresh();
    const dataProvider = useDataProvider();
    const translate = useTranslate();

    // Track which tabs are currently updating their status
    const [updatingTabs, setUpdatingTabs] = useState<Set<number>>(new Set());

    const [statusLabel, setStatusLabel] = useState({
        'CREATED': 'Creado',
        'CONFIRMED': 'Confirmado',
        'IN_PREPARATION': 'En preparación',
        'PREPARED': 'Preparado',
        'DELIVERED': 'Entregado',
        'CLOSED': 'Cerrado'
    });


    const axios = useAxios();

    const [update] = useUpdate();

    const statusLabels = {
        'CREATED': 'Creado',
        'CONFIRMED': 'Confirmado',
        'IN_PREPARATION': 'En preparación',
        'PREPARED': 'Preparado',
        'DELIVERED': 'Entregado',
        'CLOSED': 'Cerrado',
        'CANCELLED': 'Cancelado'
    };

    const updateTabStatus = async (id: number, status: string) => {
        // Add tab to updating set
        setUpdatingTabs(prev => new Set(prev).add(id));
        try {
            await dataProvider.update(`tab/tab`, {
                id: id,
                data: { status },
                previousData: undefined
            });
            refresh();
        } catch (error) {
            console.error('Failed to update tab status:', error);
            showError('Error al actualizar el estado de la orden');
        } finally {
            // Remove tab from updating set
            setUpdatingTabs(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        }
    }

    const getNextStatus = (currentStatus) => {
        const nextStatusMap = {
            'CREATED': 'CONFIRMED',
            'CONFIRMED': 'PREPARED',
            //'CONFIRMED': 'IN_PREPARATION',
            'IN_PREPARATION': 'PREPARED',
            'PREPARED': 'DELIVERED',
            'DELIVERED': 'CLOSED'
        };
        return nextStatusMap[currentStatus];
    }

    const showMessage = (info: string) => {
        toast.info(<>{info}</>, {
            position: 'top-center',
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: false,
            draggable: false,
        });
    };

    const showError = (msg: string) => {
        toast.error(<>{msg}</>, {
            position: 'top-center',
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: false,
            draggable: false,
        });
    };

    useEffect(() => {
        console.log(lastEvent);
        if (lastEvent?.model === "Domain\\App\\Models\\Tab\\Tab" && (lastEvent as INotificationPayload<ITabStatusChange>).data?.type === "tab.status" /*&& (lastEvent as INotificationPayload<ITabStatusChange>).data.user !== identity.id*/) {
            showMessage(`Se ha cambiado el estado de la orden ${(lastEvent as INotificationPayload<ITabStatusChange>).data.old} a ${(lastEvent as INotificationPayload<ITabStatusChange>).data.new}`);
            refresh();
        }
        if (lastEvent?.model === "Domain\\App\\Models\\Tab\\Tab" && (lastEvent as INotificationPayload<ITabStatusChange>).data?.type === "tab.update" /*&& (lastEvent as INotificationPayload<ITabStatusChange>).data.user !== identity.id*/) {

            refresh();
        }
    }, [lastEvent]);

    return <>

        <WithListContext render={({ isPending, data }) => {
            // Use the draggable carousel hook with configurable options
            const carousel = useDraggableCarousel<ITab>((data as ITab[]) || [], KITCHEN_CAROUSEL_CONFIG);
            
            // Calculate item width: (100% - total gaps) / items per page
            const totalGaps = (carousel.itemsPerPage - 1) * carousel.gap;
            const itemWidthCalc = `calc((100% - ${totalGaps}px) / ${carousel.itemsPerPage})`;

            return (
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
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
                                        const nextStatusLabel = statusLabels[nextStatus];
                                        const isUpdating = updatingTabs.has(record.id);

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
                                                <Card 
                                                    className="dash-kitchen-tab" 
                                                    sx={{ 
                                                        p: 1, 
                                                        height: '100%', 
                                                        display: 'flex', 
                                                        flexDirection: 'column',
                                                        opacity: isUpdating ? 0.6 : 1,
                                                        pointerEvents: isUpdating ? 'none' : 'auto',
                                                        transition: 'opacity 0.3s ease',
                                                    }}
                                                >
                                                    
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                                        <CardHeader
                                                            sx={{ p: 0 }}
                                                            title={
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                                                    <Typography variant="h5">{`#${String(record.id).slice(-6)}`}</Typography>
                                                                    <ButtonGroup style={{ alignItems: "center" }} orientation="horizontal" variant="text" size="small">
                                                                        <TabTimerClock createdAt={(record as ITab).date_confirmed} />
                                                                        <DashResourceButton resource={resourceConfig.model} record={record} resourceConfig={resourceConfig} mode={"show"} />
                                                                        <IconButton
                                                                            onClick={async () => {
                                                                                try {
                                                                                    await axios.get(`tab/tab/${record.id}/print?regenerate=true`)
                                                                                    showMessage("Orden enviada a impresión")
                                                                                } catch (error) {
                                                                                    showError(`Error al enviar la orden a imprimir. Por favor, intente nuevamente.`)
                                                                                }
                                                                            }} >
                                                                            <PrintIcon />
                                                                        </IconButton>
                                                                    </ButtonGroup>
                                                                </Box>
                                                            }
                                                        />
                                                        <CardContent sx={{ p: 0, flex: 1, overflow: 'auto' }}>
                                                            {nextStatusLabel &&
                                                                <Button
                                                                    variant="contained"
                                                                    fullWidth
                                                                    sx={{ mb: 2 }}
                                                                    disabled={isUpdating}
                                                                    onClick={() => {
                                                                        if (nextStatus && !isUpdating) {
                                                                            updateTabStatus(record.id, nextStatus);
                                                                        }
                                                                    }}
                                                                >
                                                                    {isUpdating ? (
                                                                        <CircularProgress size={20} color="inherit" />
                                                                    ) : (
                                                                        <>{nextStatusLabel} <ArrowForward /></>
                                                                    )}
                                                                </Button>
                                                            }

                                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                                                                {!(['CREATED'].includes((record as ITab).status)) && (
                                                                    <Chip
                                                                        label={`${statusLabel[(record as ITab).status]} - ${new Date(
                                                                            record.status === 'CREATED' ? record.date_created :
                                                                                record.status === 'CONFIRMED' ? record.date_confirmed! :
                                                                                    record.status === 'IN_PREPARATION' ? record.date_in_preparation! :
                                                                                        record.status === 'PREPARED' ? record.date_prepared! :
                                                                                            record.status === 'DELIVERED' ? record.date_delivered! :
                                                                                                record.status === 'CLOSED' ? record.date_closed! :
                                                                                                    record.date_created
                                                                        ).toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}`}
                                                                        size="small"
                                                                        color={
                                                                            record.status === 'CREATED' ? 'default' :
                                                                                record.status === 'CONFIRMED' ? 'primary' :
                                                                                    record.status === 'IN_PREPARATION' ? 'warning' :
                                                                                        record.status === 'PREPARED' ? 'info' :
                                                                                            record.status === 'DELIVERED' ? 'success' :
                                                                                                record.status === 'CLOSED' ? 'secondary' : 'default'
                                                                        }
                                                                    />
                                                                )}
                                                            </Box>

                                                            <OrderProductsView resourceConfig={resourceConfig} record={record} attribute={undefined} method={"view"} />
                                                        </CardContent>
                                                    </Box>
                                                </Card>
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