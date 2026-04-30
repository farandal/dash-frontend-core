import React, { useState, useCallback } from 'react';
import { useTranslate } from 'react-admin';
import {
    Box,
    Card,
    IconButton,
    Typography,
    CircularProgress,
    Tooltip,
    Chip,
    Collapse,
    Switch,
    FormControlLabel,
    useTheme,
    alpha,
    Dialog,
    DialogContent,
    DialogActions,
    Button,
    SwipeableDrawer,
    Divider,
    List,
    ListItem,
    ListItemText,
    Alert,
    CardContent,
} from '@mui/material';
import {
    Mic as MicIcon,
    MicOff as MicOffIcon,
    CameraAlt as CameraIcon,
    PhotoLibrary as GalleryIcon,
    AutoAwesome as AIIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Close as CloseIcon,
    Info as InfoIcon,
    Speed as SpeedIcon,
    Psychology as BrainIcon,
} from '@mui/icons-material';
import { IDashAutoAdminCustomFieldComponent } from 'dash-auto-admin';
import { useTabManager } from '../contexts/TabManagerContext';
import { useParams } from 'react-router-dom';
import { ITab } from '../interfaces/ITab';

// Import the hooks directly for compact usage
// TODO: useVoiceAgent needs to be moved to a package

import { useImageCapture } from '../hooks/useImageCapture';
import { useImageAgent, ImageAgentAction } from '../hooks/useImageAgent';
import useVoiceAgent from '../voice/useVoiceAgent';

// Temporary stub for VoiceAction until the module is properly refactored
type VoiceAction = ImageAgentAction;

// Helper to convert ImageAgentAction to VoiceAction format
const convertImageActionsToVoiceActions = (actions: ImageAgentAction[]): VoiceAction[] => {
    return actions.map(action => ({
        action: action.action,
        product_names: action.product_names,
        quantity: action.quantity,
        note: action.note,
        confidence: action.confidence,
        resolved_products: action.resolved_products?.map(p => ({
            id: String(p.id),
            name: p.name,
            sku: p.sku,
            price: p.price,
            product_data: p.product_data,
        })),
        resolution_status: action.resolution_status === 'multiple_found' ? 'multiple' : action.resolution_status,
        suggested_modifiers: action.suggested_modifiers?.map(m => ({
            product_id: String(m.product_id),
            modifier_group_id: String(m.modifier_group_id),
            modifier_option_id: String(m.modifier_option_id),
            detection_reason: m.detection_reason || '',
            confidence: m.confidence,
            matched_keywords: m.matched_keywords,
            detection_type: m.detection_type || 'image',
        })),
        ai_analysis: action.ai_analysis,
    } as unknown as VoiceAction));
};

export interface ITabAgentToolbarConfig {
    enableVoice?: boolean;
    enableImage?: boolean;
    autoApply?: boolean;
    compact?: boolean;
    showStatus?: boolean;
}

// Make the IDashAutoAdminCustomFieldComponent props optional for standalone usage
export interface ITabAgentToolbar extends Partial<IDashAutoAdminCustomFieldComponent> {
    config?: ITabAgentToolbarConfig;
}

const DEFAULT_CONFIG: Required<ITabAgentToolbarConfig> = {
    enableVoice: true,
    enableImage: true,
    autoApply: true,
    compact: true,
    showStatus: true,
};

/**
 * TabAgentToolbar Component
 * 
 * A compact toolbar that combines Voice and Image AI agents in a single row.
 * Can be embedded directly from the schema.
 */
