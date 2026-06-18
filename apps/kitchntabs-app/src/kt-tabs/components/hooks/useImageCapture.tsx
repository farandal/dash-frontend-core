/**
 * useImageCapture Hook
 * 
 * A React hook for capturing images using Capacitor Camera plugin on Android/iOS
 * and the browser's native camera API (getUserMedia) on web.
 * 
 * This is designed to work with the Image Agent API for order processing.
 * 
 * Requirements:
 * - @capacitor/camera plugin must be installed for native
 * - Browser must support navigator.mediaDevices.getUserMedia for web camera
 * 
 * Installation:
 * ```bash
 * pnpm add @capacitor/camera
 * npx cap sync
 * ```
 * 
 * Android Permissions (in AndroidManifest.xml):
 * ```xml
 * <uses-permission android:name="android.permission.CAMERA" />
 * <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
 * <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
 * ```
 */

import { useState, useCallback, useRef, useEffect } from 'react';

// Helper functions to access Capacitor from window object (avoids direct imports)
const getCapacitor = () => {
  return (window as any)?.Capacitor;
};

const isCameraAvailable = (): boolean => {
  return !!(window as any)?.Capacitor?.Plugins?.Camera;
};

const getCameraPlugin = () => {
  return (window as any)?.Capacitor?.Plugins?.Camera;
};

// Camera result type enum values (matching @capacitor/camera)
const CameraResultType = {
  Uri: 'uri',
  Base64: 'base64',
  DataUrl: 'dataUrl',
} as const;

// Camera source enum values (matching @capacitor/camera)
const CameraSource = {
  Prompt: 'PROMPT',
  Camera: 'CAMERA',
  Photos: 'PHOTOS',
} as const;

// Types for the Camera plugin (we'll dynamically import it)
interface Photo {
  base64String?: string;
  dataUrl?: string;
  path?: string;
  webPath?: string;
  format: string;
}

interface CameraOptions {
  quality?: number;
  allowEditing?: boolean;
  resultType?: 'uri' | 'base64' | 'dataUrl';
  source?: 'camera' | 'photos' | 'prompt';
  width?: number;
  height?: number;
  correctOrientation?: boolean;
  saveToGallery?: boolean;
  promptLabelHeader?: string;
  promptLabelCancel?: string;
  promptLabelPhoto?: string;
  promptLabelPicture?: string;
}

export interface ImageCaptureResult {
  base64: string | null;
  dataUrl: string | null;
  webPath: string | null;
  format: string;
  timestamp: number;
}

export interface UseImageCaptureReturn {
  // State
  isCapturing: boolean;
  capturedImage: ImageCaptureResult | null;
  error: string | null;
  isNative: boolean;
  isCameraSupported: boolean;
  isWebCameraActive: boolean;
  countdown: number | null;
  
  // Actions
  captureFromCamera: (options?: CameraOptions) => Promise<ImageCaptureResult | null>;
  captureFromGallery: (options?: CameraOptions) => Promise<ImageCaptureResult | null>;
  captureWithPrompt: (options?: CameraOptions) => Promise<ImageCaptureResult | null>;
  openWebCamera: () => Promise<void>;
  captureFromWebCamera: () => Promise<ImageCaptureResult | null>;
  captureWithCountdown: (countdownSeconds?: number) => Promise<ImageCaptureResult | null>;
  closeWebCamera: () => void;
  cancelCountdown: () => void;
  resetCapture: () => void;
  
  // Utilities
  getBase64ForApi: () => string | null;
  getImageFile: () => Promise<File | null>;
  
