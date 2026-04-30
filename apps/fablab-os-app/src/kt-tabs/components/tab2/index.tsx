// Main components
export { default as OrderProductsList } from './components/OrderProductsList';
export { default as ProductListItem } from './components/ProductListItem';
export { default as OrderSummary } from './components/OrderSummary';
export { default as DiscountSection } from './components/DiscountSection';

// Hooks
export { useOrderManagement } from './hooks/useOrderManagement';
export { useVoiceActionHandlers } from './hooks/useVoiceActionHandlers';
export { useVoiceProcessing } from './hooks/useVoiceProcessing';

// Types
export type {
    ProductItem,
    OrderSummaryProps,
    ProductListItemProps,
    OrderProductsListProps,
    VoiceAction,
    OrderManagementHookReturn
} from './types';

// Utils
// Utils
export {
    calculateOrderTotal,
    calculateItemTotal,
    calculateServiceFee,
    calculateDiscountAmount,
    formatCurrency,
    generateLineId,
    createNewProduct,
    applyModifierSuggestions,
    PLACEHOLDER_IMAGE
} from './utils';