/**
 * kt-mall/contexts - Contexts chunk
 *
 * Lazy-loaded contexts for better bundle splitting
 */

// Contexts - Bridge context for WebSocket events
export {
    MallEchoBridgeContext,
    MallEchoBridgeProvider,
    useMallEchoBridge,
    type IMallEchoBridgeContext,
} from './contexts/MallEchoBridgeContext';