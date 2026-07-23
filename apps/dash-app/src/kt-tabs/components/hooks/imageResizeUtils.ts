/**
 * Image Resize Utilities
 *
 * Provides configurable image resizing functionality for optimizing images
 * before sending to APIs (e.g., OpenAI Vision API).
 *
 * Usage:
 * ```typescript
 * // Resize to max 800px width (maintains aspect ratio)
 * const resizedDataUrl = await resizeImageForApi(originalDataUrl, { maxWidth: 800 });
 *
 * // Resize to max 1024px on longest side
 * const resizedDataUrl = await resizeImageForApi(originalDataUrl, { maxSize: 1024 });
 *
 * // Resize with custom quality
 * const resizedDataUrl = await resizeImageForApi(originalDataUrl, { maxWidth: 800, quality: 0.7 });
 * ```
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Default configuration for image resizing
 * These values can be overridden per-call
 */
export const IMAGE_RESIZE_CONFIG = {
  // Maximum width in pixels (height scales proportionally)
  // Set to 0 or null to disable width-based resizing
  MAX_WIDTH: 800,

  // Maximum height in pixels (width scales proportionally)
  // Set to 0 or null to disable height-based resizing
  MAX_HEIGHT: 0,

  // Maximum size on longest dimension (width or height)
  // This takes precedence over MAX_WIDTH/MAX_HEIGHT if set
  // Set to 0 or null to use MAX_WIDTH/MAX_HEIGHT instead
  MAX_SIZE: 0,

  // JPEG quality (0.0 to 1.0)
  // Lower = smaller file, worse quality
  // 0.8 is a good balance for most use cases
  QUALITY: 0.85,

  // Output format
  // 'image/jpeg' - smaller file size, lossy compression
  // 'image/png' - larger file, lossless (good for text/screenshots)
  // 'image/webp' - smallest file, good quality (not supported everywhere)
  OUTPUT_FORMAT: 'image/jpeg' as const,

  // Whether to enable resizing by default
  // Set to false to pass images through unchanged
  ENABLED: true,

  // Skip resize if image is already smaller than max dimensions
  SKIP_IF_SMALLER: true,

  // Log resize operations for debugging
  DEBUG: false,
} as const;

// =============================================================================
// TYPES
// =============================================================================

export interface ImageResizeOptions {
  /** Maximum width in pixels. Height scales proportionally. */
  maxWidth?: number;
  /** Maximum height in pixels. Width scales proportionally. */
  maxHeight?: number;
  /** Maximum size on longest dimension. Overrides maxWidth/maxHeight. */
  maxSize?: number;
  /** JPEG/WebP quality (0.0-1.0). Default: 0.85 */
  quality?: number;
  /** Output format. Default: 'image/jpeg' */
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
  /** Enable/disable resizing. Default: true */
  enabled?: boolean;
  /** Skip resize if already smaller. Default: true */
  skipIfSmaller?: boolean;
  /** Log debug info. Default: false */
  debug?: boolean;
}

export interface ImageResizeResult {
  /** Resized image as data URL */
  dataUrl: string;
  /** Base64 string (without data URL prefix) */
  base64: string;
  /** Original dimensions */
  originalWidth: number;
  originalHeight: number;
  /** New dimensions */
  width: number;
  height: number;
  /** Whether resize was performed */
  wasResized: boolean;
  /** Approximate size reduction percentage */
  sizeReduction?: number;
}

// =============================================================================
// CORE FUNCTIONS
// =============================================================================

/**
 * Load an image from a data URL or URL
 */
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error(`Failed to load image: ${err}`));
    img.src = src;
  });
};

/**
 * Calculate new dimensions while maintaining aspect ratio
 */
const calculateDimensions = (
  originalWidth: number,
  originalHeight: number,
  options: ImageResizeOptions
): { width: number; height: number; shouldResize: boolean } => {
  const maxWidth = options.maxWidth || IMAGE_RESIZE_CONFIG.MAX_WIDTH;
  const maxHeight = options.maxHeight || IMAGE_RESIZE_CONFIG.MAX_HEIGHT;
  const maxSize = options.maxSize || IMAGE_RESIZE_CONFIG.MAX_SIZE;
  const skipIfSmaller = options.skipIfSmaller ?? IMAGE_RESIZE_CONFIG.SKIP_IF_SMALLER;

  let targetWidth = originalWidth;
  let targetHeight = originalHeight;
  let shouldResize = false;

  // Use maxSize if specified (applies to longest dimension)
  if (maxSize && maxSize > 0) {
    if (originalWidth > maxSize || originalHeight > maxSize) {
      if (originalWidth >= originalHeight) {
        // Width is longest
        targetWidth = maxSize;
        targetHeight = Math.round((originalHeight / originalWidth) * maxSize);
      } else {
        // Height is longest
        targetHeight = maxSize;
        targetWidth = Math.round((originalWidth / originalHeight) * maxSize);
      }
      shouldResize = true;
    }
  } else {
    // Use maxWidth/maxHeight separately
    if (maxWidth && maxWidth > 0 && originalWidth > maxWidth) {
      const ratio = maxWidth / originalWidth;
      targetWidth = maxWidth;
      targetHeight = Math.round(originalHeight * ratio);
      shouldResize = true;
    }

    if (maxHeight && maxHeight > 0 && targetHeight > maxHeight) {
      const ratio = maxHeight / targetHeight;
      targetHeight = maxHeight;
      targetWidth = Math.round(targetWidth * ratio);
      shouldResize = true;
    }
  }

  // Skip if already smaller and option is enabled
  if (skipIfSmaller && !shouldResize) {
    return { width: originalWidth, height: originalHeight, shouldResize: false };
  }

  return { width: targetWidth, height: targetHeight, shouldResize };
};

