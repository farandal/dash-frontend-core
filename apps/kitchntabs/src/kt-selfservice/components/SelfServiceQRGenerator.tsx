/**
 * SelfServiceQRGenerator
 * 
 * Component to automatically generate and display QR codes for self-service kiosk sessions.
 * Auto-generates based on the currently logged-in tenant.
 * 
 * Listens to WebSocket events to auto-refresh QR code when a session is activated.
 */
import React, { useState, useCallback, useEffect, useContext } from 'react';
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
import { useNotify, Title } from 'react-admin';
import { useAxios } from 'dash-axios-hook';
import QRCode from 'qrcode';
import { AuthPersistenceService } from 'dash-auth';
// import { useSelfServiceEcho } from '../contexts/SelfServiceEchoContext';
import { LaravelEchoContext } from 'dash-admin/src/contexts/com/LaravelEchoContext';

interface SessionData {
    hash: string;
    tenant_id: string;
    status: string;
    table_number?: string;
}

const SelfServiceQRGenerator: React.FC = () => {
    const notify = useNotify();
    const axios = useAxios();
    
    // State
    const [tableNumber, setTableNumber] = useState('');
    const [sessionData, setSessionData] = useState<SessionData | null>(null);
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [tenantSlug, setTenantSlug] = useState<string>('');
    const [tenantName, setTenantName] = useState<string>('');
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
        const baseUrl = window.location.origin;
        return `${baseUrl}/selfservice/${hash}`;
    }, [tenantSlug]);

    // Generate QR code image from URL
    const generateQRCodeImage = useCallback(async (url: string) => {
        try {
            const dataUrl = await QRCode.toDataURL(url, {
                width: 350,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF',
                },
                errorCorrectionLevel: 'M',
            });
            setQrCodeDataUrl(dataUrl);
        } catch (error) {
            console.error('Error generating QR code:', error);
            notify('Error generating QR code', { type: 'error' });
        }
    }, [notify]);

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
            const kioskUrl = getKioskUrl(data.hash, slug);
            await generateQRCodeImage(kioskUrl);

            notify('QR Code generated successfully!', { type: 'success' });
        } catch (error: any) {
            console.error('Error creating session:', error);
            const message = error.response?.data?.message || 'Failed to create session';
            setError(message);
            notify(message, { type: 'error' });
        } finally {
            setIsLoading(false);
        }
    }, [axios, tableNumber, tenantSlug, getKioskUrl, generateQRCodeImage, notify]);

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
        if (!qrCodeDataUrl || !sessionData) return;

        const link = document.createElement('a');
        link.download = `selfservice-qr-${tenantSlug}-${sessionData.hash}.png`;
        link.href = qrCodeDataUrl;
        link.click();
    }, [qrCodeDataUrl, sessionData, tenantSlug]);

    // Print QR code
    const printQRCode = useCallback(() => {
        if (!qrCodeDataUrl || !sessionData) return;

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
                <title>Self-Service QR Code - ${tenantName}</title>
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
            <body>
                <div class="container">
                    <div class="title">📱 Ordena desde tu celular</div>
                    <div class="tenant-name">${tenantName}</div>
                    <div class="subtitle">Escanea el código QR para ver el menú</div>
                    ${sessionData.table_number ? `<div class="table-number">Mesa ${sessionData.table_number}</div>` : ''}
                    <div class="qr-code">
                        <img src="${qrCodeDataUrl}" alt="QR Code" />
                    </div>
                    <div class="session-id">${sessionData.hash}</div>
                    <div class="instructions">
                        Apunta tu cámara al código QR
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
    }, [qrCodeDataUrl, sessionData, tenantName, getKioskUrl, notify]);

    // Error state
    if (error && !sessionData) {
        return (
            <Box sx={{ p: 3, maxWidth: 600, margin: '0 auto' }}>
                <Title title="Self-Service QR Generator" />
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
        <Box sx={{ p: 3, maxWidth: 600, margin: '0 auto' }}>
            <Title title="Self-Service QR Generator" />
            
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <QrCodeIcon fontSize="large" />
                {tenantName}
            </Typography>
            
            {/*tenantName && (
                <Typography variant="h6" color="primary" gutterBottom>
                    {tenantName}
                </Typography>
            )*/}

            {/* QR Code Card */}
            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    {qrCodeDataUrl && (
                        <Paper elevation={3} sx={{ p: 2, display: 'inline-block', mb: 3, bgcolor: 'white' }}>
                            <img 
                                src={qrCodeDataUrl} 
                                alt="QR Code" 
                                style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
                            />
                        </Paper>
                    )}

                    {sessionData && (
                        <>
                            {sessionData.table_number && (
                                <Typography variant="h4" color="primary" gutterBottom>
                                    Mesa {sessionData.table_number}
                                </Typography>
                            )}

                            {/*<Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 3 }}>
                                <Chip 
                                    label={`Session: ${sessionData.hash}`}
                                    color="primary"
                                    variant="outlined"
                                    size="medium"
                                />
                                <Chip 
                                    label={sessionData.status}
                                    color="success"
                                    size="medium"
                                />
                            </Stack>*/}

                            <Divider sx={{ my: 2 }} />

                            <Stack direction="row" spacing={2} justifyContent="center">
                                {/*<Tooltip title="Copy URL">
                                    <IconButton 
                                        onClick={copyToClipboard} 
                                        color={copied ? 'success' : 'default'}
                                        size="large"
                                    >
                                        {copied ? <CheckCircleIcon /> : <CopyIcon />}
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Download PNG">
                                    <IconButton onClick={downloadQRCode} size="large">
                                        <DownloadIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Print">
                                    <IconButton onClick={printQRCode} size="large">
                                        <PrintIcon />
                                    </IconButton>
                                </Tooltip>*/}
                            </Stack>

                            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                                {getKioskUrl(sessionData.hash)}
                            </Typography>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Table Number & Regenerate */}
            {/*<Card>
                <CardContent>
                    <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TableIcon />
                        Generate for Specific Table
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                        <TextField
                            label="Table Number (Optional)"
                            value={tableNumber}
                            onChange={(e) => setTableNumber(e.target.value)}
                            placeholder="1, 2, Patio-A, etc."
                            size="small"
                            sx={{ flex: 1 }}
                        />
                        <Button
                            variant="contained"
                            onClick={regenerateSession}
                            disabled={isLoading}
                            startIcon={isLoading ? <CircularProgress size={20} /> : <RefreshIcon />}
                        >
                            {isLoading ? 'Generating...' : 'Generate New'}
                        </Button>
                    </Box>
                </CardContent>
            </Card>*/}
        </Box>
    );
};

export default SelfServiceQRGenerator;