const TabAgentToolbar: React.FC<ITabAgentToolbar> = (props) => {
    const { record, config: userConfig } = props;
    const theme = useTheme();
    const translate = useTranslate();
    
    // Merge config with defaults
    const config = { ...DEFAULT_CONFIG, ...(userConfig || {}) };
    
    // Get tab context - use record prop passed from parent (works in both create and edit modes)
    const { id: tabId } = useParams();
    // The record is passed directly from the parent context
    const tab = record;
    
    // Get TabManager context
    const {
        isProcessingVoiceActions,
        handleVoiceActions,
        handleVoiceError,
    } = useTabManager();

    // Local state
    const [expanded, setExpanded] = useState(false);
    const [autoMode, setAutoMode] = useState(config.autoApply);
    const [appliedActionsTimestamp, setAppliedActionsTimestamp] = useState<number | null>(null);
    const [showAnalysisDrawer, setShowAnalysisDrawer] = useState(false);

    // Voice Agent Hook
    const {
        isRecording,
        isProcessing: isVoiceProcessing,
        lastTranscription,
        lastActions: voiceActions,
        toggleRecording,
        cleanup: cleanupVoice,
    } = useVoiceAgent({
        autoApply: autoMode,
        onActionsDetected: handleVoiceActions,
        onError: handleVoiceError,
    });

    // Image Capture Hook
    const {
        isCapturing,
        isNative,
        isCameraSupported,
        isWebCameraActive,
        countdown,
        captureFromCamera,
        captureFromGallery,
        captureWithCountdown,
        cancelCountdown,
        closeWebCamera,
        resetCapture,
        videoRef,
        canvasRef,
    } = useImageCapture();

    // Image Agent Hook
    const {
        isProcessing: isImageProcessing,
        lastResult,
        processImage,
        getLastActions,
        reset: resetImageAgent,
    } = useImageAgent();

    const imageActions = getLastActions();

    // Combined processing state
    const isProcessing = isVoiceProcessing || isImageProcessing || isProcessingVoiceActions;

    // Prepare tab context for AI
    const getTabContext = useCallback(() => {
        if (!tab) return null;
        return {
            tab_id: tabId,
            current_order: {
                items: tab.order?.items?.map((item: any) => ({
                    id: item.id,
                    product_id: item.product_id,
                    product_name: item.product?.name,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    note: item.note || '',
                })) || [],
                total_items: tab.order?.items?.length || 0,
            },
            table_number: tab.table_number,
            status: tab.status,
        };
    }, [tab, tabId]);

    // Voice recording handler
    const handleVoiceToggle = useCallback(() => {
        if (isProcessing) return;
        
        const tabContext = getTabContext();
        toggleRecording(`voice_${Date.now()}`, tabId || null, {
            enhanced_analysis: true,
            language: 'es',
            tab_context: tabContext,
        });
    }, [isProcessing, getTabContext, toggleRecording, tabId]);

    // Camera capture handler
    const handleCameraCapture = useCallback(async () => {
        if (isProcessing) {
            console.log('[TabAgentToolbar] Camera capture skipped - already processing');
            return;
        }
        
        console.log('[TabAgentToolbar] Starting camera capture...', {
            isNative,
            isCameraSupported,
            hasCameraPlugin: !!(window as any)?.Capacitor?.Plugins?.Camera
        });
        
        try {
            let result;
            if (!isNative && isCameraSupported) {
                console.log('[TabAgentToolbar] Using web camera with countdown');
                result = await captureWithCountdown(3);
            } else if (isNative) {
                console.log('[TabAgentToolbar] Using native camera');
                result = await captureFromCamera();
            } else {
                console.log('[TabAgentToolbar] Fallback to captureFromCamera');
                result = await captureFromCamera();
            }
            
            console.log('[TabAgentToolbar] Camera capture result:', result ? 'success' : 'null/cancelled');
            
            if (result?.base64) {
                const tabContext = getTabContext();
                const processResult = await processImage({
                    image: result.dataUrl || `data:image/${result.format};base64,${result.base64}`,
                    sessionId: `image_${Date.now()}`,
                    tabId: tabId || undefined,
                    analysisType: 'order',
                    context: tabContext ? JSON.stringify(tabContext) : undefined,
                });
                
                if (processResult?.actions && autoMode) {
                    handleVoiceActions(convertImageActionsToVoiceActions(processResult.actions));
                }
            }
        } catch (error: any) {
            console.error('[TabAgentToolbar] Camera capture error:', error);
            // User cancellation is expected, don't show error for that
            if (error?.message?.includes('cancelled') || error?.message?.includes('User cancelled')) {
                console.log('[TabAgentToolbar] Camera capture cancelled by user');
            }
        }
    }, [isProcessing, isNative, isCameraSupported, captureWithCountdown, captureFromCamera, getTabContext, processImage, tabId, autoMode, handleVoiceActions]);

    // Gallery capture handler
    const handleGalleryCapture = useCallback(async () => {
        if (isProcessing) return;
        
        const result = await captureFromGallery();
        
        if (result?.base64) {
            const tabContext = getTabContext();
            const processResult = await processImage({
                image: result.dataUrl || `data:image/${result.format};base64,${result.base64}`,
                sessionId: `image_${Date.now()}`,
                tabId: tabId || undefined,
                analysisType: 'order',
                context: tabContext ? JSON.stringify(tabContext) : undefined,
            });
            
            if (processResult?.actions && autoMode) {
                handleVoiceActions(convertImageActionsToVoiceActions(processResult.actions));
            }
        }
    }, [isProcessing, captureFromGallery, getTabContext, processImage, tabId, autoMode, handleVoiceActions]);

    // Status indicator
    const getStatusInfo = () => {
        if (isRecording) return { color: 'error', text: translate('tab.agent.recording'), icon: '🔴' };
        if (isVoiceProcessing) return { color: 'warning', text: translate('tab.agent.processing_voice'), icon: '🟡' };
        if (isImageProcessing) return { color: 'warning', text: translate('tab.agent.processing_image'), icon: '🟡' };
        if (isCapturing) return { color: 'info', text: countdown ? translate('tab.agent.capturing_countdown', { countdown }) : translate('tab.agent.capturing'), icon: '📷' };
        if (isProcessingVoiceActions) return { color: 'info', text: translate('tab.agent.applying'), icon: '⚙️' };
        return { color: 'default', text: '✨', icon: '✨' };
    };

    const status = getStatusInfo();

    // Handle cancel countdown
    const handleCancelCountdown = useCallback(() => {
        cancelCountdown();
        closeWebCamera();
    }, [cancelCountdown, closeWebCamera]);

    // Camera countdown dialog with live preview
    const renderCameraCountdownDialog = () => (
        <Dialog 
            open={isWebCameraActive} 
            onClose={handleCancelCountdown} 
            maxWidth="md" 
            fullWidth
            PaperProps={{
                sx: { bgcolor: 'black' }
            }}
        >
            <DialogContent sx={{ p: 0, position: 'relative', minHeight: 400 }}>
                {/* Countdown overlay - positioned at top center */}
                {countdown !== null && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            zIndex: 10,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            pt: 4,
                            pointerEvents: 'none'
                        }}
                    >
                        <Typography
                            variant="h1"
                            sx={{
                                color: 'white',
                                fontSize: { xs: '6rem', sm: '8rem' },
                                fontWeight: 'bold',
                                textShadow: '0 0 20px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.5)',
                                textAlign: 'center',
                                animation: countdown > 0 ? 'pulse 1s ease-in-out infinite' : 'none',
                                '@keyframes pulse': {
                                    '0%': { transform: 'scale(1)', opacity: 1 },
                                    '50%': { transform: 'scale(1.1)', opacity: 0.8 },
                                    '100%': { transform: 'scale(1)', opacity: 1 }
                                }
                            }}
                        >
                            {countdown > 0 ? countdown : '📸'}
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                color: 'white',
                                mt: 1,
                                textAlign: 'center',
                                textShadow: '0 0 10px rgba(0,0,0,0.8)'
                            }}
                        >
                            {countdown > 0 ? translate('tab.agent.capture_preparing') : translate('tab.agent.capturing')}
                        </Typography>
                    </Box>
                )}

                {/* Video preview */}
                <Box
                    sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'black',
                        position: 'relative'
                    }}
                >
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{
                            width: '100%',
                            maxHeight: '70vh',
                            objectFit: 'contain'
                        }}
                    />
                    
                    {/* Hidden canvas for capture */}
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                </Box>
            </DialogContent>
            <DialogActions sx={{ bgcolor: 'black', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <Button 
                    onClick={handleCancelCountdown} 
                    color="error"
                    variant="contained"
                    startIcon={<CloseIcon />}
                >
                    {translate('tab.agent.cancel')}
                </Button>
                <Box sx={{ flex: 1, textAlign: 'center' }}>
                    {countdown !== null && (
                        <Chip
                            label={translate('tab.agent.capture_in', { seconds: countdown })}
                            color="warning"
                            sx={{ 
                                fontSize: '1rem',
                                height: 36,
                                '& .MuiChip-label': { px: 2 }
                            }}
                        />
                    )}
                </Box>
            </DialogActions>
        </Dialog>
    );

    // Analysis Results Drawer
    const renderAnalysisDrawer = () => (
        <SwipeableDrawer
            anchor="right"
            open={showAnalysisDrawer}
            onClose={() => setShowAnalysisDrawer(false)}
            onOpen={() => setShowAnalysisDrawer(true)}
            PaperProps={{
                sx: { width: { xs: '100%', sm: 400 }, maxWidth: '100%' }
            }}
        >
            <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AIIcon color="primary" />
                        {translate('tab.agent.drawer_title')}
                    </Typography>
                    <IconButton onClick={() => setShowAnalysisDrawer(false)} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Voice Section */}
                <Typography variant="subtitle1" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MicIcon fontSize="small" color="primary" />
                    {translate('tab.agent.voice_agent_title')}
                </Typography>
                
                {lastTranscription ? (
                    <Card variant="outlined" sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                                {translate('tab.agent.last_transcription')}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                                fontStyle: 'italic',
                                bgcolor: 'grey.100',
                                p: 1,
                                borderRadius: 1
                            }}>
                                "{lastTranscription}"
                            </Typography>
                        </CardContent>
                    </Card>
                ) : (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        {translate('tab.agent.no_recent_transcriptions')}
                    </Alert>
                )}

                {voiceActions.length > 0 && (
                    <Card variant="outlined" sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant="subtitle2" color="primary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <SpeedIcon fontSize="small" />
                                {translate('tab.agent.voice_actions_title')} ({voiceActions.length})
                            </Typography>
                            <List dense>
                                {voiceActions.map((action, index) => (
                                    <ListItem key={index} sx={{ px: 0 }}>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Chip 
                                                        label={action.action} 
                                                        size="small" 
                                                        color={action.action === 'add' ? 'success' : action.action === 'remove' ? 'error' : 'default'}
                                                    />
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {action.product_names?.join(', ') || translate('tab.agent.no_name')}
                                                    </Typography>
                                                </Box>
                                            }
                                            secondary={`${translate('tab.agent.quantity')}: ${action.quantity || 1} | ${translate('tab.agent.confidence')}: ${((action.confidence || 0) * 100).toFixed(0)}%`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                )}

                <Divider sx={{ my: 2 }} />

                {/* Image Section */}
                <Typography variant="subtitle1" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CameraIcon fontSize="small" color="primary" />
                    {translate('tab.agent.image_agent_title')}
                </Typography>

                {!lastResult ? (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        {translate('tab.agent.no_image_analysis')}
                    </Alert>
                ) : (
                    <>
                        {/* Original Analysis */}
                        {lastResult.analysis && (
                            <Card variant="outlined" sx={{ mb: 2 }}>
                                <CardContent>
                                    <Typography variant="subtitle2" color="primary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <BrainIcon fontSize="small" />
                                        {translate('tab.agent.original_analysis')}
                                    </Typography>
                                    <Typography variant="body2" sx={{ 
                                        whiteSpace: 'pre-wrap', 
                                        fontFamily: 'monospace', 
                                        fontSize: '0.75rem',
                                        bgcolor: 'grey.100',
                                        p: 1,
                                        borderRadius: 1,
                                        maxHeight: 200,
                                        overflow: 'auto'
                                    }}>
                                        {lastResult.analysis}
                                    </Typography>
                                </CardContent>
                            </Card>
                        )}

                        {/* Detected Actions */}
                        {imageActions.length > 0 && (
                            <Card variant="outlined" sx={{ mb: 2 }}>
                                <CardContent>
                                    <Typography variant="subtitle2" color="primary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <SpeedIcon fontSize="small" />
                                        {translate('tab.agent.image_actions_title')} ({imageActions.length})
                                    </Typography>
                                    <List dense>
                                        {imageActions.map((action, index) => (
                                            <ListItem key={index} sx={{ px: 0 }}>
                                                <ListItemText
                                                    primary={
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Chip 
                                                                label={action.action} 
                                                                size="small" 
                                                                color={action.action === 'add' ? 'success' : action.action === 'remove' ? 'error' : 'default'}
                                                            />
                                                            <Typography variant="body2" fontWeight="medium">
                                                                {action.product_names?.join(', ') || translate('tab.agent.no_name')}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                    secondary={`${translate('tab.agent.quantity')}: ${action.quantity || 1} | ${translate('tab.agent.confidence')}: ${((action.confidence || 0) * 100).toFixed(0)}%`}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>
                        )}

                        {/* Processing Info */}
                        {lastResult.processing_time && (
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="subtitle2" color="primary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <SpeedIcon fontSize="small" />
                                        {translate('tab.agent.processing_info')}
                                    </Typography>
                                    <Typography variant="caption" display="block">
                                        {translate('tab.agent.total_time')}: {lastResult.processing_time}ms
                                    </Typography>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </Box>
        </SwipeableDrawer>
    );

    return (
        <>
       
            {/* Main Toolbar Row */}
            <Card
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1.5,
                    py: 1,
                }}
            >
              

                {/* Image Agent Buttons */}
                {config.enableImage && (
                    <>
                        <Tooltip title={translate('tab.agent.camera_button_tooltip') + (!isCameraSupported ? ` ${translate('tab.agent.unavailable')}` : '')}>
                            <span>
                                <IconButton
                                    onClick={() => {
                                        console.log('[TabAgentToolbar] Camera button clicked!', {
                                            isProcessing,
                                            isCameraSupported,
                                            isNative,
                                            isCapturing,
                                        });
                                        handleCameraCapture();
                                    }}
                                    disabled={isProcessing}
                                    size="small"
                                    /*sx={{
                                        bgcolor: isCapturing ? alpha(theme.palette.info.main, 0.1) : 'transparent',
                                        '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.1) },
                                    }}*/
                                >
                                    {isCapturing && countdown ? (
                                        <Typography variant="caption" fontWeight={700} color="info.main">
                                            {countdown}
                                        </Typography>
                                    ) : isImageProcessing ? (
                                        <CircularProgress size={20} color="info" />
                                    ) : (
                                        <CameraIcon fontSize="small" color={isCapturing ? 'info' : 'primary'} />
                                    )}
                                </IconButton>
                            </span>
                        </Tooltip>

                        <Tooltip title={translate('tab.agent.gallery_button_tooltip')}>
                            <span>
                                <IconButton
                                    onClick={handleGalleryCapture}
                                    disabled={isProcessing}
                                    size="small"
                                    /*sx={{
                                        '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.1) },
                                    }}*/
                                >
                                    <GalleryIcon fontSize="small" color="primary" />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </>
                )}

                {/* Voice Agent Button */}
                {config.enableVoice && (
                    <Tooltip title={isRecording ? translate('tab.agent.voice_stop_tooltip') : translate('tab.agent.voice_record_tooltip')}>
                        <span>
                            <IconButton
                                onClick={handleVoiceToggle}
                                disabled={isProcessing && !isRecording}
                                size="small"
                                sx={{
                                   /*bgcolor: isRecording 
                                        ? alpha(theme.palette.error.main, 0.15)
                                        : isVoiceProcessing 
                                        ? alpha(theme.palette.warning.main, 0.1)
                                        : 'transparent',
                                    '&:hover': { 
                                        bgcolor: isRecording 
                                            ? alpha(theme.palette.error.main, 0.25)
                                            : alpha(theme.palette.primary.main, 0.1),
                                    },*/
                                    animation: isRecording ? 'pulse 1.5s infinite' : 'none',
                                    '@keyframes pulse': {
                                        '0%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.error.main, 0.4)}` },
                                        '70%': { boxShadow: `0 0 0 8px ${alpha(theme.palette.error.main, 0)}` },
                                        '100%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.error.main, 0)}` },
                                    },
                                }}
                            >
                                {isVoiceProcessing ? (
                                    <CircularProgress size={20} color="warning" />
                                ) : isRecording ? (
                                    <MicOffIcon fontSize="small" color="error" />
                                ) : (
                                    <MicIcon fontSize="small" color="primary" />
                                )}
                            </IconButton>
                        </span>
                    </Tooltip>
                )}

                {/* Spacer */}
                <Box sx={{ flex: 1 }} />

                {/* Info Button - Opens Analysis Drawer */}
                <Tooltip title={translate('tab.agent.analysis_tooltip')}>
                    <span>
                        <IconButton
                            size="small"
                            onClick={() => setShowAnalysisDrawer(true)}
                            //color={(lastResult || lastTranscription) ? "primary" : "default"}
                            sx={{
                                border: 1,
                                borderColor: (lastResult || lastTranscription) ? 'primary.main' : 'divider',
                                borderRadius: 1,
                            }}
                        >
                            <InfoIcon fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>

                {/* Status Chip */}
                {/*config.showStatus && (
                    <Chip
                        label={status.text}
                        size="small"
                        color={status.color as any}
                        variant="outlined"
                        sx={{
                            height: 24,
                            fontSize: '0.7rem',
                            '& .MuiChip-label': { px: 1 },
                        }}
                    />
                )*/}

                {/* Auto Mode Toggle */}
                {/*<Tooltip title={autoMode ? 'Modo automático activado' : 'Modo automático desactivado'}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={autoMode}
                                onChange={(e) => setAutoMode(e.target.checked)}
                                size="small"
                                color="primary"
                            />
                        }
                        label={
                            <Typography variant="caption" color="text.secondary">
                                Auto
                            </Typography>
                        }
                        sx={{ m: 0, ml: 0.5 }}
                    />
                </Tooltip>*/}

                {/* Expand Button */}
                {!config.compact && (
                    <IconButton
                        size="small"
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                    </IconButton>
                )}
            </Card>

            {/* Expanded Details */}
            <Collapse in={expanded}>
                <Box
                    sx={{
                        px: 1.5,
                        py: 1,
                        bgcolor: 'background.default',
                        borderTop: 1,
                        borderColor: 'divider',
                    }}
                >
                    {/* Last Transcription */}
                    {lastTranscription && (
                        <Box sx={{ mb: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                                {translate('tab.agent.last_transcription')}
                            </Typography>
                            <Typography variant="body2">
                                "{lastTranscription}"
                            </Typography>
                        </Box>
                    )}

                    {/* Actions Count */}
                    {(voiceActions.length > 0 || imageActions.length > 0) && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            {voiceActions.length > 0 && (
                                <Chip
                                    label={translate('tab.agent.voice_actions_count', { count: voiceActions.length })}
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                />
                            )}
                            {imageActions.length > 0 && (
                                <Chip
                                    label={translate('tab.agent.image_actions_count', { count: imageActions.length })}
                                    size="small"
                                    color="info"
                                    variant="outlined"
                                />
                            )}
                        </Box>
                    )}
                </Box>
            </Collapse>
       

        {/* Camera Countdown Dialog */}
        {renderCameraCountdownDialog()}

        {/* Analysis Drawer */}
        {renderAnalysisDrawer()}
        </>
    );
};

export default TabAgentToolbar;