/**
 * Resize an image using canvas
 */
const resizeWithCanvas = (
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number,
  format: string,
  quality: number
): { dataUrl: string; base64: string } => {
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Use better quality interpolation
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Draw the resized image
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // Convert to data URL
  const dataUrl = canvas.toDataURL(format, quality);
  const base64 = dataUrl.split(',')[1] || '';

  return { dataUrl, base64 };
};

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Resize an image for API submission
 *
 * This function takes an image (as base64 data URL) and resizes it
 * according to the provided options or defaults.
 *
 * @param imageDataUrl - The image as a data URL (e.g., "data:image/jpeg;base64,...")
 * @param options - Resize options (optional)
 * @returns Promise with resized image data URL
 *
 * @example
 * // Basic usage with default 800px max width
 * const resized = await resizeImageForApi(originalImage);
 *
 * @example
 * // Custom max width
 * const resized = await resizeImageForApi(originalImage, { maxWidth: 1024 });
 *
 * @example
 * // Max size on longest dimension (good for square/portrait images)
 * const resized = await resizeImageForApi(originalImage, { maxSize: 800 });
 */
export const resizeImageForApi = async (
  imageDataUrl: string,
  options: ImageResizeOptions = {}
): Promise<string> => {
  const result = await resizeImage(imageDataUrl, options);
  return result.dataUrl;
};

/**
 * Resize an image with detailed result information
 *
 * @param imageDataUrl - The image as a data URL
 * @param options - Resize options
 * @returns Promise with detailed resize result
 */
export const resizeImage = async (
  imageDataUrl: string,
  options: ImageResizeOptions = {}
): Promise<ImageResizeResult> => {
  const enabled = options.enabled ?? IMAGE_RESIZE_CONFIG.ENABLED;
  const debug = options.debug ?? IMAGE_RESIZE_CONFIG.DEBUG;
  const quality = options.quality ?? IMAGE_RESIZE_CONFIG.QUALITY;
  const format = options.format ?? IMAGE_RESIZE_CONFIG.OUTPUT_FORMAT;

  if (debug) {
    console.log('[imageResizeUtils] Starting resize with options:', options);
  }

  // If disabled, return original
  if (!enabled) {
    if (debug) {
      console.log('[imageResizeUtils] Resizing disabled, returning original');
    }
    const base64 = imageDataUrl.split(',')[1] || '';
    return {
      dataUrl: imageDataUrl,
      base64,
      originalWidth: 0,
      originalHeight: 0,
      width: 0,
      height: 0,
      wasResized: false,
    };
  }

  // Validate input
  if (!imageDataUrl || !imageDataUrl.startsWith('data:image')) {
    throw new Error('Invalid image data URL');
  }

  try {
    // Load the image
    const img = await loadImage(imageDataUrl);
    const originalWidth = img.naturalWidth || img.width;
    const originalHeight = img.naturalHeight || img.height;

    if (debug) {
      console.log('[imageResizeUtils] Original dimensions:', originalWidth, 'x', originalHeight);
    }

    // Calculate target dimensions
    const { width, height, shouldResize } = calculateDimensions(
      originalWidth,
      originalHeight,
      options
    );

    if (debug) {
      console.log('[imageResizeUtils] Target dimensions:', width, 'x', height, 'shouldResize:', shouldResize);
    }

    // Skip if no resize needed
    if (!shouldResize) {
      if (debug) {
        console.log('[imageResizeUtils] No resize needed, returning original');
      }
      const base64 = imageDataUrl.split(',')[1] || '';
      return {
        dataUrl: imageDataUrl,
        base64,
        originalWidth,
        originalHeight,
        width: originalWidth,
        height: originalHeight,
        wasResized: false,
      };
    }

    // Perform resize
    const { dataUrl, base64 } = resizeWithCanvas(img, width, height, format, quality);

    // Calculate size reduction
    const originalSize = imageDataUrl.length;
    const newSize = dataUrl.length;
    const sizeReduction = Math.round((1 - newSize / originalSize) * 100);

    if (debug) {
      console.log('[imageResizeUtils] Resize complete:', {
        originalDimensions: `${originalWidth}x${originalHeight}`,
        newDimensions: `${width}x${height}`,
        originalSize: `${Math.round(originalSize / 1024)}KB`,
        newSize: `${Math.round(newSize / 1024)}KB`,
        sizeReduction: `${sizeReduction}%`,
      });
    }

    return {
      dataUrl,
      base64,
      originalWidth,
      originalHeight,
      width,
      height,
      wasResized: true,
      sizeReduction,
    };
  } catch (error) {
    console.error('[imageResizeUtils] Resize failed:', error);
    // Return original on error
    const base64 = imageDataUrl.split(',')[1] || '';
    return {
      dataUrl: imageDataUrl,
      base64,
      originalWidth: 0,
      originalHeight: 0,
      width: 0,
      height: 0,
      wasResized: false,
    };
  }
};

/**
 * Get current resize configuration
 * Useful for displaying current settings in UI
 */
export const getResizeConfig = (): typeof IMAGE_RESIZE_CONFIG => {
  return { ...IMAGE_RESIZE_CONFIG };
};

/**
 * Quick helper to check if an image needs resizing
 * based on current configuration
 */
export const needsResize = async (imageDataUrl: string): Promise<boolean> => {
  if (!IMAGE_RESIZE_CONFIG.ENABLED) {
    return false;
  }

  try {
    const img = await loadImage(imageDataUrl);
    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;

    const { shouldResize } = calculateDimensions(width, height, {});
    return shouldResize;
  } catch {
    return false;
  }
};

export default {
  resizeImageForApi,
  resizeImage,
  getResizeConfig,
  needsResize,
  IMAGE_RESIZE_CONFIG,
};
