import React, { useState, useCallback, useEffect } from 'react';
import { useTranslate } from 'react-admin';
import {
    Box,
    Button,
    Typography,
    CircularProgress,
    Chip,
    Alert,
    Collapse,
    IconButton,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    Divider,
    Tooltip,
    SwipeableDrawer
} from '@mui/material';
import {
    Mic as MicIcon,
    MicOff as MicOffIcon,
    PlayArrow as PlayIcon,
    Stop as StopIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    AutoAwesome as AIIcon,
    Psychology as BrainIcon,
    Speed as SpeedIcon,
    BugReport as DebugIcon,
    Info as InfoIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { useVoiceAgent, VoiceAction } from './useVoiceAgent';

interface VoiceTabAgentProps {
    tabId?: string | null;
    tabData?: any; // Add tab data prop
    onActionsDetected?: (actions: VoiceAction[]) => void;
    onError?: (error: string) => void;
    disabled?: boolean;
    autoApply?: boolean;
    layout?: 'vertical' | 'horizontal';
    showExamples?: boolean;
    sessionId?: string;
    debug?: boolean;
}

const VoiceTabAgent: React.FC<VoiceTabAgentProps> = ({
    tabId,
    tabData, // Use this prop to provide tab context
    onActionsDetected,
    onError,
    disabled = false,
    autoApply = false,
    layout = 'vertical',
    showExamples = false,
    sessionId,
    debug = false
}) => {
    const translate = useTranslate();
    const [showDetails, setShowDetails] = useState(false);
    const [showExamplesPanel, setShowExamplesPanel] = useState(false);
    const [showDebugInfo, setShowDebugInfo] = useState(false);
    const [showAnalysisDrawer, setShowAnalysisDrawer] = useState(false);
    const [recordingAttempts, setRecordingAttempts] = useState(0);
  
    const [currentSessionId] = useState(sessionId || `voice_session_${Date.now()}`);

    const {
        isRecording,
        isProcessing,
        lastTranscription,
        lastActions,
        processingSteps,
        toggleRecording,
        cleanup,
        hasEnhancedAnalysis,
        getModifierSuggestions,
        getAutoAddedProducts,
        getProcessingMetrics,
        getAudioChunksInfo,
        getDebugInfo
        //resetState // Add reset function
    } = useVoiceAgent({
        autoApply,
        onActionsDetected,
        onError: (error) => {
            console.error('🚨 Voice Agent Error:', error);
            onError?.(error);
        },
        onTranscriptionComplete: (transcription) => {
            console.log('🎤 Transcription completed:', transcription);
        },
        onProcessingComplete: (result) => {
            console.log('✅ Processing completed:', result);
        }
    });

    useEffect(()=>{
        console.log(getDebugInfo());
        
    },[])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            console.log('🧹 Cleaning up VoiceTabAgent...');
            cleanup();
        };
    }, [cleanup]);

    // Reset state when recording fails
    useEffect(() => {
        if (!isRecording && !isProcessing && recordingAttempts > 0) {
            const timer = setTimeout(() => {
                console.log('🔄 Auto-resetting voice agent state...');
                //resetState?.();
            }, 1000);
            
            return () => clearTimeout(timer);
        }
    }, [isRecording, isProcessing, recordingAttempts, /*resetState*/]);

    const handleToggleRecording = useCallback(() => {
        if (disabled) {
            console.log('⚠️ Recording disabled');
            return;
        }
        
        console.log('🔄 Toggling recording...', { 
            isRecording, 
            isProcessing, 
            attempts: recordingAttempts,
            tabId,
            hasTabData: !!tabData
        });

        // Increment attempts counter
        setRecordingAttempts(prev => prev + 1);

        // Prepare tab context for OpenAI
        const tabContext = tabData ? {
            tab_id: tabId,
            current_order: {
                items: tabData.order?.items?.map(item => ({
                    id: item.id,
                    product_id: item.product_id,
                    product_name: item.product?.name,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    note: item.note || '',
                    modifiers: item.modifiers?.map(mod => ({
                        id: mod.id,
                        modifier_option_id: mod.modifier_option_id,
                        modifier_group_id: mod.modifier_group_id,
                        modifier_option_name: mod.modifier_option?.name,
                        modifier_group_name: mod.modifier_option?.modifierGroup?.name,
                        price_adjustment: mod.price_adjustment
                    })) || []
                })) || [],
                total_items: tabData.order?.items?.length || 0,
                subtotal: tabData.order?.items?.reduce((sum, item) => {
                    const itemTotal = parseFloat(item.unit_price || '0') * (item.quantity || 0);
                    const modifierTotal = (item.modifiers || []).reduce((modSum, mod) => 
                        modSum + (parseFloat(mod.price_adjustment || '0') * (item.quantity || 0)), 0);
                    return sum + itemTotal + modifierTotal;
                }, 0) || 0
            },
            table_number: tabData.table_number,
            status: tabData.status,
            created_at: tabData.created_at
        } : null;

        console.log('📋 Tab context prepared:', tabContext);
        
        toggleRecording(currentSessionId, tabId, {
            enhanced_analysis: true,
            language: 'es',
            tab_context: tabContext // Send tab context to backend
        });
    }, [disabled, toggleRecording, currentSessionId, tabId, isRecording, isProcessing, recordingAttempts, tabData]);

    const processingMetrics = getProcessingMetrics();
    const modifierSuggestions = getModifierSuggestions();
    const autoAddedProducts = getAutoAddedProducts();
    const audioChunksInfo = getAudioChunksInfo();

    const examples = [
        translate('voice.examples.add_two_burgers'),
        translate('voice.examples.large_coffee_takeout'),
        translate('voice.examples.remove_pizza'),
        translate('voice.examples.change_tacos_quantity'),
        translate('voice.examples.add_note_no_onion'),
        translate('voice.examples.remove_second_ramen'),
        translate('voice.examples.modify_steak_quantity'),
        translate('voice.examples.add_note_not_spicy')
    ];

    const getStatusColor = () => {
        if (isProcessing) return 'info';
        if (isRecording) return 'error';
        if (lastActions.length > 0) return 'success';
        return 'default';
    };

    const getStatusText = () => {
        if (isProcessing) return translate('voice.processing_ai');
        if (isRecording) return translate('voice.recording');
        if (lastActions.length > 0) return translate('voice.actions_detected', { count: lastActions.length });
        return translate('voice.ready_to_record');
    };

    const getStatusCircle = () => {
        if (isProcessing) return '🟡'; // yellow - processing
        if (isRecording) return '🔴'; // red - recording
        if (lastActions.length > 0) return '🔵'; // blue - success
        return '🟢'; // green - ready
    };

    const renderTabContext = () => {
        if (!debug || !tabData) return null;

        return (
            <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    📋 Tab Context
                </Typography>
                <Card variant="outlined" sx={{ bgcolor: 'grey.50', mt: 1 }}>
                    <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                        <Typography variant="caption" component="div">
                            <strong>Table:</strong> {tabData.table_number || 'N/A'}
                        </Typography>
                        <Typography variant="caption" component="div">
                            <strong>Status:</strong> {tabData.status || 'N/A'}
                        </Typography>
                        <Typography variant="caption" component="div">
                            <strong>Items:</strong> {tabData.order?.items?.length || 0}
                        </Typography>
                        {tabData.order?.items?.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                                <Typography variant="caption" component="div">
                                    <strong>Current Order:</strong>
                                </Typography>
                                {tabData.order.items.slice(0, 3).map((item, index) => (
                                    <Typography key={index} variant="caption" component="div" sx={{ ml: 1 }}>
                                        • {item.quantity}x {item.product?.name} ${item.unit_price}
                                    </Typography>
                                ))}
                                {tabData.order.items.length > 3 && (
                                    <Typography variant="caption" component="div" sx={{ ml: 1 }}>
                                        ... and {tabData.order.items.length - 3} more items
                                    </Typography>
                                )}
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Box>
        );
    };

    const renderDebugInfo = () => {
        if (!debug) return null;

        return (
            <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DebugIcon fontSize="small" />
                        Debug Info
                    </Typography>
                    <IconButton
                        size="small"
                        onClick={() => setShowDebugInfo(!showDebugInfo)}
                    >
                        {showDebugInfo ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                </Box>

                <Collapse in={showDebugInfo}>
                    <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                        <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                            <Typography variant="caption" component="div">
                                <strong>Recording State:</strong> {isRecording ? 'Active' : 'Inactive'}
                            </Typography>
                            <Typography variant="caption" component="div">
                                <strong>Processing State:</strong> {isProcessing ? 'Active' : 'Inactive'}
                            </Typography>
                            <Typography variant="caption" component="div">
                                <strong>Recording Attempts:</strong> {recordingAttempts}
                            </Typography>
                            <Typography variant="caption" component="div">
                                <strong>Audio Chunks:</strong> {audioChunksInfo.count} chunks, {audioChunksInfo.totalSize} bytes
                            </Typography>
                            <Typography variant="caption" component="div">
                                <strong>Session ID:</strong> {currentSessionId}
                            </Typography>
                            <Typography variant="caption" component="div">
                                <strong>Tab ID:</strong> {tabId || 'None'}
                            </Typography>
                            <Typography variant="caption" component="div">
                                <strong>Has Tab Data:</strong> {tabData ? 'Yes' : 'No'}
                            </Typography>
                            {lastTranscription && (
                                <Typography variant="caption" component="div">
                                    <strong>Last Transcription:</strong> "{lastTranscription}"
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                    
                    {/* Tab Context Debug */}
                    {renderTabContext()}
                </Collapse>
            </Box>
        );
    };
    
    const renderProcessingSteps = () => {
        if (!processingSteps || Object.keys(processingSteps).length === 0) {
            return null;
        }

        return (
            <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BrainIcon fontSize="small" />
                    Análisis IA (3 pasos)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                        size="small"
                        label="1. Extracción"
                        color={processingSteps.step1_initial_extraction ? 'success' : 'default'}
                        icon={processingSteps.step1_initial_extraction ? <SpeedIcon /> : undefined}
                    />
                    <Chip
                        size="small"
                        label="2. Productos"
                        color={processingSteps.step2_product_resolution === 'completed' ? 'success' : 'default'}
                    />
                    <Chip
                        size="small"
                        label="3. IA Avanzada"
                        color={processingSteps.step3_enhanced_analysis === 'completed' ? 'success' : 'default'}
                        icon={hasEnhancedAnalysis ? <AIIcon /> : undefined}
                    />
                </Box>
            </Box>
        );
    };

    const renderEnhancedResults = () => {
        if (!lastActions.length) return null;

        return (
            <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2">
                        Resultados Mejorados
                    </Typography>
                    <IconButton
                        size="small"
                        onClick={() => setShowDetails(!showDetails)}
                    >
                        {showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                </Box>

                {/* Quick metrics */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                    <Chip
                        size="small"
                        label={`${processingMetrics.totalActions} acciones`}
                        color="primary"
                    />
                    <Chip
                        size="small"
                        label={`${processingMetrics.productsResolved} productos`}
                        color="secondary"
                    />
                    {processingMetrics.modifiersSuggested > 0 && (
                        <Chip
                            size="small"
                            label={`${processingMetrics.modifiersSuggested} modificadores IA`}
                            color="success"
                            icon={<AIIcon />}
                        />
                    )}
                    {processingMetrics.autoAddedProducts > 0 && (
                        <Chip
                            size="small"
                            label={`${processingMetrics.autoAddedProducts} auto-agregados`}
                            color="warning"
                            icon={<BrainIcon />}
                        />
                    )}
                </Box>

                <Collapse in={showDetails}>
                    <Card variant="outlined" sx={{ mt: 1 }}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            {/* Transcription */}
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                <strong>Transcripción:</strong> "{lastTranscription}"
                            </Typography>

                            {/* Actions */}
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Acciones Detectadas:
                            </Typography>
                            <List dense>
                                {lastActions.map((action, index) => (
                                    <React.Fragment key={index}>
                                        <ListItem sx={{ px: 0 }}>
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                                        <Chip
                                                            size="small"
                                                            label={action.action}
                                                            color="primary"
                                                        />
                                                        <Typography variant="body2">
                                                            {action.product_names.join(', ')}
                                                        </Typography>
                                                        {action.quantity && action.quantity > 1 && (
                                                            <Chip size="small" label={`x${action.quantity}`} />
                                                        )}
                                                        {action.auto_added && (
                                                            <Chip
                                                                size="small"
                                                                label="Auto IA"
                                                                color="warning"
                                                                icon={<AIIcon />}
                                                            />
                                                        )}
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box sx={{ mt: 1 }}>
                                                        {/* Products found */}
                                                        {action.resolved_products && action.resolved_products.length > 0 && (
                                                            <Typography variant="caption" color="success.main" display="block">
                                                                ✓ {action.resolved_products.length} producto(s) encontrado(s)
                                                            </Typography>
                                                        )}
                                                        
                                                        {/* AI Modifiers */}
                                                        {action.suggested_modifiers && action.suggested_modifiers.length > 0 && (
                                                            <Typography variant="caption" color="info.main" display="block">
                                                                🤖 Modificadores IA: {action.suggested_modifiers.map(m => m.modifier_option_name || 'Modificador').join(', ')}
                                                            </Typography>
                                                        )}

                                                        {/* AI Analysis */}
                                                        {action.ai_analysis && (
                                                            <Typography variant="caption" color="text.secondary" display="block">
                                                                💭 {action.ai_analysis}
                                                            </Typography>
                                                        )}

                                                        {/* Note */}
                                                        {action.note && (
                                                            <Typography variant="caption" display="block">
                                                                📝 {action.note}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                        {index < lastActions.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Collapse>
            </Box>
        );
    };

    const renderExamples = () => {
        
       

        if (!showExamples) return null;

        return (
            <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                        Ejemplos de comandos
                    </Typography>
                    <IconButton
                        size="small"
                        onClick={() => setShowExamplesPanel(!showExamplesPanel)}
                    >
                        {showExamplesPanel ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                </Box>

                <Collapse in={showExamplesPanel}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {examples.map((example, index) => (
                            <Typography
                                key={index}
                                variant="caption"
                                color="text.secondary"
                                sx={{ 
                                    px: 1, 
                                    py: 0.5, 
                                    bgcolor: 'grey.50', 
                                    borderRadius: 1,
                                    fontStyle: 'italic'
                                }}
                            >
                                "{example}"
                            </Typography>
                        ))}
                    </Box>
                </Collapse>
            </Box>
        );
    };

    const renderAnalysisDrawer = () => {
        const metrics = getProcessingMetrics();
        const debugInfo = getDebugInfo();

        return (
            <SwipeableDrawer
                anchor="right"
                open={showAnalysisDrawer}
                onClose={() => setShowAnalysisDrawer(false)}
                onOpen={() => setShowAnalysisDrawer(true)}
            >
                <Box sx={{ width: 400, p: 2 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BrainIcon color="primary" />
                            Análisis de Voz IA
                        </Typography>
                        <IconButton onClick={() => setShowAnalysisDrawer(false)}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    
                    <Divider sx={{ mb: 2 }} />

                    {/* Transcription */}
                    {lastTranscription && (
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                🎤 Transcripción
                            </Typography>
                            <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                        "{lastTranscription}"
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Box>
                    )}

                    {/* Processing Steps */}
                    {processingSteps && Object.keys(processingSteps).length > 0 && (
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                ⚙️ Pasos de Procesamiento
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Chip
                                    size="small"
                                    label="1. Extracción"
                                    color={processingSteps.step1_initial_extraction ? 'success' : 'default'}
                                />
                                <Chip
                                    size="small"
                                    label="2. Productos"
                                    color={processingSteps.step2_product_resolution === 'completed' ? 'success' : 'default'}
                                />
                                <Chip
                                    size="small"
                                    label="3. IA Avanzada"
                                    color={processingSteps.step3_enhanced_analysis === 'completed' ? 'success' : 'default'}
                                    icon={hasEnhancedAnalysis ? <AIIcon /> : undefined}
                                />
                            </Box>
                        </Box>
                    )}

                    {/* Actions Detected */}
                    {lastActions.length > 0 && (
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                🎯 Acciones Detectadas ({lastActions.length})
                            </Typography>
                            <List dense sx={{ bgcolor: 'background.paper' }}>
                                {lastActions.map((action, index) => (
                                    <React.Fragment key={index}>
                                        <ListItem sx={{ px: 1, flexDirection: 'column', alignItems: 'flex-start' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                                <Chip
                                                    size="small"
                                                    label={action.action}
                                                    color="primary"
                                                />
                                                <Typography variant="body2" sx={{ flex: 1 }}>
                                                    {action.product_names?.join(', ') || 'Sin producto'}
                                                </Typography>
                                                {action.quantity && action.quantity > 1 && (
                                                    <Chip size="small" label={`x${action.quantity}`} variant="outlined" />
                                                )}
                                            </Box>
                                            
                                            {/* Resolved Products */}
                                            {action.resolved_products && action.resolved_products.length > 0 && (
                                                <Typography variant="caption" color="success.main" sx={{ mt: 0.5, ml: 1 }}>
                                                    ✓ Resuelto: {action.resolved_products.map(p => p.name).join(', ')}
                                                </Typography>
                                            )}
                                            
                                            {/* Modifiers */}
                                            {action.suggested_modifiers && action.suggested_modifiers.length > 0 && (
                                                <Box sx={{ mt: 0.5, ml: 1 }}>
                                                    <Typography variant="caption" color="info.main">
                                                        🤖 Modificadores IA:
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                                                        {action.suggested_modifiers.map((mod, modIndex) => (
                                                            <Chip
                                                                key={modIndex}
                                                                size="small"
                                                                label={mod.modifier_option_name || 'Modificador'}
                                                                variant="outlined"
                                                                color="info"
                                                            />
                                                        ))}
                                                    </Box>
                                                </Box>
                                            )}

                                            {/* Raw Modifiers */}
                                            {action.modifiers && action.modifiers.length > 0 && (
                                                <Box sx={{ mt: 0.5, ml: 1 }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        📝 Modificadores detectados: {action.modifiers.join(', ')}
                                                    </Typography>
                                                </Box>
                                            )}

                                            {/* Note */}
                                            {action.note && (
                                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1 }}>
                                                    📝 Nota: {action.note}
                                                </Typography>
                                            )}

                                            {/* AI Analysis */}
                                            {action.ai_analysis && (
                                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1, fontStyle: 'italic' }}>
                                                    💭 {action.ai_analysis}
                                                </Typography>
                                            )}
                                        </ListItem>
                                        {index < lastActions.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        </Box>
                    )}

                    {/* Processing Metrics */}
                    {metrics && (
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                📊 Métricas
                            </Typography>
                            <Card variant="outlined">
                                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                                        <Typography variant="caption">
                                            <strong>Acciones:</strong> {metrics.totalActions}
                                        </Typography>
                                        <Typography variant="caption">
                                            <strong>Productos:</strong> {metrics.productsResolved}
                                        </Typography>
                                        <Typography variant="caption">
                                            <strong>Modificadores IA:</strong> {metrics.modifiersSuggested}
                                        </Typography>
                                        <Typography variant="caption">
                                            <strong>Auto-agregados:</strong> {metrics.autoAddedProducts}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Box>
                    )}

                    {/* Debug Info */}
                    {debug && debugInfo && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                🐛 Debug Info
                            </Typography>
                            <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                                    <Typography variant="caption" component="pre" sx={{ 
                                        whiteSpace: 'pre-wrap', 
                                        wordBreak: 'break-word',
                                        fontFamily: 'monospace',
                                        fontSize: '10px'
                                    }}>
                                        {JSON.stringify(debugInfo, null, 2)}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Box>
                    )}

                    {/* No Data Message */}
                    {!lastTranscription && lastActions.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <MicIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                            <Typography color="text.secondary">
                                No hay análisis disponible
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Graba un comando de voz para ver el análisis
                            </Typography>
                        </Box>
                    )}
                </Box>
            </SwipeableDrawer>
        );
    };

    const renderHorizontalLayout = () => (
       <>
                    {/* Recording Button Row */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        <Tooltip title={
                            disabled ? translate('voice.recording_disabled') :
                            isProcessing ? translate('voice.processing') :
                            isRecording ? translate('voice.stop_recording') : translate('voice.start_recording')
                        }>
                            <Button
                                variant={isRecording ? "outlined" : "contained"}
                                color={isRecording ? "error" : "primary"}
                                onClick={handleToggleRecording}
                                disabled={disabled || isProcessing}
                                startIcon={
                                    isProcessing ? (
                                        <CircularProgress size={20} />
                                    ) : isRecording ? (
                                        <StopIcon />
                                    ) : (
                                        <MicIcon />
                                    )
                                }
                                endIcon={
                                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto', gap: 0.5 }}>
                                        <Tooltip title={getStatusText()}>
                                            <span style={{ fontSize: '16px', cursor: 'default' }}>{getStatusCircle()}</span>
                                        </Tooltip>
                                        {hasEnhancedAnalysis && (
                                            <Chip
                                                label={translate('voice.ai_label')}
                                                color="success"
                                                size="small"
                                                icon={<BrainIcon />}
                                            />
                                        )}
                                        {autoApply && (
                                            <Chip
                                                label={translate('voice.auto_label')}
                                                color="info"
                                                size="small"
                                                variant="outlined"
                                            />
                                        )}
                                        {debug && (
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowDebugInfo(!showDebugInfo);
                                                }}
                                                color={showDebugInfo ? "primary" : "default"}
                                            >
                                                <DebugIcon />
                                            </IconButton>
                                        )}
                                    </Box>
                                }
                                sx={{ minWidth: 140, flex: 1, justifyContent: 'flex-start' }}
                            >
                                {isProcessing ? translate('voice.processing') : isRecording ? translate('voice.stop') : translate('voice.record')}
                            </Button>
                        </Tooltip>

                        {/* Info Button - Outside Recording Button */}
                        <Tooltip title={translate('voice.view_ai_analysis')}>
                            <IconButton
                                onClick={() => setShowAnalysisDrawer(true)}
                                sx={{
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                }}
                            >
                                <InfoIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>

        {renderAnalysisDrawer()}
        </>
    );

    const renderVerticalLayout = () => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Main Controls */}
            <Card variant="outlined">
                <CardContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MicIcon />
                            Asistente de Voz IA
                            {hasEnhancedAnalysis && <AIIcon color="success" />}
                            {debug && (
                                <Tooltip title="Debug mode enabled">
                                    <DebugIcon color="warning" />
                                </Tooltip>
                            )}
                            <Tooltip title="Ver análisis de IA">
                                <IconButton
                                    size="small"
                                    onClick={() => setShowAnalysisDrawer(true)}
                                >
                                    <InfoIcon />
                                </IconButton>
                            </Tooltip>
                        </Typography>

                        <Button
                            variant={isRecording ? "contained" : "outlined"}
                            color={isRecording ? "error" : "primary"}
                            size="large"
                            onClick={handleToggleRecording}
                            disabled={disabled || isProcessing}
                            startIcon={
                                isProcessing ? (
                                    <CircularProgress size={24} />
                                ) : isRecording ? (
                                    <MicOffIcon />
                                ) : (
                                    <MicIcon />
                                )
                            }
                            sx={{ minWidth: 200, minHeight: 48 }}
                        >
                            {isProcessing ? translate('voice.processing_ai') : isRecording ? translate('voice.stop_recording_full') : translate('voice.start_recording_full')}
                        </Button>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Tooltip title={getStatusText()}>
                                <span style={{ fontSize: '24px', cursor: 'default' }}>{getStatusCircle()}</span>
                            </Tooltip>
                            {hasEnhancedAnalysis && (
                                <Chip
                                    label={translate('voice.ai_label')}
                                    color="success"
                                    size="small"
                                    icon={<AIIcon />}
                                />
                            )}
                        </Box>

                        {autoApply && (
                            <Alert severity="info" sx={{ width: '100%' }}>
                                {translate('voice.auto_apply_info')}
                            </Alert>
                        )}

                        {disabled && (
                            <Alert severity="warning" sx={{ width: '100%' }}>
                                {translate('voice.recording_disabled_full')}
                            </Alert>
                        )}
                    </Box>
                </CardContent>
            </Card>

            {/* Analysis Drawer */}
            {renderAnalysisDrawer()}
        </Box>
    );

    return layout === 'horizontal' ? renderHorizontalLayout() : renderVerticalLayout();
};

export default VoiceTabAgent;
