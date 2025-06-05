export default interface IComponentDataState {
  [key: string]: any;
}

// Helper type for strongly typed component data access
export interface ITypedComponentData<T = any> {
  data: T;
  timestamp?: number;
  version?: string;
}

/*
// Common component data patterns
export interface ITabProductsData {
  products: any[];
  filters: Record<string, any>;
  pagination: {
    page: number;
    perPage: number;
    total: number;
  };
  lastFetch: number;
}

export interface ITabsListData {
  tabs: any[];
  selectedTabs: string[];
  statusFilter: string;
  sortOrder: 'asc' | 'desc';
  viewMode: 'grid' | 'list';
}
*/
