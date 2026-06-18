/**
 * useImageAgent Hook
 * 
 * A React hook for interacting with the Image Agent API
 * to process images and extract structured actions for tab manipulation.
 * 
 * This is the image counterpart to the voice agent functionality.
 * 
 * Images are automatically resized before sending to the API to optimize
 * bandwidth and API costs. Configure resize settings in imageResizeUtils.ts
 * 
 * Usage:
 * ```tsx
 * const { processImage, isProcessing, result, error } = useImageAgent();
 * 
 * // Process an image (automatically resized to max 800px width)
 * await processImage({
 *   image: imageBase64DataUrl,
 *   analysisType: 'order',
 *   tabId: '123',
 *   context: JSON.stringify({ table_number: '5' })
 * });
 * 
 * // Skip resize for specific call
 * await processImage({
 *   image: imageBase64DataUrl,
 *   analysisType: 'order',
 *   skipResize: true
 * });
 * ```
 */

import { useState, useCallback } from 'react';
import { useNotify } from 'react-admin';
import { useAxios } from 'dash-axios-hook';
import { dashStorage } from 'dash-utils';
import { resizeImageForApi, IMAGE_RESIZE_CONFIG } from './imageResizeUtils';

// Helper to check if we're on a native Capacitor platform
const isNativePlatform = (): boolean => {
  return !!(window as any)?.Capacitor?.isNativePlatform?.();
};

// Get Capacitor instance
const getCapacitor = () => {
  return (window as any)?.Capacitor;
};

// Types
export interface ImageAgentAction {
  action: 'add' | 'remove' | 'modify_quantity' | 'add_note';
  product_names: string[];
  quantity: number;
  note: string;
  confidence: number;
  source: string;
  raw_text?: string;
  resolved_products?: ResolvedProduct[];
  resolution_status?: 'found' | 'multiple_found' | 'not_found' | 'resolution_error';
  suggested_modifiers?: SuggestedModifier[];
  ai_analysis?: string;
  confidence_boost?: number;
  products_limited?: boolean;
  original_products_count?: number;
}

export interface ResolvedProduct {
  id: number;
  name: string;
  sku: string;
  price: string;
  relevance_score: number;
  gallery?: any;
  primary_image_url?: string;
  product_data?: {
    modifier_groups?: ModifierGroup[];
    [key: string]: any;
  };
}

export interface ModifierGroup {
  id: number;
  name: string;
  type: 'single' | 'multi';
  is_required: boolean;
  options: ModifierOption[];
}

export interface ModifierOption {
  id: number;
  name: string;
  price_adjustment: string;
  is_default: boolean;
}

export interface SuggestedModifier {
  product_id?: number;
  modifier_group_id?: number;
  modifier_option_id?: number;
  modifier_group_name?: string;
  modifier_option_name: string;
  detection_reason: string;
  confidence: number;
  matched_keywords?: string[];
  detection_type?: string;
}

export interface ProcessingSteps {
  step_0_image_analysis?: number;
  step_1_action_extraction?: number;
  step_2_product_resolution?: number;
  step_3_ai_enhancement?: number;
  total_processing_time: number;
}

export interface ImageAgentResult {
  id: number;
  original_analysis: string;
  analysis?: string;
  actions: ImageAgentAction[];
  enhanced_analysis: boolean;
  processing_steps: ProcessingSteps;
  processing_time: number;
}

export interface ImageAgentResponse {
  success: boolean;
  data?: ImageAgentResult;
  error?: string;
  session_id: string;
}

export interface ProcessImageOptions {
  image: string; // base64 data URL
  analysisType?: 'menu' | 'receipt' | 'order' | 'general';
  tabId?: string;
  sessionId?: string;
  maxProductsPerAction?: number;
  quickMode?: boolean;
  context?: string;
  /** Skip image resizing (default: false - images are resized to max 800px width) */
  skipResize?: boolean;
  /** Custom max width for resize (overrides default 800px) */
  maxWidth?: number;
  /** Custom max height for resize */
  maxHeight?: number;
}

export interface UseImageAgentReturn {
  // State
  isProcessing: boolean;
  lastResult: ImageAgentResult | null;
  error: string | null;
  sessionId: string | null;
  
  // Actions
  processImage: (options: ProcessImageOptions) => Promise<ImageAgentResult | null>;
  analyzeImage: (imageData: string, analysisType?: string) => Promise<string | null>;
  reset: () => void;
  
  // Utilities
  getLastActions: () => ImageAgentAction[];
  getResolvedProducts: () => ResolvedProduct[];
}

