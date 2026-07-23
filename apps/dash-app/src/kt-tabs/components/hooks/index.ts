/**
 * kt-tabs Hooks Index
 */


export { useAudioRecorder } from './useAudioRecorder';
export { default as useDraggableCarousel } from './useDraggableCarousel';
export { useImageAgent } from './useImageAgent';
export { useImageCapture } from './useImageCapture';
export { useProductsCache, useTabCache } from './useProductsCache';
export { useTabActions } from './useTabActions';

// Image resize utilities
export {
  resizeImageForApi,
  resizeImage,
  getResizeConfig,
  needsResize,
  IMAGE_RESIZE_CONFIG,
  type ImageResizeOptions,
  type ImageResizeResult,
} from './imageResizeUtils';
