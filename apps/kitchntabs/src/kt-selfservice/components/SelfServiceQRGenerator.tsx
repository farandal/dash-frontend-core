/**
 * SelfServiceQRGenerator
 * 
 * Component to automatically generate and display QR codes for self-service kiosk sessions.
 * Auto-generates based on the currently logged-in tenant.
 * 
 * Listens to WebSocket events to auto-refresh QR code when a session is activated.
 */
import React, { useState, useCallback, useEffect, useContext, useRef } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    Paper,
    IconButton,
    Tooltip,
    Alert,
    CircularProgress,
    Divider,
    Chip,
    Stack,
    Grid,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import {
    QrCode as QrCodeIcon,
    Refresh as RefreshIcon,
    Print as PrintIcon,
    ContentCopy as CopyIcon,
    Download as DownloadIcon,
    TableRestaurant as TableIcon,
    CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useNotify, Title, useTranslate } from 'react-admin';
import { useAxios } from 'dash-axios-hook';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { AuthPersistenceService } from 'dash-auth';
// import { useSelfServiceEcho } from '../contexts/SelfServiceEchoContext';
import { LaravelEchoContext } from 'dash-admin/src/contexts/com/LaravelEchoContext';
import { DASHAdminSystemConstants } from 'dash-constants';

interface SessionData {
    hash: string;
    tenant_id: string;
    status: string;
    table_number?: string;
}

const ENABLE_DOWNLOAD = false;
const ENABLE_PRINT = false;
const ENABLE_REGENERATE = false;
const ENABLE_COPY_URL = false;