/**
 * Hook for interacting with the Image Agent API
 */
export const useImageAgent = (): UseImageAgentReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<ImageAgentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const notify = useNotify();
  const axios = useAxios(); // Use configured axios instance with baseURL

  /**
   * Get auth token from dashStorage
   */
  const getAuthToken = useCallback((): string | null => {
    try {
      const token = dashStorage.getItem('token');
      return token || null;
    } catch {
      return null;
    }
  }, []);

  /**
   * Get the API base URL from axios instance
   */
  const getBaseUrl = useCallback((): string => {
    // Use the configured axios baseURL
    const baseUrl = axios.defaults.baseURL || '';
    console.log('[useImageAgent] axios.defaults.baseURL:', baseUrl);
    return baseUrl;
  }, [axios]);

  /**
   * Process image using native fetch (for Capacitor)
   */
  const processImageNative = useCallback(async (
    options: ProcessImageOptions
  ): Promise<ImageAgentResult | null> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const baseUrl = getBaseUrl();

    // Build form data
    const formData = new FormData();
    formData.append('image_base64', options.image);

    if (options.sessionId) {
      formData.append('session_id', options.sessionId);
    }

    if (options.tabId) {
      formData.append('tab_id', options.tabId);
    }

    if (options.analysisType) {
      formData.append('analysis_type', options.analysisType);
    }

    if (options.maxProductsPerAction) {
      formData.append('max_products_per_action', options.maxProductsPerAction.toString());
    }

    if (options.quickMode !== undefined) {
      formData.append('quick_mode', options.quickMode ? '1' : '0');
    }

    if (options.context) {
      formData.append('context', options.context);
    }

    console.log('[useImageAgent] 📱 Using native fetch for Capacitor...');
    console.log('[useImageAgent] Base URL:', baseUrl);

    const fetchResponse = await fetch(`${baseUrl}/system/image-agent/process-actions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
        // Don't set Content-Type for FormData - let browser handle it
      },
      body: formData
    });

    console.log('[useImageAgent] 📥 Native fetch response:', {
      status: fetchResponse.status,
      statusText: fetchResponse.statusText
    });

    const responseData = await fetchResponse.json();

    if (fetchResponse.ok && responseData.success && responseData.data) {
      return responseData.data;
    } else {
      throw new Error(responseData.error || responseData.message || 'Image processing failed');
    }
  }, [getAuthToken, getBaseUrl, axios]);

  /**
   * Process image using axios (for web)
   */
  const processImageWeb = useCallback(async (
    options: ProcessImageOptions
  ): Promise<ImageAgentResult | null> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const baseUrl = getBaseUrl();

    // Build form data
    const formData = new FormData();
    formData.append('image_base64', options.image);

    if (options.sessionId) {
      formData.append('session_id', options.sessionId);
    }

    if (options.tabId) {
      formData.append('tab_id', options.tabId);
    }

    if (options.analysisType) {
      formData.append('analysis_type', options.analysisType);
    }

    if (options.maxProductsPerAction) {
      formData.append('max_products_per_action', options.maxProductsPerAction.toString());
    }

    if (options.quickMode !== undefined) {
      formData.append('quick_mode', options.quickMode ? '1' : '0');
    }

    if (options.context) {
      formData.append('context', options.context);
    }

    console.log('[useImageAgent] 🌐 Using axios for web...');

    const response = await axios.post<ImageAgentResponse>(
      `${baseUrl}/system/image-agent/process-actions`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        timeout: 60000, // 60 second timeout for image processing
      }
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.error || 'Image processing failed');
    }
  }, [getAuthToken, getBaseUrl, axios]);

  /**
   * Process image and extract actions for tab manipulation
   * Images are automatically resized before sending to optimize API usage
   */
  const processImage = useCallback(async (
    options: ProcessImageOptions
  ): Promise<ImageAgentResult | null> => {
    setIsProcessing(true);
    setError(null);

    try {
      // Resize image before sending (unless skipResize is true)
      let processedImage = options.image;
      
      if (!options.skipResize && options.image) {
        try {
          console.log('[useImageAgent] Resizing image before API call...', {
            originalLength: options.image.length,
            maxWidth: options.maxWidth || IMAGE_RESIZE_CONFIG.MAX_WIDTH,
            maxHeight: options.maxHeight || IMAGE_RESIZE_CONFIG.MAX_HEIGHT,
          });

          processedImage = await resizeImageForApi(options.image, {
            maxWidth: options.maxWidth,
            maxHeight: options.maxHeight,
            enabled: true,
            debug: true,
          });

          console.log('[useImageAgent] Image resized:', {
            originalLength: options.image.length,
            resizedLength: processedImage.length,
            reduction: `${Math.round((1 - processedImage.length / options.image.length) * 100)}%`,
          });
        } catch (resizeErr) {
          console.warn('[useImageAgent] Image resize failed, using original:', resizeErr);
          processedImage = options.image;
        }
      }

      console.log('[useImageAgent] Sending image to API...', {
        hasImage: !!processedImage,
        imageLength: processedImage?.length || 0,
        analysisType: options.analysisType,
        quickMode: options.quickMode,
        isNative: isNativePlatform(),
        wasResized: processedImage !== options.image,
      });

      // Create options with processed (resized) image
      const processedOptions = {
        ...options,
        image: processedImage,
      };

      let result: ImageAgentResult | null;

      // Use native fetch for Capacitor (axios has XMLHttpRequest issues)
      if (isNativePlatform()) {
        result = await processImageNative(processedOptions);
      } else {
        result = await processImageWeb(processedOptions);
      }

      console.log('[useImageAgent] API Response:', result);

      if (result) {
        setLastResult(result);
        setSessionId(options.sessionId || null);
        
        // Show success notification
        const actionsCount = result.actions?.length || 0;
        if (actionsCount > 0) {
          notify(`Procesado: ${actionsCount} acción(es) detectada(s)`, { type: 'success' });
        }
        
        return result;
      } else {
        throw new Error('No result returned from API');
      }

    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to process image';
      console.error('[useImageAgent] Error:', errorMessage, err);
      setError(errorMessage);
      notify(errorMessage, { type: 'error' });
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [processImageNative, processImageWeb, notify]);

  /**
   * Analyze image without extracting actions (simpler analysis)
   * Images are automatically resized before sending
   */
  const analyzeImage = useCallback(async (
    imageData: string,
    analysisType: string = 'general',
    skipResize: boolean = false
  ): Promise<string | null> => {
    setIsProcessing(true);
    setError(null);

    try {
      // Resize image before sending (unless skipResize is true)
      let processedImage = imageData;
      
      if (!skipResize && imageData) {
        try {
          processedImage = await resizeImageForApi(imageData, { debug: true });
          console.log('[useImageAgent] analyzeImage - Image resized:', {
            originalLength: imageData.length,
            resizedLength: processedImage.length,
          });
        } catch (resizeErr) {
          console.warn('[useImageAgent] analyzeImage - Image resize failed, using original:', resizeErr);
          processedImage = imageData;
        }
      }

      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const baseUrl = getBaseUrl();
      const formData = new FormData();
      formData.append('image_base64', processedImage);
      formData.append('analysis_type', analysisType);

      console.log('[useImageAgent] Analyzing image...', { analysisType, isNative: isNativePlatform() });

      let responseData: any;

      if (isNativePlatform()) {
        // Native fetch for Capacitor
        const fetchResponse = await fetch(`${baseUrl}/system/image-agent/analyze`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          body: formData
        });
        responseData = await fetchResponse.json();
      } else {
        // Axios for web
        const response = await axios.post(
          `${baseUrl}/system/image-agent/analyze`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            },
            timeout: 30000,
          }
        );
        responseData = response.data;
      }

      if (responseData.success && responseData.data?.analysis) {
        return responseData.data.analysis;
      } else {
        throw new Error(responseData.error || 'Analysis failed');
      }

    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to analyze image';
      console.error('[useImageAgent] Analysis error:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [getAuthToken, getBaseUrl, axios]);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setLastResult(null);
    setError(null);
    setSessionId(null);
  }, []);

  /**
   * Get actions from last result
   */
  const getLastActions = useCallback((): ImageAgentAction[] => {
    return lastResult?.actions || [];
  }, [lastResult]);

  /**
   * Get all resolved products from last result
   */
  const getResolvedProducts = useCallback((): ResolvedProduct[] => {
    if (!lastResult?.actions) return [];
    
    const products: ResolvedProduct[] = [];
    for (const action of lastResult.actions) {
      if (action.resolved_products) {
        products.push(...action.resolved_products);
      }
    }
    return products;
  }, [lastResult]);

  return {
    // State
    isProcessing,
    lastResult,
    error,
    sessionId,
    
    // Actions
    processImage,
    analyzeImage,
    reset,
    
    // Utilities
    getLastActions,
    getResolvedProducts,
  };
};

export default useImageAgent;
