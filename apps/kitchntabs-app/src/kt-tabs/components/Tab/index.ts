/**
 * kt-tabs Tab Components Index
 */

// Context Providers
export { TabsContext } from './TabContext';

// Order Products Components
export { default as OrderProductsEdit } from './OrderProductsEdit';
export { default as OrderProductsEditRefactored } from './OrderProductsEditRefactored';
export { default as OrderProductsList } from './OrderProductsList';
export { default as OrderProductsMallFilters } from './OrderProductsMallFilters';
export { default as OrderProductsView, OrderProductsView as OrderProductsViewComponent } from './OrderProductsView';

// Product & Modifiers
export { default as ProductModifiers } from './ProductModifiers';
// CategoryCarousel - placeholder, file is empty
// export { default as CategoryCarousel } from './CategoryCarousel';

// Tab Components
export { default as TabListItem } from './TabListItem';
export { default as TabActionsButtons } from './TabActionsButtons';
export { default as TabAgentToolbar } from './TabAgentToolbar';
export { default as TabOrderProductsSelector } from './TabOrderProductsSelector';
export { default as ProductSearchBox } from './ProductSearchBox';
export { default as CategorySelector } from './CategorySelector';

// Order Views
export { default as EditOrder, CreateOrder } from './EditOrder';
export { default as ViewOrder } from './ViewOrder';
export { default as ViewMarketplaceDetail } from './ViewMarketplaceDetail';

// Type exports
export type { IOrderProducts } from './OrderProductsEditRefactored';
export type { IOrderProductsMallFilters } from './OrderProductsMallFilters';
export type { ITabAgentToolbarConfig, ITabAgentToolbar } from './TabAgentToolbar';
export type { ICategorySelectorConfig, ICategorySelectorProps } from './CategorySelector';