  // Web camera refs (for rendering video preview)
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const DEFAULT_OPTIONS: CameraOptions = {
  quality: 85,
  allowEditing: false,
  resultType: 'base64',
  correctOrientation: true,
  saveToGallery: false,
  width: 1920,
  height: 1920,
  promptLabelHeader: 'Foto',
  promptLabelCancel: 'Cancelar',
  promptLabelPhoto: 'Cámara',
  promptLabelPicture: 'Galería',
};

export const useImageCapture = (): UseImageCaptureReturn => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<ImageCaptureResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isWebCameraActive, setIsWebCameraActive] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  
  // File input ref for web fallback
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  // Web camera refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownCancelledRef = useRef<boolean>(false);
  
  // Check if we're running in a native environment using window object
  const capacitor = getCapacitor();
  const isNative = capacitor?.isNativePlatform?.() || false;
  const platform = capacitor?.getPlatform?.() || 'web';
  const hasCameraPlugin = isCameraAvailable();
  
  // Check if browser supports camera (getUserMedia) - for web only
  const webCameraSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  
  // Camera is supported if:
  // - On native AND has camera plugin, OR
  // - On web AND browser supports getUserMedia
  const isCameraSupported = (isNative && hasCameraPlugin) || (!isNative && webCameraSupported);
  
  console.log('[useImageCapture] Platform:', platform, 'isNative:', isNative, 'hasCameraPlugin:', hasCameraPlugin, 'webCameraSupported:', webCameraSupported, 'isCameraSupported:', isCameraSupported);

  // Cleanup web camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, []);

  /**
   * Get the Camera plugin from window object
   */
  const getCamera = useCallback(() => {
    const camera = getCameraPlugin();
    if (!camera) {
      console.error('[useImageCapture] Camera plugin not available on window.Capacitor.Plugins');
      return null;
    }
    return camera;
  }, []);

  /**
   * Check and request camera permissions
   */
  const checkPermissions = useCallback(async (): Promise<boolean> => {
    if (!isNative || !hasCameraPlugin) {
      // On web, permissions are handled by the browser
      return true;
    }

    try {
      const Camera = getCamera();
      if (!Camera) {
        throw new Error('Camera plugin not available');
      }

      const permissions = await Camera.checkPermissions();
      console.log('[useImageCapture] Current permissions:', permissions);

      if (permissions.camera !== 'granted' || permissions.photos !== 'granted') {
        console.log('[useImageCapture] Requesting permissions...');
        const newPermissions = await Camera.requestPermissions({
          permissions: ['camera', 'photos'],
        });
        console.log('[useImageCapture] New permissions:', newPermissions);
        
        return newPermissions.camera === 'granted';
      }

      return true;
    } catch (err) {
      console.error('[useImageCapture] Permission error:', err);
      return false;
    }
  }, [isNative, hasCameraPlugin, getCamera]);

  /**
   * Capture image from camera (native)
   */
  const captureFromCameraNative = useCallback(async (options: CameraOptions = {}): Promise<ImageCaptureResult | null> => {
    console.log('[useImageCapture] captureFromCameraNative called');
    try {
      const Camera = getCamera();
      console.log('[useImageCapture] Camera plugin:', Camera ? 'available' : 'not available');
      
      if (!Camera) {
        throw new Error('Camera plugin not available');
      }

      const hasPermission = await checkPermissions();
      console.log('[useImageCapture] Permission check result:', hasPermission);
      
      if (!hasPermission) {
        throw new Error('Camera permission denied');
      }

      const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
      console.log('[useImageCapture] Calling Camera.getPhoto with options:', {
        quality: mergedOptions.quality,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
      });
      
      const photo: Photo = await Camera.getPhoto({
        quality: mergedOptions.quality,
        allowEditing: mergedOptions.allowEditing,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        width: mergedOptions.width,
        height: mergedOptions.height,
        correctOrientation: mergedOptions.correctOrientation,
        saveToGallery: mergedOptions.saveToGallery,
      });

      console.log('[useImageCapture] Photo captured successfully:', {
        hasBase64: !!photo.base64String,
        format: photo.format,
        webPath: photo.webPath,
      });

      const result: ImageCaptureResult = {
        base64: photo.base64String || null,
        dataUrl: photo.base64String ? `data:image/${photo.format};base64,${photo.base64String}` : null,
        webPath: photo.webPath || null,
        format: photo.format || 'jpeg',
        timestamp: Date.now(),
      };

      return result;
    } catch (err: any) {
      console.error('[useImageCapture] Camera capture error:', err);
      console.error('[useImageCapture] Error name:', err?.name);
      console.error('[useImageCapture] Error message:', err?.message);
      throw err;
    }
  }, [getCamera, checkPermissions]);

  /**
   * Capture image from gallery (native)
   */
  const captureFromGalleryNative = useCallback(async (options: CameraOptions = {}): Promise<ImageCaptureResult | null> => {
    try {
      const Camera = getCamera();
      if (!Camera) {
        throw new Error('Camera plugin not available');
      }

      const hasPermission = await checkPermissions();
      if (!hasPermission) {
        throw new Error('Photo library permission denied');
      }

      const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
      
      const photo: Photo = await Camera.getPhoto({
        quality: mergedOptions.quality,
        allowEditing: mergedOptions.allowEditing,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos,
        width: mergedOptions.width,
        height: mergedOptions.height,
        correctOrientation: mergedOptions.correctOrientation,
      });

      const result: ImageCaptureResult = {
        base64: photo.base64String || null,
        dataUrl: photo.base64String ? `data:image/${photo.format};base64,${photo.base64String}` : null,
        webPath: photo.webPath || null,
        format: photo.format || 'jpeg',
        timestamp: Date.now(),
      };

      return result;
    } catch (err: any) {
      console.error('[useImageCapture] Gallery capture error:', err);
      throw err;
    }
  }, [getCamera, checkPermissions]);

  /**
   * Capture with prompt (native) - lets user choose between camera and gallery
   */
  const captureWithPromptNative = useCallback(async (options: CameraOptions = {}): Promise<ImageCaptureResult | null> => {
    try {
      const Camera = getCamera();
      if (!Camera) {
        throw new Error('Camera plugin not available');
      }

      const hasPermission = await checkPermissions();
      if (!hasPermission) {
        throw new Error('Camera/photo permission denied');
      }

      const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
      
      const photo: Photo = await Camera.getPhoto({
        quality: mergedOptions.quality,
        allowEditing: mergedOptions.allowEditing,
        resultType: CameraResultType.Base64,
        source: CameraSource.Prompt,
        width: mergedOptions.width,
        height: mergedOptions.height,
        correctOrientation: mergedOptions.correctOrientation,
        saveToGallery: mergedOptions.saveToGallery,
        promptLabelHeader: mergedOptions.promptLabelHeader,
        promptLabelCancel: mergedOptions.promptLabelCancel,
        promptLabelPhoto: mergedOptions.promptLabelPhoto,
        promptLabelPicture: mergedOptions.promptLabelPicture,
      });

      const result: ImageCaptureResult = {
        base64: photo.base64String || null,
        dataUrl: photo.base64String ? `data:image/${photo.format};base64,${photo.base64String}` : null,
        webPath: photo.webPath || null,
        format: photo.format || 'jpeg',
        timestamp: Date.now(),
      };

      return result;
    } catch (err: any) {
      console.error('[useImageCapture] Prompt capture error:', err);
      throw err;
    }
  }, [getCamera, checkPermissions]);

  /**
   * Web fallback: File input capture
   */
  const captureFromWeb = useCallback((acceptType: 'camera' | 'gallery' | 'both' = 'both'): Promise<ImageCaptureResult | null> => {
    return new Promise((resolve, reject) => {
      // Create file input if not exists
      if (!fileInputRef.current) {
        fileInputRef.current = document.createElement('input');
        fileInputRef.current.type = 'file';
        fileInputRef.current.style.display = 'none';
        document.body.appendChild(fileInputRef.current);
      }

      const input = fileInputRef.current;
      input.accept = 'image/jpeg,image/png,image/webp,image/gif';
      
      // On mobile web, we can suggest camera
      if (acceptType === 'camera') {
        input.setAttribute('capture', 'environment');
      } else if (acceptType === 'gallery') {
        input.removeAttribute('capture');
      }

      const handleChange = (event: Event) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        
        if (!file) {
          resolve(null);
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          const base64 = dataUrl.split(',')[1];
          const format = file.type.split('/')[1] || 'jpeg';

          const result: ImageCaptureResult = {
            base64,
            dataUrl,
            webPath: URL.createObjectURL(file),
            format,
            timestamp: Date.now(),
          };

          resolve(result);
        };
        
        reader.onerror = () => {
          reject(new Error('Failed to read image file'));
        };

        reader.readAsDataURL(file);
        
        // Reset input for next use
        input.value = '';
      };

      input.addEventListener('change', handleChange, { once: true });
      input.click();
    });
  }, []);

  /**
   * Open web camera using getUserMedia API
   */
  const openWebCamera = useCallback(async (): Promise<void> => {
    if (!isCameraSupported) {
      setError('Camera not supported in this browser');
      return;
    }

    try {
      setIsCapturing(true);
      setError(null);

      console.log('[useImageCapture] Opening web camera...');

      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Request camera access with preferences for rear camera on mobile
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' }, // Prefer rear camera
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      streamRef.current = stream;

      // Attach to video element if available
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // iOS requirement
        await videoRef.current.play();
      }

      setIsWebCameraActive(true);
      console.log('[useImageCapture] Web camera opened successfully');

    } catch (err: any) {
      console.error('[useImageCapture] Failed to open web camera:', err);
      
      let errorMessage = 'Failed to access camera';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = 'Camera permission denied. Please allow camera access in your browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = 'No camera found on this device.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = 'Camera is already in use by another application.';
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = 'Camera does not meet the requested constraints.';
      }
      
      setError(errorMessage);
      setIsWebCameraActive(false);
    } finally {
      setIsCapturing(false);
    }
  }, [isCameraSupported]);

  /**
   * Capture image from active web camera stream
   */
  const captureFromWebCamera = useCallback(async (): Promise<ImageCaptureResult | null> => {
    if (!videoRef.current || !canvasRef.current || !streamRef.current) {
      setError('Web camera not active. Please open the camera first.');
      return null;
    }

    try {
      setIsCapturing(true);
      setError(null);

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Failed to get canvas context');
      }

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to base64
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      const base64 = dataUrl.split(',')[1];

      const result: ImageCaptureResult = {
        base64,
        dataUrl,
        webPath: dataUrl,
        format: 'jpeg',
        timestamp: Date.now(),
      };

      setCapturedImage(result);
      console.log('[useImageCapture] Web camera capture successful');

      return result;

    } catch (err: any) {
      console.error('[useImageCapture] Web camera capture error:', err);
      setError(err.message || 'Failed to capture from web camera');
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, []);

  /**
   * Close web camera and stop stream
   */
  const closeWebCamera = useCallback(() => {
    console.log('[useImageCapture] Closing web camera...');
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('[useImageCapture] Stopped track:', track.kind);
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsWebCameraActive(false);
    setCountdown(null);
    setError(null);
  }, []);

  /**
   * Cancel ongoing countdown
   */
  const cancelCountdown = useCallback(() => {
    console.log('[useImageCapture] Cancelling countdown...');
    countdownCancelledRef.current = true;
    
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    
    setCountdown(null);
    setIsCapturing(false);  // Reset capturing state
    closeWebCamera();
  }, [closeWebCamera]);

  /**
   * Capture from web camera with countdown timer and preview
   * Opens camera, shows video preview, counts down, then captures
   */
  const captureWithCountdown = useCallback(async (countdownSeconds: number = 5): Promise<ImageCaptureResult | null> => {
    if (!isCameraSupported) {
      console.log('[useImageCapture] Camera not supported, falling back to file input');
      return captureFromWeb('camera');
    }

    try {
      setIsCapturing(true);
      setError(null);
      countdownCancelledRef.current = false;

      console.log('[useImageCapture] Starting capture with', countdownSeconds, 'second countdown...');

      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // FIRST: Open the dialog so the video element is rendered
      setIsWebCameraActive(true);
      
      // Wait for the dialog and video element to render
      await new Promise<void>((resolve) => {
        const checkVideoRef = () => {
          if (videoRef.current) {
            console.log('[useImageCapture] Video element found');
            resolve();
          } else {
            console.log('[useImageCapture] Waiting for video element...');
            setTimeout(checkVideoRef, 50);
          }
        };
        // Small initial delay for React to render
        setTimeout(checkVideoRef, 100);
      });

      // Check if cancelled while waiting for dialog
      if (countdownCancelledRef.current) {
        setIsWebCameraActive(false);
        return null;
      }

      // Request camera
      console.log('[useImageCapture] Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      // Check if cancelled during permission request
      if (countdownCancelledRef.current) {
        stream.getTracks().forEach(track => track.stop());
        setIsWebCameraActive(false);
        return null;
      }

      streamRef.current = stream;

      // Attach to video element for preview
      if (videoRef.current) {
        console.log('[useImageCapture] Attaching stream to video element...');
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.muted = true;
        await videoRef.current.play();
        console.log('[useImageCapture] Video playing');
      } else {
        console.error('[useImageCapture] Video ref still null after waiting!');
      }

      // Wait for video to be ready with actual video data
      await new Promise<void>((resolve) => {
        const video = videoRef.current;
        if (video && video.readyState >= 2 && video.videoWidth > 0) {
          console.log('[useImageCapture] Video already ready:', video.videoWidth, 'x', video.videoHeight);
          resolve();
        } else if (video) {
          console.log('[useImageCapture] Waiting for video data...');
          const onReady = () => {
            console.log('[useImageCapture] Video now ready:', video.videoWidth, 'x', video.videoHeight);
            video.removeEventListener('loadeddata', onReady);
            video.removeEventListener('canplay', onReady);
            resolve();
          };
          video.addEventListener('loadeddata', onReady);
          video.addEventListener('canplay', onReady);
          // Fallback timeout
          setTimeout(() => {
            console.log('[useImageCapture] Video ready timeout, proceeding anyway');
            resolve();
          }, 2000);
        } else {
          // Fallback timeout
          setTimeout(resolve, 500);
        }
      });

      // Check if cancelled
      if (countdownCancelledRef.current) {
        closeWebCamera();
        return null;
      }

      // Start countdown
      setCountdown(countdownSeconds);
      
      await new Promise<void>((resolve, reject) => {
        let remaining = countdownSeconds;
        
        countdownIntervalRef.current = setInterval(() => {
          if (countdownCancelledRef.current) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
              countdownIntervalRef.current = null;
            }
            reject(new Error('Countdown cancelled'));
            return;
          }
          
          remaining -= 1;
          setCountdown(remaining);
          console.log('[useImageCapture] Countdown:', remaining);
          
          if (remaining <= 0) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
              countdownIntervalRef.current = null;
            }
            resolve();
          }
        }, 1000);
      });

      // Check if cancelled
      if (countdownCancelledRef.current) {
        closeWebCamera();
        return null;
      }

      console.log('[useImageCapture] Countdown complete, capturing...');

      // Capture the frame
      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement('canvas');
      
      if (!video) {
        throw new Error('Video element not available');
      }

      canvas.width = video.videoWidth || 1920;
      canvas.height = video.videoHeight || 1080;
      
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Failed to get canvas context');
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to base64
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      const base64 = dataUrl.split(',')[1];

      // Cleanup
      closeWebCamera();

      const result: ImageCaptureResult = {
        base64,
        dataUrl,
        webPath: dataUrl,
        format: 'jpeg',
        timestamp: Date.now(),
      };

      setCapturedImage(result);
      console.log('[useImageCapture] Countdown capture successful');

      return result;

    } catch (err: any) {
      console.error('[useImageCapture] Countdown capture error:', err);
      
      // Cleanup on error
      closeWebCamera();

      if (err.message === 'Countdown cancelled') {
        return null;
      }

      let errorMessage = 'Failed to access camera';
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device.';
      }
      
      setError(errorMessage);
      return null;
    } finally {
      setIsCapturing(false);
      setCountdown(null);
    }
  }, [isCameraSupported, captureFromWeb, closeWebCamera]);

  /**
   * Capture from web camera with automatic open/capture/close flow
   * Opens camera, shows preview, and captures on user action
   */
  const captureFromWebCameraAuto = useCallback(async (): Promise<ImageCaptureResult | null> => {
    if (!isCameraSupported) {
      // Fallback to file input if camera not supported
      console.log('[useImageCapture] Camera not supported, falling back to file input');
      return captureFromWeb('camera');
    }

    // For simplicity, we open camera and return - user should call captureFromWebCamera
    // Or we can do instant capture (open, wait for video, capture, close)
    try {
      setIsCapturing(true);
      setError(null);

      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Request camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      streamRef.current = stream;

      // Create temporary video element
      const video = document.createElement('video');
      video.srcObject = stream;
      video.setAttribute('playsinline', 'true');
      video.muted = true;
      
      await video.play();
      
      // Wait for video to be ready
      await new Promise<void>((resolve) => {
        if (video.readyState >= 2) {
          resolve();
        } else {
          video.onloadeddata = () => resolve();
        }
      });

      // Small delay to ensure proper frame
      await new Promise(resolve => setTimeout(resolve, 300));

      // Create canvas and capture
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1920;
      canvas.height = video.videoHeight || 1080;
      
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Failed to get canvas context');
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to base64
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      const base64 = dataUrl.split(',')[1];

      // Cleanup
      stream.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      video.srcObject = null;

      const result: ImageCaptureResult = {
        base64,
        dataUrl,
        webPath: dataUrl,
        format: 'jpeg',
        timestamp: Date.now(),
      };

      setCapturedImage(result);
      console.log('[useImageCapture] Auto web camera capture successful');

      return result;

    } catch (err: any) {
      console.error('[useImageCapture] Auto web camera capture error:', err);
      
      // Cleanup on error
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      let errorMessage = 'Failed to access camera';
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera found';
      }
      
      setError(errorMessage);
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, [isCameraSupported, captureFromWeb]);

  /**
   * Main capture functions that handle both native and web
   */
  const captureFromCamera = useCallback(async (options: CameraOptions = {}): Promise<ImageCaptureResult | null> => {
    console.log('[useImageCapture] captureFromCamera called', { isNative, isCameraSupported });
    setIsCapturing(true);
    setError(null);

    try {
      let result: ImageCaptureResult | null;

      if (isNative) {
        console.log('[useImageCapture] Using native camera capture');
        result = await captureFromCameraNative(options);
      } else if (isCameraSupported) {
        // Use web camera API for browser
        console.log('[useImageCapture] Using web camera capture');
        result = await captureFromWebCameraAuto();
      } else {
        // Fallback to file input
        console.log('[useImageCapture] Falling back to file input');
        result = await captureFromWeb('camera');
      }

      console.log('[useImageCapture] captureFromCamera result:', result ? 'success' : 'null');

      if (result) {
        setCapturedImage(result);
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to capture image from camera';
      setError(errorMessage);
      console.error('[useImageCapture] captureFromCamera error:', err);
      
      // Re-throw user cancellation errors so calling code can handle them
      if (err.message?.includes('cancelled') || err.message?.includes('User cancelled')) {
        throw err;
      }
      
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, [isNative, isCameraSupported, captureFromCameraNative, captureFromWebCameraAuto, captureFromWeb]);

  const captureFromGallery = useCallback(async (options: CameraOptions = {}): Promise<ImageCaptureResult | null> => {
    setIsCapturing(true);
    setError(null);

    try {
      let result: ImageCaptureResult | null;

      if (isNative) {
        result = await captureFromGalleryNative(options);
      } else {
        result = await captureFromWeb('gallery');
      }

      if (result) {
        setCapturedImage(result);
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to capture image from gallery';
      setError(errorMessage);
      console.error('[useImageCapture] captureFromGallery error:', err);
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, [isNative, captureFromGalleryNative, captureFromWeb]);

  const captureWithPrompt = useCallback(async (options: CameraOptions = {}): Promise<ImageCaptureResult | null> => {
    setIsCapturing(true);
    setError(null);

    try {
      let result: ImageCaptureResult | null;

      if (isNative) {
        result = await captureWithPromptNative(options);
      } else {
        // On web, just show file picker
        result = await captureFromWeb('both');
      }

      if (result) {
        setCapturedImage(result);
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to capture image';
      setError(errorMessage);
      console.error('[useImageCapture] captureWithPrompt error:', err);
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, [isNative, captureWithPromptNative, captureFromWeb]);

  /**
   * Reset the capture state
   */
  const resetCapture = useCallback(() => {
    setCapturedImage(null);
    setError(null);
  }, []);

  /**
   * Get base64 string ready for API submission
   */
  const getBase64ForApi = useCallback((): string | null => {
    if (!capturedImage?.base64) {
      return null;
    }
    
    // Return with data URI prefix for the API
    return capturedImage.dataUrl || `data:image/${capturedImage.format};base64,${capturedImage.base64}`;
  }, [capturedImage]);

  /**
   * Convert captured image to File object (useful for FormData)
   */
  const getImageFile = useCallback(async (): Promise<File | null> => {
    if (!capturedImage?.base64) {
      return null;
    }

    try {
      const response = await fetch(capturedImage.dataUrl || `data:image/${capturedImage.format};base64,${capturedImage.base64}`);
      const blob = await response.blob();
      
      const filename = `capture_${capturedImage.timestamp}.${capturedImage.format}`;
      return new File([blob], filename, { type: `image/${capturedImage.format}` });
    } catch (err) {
      console.error('[useImageCapture] Failed to convert to File:', err);
      return null;
    }
  }, [capturedImage]);

  return {
    // State
    isCapturing,
    capturedImage,
    error,
    isNative,
    isCameraSupported,
    isWebCameraActive,
    countdown,
    
    // Actions
    captureFromCamera,
    captureFromGallery,
    captureWithPrompt,
    openWebCamera,
    captureFromWebCamera,
    captureWithCountdown,
    closeWebCamera,
    cancelCountdown,
    resetCapture,
    
    // Utilities
    getBase64ForApi,
    getImageFile,
    
    // Web camera refs
    videoRef,
    canvasRef,
  };
};

export default useImageCapture;
