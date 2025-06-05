// ComponentData Actions
export const SET_COMPONENT_DATA = 'SET_COMPONENT_DATA';
export const CLEAR_COMPONENT_DATA = 'CLEAR_COMPONENT_DATA';
export const REMOVE_COMPONENT_DATA_KEY = 'REMOVE_COMPONENT_DATA_KEY';
export const MERGE_COMPONENT_DATA = 'MERGE_COMPONENT_DATA';

export interface ISetComponentDataAction {
  type: typeof SET_COMPONENT_DATA;
  payload: {
    key: string;
    data: any;
  };
}

export interface IClearComponentDataAction {
  type: typeof CLEAR_COMPONENT_DATA;
}

export interface IRemoveComponentDataKeyAction {
  type: typeof REMOVE_COMPONENT_DATA_KEY;
  payload: {
    key: string;
  };
}

export interface IMergeComponentDataAction {
  type: typeof MERGE_COMPONENT_DATA;
  payload: {
    key: string;
    data: any;
  };
}

export type ComponentDataActionTypes =
  | ISetComponentDataAction
  | IClearComponentDataAction
  | IRemoveComponentDataKeyAction
  | IMergeComponentDataAction;

/**
 * Set component data for a specific key
 * @param key - The component key (e.g., 'tab.products.list')
 * @param data - The data to store
 */
export const setComponentData = (key: string, data: any) => ({
  type: SET_COMPONENT_DATA,
  payload: { key, data }
});

/**
 * Merge data with existing component data for a specific key
 * @param key - The component key
 * @param data - The data to merge
 */
export const mergeComponentData = (key: string, data: any): IMergeComponentDataAction => ({
  type: MERGE_COMPONENT_DATA,
  payload: { key, data }
});

/**
 * Remove a specific component data key
 * @param key - The component key to remove
 */
export const removeComponentDataKey = (key: string): IRemoveComponentDataKeyAction => ({
  type: REMOVE_COMPONENT_DATA_KEY,
  payload: { key }
});

/**
 * Clear all component data
 */
export const clearComponentData = (): IClearComponentDataAction => ({
  type: CLEAR_COMPONENT_DATA
});

// Convenience action creators for common patterns
export const setCustomData = setComponentData; // Alias for backward compatibility
export const clearCustomData = clearComponentData; // Alias for backward compatibility
