import { useState, useCallback, useRef } from 'react';
import { useAxios } from 'dash-axios-hook';
import { dashStorage } from 'dash-utils';
// Simple helper to check if VoiceRecorder plugin is available
const isVoiceRecorderAvailable = (): boolean => {
    return !!(window as any)?.Capacitor?.Plugins?.VoiceRecorder;
};

// Get VoiceRecorder plugin directly
const getVoiceRecorder = () => {
    return (window as any)?.Capacitor?.Plugins?.VoiceRecorder;
};

// Get Capacitor core
const getCapacitor = () => {
    return (window as any)?.Capacitor;
};

export interface VoiceAction {
    action: 'add' | 'remove' | 'modify_quantity' | 'add_note';
    product_names: string[];
    quantity?: number;
    note?: string;
    confidence: number;
    resolved_products?: Array<{
        id: string;
        name: string;
        sku: string;
        price: string;
        product_data: any;
    }>;
    resolution_status?: 'found' | 'not_found' | 'multiple' | 'resolution_error';
    resolution_error?: string;
    
    // Raw modifiers from action extraction (e.g., ["con arroz", "sin cebolla"])
    modifiers?: string[];
    
    // Enhanced AI features
    suggested_modifiers?: Array<{
        product_id: string;
        modifier_group_id: string;
        modifier_option_id: string;
        detection_reason: string;
        confidence: number;
        matched_keywords?: string[];
        detection_type: string;
    }>;
    auto_added?: boolean;
    auto_added_reason?: string;
    ai_analysis?: string;
    confidence_boost?: number;
}

export interface VoiceAgentResponse {
    success: boolean;
    data?: {
        id: number;
        original_transcription: string;
        actions: VoiceAction[];
        ai_response?: any;
        enhanced_analysis?: boolean;
        processing_steps?: {
            step1_initial_extraction: string;
            step2_product_resolution: string;
            step3_enhanced_analysis: string;
        };
        processing_time?: number;
    };
    session_id: string;
    error?: string;
}

export interface VoiceProcessingResult {
    success: boolean;
    data?: {
        id: number;
        original_transcription: string;
        actions: VoiceAction[];
        processing_steps?: {
            step1_initial_extraction?: any;
            step2_product_resolution?: string;
            step3_enhanced_analysis?: string;
        };
        enhanced_analysis?: boolean;
    };
    session_id: string;
    error?: string;
}

export interface UseVoiceAgentOptions {
    autoApply?: boolean;
    onActionsDetected?: (actions: VoiceAction[]) => void;
    onError?: (error: string) => void;
    onTranscriptionComplete?: (transcription: string) => void;
    onProcessingComplete?: (result: VoiceProcessingResult) => void;
}

export interface UseVoiceAgentReturn {
    // State
    isRecording: boolean;
    isProcessing: boolean;
    lastTranscription: string;
    lastActions: VoiceAction[];
    processingSteps: any;
    permissionStatus: 'unknown' | 'granted' | 'denied';
    
    // Core functions
    checkMicrophonePermission: () => Promise<boolean>;
    startRecording: () => Promise<void>;
    stopRecording: () => Promise<Blob | { base64: string; mimeType: string; duration: number } | null>;
    processAudio: (
        audioData: Blob | { base64: string; mimeType: string; duration: number },
        sessionId?: string,
        tabId?: string | null,
        context?: any
    ) => Promise<VoiceProcessingResult>;
    processRecording: (
        sessionId?: string,
        tabId?: string | null,
        context?: any
    ) => Promise<VoiceProcessingResult | undefined>;
    toggleRecording: (
        sessionId?: string,
        tabId?: string | null,
        context?: any
    ) => Promise<VoiceProcessingResult | undefined>;
    cleanup: () => Promise<void>;
    
    // Native-specific functions
    getCurrentStatus: () => Promise<string>;
    pauseRecording: () => Promise<boolean>;
    resumeRecording: () => Promise<boolean>;
    
    // Platform info
    isNative: boolean;
    platform: string;
    hasVoiceRecorderPlugin: boolean;
    
    // Enhanced utilities
    hasEnhancedAnalysis: boolean;
    getModifierSuggestions: () => any[];
    getAutoAddedProducts: () => VoiceAction[];
    getProcessingMetrics: () => {
        totalActions: number;
        productsResolved: number;
        modifiersSuggested: number;
        autoAddedProducts: number;
        enhancedAnalysis: boolean;
    };
    
    // Debug utilities
    getDebugInfo: () => any;
    getAudioChunksInfo: () => any;
}

