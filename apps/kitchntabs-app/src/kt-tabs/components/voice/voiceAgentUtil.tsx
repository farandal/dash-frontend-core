

// Utility functions for using the voice agent service outside of React components

import { voiceAgentService } from "@app/services/openai/openaiService";

export const processAudioFile = async (file: File, context?: Record<string, any>) => {
  try {
    const result = await voiceAgentService.processVoiceInput(file, context);
    return result;
  } catch (error) {
    console.error('Error processing audio file:', error);
    return {
      success: false,
      error: 'Failed to process audio file'
    };
  }
};

export const transcribeAudioFile = async (file: File) => {
  try {
    const result = await voiceAgentService.transcribeAudio(file);
    return result;
  } catch (error) {
    console.error('Error transcribing audio file:', error);
    return {
      success: false,
      error: 'Failed to transcribe audio file'
    };
  }
};

export const generateTextResponse = async (text: string, context?: Record<string, any>) => {
  try {
    const result = await voiceAgentService.generateResponse(text, context);
    return result;
  } catch (error) {
    console.error('Error generating response:', error);
    return {
      success: false,
      error: 'Failed to generate response'
    };
  }
};

export const getSessionHistory = async (sessionId?: string, limit?: number) => {
  try {
    if (sessionId) {
      voiceAgentService.setSessionId(sessionId);
    }
    const result = await voiceAgentService.getConversationHistory(limit);
    return result;
  } catch (error) {
    console.error('Error fetching session history:', error);
    return {
      success: false,
      error: 'Failed to fetch session history'
    };
  }
};

export const clearSessionHistory = async (sessionId?: string) => {
  try {
    if (sessionId) {
      voiceAgentService.setSessionId(sessionId);
    }
    const result = await voiceAgentService.clearHistory();
    return result;
  } catch (error) {
    console.error('Error clearing session history:', error);
    return {
      success: false,
      error: 'Failed to clear session history'
    };
  }
};

// Helper function to create a new voice agent service instance with custom configuration
export const createVoiceAgentService = (config?: {
  sessionId?: string;
  baseURL?: string;
  timeout?: number;
}) => {
  const service = new (voiceAgentService.constructor as any)();
  
  if (config?.sessionId) {
    service.setSessionId(config.sessionId);
  }
  
  if (config?.baseURL || config?.timeout) {
    service.updateAxiosConfig({
      ...(config.baseURL && { baseURL: config.baseURL }),
      ...(config.timeout && { timeout: config.timeout })
    });
  }
  
  return service;
};
