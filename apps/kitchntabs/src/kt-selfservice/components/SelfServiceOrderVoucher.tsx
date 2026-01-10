import React, { useState, useCallback } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Drawer,
    IconButton,
    Alert,
    Stack,
    Divider
} from '@mui/material';
import {
    Download as DownloadIcon,
    Receipt as ReceiptIcon,
    Visibility as ViewIcon,
    PictureAsPdf as PdfIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { useRecordContext, useTranslate } from 'react-admin';
import { useAxios } from 'dash-axios-hook';
import { saveAs } from 'file-saver';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import PDFViewer from '../../kt-kiosk/misc/PDFViewer';

/**
 * SelfServiceOrderVoucher
 * 
 * Component for displaying and downloading the voucher/sale note for a self-service order.
 * Simplified version of MallOrderVouchers for single-tenant use.
 */
const SelfServiceOrderVoucher: React.FC<IDashAutoAdminCustomFieldComponent> = () => {
    const record = useRecordContext();
    const translate = useTranslate();
    const axios = useAxios();
    
    const [loading, setLoading] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Get session hash from URL
    const getSessionHash = useCallback(() => {
        const match = window.location.pathname.match(/\/selfservice\/([A-Z0-9]{5,})/i);
        return match ? match[1] : '';
    }, []);

    const buildDownloadUrl = useCallback(() => {
        if (!record?.id) return '';
        const sessionHash = getSessionHash();
        return `public/selfservice/${sessionHash}/tab/${record.id}/download-sale-note?regenerate=true`;
    }, [record?.id, getSessionHash]);

    const loadPdf = useCallback(async () => {
        if (!record?.id) return;
        
        try {
            setLoading(true);
            setError(null);
            
            const downloadUrl = buildDownloadUrl();
            const response = await axios.get(downloadUrl, {
                responseType: 'blob',
            });

            const file = new Blob([response.data], {
                type: 'application/pdf',
            });

            const fileURL = URL.createObjectURL(file);
            setPdfUrl(fileURL);
            setLoading(false);
        } catch (err: any) {
            console.error('Error loading voucher PDF:', err);
            setError(translate('selfservice.voucher.load_error'));
            setLoading(false);
        }
    }, [axios, buildDownloadUrl, record?.id, translate]);

    const handleView = () => {
        setViewDialogOpen(true);
        if (!pdfUrl) {
            loadPdf();
        }
    };

    const handleDownload = async () => {
        try {
            const url = buildDownloadUrl();
            const response = await axios.get(url, {
                responseType: 'blob',
            });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            saveAs(blob, `Voucher_${record?.id || 'order'}.pdf`);
        } catch (err) {
            console.error('Error downloading voucher:', err);
        }
    };

    const handleCloseDrawer = () => {
        setViewDialogOpen(false);
    };

    // Only show if record exists and has an ID
    if (!record || !record.id) return null;

    return (
        <Box sx={{ width: '100%', mb: 2 }}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <PdfIcon color="error" sx={{ fontSize: 32 }} />
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    {translate('selfservice.voucher.title')}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                    #{record.id}
                                </Typography>
                            </Box>
                        </Stack>

                        <Stack direction="row" spacing={1}>
                             <IconButton 
                                size="small" 
                                color="primary" 
                                onClick={handleView}
                                title={translate('common.view', { _: 'Ver' })}
                                sx={{ border: '1px solid', borderColor: 'divider' }}
                            >
                                <ViewIcon />
                            </IconButton>
                            <IconButton 
                                size="small" 
                                color="primary" 
                                onClick={handleDownload}
                                title={translate('common.download', { _: 'Descargar' })}
                                sx={{ border: '1px solid', borderColor: 'divider' }}
                            >
                                <DownloadIcon />
                            </IconButton>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>

            <Drawer
                anchor="right"
                open={viewDialogOpen}
                onClose={handleCloseDrawer}
                PaperProps={{
                    sx: { width: '100%', maxWidth: '100vw', md: { maxWidth: 600 } }
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #eee' }}>
                         <Stack direction="row" spacing={1} alignItems="center">
                            <ReceiptIcon color="primary" />
                            <Typography variant="h6">
                                {translate('selfservice.voucher.dialog_title')} #{record.id}
                            </Typography>
                        </Stack>
                        <IconButton onClick={handleCloseDrawer}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    
                    <Box sx={{ flex: 1, overflow: 'auto', p: 0, bgcolor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
                        {loading ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, p: 4 }}>
                                <CircularProgress size={40} sx={{ mb: 2 }} />
                                <Typography color="text.secondary">
                                    {translate('selfservice.voucher.loading')}
                                </Typography>
                            </Box>
                        ) : error ? (
                            <Box sx={{ p: 3 }}>
                                <Alert severity="error">{error}</Alert>
                                <Button 
                                    variant="outlined" 
                                    onClick={() => loadPdf()} 
                                    sx={{ mt: 2 }}
                                >
                                    {translate('common.retry', { _: 'Reintentar' })}
                                </Button>
                            </Box>
                        ) : pdfUrl ? (
                             <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', p: 2 }}>
                                <PDFViewer file={pdfUrl} />
                            </Box>
                        ) : null}
                    </Box>
                    
                    <Box sx={{ p: 2, borderTop: '1px solid #eee' }}>
                        <Button 
                            fullWidth
                            variant="contained" 
                            size="large"
                            startIcon={<DownloadIcon />}
                            onClick={handleDownload}
                        >
                            {translate('common.download', { _: 'Descargar PDF' })}
                        </Button>
                    </Box>
                </Box>
            </Drawer>
        </Box>
    );
};

export default SelfServiceOrderVoucher;