export const useVoiceAgent = (options: UseVoiceAgentOptions = {}): UseVoiceAgentReturn => {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastTranscription, setLastTranscription] = useState<string>('');
    const [lastActions, setLastActions] = useState<VoiceAction[]>([]);
    const [processingSteps, setProcessingSteps] = useState<any>({});
    const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied'>('unknown');
    
    // For web recording fallback
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    
    const axios = useAxios();

    // Audio conversion utility using Web Audio API
    const convertAudioToWebM = useCallback(async (audioData: { base64: string; mimeType: string; duration: number }): Promise<Blob> => {
        try {
            console.log('🔄 Converting AAC to WebM using Web Audio API');
            
            // Convert base64 to ArrayBuffer
            const binaryString = atob(audioData.base64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            
            // Create AudioContext
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            
            console.log('🎵 Decoding audio data...', {
                originalSize: bytes.length,
                mimeType: audioData.mimeType,
                duration: audioData.duration
            });
            
            // Decode the audio data
            const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);
            
            console.log('✅ Audio decoded successfully:', {
                sampleRate: audioBuffer.sampleRate,
                duration: audioBuffer.duration,
                numberOfChannels: audioBuffer.numberOfChannels,
                length: audioBuffer.length
            });
            
            // Create MediaStream from AudioBuffer using a more reliable method
            const sampleRate = audioBuffer.sampleRate;
            const numberOfChannels = audioBuffer.numberOfChannels;
            const length = audioBuffer.length;
            
            // Create an OfflineAudioContext to render the audio
            const offlineContext = new OfflineAudioContext(numberOfChannels, length, sampleRate);
            const source = offlineContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(offlineContext.destination);
            source.start(0);
            
            // Render the audio buffer
            const renderedBuffer = await offlineContext.startRendering();
            
            console.log('🎵 Audio rendered, creating MediaStream...');
            
            // Create a new AudioContext for real-time processing
            const realTimeContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            
            // Create MediaStreamDestination
            const destination = realTimeContext.createMediaStreamDestination();
            
            // Create a buffer source for the rendered audio
            const playbackSource = realTimeContext.createBufferSource();
            playbackSource.buffer = renderedBuffer;
            playbackSource.connect(destination);
            
            // Get the MediaStream
            const mediaStream = destination.stream;
            
            console.log('🎵 MediaStream created, starting MediaRecorder...');
            
            // Use MediaRecorder to encode as WebM
            const mimeType = 'audio/webm;codecs=opus';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                console.warn('⚠️ WebM/Opus not supported, trying alternatives...');
                const alternatives = [
                    'audio/webm',
                    'audio/mp4',
                    'audio/ogg;codecs=opus',
                    'audio/wav'
                ];
                
                let supportedType = '';
                for (const type of alternatives) {
                    if (MediaRecorder.isTypeSupported(type)) {
                        supportedType = type;
                        break;
                    }
                }
                
                if (!supportedType) {
                    throw new Error('No supported audio format found for MediaRecorder');
                }
                
                console.log('✅ Using alternative format:', supportedType);
            }
            
            const mediaRecorder = new MediaRecorder(mediaStream, {
                mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : 'audio/webm'
            });
            
            const chunks: Blob[] = [];
            
            return new Promise((resolve, reject) => {
                let timeoutId: NodeJS.Timeout;
                
                mediaRecorder.ondataavailable = (event) => {
                    console.log('📊 MediaRecorder data available:', event.data.size);
                    if (event.data.size > 0) {
                        chunks.push(event.data);
                    }
                };
                
                mediaRecorder.onstop = () => {
                    console.log('⏹️ MediaRecorder stopped, creating final blob...');
                    clearTimeout(timeoutId);
                    
                    if (chunks.length === 0) {
                        reject(new Error('No audio data was recorded during conversion'));
                        return;
                    }
                    
                    const webmBlob = new Blob(chunks, { 
                        type: mediaRecorder.mimeType || 'audio/webm' 
                    });
                    
                    console.log('✅ Conversion to WebM completed:', {
                        originalSize: bytes.length,
                        convertedSize: webmBlob.size,
                        finalMimeType: webmBlob.type,
                        chunksCount: chunks.length
                    });
                    
                    // Cleanup
                    realTimeContext.close();
                    audioContext.close();
                    
                    resolve(webmBlob);
                };
                
                mediaRecorder.onerror = (error) => {
                    console.error('❌ MediaRecorder error:', error);
                    clearTimeout(timeoutId);
                    realTimeContext.close();
                    audioContext.close();
                    reject(error);
                };
                
                // Start recording
                mediaRecorder.start(100); // Collect data every 100ms
                
                // Start playback of the audio
                playbackSource.start(0);
                
                // Stop recording after the duration of the audio + some buffer
                const recordingDuration = Math.max(audioBuffer.duration * 1000, 1000); // At least 1 second
                timeoutId = setTimeout(() => {
                    console.log('⏰ Stopping MediaRecorder after', recordingDuration, 'ms');
                    if (mediaRecorder.state === 'recording') {
                        mediaRecorder.stop();
                    }
                    playbackSource.stop();
                }, recordingDuration + 500); // Add 500ms buffer
            });
            
        } catch (error: any) {
            console.error('❌ Audio conversion failed:', error);
            throw new Error(`Audio conversion failed: ${error.message}`);
        }
    }, []);

    // Fallback conversion method (simple format change)
    const convertAudioFormat = useCallback(async (audioData: { base64: string; mimeType: string; duration: number }): Promise<Blob> => {
        console.log('🔄 Converting audio format (simple approach)');
        
        // Convert base64 to binary
        const binaryString = atob(audioData.base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        // For AAC data, MP4 container usually works best with OpenAI
        const targetMimeType = 'audio/mp4';
        const convertedBlob = new Blob([bytes], { type: targetMimeType });
        
        console.log('✅ Format conversion completed:', {
            originalMime: audioData.mimeType,
            targetMime: targetMimeType,
            size: convertedBlob.size
        });
        
        return convertedBlob;
    }, []);

    // Check microphone permission
    const checkMicrophonePermission = useCallback(async (): Promise<boolean> => {
        try {
            const hasVoiceRecorder = isVoiceRecorderAvailable();
            console.log('🔍 Checking microphone permissions...', {
                hasVoiceRecorder,
                availablePlugins: Object.keys((window as any)?.Capacitor?.Plugins || {})
            });

            if (hasVoiceRecorder) {
                console.log('🎤 Using VoiceRecorder plugin for permissions');
                const VoiceRecorder = getVoiceRecorder();

                // Check if device can record
                const canRecord = await VoiceRecorder.canDeviceVoiceRecord();
                console.log('🎤 Can device record:', canRecord);
                if (!canRecord.value) {
                    console.error('❌ Device cannot record audio');
                    options.onError?.('Device does not support audio recording');
                    return false;
                }

                // Check current permission status
                const hasPermission = await VoiceRecorder.hasAudioRecordingPermission();
                console.log('🔐 Has permission:', hasPermission);
                if (hasPermission.value) {
                    console.log('✅ Audio recording permission already granted');
                    setPermissionStatus('granted');
                    return true;
                }

                // Request permission
                const permission = await VoiceRecorder.requestAudioRecordingPermission();
                console.log('🔐 Permission request result:', permission);
                if (permission.value) {
                    console.log('✅ Audio recording permission granted');
                    setPermissionStatus('granted');
                    return true;
                } else {
                    console.log('❌ Audio recording permission denied');
                    setPermissionStatus('denied');
                    options.onError?.('Microphone permission denied. Please enable microphone access in your device settings.');
                    return
                    return false;
                }
            } else {
                console.log('🌐 Using web fallback for permissions');
                // Web fallback
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    console.error('❌ getUserMedia not supported');
                    options.onError?.('Audio recording not supported in this browser');
                    return false;
                }

                try {
                    const testStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    console.log('✅ Web microphone permission granted');
                    testStream.getTracks().forEach(track => track.stop());
                    setPermissionStatus('granted');
                    return true;
                } catch (error: any) {
                    console.error('❌ Web microphone permission denied:', error);
                    setPermissionStatus('denied');
                    options.onError?.('Microphone permission denied. Please enable microphone access.');
                    return false;
                }
            }
        } catch (error: any) {
            console.error('❌ Error checking microphone permission:', error);
            options.onError?.(`Permission check failed: ${error.message}`);
            return false;
        }
    }, [options]);

    // Native recording functions
    const startNativeRecording = useCallback(async () => {
        const VoiceRecorder = getVoiceRecorder();
        if (!VoiceRecorder) {
            console.warn('⚠️ VoiceRecorder not available');
            options.onError?.('Voice recorder not available on this platform');
            return;
        }

        try {
            console.log('🎤 Starting native recording...');
            const result = await VoiceRecorder.startRecording();
            console.log('🎤 Start recording result:', result);
            if (result.value) {
                setIsRecording(true);
                console.log('✅ Native recording started successfully');
            } else {
                throw new Error('Failed to start recording - no value returned');
            }
        } catch (error: any) {
            console.error('❌ Error starting native recording:', error);
            // Handle specific error codes
            if (error.code === 'MISSING_PERMISSION') {
                options.onError?.('Microphone permission is required. Please enable it in settings.');
            } else if (error.code === 'DEVICE_CANNOT_VOICE_RECORD') {
                options.onError?.('This device cannot record audio.');
            } else if (error.code === 'ALREADY_RECORDING') {
                options.onError?.('Recording is already in progress.');
            } else if (error.code === 'MICROPHONE_BEING_USED') {
                options.onError?.('Microphone is being used by another app.');
            } else {
                options.onError?.(`Failed to start recording: ${error.message}`);
            }
        }
    }, [options]);

    const stopNativeRecording = useCallback(async (): Promise<{ base64: string; mimeType: string; duration: number } | null> => {
        const VoiceRecorder = getVoiceRecorder();
        if (!VoiceRecorder) {
            console.warn('⚠️ VoiceRecorder not available');
            options.onError?.('Voice recorder not available on this platform');
            return null;
        }

        try {
            console.log('🛑 Stopping native recording...');
            const result = await VoiceRecorder.stopRecording();
            console.log('🛑 Stop recording result:', result);
            setIsRecording(false);

            if (result.value && result.value.recordDataBase64) {
                console.log('✅ Native recording stopped successfully');
                console.log('📊 Recording info:', {
                    duration: result.value.msDuration,
                    mimeType: result.value.mimeType,
                    dataSize: result.value.recordDataBase64.length
                });

                return {
                    base64: result.value.recordDataBase64,
                    mimeType: result.value.mimeType,
                    duration: result.value.msDuration || 0
                };
            } else {
                throw new Error('No recording data received');
            }
        } catch (error: any) {
            console.error('❌ Error stopping native recording:', error);
            setIsRecording(false);

            if (error.code === 'RECORDING_HAS_NOT_STARTED') {
                options.onError?.('No recording in progress.');
            } else if (error.code === 'EMPTY_RECORDING') {
                options.onError?.('Recording is empty. Please try recording again.');
            } else {
                options.onError?.(`Failed to stop recording: ${error.message}`);
            }
            return null;
        }
    }, [options]);

    // Web recording functions (fallback)
    const cleanupWebRecording = useCallback(() => {
        console.log('🧹 Cleaning up web recording resources...');

        if (mediaRecorderRef.current) {
            if (mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
            mediaRecorderRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
                track.stop();
                console.log('🛑 Stopped track:', track.kind);
            });
            streamRef.current = null;
        }

        audioChunksRef.current = [];
        console.log('✅ Web recording cleanup completed');
    }, []);

    const startWebRecording = useCallback(async () => {
        try {
            console.log('🎤 Starting web recording...');
            cleanupWebRecording();
            await new Promise(resolve => setTimeout(resolve, 100));

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 44100
                }
            });

            streamRef.current = stream;
            audioChunksRef.current = [];

            const recorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            recorder.onerror = (event) => {
                console.error('❌ Web recording error:', event);
                options.onError?.('Web recording error occurred');
                cleanupWebRecording();
            };

            recorder.start(100);
            mediaRecorderRef.current = recorder;
            setIsRecording(true);

            console.log('✅ Web recording started successfully');
        } catch (error: any) {
            console.error('❌ Error starting web recording:', error);
            cleanupWebRecording();
            options.onError?.(`Failed to start web recording: ${error.message}`);
        }
    }, [options, cleanupWebRecording]);

    const stopWebRecording = useCallback((): Promise<Blob | null> => {
        return new Promise((resolve) => {
            console.log('🛑 Stopping web recording...');

            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.onstop = () => {
                    console.log('⏹️ Web recording stopped successfully');
                    setIsRecording(false);

                    if (audioChunksRef.current.length > 0) {
                        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                        resolve(audioBlob);
                    } else {
                        resolve(null);
                    }
                };
                mediaRecorderRef.current.stop();
            } else {
                console.log('⚠️ No active web recording to stop');
                setIsRecording(false);
                resolve(null);
            }
        });
    }, []);

    // Unified recording functions
    const startRecording = useCallback(async () => {
        const hasPermission = await checkMicrophonePermission();
        if (!hasPermission) {
            console.error('❌ No microphone permission');
            return;
        }

        if (isVoiceRecorderAvailable()) {
            console.log('🎤 Using VoiceRecorder plugin for recording');
            await startNativeRecording();
        } else {
            console.log('🌐 Using web recording fallback');
            await startWebRecording();
        }
    }, [checkMicrophonePermission, startNativeRecording, startWebRecording]);

    const stopRecording = useCallback(async () => {
        if (isVoiceRecorderAvailable()) {
            console.log('🛑 Using VoiceRecorder plugin to stop recording');
            return await stopNativeRecording();
        } else {
            console.log('🛑 Using web recording to stop');
            return await stopWebRecording();
        }
    }, [stopNativeRecording, stopWebRecording]);

    // Helper function to generate boundary
    const generateBoundary = () => {
        return '----formdata-capacitor-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    };

    // Helper function to convert base64 to Uint8Array
    const base64ToUint8Array = (base64: string): Uint8Array => {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    };

    // Helper function to create FormData with proper file handling
    const createFormDataWithFile = (
        audioData: Blob | { base64: string; mimeType: string; duration: number },
        sessionId?: string,
        tabId?: string | null,
        context: any = {}
    ): FormData => {
        const formData = new FormData();

        if (typeof audioData === 'object' && 'base64' in audioData) {
            // Convert base64 to blob for FormData
            const binaryData = base64ToUint8Array(audioData.base64);

            // Keep the original MIME type - don't map it, let the server handle it
            let mimeType = audioData.mimeType;
            let filename = 'recording.m4a'; // Use .m4a extension for AAC content

            // Only map the filename, keep the original MIME type
            if (mimeType.includes('aac') || mimeType.includes('mp4')) {
                filename = 'recording.m4a';
            } else if (mimeType.includes('webm')) {
                filename = 'recording.webm';
            } else if (mimeType.includes('wav')) {
                filename = 'recording.wav';
            } else if (mimeType.includes('ogg')) {
                filename = 'recording.ogg';
            }

            const audioBlob = new Blob([binaryData], { type: mimeType });
            const audioFile = new File([audioBlob], filename, {
                type: mimeType, // Keep original MIME type
                lastModified: Date.now()
            });

            formData.append('audio', audioFile);

            console.log('✅ Created audio file from base64:', {
                name: audioFile.name,
                size: audioFile.size,
                type: audioFile.type,
                originalMimeType: audioData.mimeType,
                originalBase64Length: audioData.base64.length,
                blobSize: audioBlob.size
            });
        } else {
            // Web recording - blob data
            if (audioData.size === 0) {
                throw new Error('Audio blob is empty');
            }

            const filename = audioData.type.includes('mp4') ? 'recording.mp4' :
                audioData.type.includes('webm') ? 'recording.webm' :
                    audioData.type.includes('wav') ? 'recording.wav' :
                        audioData.type.includes('ogg') ? 'recording.ogg' : 'recording.webm';

            const audioFile = new File([audioData], filename, {
                type: audioData.type,
                lastModified: Date.now()
            });

            formData.append('audio', audioFile);

            console.log('✅ Created audio file from blob:', {
                name: audioFile.name,
                size: audioFile.size,
                type: audioFile.type
            });
        }

        if (sessionId) {
            formData.append('session_id', sessionId);
        }

        if (tabId) {
            formData.append('tab_id', tabId);
        }

        formData.append('context', JSON.stringify(context));

        return formData;
    };

    // Process audio function with conversion support// Process audio function with proper file sending
const processAudio = useCallback(async (
    audioData: Blob | { base64: string; mimeType: string; duration: number },
    sessionId?: string,
    tabId?: string | null,
    context: any = {}
): Promise<VoiceProcessingResult> => {
    setIsProcessing(true);
    setProcessingSteps({});
    
    try {
        console.log('🎵 Processing audio with proper file sending:', {
            dataType: typeof audioData,
            isVoiceRecorderAvailable: isVoiceRecorderAvailable(),
            sessionId,
            tabId,
            audioInfo: typeof audioData === 'object' && 'base64' in audioData ? {
                base64Length: audioData.base64.length,
                mimeType: audioData.mimeType,
                duration: audioData.duration
            } : {
                size: (audioData as Blob).size,
                type: (audioData as Blob).type
            }
        });

        const enhancedContext = {
            mode: 'voice_to_actions',
            language: 'es',
            enhanced_analysis: true,
            platform: isVoiceRecorderAvailable() ? 'native' : 'web',
            recording_method: isVoiceRecorderAvailable() ? 'capacitor-voice-recorder' : 'mediarecorder',
            ...context
        };

        let processedAudioData = audioData;

        // Convert AAC format if needed
        if (typeof audioData === 'object' && 'base64' in audioData) {
            const needsConversion = audioData.mimeType === 'audio/x-hx-aac-adts' ||
                                  audioData.mimeType === 'audio/aac' ||
                                  audioData.mimeType.includes('aac');
            
            if (needsConversion) {
                console.log('🔄 AAC format detected, attempting conversion...');
                try {
                    console.log('🎵 Attempting Web Audio API conversion...');
                    const convertedBlob = await convertAudioToWebM(audioData);
                    processedAudioData = convertedBlob;
                    console.log('✅ Web Audio API conversion successful');
                    
                    enhancedContext.audio_converted = true;
                    enhancedContext.original_format = audioData.mimeType;
                    enhancedContext.converted_format = convertedBlob.type;
                    enhancedContext.conversion_method = 'web_audio_api';
                } catch (webAudioError: any) {
                    console.warn('⚠️ Web Audio API conversion failed, trying fallback:', webAudioError.message);
                    try {
                        console.log('🔄 Attempting fallback format conversion...');
                        const convertedBlob = await convertAudioFormat(audioData);
                        processedAudioData = convertedBlob;
                        console.log('✅ Fallback conversion successful');
                        
                        enhancedContext.audio_converted = true;
                        enhancedContext.original_format = audioData.mimeType;
                        enhancedContext.converted_format = convertedBlob.type;
                        enhancedContext.conversion_method = 'fallback_format_change';
                    } catch (fallbackError: any) {
                        console.warn('⚠️ Fallback conversion also failed:', fallbackError.message);
                        console.log('📤 Proceeding with original audio data');
                        
                        enhancedContext.audio_converted = false;
                        enhancedContext.conversion_attempted = true;
                        enhancedContext.conversion_errors = [webAudioError.message, fallbackError.message];
                    }
                }
            } else {
                console.log('ℹ️ Audio format does not need conversion:', audioData.mimeType);
            }
        }

        // Create the audio file properly
        let audioFile: File;
        
        if (typeof processedAudioData === 'object' && 'base64' in processedAudioData) {
            // Convert base64 to File
            const binaryData = base64ToUint8Array(processedAudioData.base64);
            let mimeType = processedAudioData.mimeType;
            let filename = 'recording.m4a';
            
            if (mimeType.includes('aac') || mimeType.includes('mp4')) {
                filename = 'recording.m4a';
            } else if (mimeType.includes('webm')) {
                filename = 'recording.webm';
            } else if (mimeType.includes('wav')) {
                filename = 'recording.wav';
            } else if (mimeType.includes('ogg')) {
                filename = 'recording.ogg';
            }
            
            const audioBlob = new Blob([binaryData], { type: mimeType });
            audioFile = new File([audioBlob], filename, {
                type: mimeType,
                lastModified: Date.now()
            });
            
            console.log('✅ Created audio file from base64:', {
                name: audioFile.name,
                size: audioFile.size,
                type: audioFile.type
            });
        } else {
            // Web recording - convert blob to File
            const filename = processedAudioData.type.includes('mp4') ? 'recording.mp4' :
                            processedAudioData.type.includes('webm') ? 'recording.webm' :
                            processedAudioData.type.includes('wav') ? 'recording.wav' :
                            processedAudioData.type.includes('ogg') ? 'recording.ogg' : 'recording.webm';
            
            audioFile = new File([processedAudioData], filename, {
                type: processedAudioData.type,
                lastModified: Date.now()
            });
            
            console.log('✅ Created audio file from blob:', {
                name: audioFile.name,
                size: audioFile.size,
                type: audioFile.type
            });
        }

        // For native platform, use native fetch (the working approach)
        if (isVoiceRecorderAvailable()) {
            console.log('📱 Using native fetch approach (the one that works)');
            
            const token = dashStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Create FormData for native fetch
            const formData = new FormData();
            formData.append('audio', audioFile);
            
            if (sessionId) {
                formData.append('session_id', sessionId);
            }
            
            if (tabId) {
                formData.append('tab_id', tabId);
            }
            
            formData.append('context', JSON.stringify(enhancedContext));

            console.log('📤 Native FormData contents:');
            for (let [key, value] of formData.entries()) {
                if (value instanceof File) {
                    console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
                } else {
                    console.log(`  ${key}: ${value}`);
                }
            }

            console.log('🚀 Sending native fetch request...');
            
            const fetchResponse = await fetch(`${axios.defaults.baseURL}/system/voice-agent/process-actions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                    // Don't set Content-Type, let FormData handle it
                },
                body: formData
            });

            console.log('📥 Native fetch response:', {
                status: fetchResponse.status,
                statusText: fetchResponse.statusText,
                headers: Object.fromEntries(fetchResponse.headers.entries())
            });

            const responseData = await fetchResponse.json();
            
            if (fetchResponse.ok) {
                const result: VoiceProcessingResult = responseData;
                console.log('✅ Native fetch success:', result);
                
                if (result.success && result.data) {
                    setLastTranscription(result.data.original_transcription);
                    setLastActions(result.data.actions);
                    setProcessingSteps(result.data.processing_steps || {});
                    
                    options.onTranscriptionComplete?.(result.data.original_transcription);
                    options.onProcessingComplete?.(result);
                    
                    if (options.autoApply && result.data.actions.length > 0) {
                        options.onActionsDetected?.(result.data.actions);
                    }
                } else {
                    options.onError?.(result.error || 'Voice processing failed');
                }
                
                return result;
            } else {
                console.error('❌ Native fetch error:', responseData);
                throw new Error(responseData.message || responseData.error || 'Fetch request failed');
            }
        } else {
            // Web fallback - use axios but with proper configuration
            console.log('🌐 Using axios for web platform');
            
            const formData = new FormData();
            formData.append('audio', audioFile);
            
            if (sessionId) {
                formData.append('session_id', sessionId);
            }
            
            if (tabId) {
                formData.append('tab_id', tabId);
            }
            
            formData.append('context', JSON.stringify(enhancedContext));

            console.log('📤 Web axios FormData contents:');
            for (let [key, value] of formData.entries()) {
                if (value instanceof File) {
                    console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
                } else {
                    console.log(`  ${key}: ${value}`);
                }
            }

            console.log('📤 Sending axios request...');
            
            const response = await axios.post('/system/voice-agent/process-actions', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                timeout: 30000,
                // Ensure axios doesn't transform the data
                transformRequest: [(data) => data]
            });

            console.log('📥 Axios response received:', {
                status: response.status,
                statusText: response.statusText
            });

            const result: VoiceProcessingResult = response.data;
            console.log('✅ Voice processing result:', result);

            if (result.success && result.data) {
                setLastTranscription(result.data.original_transcription);
                setLastActions(result.data.actions);
                setProcessingSteps(result.data.processing_steps || {});
                
                options.onTranscriptionComplete?.(result.data.original_transcription);
                options.onProcessingComplete?.(result);
                
                if (options.autoApply && result.data.actions.length > 0) {
                    options.onActionsDetected?.(result.data.actions);
                }
            } else {
                options.onError?.(result.error || 'Voice processing failed');
            }
            
            return result;
        }

    } catch (error: any) {
        console.error('❌ Voice processing error:', error);
        
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
            console.error('Response data:', error.response.data);
        }
        
        const errorMessage = error.response?.data?.error ||
                           error.response?.data?.message ||
                           error.message ||
                           'Voice processing failed';
        options.onError?.(errorMessage);
        
        return {
            success: false,
            error: errorMessage,
            session_id: sessionId || ''
        };
    } finally {
        setIsProcessing(false);
    }
}, [axios, options, convertAudioToWebM, convertAudioFormat]);

    const processRecording = useCallback(async (
        sessionId?: string,
        tabId?: string | null,
        context: any = {}
    ) => {
        console.log('🎬 Processing recording...');

        const audioData = await stopRecording();

        if (!audioData) {
            console.error('❌ No audio data available');
            options.onError?.('No audio recorded');
            return;
        }

        return await processAudio(audioData, sessionId, tabId, context);
    }, [stopRecording, processAudio, options]);

    const toggleRecording = useCallback(async (
        sessionId?: string,
        tabId?: string | null,
        context: any = {}
    ) => {
        console.log('🔄 Toggle recording:', { isRecording, isProcessing });

        if (isProcessing) {
            console.log('⚠️ Already processing, ignoring toggle');
            return;
        }

        if (isRecording) {
            console.log('🛑 Stopping recording and processing...');
            const result = await processRecording(sessionId, tabId, context);
            return result;
        } else {
            console.log('🎤 Starting recording...');
            await startRecording();
        }
    }, [isRecording, isProcessing, processRecording, startRecording]);

    // Get current recording status (native only)
    const getCurrentStatus = useCallback(async () => {
        if (isVoiceRecorderAvailable()) {
            try {
                const VoiceRecorder = getVoiceRecorder();
                const status = await VoiceRecorder.getCurrentStatus();
                return status.status; // 'NONE', 'RECORDING', 'PAUSED'
            } catch (error) {
                console.error('Error getting recording status:', error);
                return 'NONE';
            }
        }
        return isRecording ? 'RECORDING' : 'NONE';
    }, [isRecording]);

    // Pause recording (native only)
    const pauseRecording = useCallback(async () => {
        if (isVoiceRecorderAvailable()) {
            try {
                const VoiceRecorder = getVoiceRecorder();
                const result = await VoiceRecorder.pauseRecording();
                console.log('Recording paused:', result.value);
                return result.value;
            } catch (error: any) {
                console.error('Error pausing recording:', error);
                options.onError?.(`Failed to pause recording: ${error.message}`);
                return false;
            }
        } else {
            console.log('Pause not supported on web');
            return false;
        }
    }, [options]);

    // Resume recording (native only)
    const resumeRecording = useCallback(async () => {
        if (isVoiceRecorderAvailable()) {
            try {
                const VoiceRecorder = getVoiceRecorder();
                const result = await VoiceRecorder.resumeRecording();
                console.log('Recording resumed:', result.value);
                return result.value;
            } catch (error: any) {
                console.error('Error resuming recording:', error);
                options.onError?.(`Failed to resume recording: ${error.message}`);
                return false;
            }
        } else {
            console.log('Resume not supported on web');
            return false;
        }
    }, [options]);

    // Enhanced cleanup function
    const cleanup = useCallback(async () => {
        console.log('🧹 Final cleanup...');
        if (isVoiceRecorderAvailable()) {
            // For native, we should stop recording if it's active
            try {
                const VoiceRecorder = getVoiceRecorder();
                const status = await VoiceRecorder.getCurrentStatus();
                if (status.status === 'RECORDING' || status.status === 'PAUSED') {
                    await VoiceRecorder.stopRecording();
                }
            } catch (error) {
                console.error('Error during cleanup:', error);
            }
        } else {
            cleanupWebRecording();
        }
        setIsRecording(false);
        setIsProcessing(false);
    }, [cleanupWebRecording]);

    // Get debug information
    const getDebugInfo = useCallback(() => {
        const hasVoiceRecorder = isVoiceRecorderAvailable();
        const capacitor = getCapacitor();

        return {
            windowCapacitor: !!capacitor,
            hasVoiceRecorder,
            availablePlugins: capacitor?.Plugins ? Object.keys(capacitor.Plugins) : [],
            platform: capacitor?.getPlatform?.() || 'web',
            isNativePlatform: capacitor?.isNativePlatform?.() || false,
            permissionStatus,
            isRecording,
            isProcessing,
            lastTranscription: lastTranscription.substring(0, 100) + (lastTranscription.length > 100 ? '...' : ''),
            lastActionsCount: lastActions.length,
            processingStepsKeys: Object.keys(processingSteps),
            webAudioSupported: !!(window.AudioContext || (window as any).webkitAudioContext),
            mediaRecorderSupported: !!window.MediaRecorder,
            supportedMimeTypes: {
                webm: MediaRecorder?.isTypeSupported?.('audio/webm') || false,
                webmOpus: MediaRecorder?.isTypeSupported?.('audio/webm;codecs=opus') || false,
                mp4: MediaRecorder?.isTypeSupported?.('audio/mp4') || false,
                ogg: MediaRecorder?.isTypeSupported?.('audio/ogg') || false,
                wav: MediaRecorder?.isTypeSupported?.('audio/wav') || false
            }
        };
    }, [permissionStatus, isRecording, isProcessing, lastTranscription, lastActions.length, processingSteps]);

    return {
        // State
        isRecording,
        isProcessing,
        lastTranscription,
        lastActions,
        processingSteps,
        permissionStatus,

        // Core functions
        checkMicrophonePermission,
        startRecording,
        stopRecording,
        processAudio,
        processRecording,
        toggleRecording,
        cleanup,

        // Native-specific functions
        getCurrentStatus,
        pauseRecording,
        resumeRecording,

        // Platform info
        isNative: isVoiceRecorderAvailable(),
        platform: getCapacitor()?.getPlatform?.() || 'web',
        hasVoiceRecorderPlugin: isVoiceRecorderAvailable(),

        // Enhanced utilities
        hasEnhancedAnalysis: processingSteps?.step3_enhanced_analysis === 'completed',
        getModifierSuggestions: () => {
            return lastActions.flatMap(action => action.suggested_modifiers || []);
        },
        getAutoAddedProducts: () => {
            return lastActions.filter(action => action.auto_added);
        },
        getProcessingMetrics: () => {
            return {
                totalActions: lastActions.length,
                productsResolved: lastActions.reduce((sum, action) =>
                    sum + (action.resolved_products?.length || 0), 0),
                modifiersSuggested: lastActions.reduce((sum, action) =>
                    sum + (action.suggested_modifiers?.length || 0), 0),
                autoAddedProducts: lastActions.filter(action => action.auto_added).length,
                enhancedAnalysis: processingSteps?.step3_enhanced_analysis === 'completed'
            };
        },

        // Debug utilities
        getDebugInfo,
        getAudioChunksInfo: () => {
            if (isVoiceRecorderAvailable()) {
                return { message: 'Native recording - no chunks info available' };
            }
            return {
                count: audioChunksRef.current.length,
                totalSize: audioChunksRef.current.reduce((sum, chunk) => sum + chunk.size, 0),
                chunks: audioChunksRef.current.map(chunk => ({ size: chunk.size, type: chunk.type }))
            };
        }
    };
};

// Audio conversion utilities
const convertAudioToWebM = async (audioData: { base64: string; mimeType: string; duration: number }): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        try {
            console.log('🎵 Starting Web Audio API conversion...');
            
            // Convert base64 to ArrayBuffer
            const binaryString = atob(audioData.base64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) {
                throw new Error('Web Audio API not supported');
            }
            
            const audioContext = new AudioContext();
            
            audioContext.decodeAudioData(bytes.buffer)
                .then(audioBuffer => {
                    console.log('✅ Audio decoded successfully:', {
                        sampleRate: audioBuffer.sampleRate,
                        duration: audioBuffer.duration,
                        numberOfChannels: audioBuffer.numberOfChannels
                    });
                    
                    // Create a new audio buffer with the decoded data
                    const offlineContext = new OfflineAudioContext(
                        audioBuffer.numberOfChannels,
                        audioBuffer.length,
                        audioBuffer.sampleRate
                    );
                    
                    const source = offlineContext.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(offlineContext.destination);
                    source.start(0);
                    
                    return offlineContext.startRendering();
                })
                .then(renderedBuffer => {
                    console.log('✅ Audio rendered successfully');
                    
                    // Convert to WAV format (more compatible)
                    const wavBlob = audioBufferToWav(renderedBuffer);
                    resolve(wavBlob);
                })
                .catch(error => {
                    console.error('❌ Web Audio API conversion failed:', error);
                    reject(error);
                });
                
        } catch (error) {
            console.error('❌ Web Audio API setup failed:', error);
            reject(error);
        }
    });
};

const convertAudioFormat = async (audioData: { base64: string; mimeType: string; duration: number }): Promise<Blob> => {
    console.log('🔄 Attempting simple format conversion...');
    
    // Convert base64 to blob with a more compatible MIME type
    const binaryString = atob(audioData.base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Try different MIME types that might be more compatible
    const compatibleMimeTypes = [
        'audio/mp4',
        'audio/mpeg',
        'audio/wav',
        'audio/ogg',
        'audio/webm'
    ];
    
    // Use the first compatible MIME type, or default to mp4
    const mimeType = compatibleMimeTypes[0]; // Start with mp4 as it's widely supported
    
    console.log('✅ Format conversion completed:', {
        originalMimeType: audioData.mimeType,
        newMimeType: mimeType,
        size: bytes.length
    });
    
    return new Blob([bytes], { type: mimeType });
};

// Helper function to convert AudioBuffer to WAV
const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numberOfChannels * 2, true);
    
    // Convert float samples to 16-bit PCM
    let offset = 44;
    for (let i = 0; i < length; i++) {
        for (let channel = 0; channel < numberOfChannels; channel++) {
            const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            offset += 2;
        }
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
};



export default useVoiceAgent;
