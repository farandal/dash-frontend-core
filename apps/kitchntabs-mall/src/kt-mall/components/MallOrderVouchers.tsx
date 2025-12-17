import React, { useState, useCallback } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    CircularProgress,
    IconButton,
    Divider,
    Alert,
    Chip,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import {
    Download as DownloadIcon,
    Receipt as ReceiptIcon,
    Store as StoreIcon,
    Visibility as ViewIcon,
    PictureAsPdf as PdfIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import { useRecordContext } from 'react-admin';
import { useAxios } from 'dash-axios-hook';
import { saveAs } from 'file-saver';
import { dashStorage } from 'dash-utils';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import PDFViewer from '../../components/misc/PDFViewer';

/**
 * Interface for tenant tab data from the record
 */
interface TenantTab {
    id: string;
    tenant_id: string;
    tenant_name: string;
    status: string;
    status_localized: string;
    progress: number;
    sale_note_path?: string;
    date_created: string;
    date_confirmed?: string;
    date_in_preparation?: string;
    date_prepared?: string;
    date_delivered?: string;
    date_closed?: string;
}

/**
 * Interface for the main tab record
 */
interface MallTabRecord {
    id: string;
    tenant_id: string;
    status: string;
    sale_note_path?: string;
    is_master_tab: boolean;
    tenant_tabs?: TenantTab[];
    tenant?: {
        id: number;
        name: string;
    };
}

/**
 * Interface for voucher data
 */
interface VoucherData {
    tabId: string;
    tenantId: number;
    tenantName: string;
    saleNotePath: string | null;
    pdfUrl: string | null;
    loading: boolean;
    error: string | null;
    isViewing: boolean;
}

/**
 * MallOrderVouchers - Component for displaying and downloading PDF vouchers
 * for mall orders (master tab and all tenant tabs)
 * 
 * Features:
 * - Displays PDFs inline as soon as they are available
 * - Tabbed interface for master and each tenant tab
 * - Download button for each voucher
 * - No additional API calls - uses data from record
 */
const MallOrderVouchers: React.FC<IDashAutoAdminCustomFieldComponent> = ({ method }) => {
    const record = useRecordContext<MallTabRecord>();
    const axios = useAxios();
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    
    const [vouchers, setVouchers] = useState<VoucherData[]>([]);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [viewingVoucherIndex, setViewingVoucherIndex] = useState<number | null>(null);

    /**
     * Get mall session hash from localStorage
     */
    const getMallSessionHash = useCallback(() => {
        return dashStorage.getItem('mall-session-hash') || '';
    }, []);

    /**
     * Build the API endpoint for downloading a sale note
     */
    const buildDownloadUrl = useCallback((tabId: string) => {
        const mallSessionHash = getMallSessionHash();
        return `public/mall/tab/${tabId}/download-sale-note?mall_session=${mallSessionHash}&regenerate=true`;
    }, [getMallSessionHash]);

    /**
     * Build vouchers list from record data
     */
    const buildVouchersList = useCallback(() => {
        if (!record) return [];

        const vouchersList: VoucherData[] = [];

        // Add tenant tabs vouchers only (no master voucher)
        if (record.tenant_tabs && Array.isArray(record.tenant_tabs)) {
            record.tenant_tabs.forEach((tenantTab) => {
                vouchersList.push({
                    tabId: tenantTab.id,
                    tenantId: tenantTab.tenant_id,
                    tenantName: tenantTab.tenant_name || `Tienda ${tenantTab.tenant_id}`,
                    saleNotePath: tenantTab.sale_note_path || null,
                    pdfUrl: null,
                    loading: false,
                    error: null,
                    isViewing: false,
                });
            });
        }

        return vouchersList;
    }, [record]);

    /**
     * Load PDF for a specific voucher using the tab ID
     */
    const loadPdf = useCallback(async (index: number, tabId: string) => {
        try {
            const downloadUrl = buildDownloadUrl(tabId);
            const response = await axios.get(downloadUrl, {
                responseType: 'blob',
            });

            const file = new Blob([response.data], {
                type: 'application/pdf',
            });

            const fileURL = URL.createObjectURL(file);

            setVouchers((prev) => {
                const updated = [...prev];
                if (updated[index]) {
                    updated[index] = {
                        ...updated[index],
                        pdfUrl: fileURL,
                        loading: false,
                        error: null,
                    };
                }
                return updated;
            });
        } catch (error: any) {
            console.error('Error loading PDF:', error);
            setVouchers((prev) => {
                const updated = [...prev];
                if (updated[index]) {
                    updated[index] = {
                        ...updated[index],
                        loading: false,
                        error: 'Error al cargar el documento',
                    };
                }
                return updated;
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Download a specific voucher
     */
    const downloadVoucher = useCallback(async (voucher: VoucherData) => {
        try {
            const downloadUrl = buildDownloadUrl(voucher.tabId);
            const response = await axios.get(downloadUrl, {
                responseType: 'blob',
            });

            const file = new Blob([response.data], {
                type: 'application/pdf',
            });

            const fileName = `voucher-${voucher.tenantName.toLowerCase().replace(/\s+/g, '-')}-${voucher.tabId}.pdf`;
            saveAs(file, fileName);
        } catch (error) {
            console.error('Error downloading PDF:', error);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [buildDownloadUrl]);

    /**
     * View a specific voucher - loads PDF and opens dialog
     */
    const viewVoucher = useCallback(async (index: number) => {
        const voucher = vouchers[index];
        if (!voucher) return;

        // Set loading state for this voucher
        setVouchers((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], loading: true, error: null };
            return updated;
        });

        setViewingVoucherIndex(index);
        setViewDialogOpen(true);

        // Load the PDF
        await loadPdf(index, voucher.tabId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [vouchers, loadPdf]);

    /**
     * Close view dialog
     */
    const closeViewDialog = useCallback(() => {
        setViewDialogOpen(false);
        setViewingVoucherIndex(null);
    }, []);

    /**
     * Initialize vouchers from record (without loading PDFs)
     */
    React.useEffect(() => {
        const vouchersList = buildVouchersList();
        if (vouchersList.length > 0) {
            setVouchers(vouchersList);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [record?.id]);

    // Only show in edit/show modes
    if (method === 'create' || method === 'list') {
        return null;
    }

    if (!record) {
        return (
            <Box sx={{ p: 2 }}>
                <CircularProgress size={24} />
            </Box>
        );
    }

    if (vouchers.length === 0) {
        return (
            <Alert severity="info" sx={{ m: 2 }}>
                No hay vouchers disponibles para este pedido.
            </Alert>
        );
    }

    return (
        <Box sx={{ width: '100%', p: 1 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, backgroundColor:'none' }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ReceiptIcon /> Vouchers del Pedido
                </Typography>
            </Box>

            {/* Voucher cards - one per restaurant */}
            <Stack spacing={2}>
                {vouchers.map((voucher, index) => (
                    <Card sx={{backgroundColor:'none'}} key={voucher.tabId} >
                        <CardContent 
                            sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                py: 2,
                                flexDirection: isSmallScreen ? 'column' : 'row',
                                gap: isSmallScreen ? 2 : 0,
                                alignItems: isSmallScreen ? 'stretch' : 'center',
                            }}
                        >
                            {/* Left side - PDF icon and restaurant info */}
                            <Stack direction="row" spacing={2} alignItems="center">
                                <PdfIcon 
                                    sx={{ 
                                        fontSize: isSmallScreen ? 32 : 48, 
                                        color: 'error.main' 
                                    }} 
                                />
                                <Box>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <StoreIcon fontSize="small" color="action" />
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {voucher.tenantName}
                                        </Typography>
                                    </Stack>
                                    <Typography variant="body2" color="text.secondary">
                                        Voucher #{voucher.tabId}
                                    </Typography>
                                </Box>
                            </Stack>

                            {/* Right side - Action buttons */}
                            <Stack 
                                direction="row" 
                                spacing={1}
                                sx={{
                                    width: isSmallScreen ? '100%' : 'auto',
                                    justifyContent: isSmallScreen ? 'center' : 'flex-end',
                                }}
                            >
                                {isSmallScreen ? (
                                    // Small screens: Circular icon buttons
                                    <>
                                        <IconButton
                                            color="primary"
                                            size="small"
                                            onClick={() => viewVoucher(index)}
                                            disabled={voucher.loading && viewingVoucherIndex === index}
                                            sx={{
                                                bgcolor: 'primary.main',
                                                color: 'white',
                                                '&:hover': {
                                                    bgcolor: 'primary.dark',
                                                },
                                                width: 36,
                                                height: 36,
                                            }}
                                        >
                                            {voucher.loading && viewingVoucherIndex === index ? (
                                                <CircularProgress size={16} color="inherit" />
                                            ) : (
                                                <ViewIcon fontSize="small" />
                                            )}
                                        </IconButton>
                                        <IconButton
                                            color="primary"
                                            size="small"
                                            onClick={() => downloadVoucher(voucher)}
                                            sx={{
                                                bgcolor: 'success.main',
                                                color: 'white',
                                                '&:hover': {
                                                    bgcolor: 'success.dark',
                                                },
                                                width: 36,
                                                height: 36,
                                            }}
                                        >
                                            <DownloadIcon fontSize="small" />
                                        </IconButton>
                                    </>
                                ) : (
                                    // Large screens: Full buttons with text
                                    <>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={voucher.loading && viewingVoucherIndex === index ? <CircularProgress size={16} /> : <ViewIcon />}
                                            onClick={() => viewVoucher(index)}
                                            disabled={voucher.loading && viewingVoucherIndex === index}
                                        >
                                            Ver
                                        </Button>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            startIcon={<DownloadIcon />}
                                            onClick={() => downloadVoucher(voucher)}
                                        >
                                            Descargar
                                        </Button>
                                    </>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>
                ))}
            </Stack>

            {/* Download all button when multiple vouchers */}
            {vouchers.length > 1 && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                    {isSmallScreen ? (
                        <IconButton
                            color="primary"
                            size="large"
                            onClick={() => {
                                vouchers.forEach((v) => {
                                    downloadVoucher(v);
                                });
                            }}
                            sx={{
                                bgcolor: 'primary.main',
                                color: 'white',
                                '&:hover': {
                                    bgcolor: 'primary.dark',
                                },
                                width: 48,
                                height: 48,
                            }}
                            title="Descargar todos los vouchers"
                        >
                            <DownloadIcon />
                        </IconButton>
                    ) : (
                        <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={() => {
                                vouchers.forEach((v) => {
                                    downloadVoucher(v);
                                });
                            }}
                        >
                            Descargar Todos los Vouchers
                        </Button>
                    )}
                </Box>
            )}

            {/* View PDF Dialog */}
            <Dialog
                open={viewDialogOpen}
                onClose={closeViewDialog}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: { minHeight: '80vh' }
                }}
            >
                {viewingVoucherIndex !== null && vouchers[viewingVoucherIndex] && (
                    <>
                        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <PdfIcon color="error" />
                                <Typography variant="h6">
                                    Voucher - {vouchers[viewingVoucherIndex].tenantName}
                                </Typography>
                            </Stack>
                            <IconButton onClick={closeViewDialog}>
                                <CloseIcon />
                            </IconButton>
                        </DialogTitle>
                        <Divider />
                        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
                            {vouchers[viewingVoucherIndex].loading ? (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        minHeight: 400,
                                        flexDirection: 'column',
                                        gap: 2,
                                    }}
                                >
                                    <CircularProgress />
                                    <Typography variant="body2" color="text.secondary">
                                        Cargando voucher...
                                    </Typography>
                                </Box>
                            ) : vouchers[viewingVoucherIndex].error ? (
                                <Alert severity="warning" sx={{ m: 2 }}>
                                    {vouchers[viewingVoucherIndex].error}
                                </Alert>
                            ) : vouchers[viewingVoucherIndex].pdfUrl ? (
                                <Box sx={{ flex: 1, minHeight: '60vh', overflow: 'auto' }}>
                                    <PDFViewer file={vouchers[viewingVoucherIndex].pdfUrl!} />
                                </Box>
                            ) : (
                                <Alert severity="info" sx={{ m: 2 }}>
                                    El voucher no está disponible.
                                </Alert>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={closeViewDialog}>
                                Cerrar
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<DownloadIcon />}
                                onClick={() => downloadVoucher(vouchers[viewingVoucherIndex])}
                            >
                                Descargar
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
};

export default MallOrderVouchers;
