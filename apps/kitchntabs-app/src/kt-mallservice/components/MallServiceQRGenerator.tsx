/**
 * MallServiceQRGenerator
 * 
 * Component to automatically generate and display QR codes for mall service sessions.
 * Auto-generates based on the mall assigned to the current user (managed_mall).
 * 
 * Listens to WebSocket events to auto-refresh QR code when a session is activated.
 * 
 * Adapted from kitchntabs-mall/src/kt-mall/components/MallQRGenerator.tsx
 */
import { FC, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { 
    Box, 
    Card, 
    CardContent,
    Typography, 
    CircularProgress, 
    Alert,
    Button,
    TextField,
    IconButton,
    Tooltip,
    Stack,
    Divider,
    Paper,
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
import { AuthPersistenceService } from 'dash-auth';
import { LaravelEchoContext } from 'dash-admin/contexts/com/LaravelEchoContext';
import { DASHAdminSystemConstants } from 'dash-constants';

interface MallQRGeneratorProps {}

interface SessionResponse {
    data: {
        hash: string;
        mall_id: string;
        status: string;
        meta: any;
    };
    message?: string;
}

const ENABLE_DOWNLOAD = false;
const ENABLE_PRINT = false;
const ENABLE_REGENERATE = false;
const ENABLE_COPY_URL = false;

const MallServiceQRGenerator: FC<MallQRGeneratorProps> = () => {
    const notify = useNotify();
    const translate = useTranslate();
    const axios = useAxios();
    const theme = useTheme();
    const isXl = useMediaQuery(theme.breakpoints.up('xl'));
    
    // Get mallSlug from route params (fallback option)
    const { mallSlug: routeMallSlug } = useParams<{ mallSlug: string }>();
    
    // State
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [mallSlug, setMallSlug] = useState<string | null>(null);
    const [mallName, setMallName] = useState<string>('');
    const [tableNumber, setTableNumber] = useState<string>('');
    const [copied, setCopied] = useState(false);
    const [horizontalLogo, setHorizontalLogo] = useState<string>('');
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Use global LaravelEchoContext for QR refresh
    const { lastEvent } = useContext(LaravelEchoContext);

    // Get mall slug from authenticated user's managed_mall (stored in user object or systemValues)
    const getMallSlugFromAuth = (): { slug: string | null; name: string } => {
        // First check user object for managed_mall
        const user = AuthPersistenceService.getUser();
        if (user?.managed_mall?.slug) {
            return { slug: user.managed_mall.slug, name: user.managed_mall.name || '' };
        }
        
        // Then check systemValues (where backend stores managed_mall info)
        const systemValues = AuthPersistenceService.getSystemValues();
        if (systemValues?.managed_mall?.slug) {
            return { slug: systemValues.managed_mall.slug, name: systemValues.managed_mall.name || '' };
        }
        
        return { slug: null, name: '' };
    };

    // Helper to get QR Code Data URL from the hidden canvas
    const getQRCodeDataURL = useCallback(() => {
        if (!canvasRef.current) return '';
        return canvasRef.current.toDataURL('image/png');
    }, []);

    // Get the frontend URL from environment or fallback to current browser URL
    const getFrontendUrl = (): string => {
        const envUrl = DASHAdminSystemConstants.system.FRONTEND_URL;
        return envUrl || (typeof window !== 'undefined' ? window.location.origin : '');
    };

    // Get mall slug - prioritize auth user's managed_mall, then route params
    const getMallSlug = (): string | null => {
        // 1. First priority: Get from authenticated user's managed_mall
        const { slug: authMallSlug } = getMallSlugFromAuth();
        if (authMallSlug) {
            return authMallSlug;
        }
        
        // 2. Second priority: Use route params if available
        if (routeMallSlug) {
            return routeMallSlug;
        }
        
        // 3. Fallback to URL parsing
        if (typeof window !== 'undefined') {
            const excludedRoutes = ['login', 'signup', 'register', 'legal', 'verify', 'reset-password', 'oauth', 'apps', 'qr', 'admin', 'mall'];
            
            // Try pattern: /apps/mall/:mallSlug
            const oldMatch = window.location.pathname.match(/^\/apps\/mall\/([^/]+)/);
            if (oldMatch?.[1]) {
                return oldMatch[1];
            }
            
            // Try pattern: /:mallSlug (first segment that's not excluded)
            const newMatch = window.location.pathname.match(/^\/([^/]+)/);
            if (newMatch?.[1] && !excludedRoutes.includes(newMatch[1])) {
                return newMatch[1];
            }
        }
        
        return null;
    };

    // Retrieve session from backend
    const retrieveSession = async (slug: string): Promise<string | null> => {
        try {
            setLoading(true);
            setError(null);

            // Use authenticated endpoint (not public)
            const endpoint = `/mall/client_session/${slug}`;
            const response = await axios.post<SessionResponse>(endpoint, {
                meta: tableNumber ? { table_number: tableNumber } : {}
            });
            
            if (response.data?.data?.hash) {
                return response.data.data.hash;
            } else {
                throw new Error('Invalid response format: missing hash');
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to create session';
            setError(errorMessage);
            console.error('Error retrieving mall session:', err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Retrieve new session (for refresh)
    const retrieveNewSession = useCallback(async () => {
        const slug = getMallSlug();

        if (!slug) {
            setError('Mall not found. Your account may not be associated with a mall.');
            setLoading(false);
            return;
        }

        const hash = await retrieveSession(slug);
        if (hash) {
            setSessionId(hash);
            notify('New QR Code generated!', { type: 'success' });
        }
    }, [tableNumber]);

    // Construct the full URL for QR code
    const constructQRUrl = (hash: string): string => {
        const baseUrl = getFrontendUrl();
        const slug = getMallSlug();
        // URL pattern: /mall/{mallSlug}/s/{hash}
        const endpoint = slug ? `/mall/${slug}/s/${hash}` : `/mall/s/${hash}`;

        const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

        return `${cleanBaseUrl}${cleanEndpoint}`;
    };

    // Listen to WebSocket events to auto-refresh QR when session is activated
    useEffect(() => {
        if (lastEvent) {
            if (lastEvent.model === "Domain\\App\\Models\\Mall\\MallSession") {
                console.log('🔄 MallServiceQRGenerator: MallSession event detected, retrieving new session...');
                retrieveNewSession();
            }
        }
    }, [lastEvent, retrieveNewSession]);

    // Initialize session on component mount
    useEffect(() => {
        const initializeSession = async () => {
            const slug = getMallSlug();
            const { name } = getMallSlugFromAuth();

            if (!slug) {
                setError('Mall slug not found. Your account may not be associated with a mall.');
                setLoading(false);
                return;
            }

            setMallSlug(slug);
            setMallName(name);

            const storedAuth = AuthPersistenceService.getAuth();
            const logo = storedAuth?.auth?.tenantImages?.horizontal_logo?.original || '';
            setHorizontalLogo(logo);

            const hash = await retrieveSession(slug);
            if (hash) {
                setSessionId(hash);
            }
        };

        initializeSession();
    }, []);

    // Copy URL to clipboard
    const copyToClipboard = async () => {
        if (!sessionId) return;

        const url = constructQRUrl(sessionId);
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            notify('URL copied to clipboard!', { type: 'success' });
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            notify('Failed to copy URL', { type: 'error' });
        }
    };

    // Print QR code
    const printQRCode = () => {
        const dataUrl = getQRCodeDataURL();
        if (!dataUrl || !sessionId) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            notify('Please allow popups to print', { type: 'warning' });
            return;
        }

        const qrUrl = constructQRUrl(sessionId);

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${translate('resource.qr_generator.title_mall')} - ${mallName || mallSlug}</title>
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
                    .mall-name {
                        font-size: 20px;
                        font-weight: bold;
                        color: #1976d2;
                        margin-bottom: 15px;
                    }
                    .qr-code {
                        margin: 20px 0;
                    }
                    .session-id {
                        font-family: monospace;
                        font-size: 14px;
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
                    <div class="title">${translate('resource.qr_generator.print.title')}</div>
                    <div class="mall-name">${mallName || mallSlug}</div>
                    <div class="subtitle">${translate('resource.qr_generator.print.subtitle')}</div>
                    <div class="qr-code">
                        <img src="${dataUrl}" alt="QR Code" />
                    </div>
                    <div class="session-id">${sessionId}</div>
                </div>
                <script>
                    window.onload = function() {
                        setTimeout(() => { window.print(); window.close(); }, 500);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    const size = 350;

    // Show loading state
    if (loading && !sessionId) {
        return (
            <Box sx={{ p: 3, maxWidth: 600, margin: '0 auto' }}>
                <Title title={translate('resource.qr_generator.title_mall')} />
                <Card sx={{
                    justifyContent: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    p: 4,
                    borderRadius: 3,
                    backgroundColor: 'white',
                    boxShadow: 3,
                    minHeight: size + 32
                }}>
                    <CircularProgress size={80} sx={{ color: 'primary.main' }} />
                </Card>
            </Box>
        );
    }

    // Show error state
    if (error && !sessionId) {
        return (
            <Box sx={{ p: 3, maxWidth: 600, margin: '0 auto' }}>
                <Title title={translate('resource.qr_generator.title_mall')} />
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
                <Button variant="contained" onClick={() => window.location.reload()}>
                    Retry
                </Button>
            </Box>
        );
    }

    // Show QR code if session is available
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
            <Title title={translate('resource.qr_generator.title_mall')} />

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
                                    alt={mallName || 'Mall'} 
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
                            {sessionId && (
                                <Stack spacing={3}>
                                    <Paper elevation={0} sx={{ 
                                        p: 2, 
                                        display: 'inline-block', 
                                        bgcolor: 'white',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 2
                                    }}>
                                        <QRCodeSVG
                                            value={constructQRUrl(sessionId)}
                                            size={isXl ? 400 : 350}
                                            level="H"
                                        />
                                        {/* Hidden canvas for image generation (printing) */}
                                        <Box sx={{ display: 'none' }}>
                                            <QRCodeCanvas
                                                ref={canvasRef}
                                                value={constructQRUrl(sessionId)}
                                                size={1024} // High resolution for printing
                                                level="H"
                                            />
                                        </Box>
                                    </Paper>

                                    {!isXl && horizontalLogo && (
                                        <Box sx={{ maxWidth: 200, margin: '0 auto' }}>
                                            <img 
                                                src={horizontalLogo} 
                                                alt={mallName || 'Mall'} 
                                                style={{ width: '100%', height: 'auto', objectFit: 'contain' }} 
                                            />
                                        </Box>
                                    )}

                                    <Divider />

                                    <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>
                                        {constructQRUrl(sessionId)}
                                    </Typography>
                                    
                                    <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
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
                                                <IconButton disabled>
                                                    <DownloadIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        {ENABLE_REGENERATE && (
                                            <Tooltip title="Regenerate">
                                                <IconButton onClick={retrieveNewSession} disabled={loading}>
                                                    {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Stack>
                                </Stack>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default MallServiceQRGenerator;


