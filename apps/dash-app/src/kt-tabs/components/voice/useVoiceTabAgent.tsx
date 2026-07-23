import { useState, useCallback, useMemo } from 'react';
import { useAxios } from 'dash-axios-hook';
import { VoiceActionResult } from './useVoiceAgent';


export const useVoiceTabAgent = () => {
  const [sessionId] = useState(() => `tab_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<any>(null);

  const axios = useAxios();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const processVoiceToActions = useCallback(async (
    audioBlob: Blob,
    tabId?: string,
    context: Record<string, any> = {}
  ): Promise<VoiceActionResult> => {
    if (!audioBlob) {
      return { success: false, error: 'No se proporcionó audio' };
    }

    setIsProcessing(true);
    clearError();

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');
      formData.append('session_id', sessionId);
      formData.append('context', JSON.stringify({
        ...context,
        action_mode: true,
        tab_id: tabId,
        language: 'es'
      }));

      if (tabId) {
        formData.append('tab_id', tabId);
      }

      const response = await axios.post('/system/voice-agent/process-actions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
      });

      const result = response.data;
      
      if (result.success) {
        setLastResponse(result.data.ai_response);
        return {
          success: true,
          transcription: result.data.original_transcription,
          actions: result.data.actions,
          aiResponse: result.data.ai_response
        };
      } else {
        const errorMsg = result.error || 'Error procesando comando de voz';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error: any) {
      console.error('VoiceTabAgent processing error:', error);
      
      let errorMessage = 'Error procesando comando de voz';
      
      if (error.response?.status === 413) {
        errorMessage = 'El archivo de audio es demasiado grande';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.error || 'Formato de audio no válido';
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Error de conexión. Verifica tu internet.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsProcessing(false);
    }
  }, [sessionId, axios, clearError]);

  // Memoized session display
  const sessionDisplay = useMemo(() => {
    return sessionId ? sessionId.slice(-8) : 'N/A';
  }, [sessionId]);

  return {
    sessionId,
    sessionDisplay,
    isProcessing,
    error,
    lastResponse,
    processVoiceToActions,
    clearError
  };
};