const SelfServiceQRGenerator: React.FC = () => {
    const notify = useNotify();
    const translate = useTranslate();
    const axios = useAxios();
    const theme = useTheme();
    const isXl = useMediaQuery(theme.breakpoints.up('xl'));
    
    // State
    const [tableNumber, setTableNumber] = useState('');
    const [sessionData, setSessionData] = useState<SessionData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [copied, setCopied] = useState(false);
    const [tenantSlug, setTenantSlug] = useState<string>('');
    const [tenantName, setTenantName] = useState<string>('');
    const [horizontalLogo, setHorizontalLogo] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    // Use global LaravelEchoContext for QR refresh (listening to Tenant channel)
    const { lastEvent } = useContext(LaravelEchoContext);
    // const { lastEvent, setSessionHash } = useSelfServiceEcho();



    // Get tenant info from AuthPersistenceService on mount
    useEffect(() => {
        const loadTenantInfo = async () => {
            try {
                const user = AuthPersistenceService.getUser();
                const storedAuth = AuthPersistenceService.getAuth();
                
                // Try to get tenant info from auth.tenant first (from getAuth response)
                // then fallback to user.tenant or systemValues.tenant
                const tenant = storedAuth?.auth?.tenant || user?.tenant || null;
                const slug = tenant?.slug || '';
                const name = tenant?.name || '';

                if (!slug) {
                    setError('Tenant slug not found. Please configure your tenant\'s URL slug in Tenant settings and log in again.');
                    setIsLoading(false);
                    return;
                }

                setTenantSlug(slug);
                setTenantName(name);

                const logo = storedAuth?.auth?.tenantImages?.horizontal_logo?.original || '';
                setHorizontalLogo(logo);
                
                // Auto-generate a session immediately
                await createSession(slug);
            } catch (err) {
                console.error('Error loading tenant info:', err);
                setError('Failed to load tenant information.');
                setIsLoading(false);
            }
        };

        loadTenantInfo();
    }, []);

    // Get the base URL for the self-service kiosk
    const getKioskUrl = useCallback((hash: string, slug: string = tenantSlug) => {
        const envUrl = DASHAdminSystemConstants.system.FRONTEND_URL;
        const baseUrl = envUrl || window.location.origin;
        return `${baseUrl}/selfservice/${hash}`;
    }, [tenantSlug]);

    // Helper to get QR Code Data URL from the hidden canvas
    const getQRCodeDataURL = useCallback(() => {
        if (!canvasRef.current) return '';
        return canvasRef.current.toDataURL('image/png');
    }, []);

    // Create a new session
    const createSession = useCallback(async (slug: string = tenantSlug) => {
        if (!slug) {
            notify('Tenant slug is required', { type: 'warning' });
            return;
        }

        setIsLoading(true);
        setError(null);
        
        try {
            const response = await axios.post(`/public/selfservice/client_session/${slug}`, {
                table_number: tableNumber || null,
            });

            const data = response.data?.data || response.data;
            setSessionData(data);

            // Update context with hash to subscribe to channel
            // setSessionHash(data.hash); // REMOVED: Private app should NOT subscribe to public channel

            // Generate QR code for this session
            // const kioskUrl = getKioskUrl(data.hash, slug);
            // await generateQRCodeImage(kioskUrl);

            notify('QR Code generated successfully!', { type: 'success' });
        } catch (error: any) {
            console.error('Error creating session:', error);
            const message = error.response?.data?.message || 'Failed to create session';
            setError(message);
            notify(message, { type: 'error' });
        } finally {
            setIsLoading(false);
        }
    }, [axios, tableNumber, tenantSlug, getKioskUrl, notify]);

    // React to WebSocket events for QR code refresh
    useEffect(() => {
        if (lastEvent && tenantSlug) {
            // The broadcast payload structure from AppNotification.toBroadcast() includes:
            // - type: notification type at root
            // - model: model class name at root
            // - data: { session_id, session_hash, tenant_id, etc. } 
            // - notificationPayload: { class, title, message, etc. }
            const eventType = lastEvent.type || lastEvent.data?.type;
            const model = lastEvent.model;
            const notificationClass = lastEvent.notificationPayload?.class;
            
            console.log('📡 SelfServiceQRGenerator: Received socket event', { 
                eventType, 
                model, 
                notificationClass,
                fullEvent: lastEvent 
            });
            
            // Check for self-service session activation
            const isSelfServiceSessionEvent = 
                eventType === 'self_service_session_activated' ||
                model === 'Domain\\App\\Models\\SelfService\\SelfServiceSession' ||
                notificationClass?.includes('SelfServiceSessionActivated');
            
            if (isSelfServiceSessionEvent) {
                const eventSessionHash = lastEvent.data?.session_hash;
                const currentHash = sessionData?.hash;

                // Only refresh if the ACTIVATED session matches the CURRENTLY DISPLAYED session
                if (eventSessionHash && currentHash && eventSessionHash === currentHash) {
                    console.log('🔄 Current session activated, generating new QR code...', { eventSessionHash, currentHash });
                    notify('Session claimed by customer. Generating new QR code...', { type: 'info' });
                    createSession(tenantSlug);
                } else {
                    console.log('⚠️ Ignoring session activation event for different hash', { eventSessionHash, currentHash });
                }
            }
        }
    }, [lastEvent, tenantSlug, sessionData]);

    // Regenerate with optional table number
    const regenerateSession = useCallback(() => {
        createSession(tenantSlug);
    }, [createSession, tenantSlug]);

    // Copy URL to clipboard
    const copyToClipboard = useCallback(async () => {
        if (!sessionData) return;

        const url = getKioskUrl(sessionData.hash);
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            notify('URL copied to clipboard!', { type: 'success' });
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            notify('Failed to copy URL', { type: 'error' });
        }
    }, [sessionData, getKioskUrl, notify]);

    // Download QR code as PNG
    const downloadQRCode = useCallback(() => {
        const dataUrl = getQRCodeDataURL();
        if (!dataUrl || !sessionData) return;

        const link = document.createElement('a');
        link.download = `selfservice-qr-${tenantSlug}-${sessionData.hash}.png`;
        link.href = dataUrl;
        link.click();
    }, [getQRCodeDataURL, sessionData, tenantSlug]);

    // Print QR code
    const printQRCode = useCallback(() => {
        const dataUrl = getQRCodeDataURL();
        if (!dataUrl || !sessionData) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            notify('Please allow popups to print', { type: 'warning' });
            return;
        }

        const kioskUrl = getKioskUrl(sessionData.hash);

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${translate('resource.qr_generator.title_self_service')} - ${tenantName}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        margin: 0;
                        padding: 20px;
                        box-sizing: border-box;
                    }
                    .container {
                        text-align: center;
                        border: 2px solid #333;
                        border-radius: 16px;
                        padding: 30px;
                        max-width: 400px;
                    }
                    .title {
                        font-size: 24px;
                        font-weight: bold;
                        margin-bottom: 10px;
                    }
                    .subtitle {
                        font-size: 16px;
                        color: #666;
                        margin-bottom: 20px;
                    }
                    .tenant-name {
                        font-size: 20px;
                        font-weight: bold;
                        color: #1976d2;
                        margin-bottom: 15px;
                    }
                    .qr-code {
                        margin: 20px 0;
                    }
                    .qr-code img {
                        width: 280px;
                        height: 280px;
                    }
                    .table-number {
                        font-size: 28px;
                        font-weight: bold;
                        color: #333;
                        margin: 10px 0;
                    }
                    .instructions {
                        font-size: 14px;
                        color: #888;
                        margin-top: 15px;
                    }
                    .session-id {
                        font-family: monospace;
                        font-size: 16px;
                        background: #f5f5f5;
                        padding: 5px 10px;
                        border-radius: 4px;
                        margin-top: 10px;
                    }
                    @media print {
                        body { -webkit-print-color-adjust: exact; }
                    }
                </style>
            </head>
            </head>
            <body>
                <div class="container">
                    <div class="title">${translate('resource.qr_generator.print.title')}</div>
                    <div class="tenant-name">${tenantName}</div>
                    <div class="subtitle">${translate('resource.qr_generator.print.subtitle')}</div>
                    ${sessionData.table_number ? `<div class="table-number">${translate('resource.qr_generator.table')} ${sessionData.table_number}</div>` : ''}
                    <div class="qr-code">
                        <img src="${dataUrl}" alt="QR Code" />
                    </div>
                    <div class="session-id">${sessionData.hash}</div>
                    <div class="instructions">
                        ${translate('resource.qr_generator.print.instructions')}
                    </div>
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                        window.close();
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }, [getQRCodeDataURL, sessionData, tenantName, getKioskUrl, notify]);

    // Error state
    if (error && !sessionData) {
        return (
            <Box sx={{ p: 3, maxWidth: 600, margin: '0 auto' }}>
                <Title title={translate('resource.qr_generator.title_self_service')} />
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
                <Button variant="contained" onClick={() => window.location.reload()}>
                    Retry
                </Button>
            </Box>
        );
    }

    // Loading state
    if (isLoading && !sessionData) {
        return (
            <Box sx={{ 
                p: 3, 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                minHeight: 400 
            }}>
                <CircularProgress size={60} sx={{ mb: 2 }} />
                {/*<Typography variant="h6" color="text.secondary">
                    Generating QR Code...
                </Typography>*/}
            </Box>
        );
    }

    return (
        <Box sx={{ 
            p: 3, 
            maxWidth: isXl ? '100%' : 600, 
            margin: '0 auto',
            minHeight: isXl ? '80vh' : 'auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
        }}>
            <Title title={translate('resource.qr_generator.title_self_service')} />
            
            <Grid container spacing={4} alignItems="center" justifyContent="center">
                {/* Information Column (Left on XL, Top on others) */}
                <Grid item xs={12} xl={8}>
                    <Stack spacing={3} alignItems={isXl ? "flex-start" : "center"} textAlign={isXl ? "left" : "center"}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <QrCodeIcon sx={{ fontSize: isXl ? 60 : 40, color: 'primary.main' }} />
                            <Typography variant={isXl ? "h2" : "h4"} fontWeight="bold">
                                {translate('resource.qr_generator.welcome_title')}
                            </Typography>
                        </Box>
                        
                        <Typography variant={isXl ? "h4" : "h6"} color="text.secondary">
                            {translate('resource.qr_generator.welcome_subtitle')}
                        </Typography>
                        
                        {isXl && horizontalLogo && (
                            <Box sx={{ mt: 4, maxWidth: 400 }}>
                                <img 
                                    src={horizontalLogo} 
                                    alt={tenantName} 
                                    style={{ width: '100%', height: 'auto', objectFit: 'contain' }} 
                                />
                            </Box>
                        )}
                    </Stack>
                </Grid>

                {/* QR Code Column (Right on XL, Bottom on others) */}
                <Grid item xs={12} xl={4}>
                    <Card sx={{ 
                        borderRadius: 4, 
                        boxShadow: 10,
                        overflow: 'hidden',
                        backgroundColor: 'white'
                    }}>
                        <CardContent sx={{ textAlign: 'center', p: 4 }}>
                            {sessionData && (
                                <Stack spacing={3}>
                                    {sessionData.table_number && (
                                        <Typography variant="h3" color="primary" fontWeight="bold">
                                            {translate('Table')} {sessionData.table_number}
                                        </Typography>
                                    )}

                                    <Paper elevation={0} sx={{ 
                                        p: 2, 
                                        display: 'inline-block', 
                                        bgcolor: 'white',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 2
                                    }}>
                                        <QRCodeSVG 
                                            value={getKioskUrl(sessionData.hash)}
                                            size={isXl ? 400 : 320}
                                            level="M"
                                            includeMargin={true}
                                        />
                                        {/* Hidden canvas for image generation (printing/downloading) */}
                                        <Box sx={{ display: 'none' }}>
                                            <QRCodeCanvas
                                                ref={canvasRef}
                                                value={getKioskUrl(sessionData.hash)}
                                                size={1024} // High resolution for printing
                                                level="M"
                                                includeMargin={true}
                                            />
                                        </Box>
                                    </Paper>

                         
                                    <Stack direction="row" spacing={1} justifyContent="center" >
                                         <Typography variant="caption"  sx={{ wordBreak: 'break-all' }}>
                                        {getKioskUrl(sessionData.hash)}
                                    </Typography>
                                        {ENABLE_COPY_URL && (
                                            <Tooltip title="Copy URL">
                                                <IconButton onClick={copyToClipboard} color={copied ? 'success' : 'default'}>
                                                    {copied ? <CheckCircleIcon /> : <CopyIcon />}
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        {ENABLE_PRINT && (
                                            <Tooltip title="Print">
                                                <IconButton onClick={printQRCode}>
                                                    <PrintIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        {ENABLE_DOWNLOAD && (
                                            <Tooltip title="Download">
                                                <IconButton onClick={downloadQRCode}>
                                                    <DownloadIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        {ENABLE_REGENERATE && (
                                            <Tooltip title="Regenerate">
                                                <IconButton onClick={regenerateSession}>
                                                    <RefreshIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Stack>

                                     {!isXl && horizontalLogo && (
                                        <Box sx={{ margin: '0 auto' }}>
                                            <img 
                                                src={horizontalLogo} 
                                                alt={tenantName} 
                                                style={{ width: '100%', height: 'auto', objectFit: 'contain' }} 
                                            />
                                        </Box>
                                    )}
                                </Stack>
                            )}
                        </CardContent>
                    </Card>

                      
                                    
                </Grid>
            </Grid>
        </Box>
    );
};

export default SelfServiceQRGenerator;
