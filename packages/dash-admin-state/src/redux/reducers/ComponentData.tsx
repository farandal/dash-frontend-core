import IComponentDataState from '../interfaces/IComponentData';
import {
  ComponentDataActionTypes,
  SET_COMPONENT_DATA,
  CLEAR_COMPONENT_DATA,
  REMOVE_COMPONENT_DATA_KEY,
  MERGE_COMPONENT_DATA
} from '../actions/ComponentData';

const INITIAL_STATE: IComponentDataState = {};

const ComponentDataReducer = (
  state: IComponentDataState = INITIAL_STATE,
  action: ComponentDataActionTypes
): IComponentDataState => {
  switch (action.type) {
    case SET_COMPONENT_DATA:
      return {
        ...state,
        [action.payload.key]: {
          ...action.payload.data,
          _timestamp: Date.now(), // Add automatic timestamp
          _version: '1.0' // Add version for cache invalidation
        }
      };

    case MERGE_COMPONENT_DATA:
      const existingData = state[action.payload.key] || {};
      return {
        ...state,
        [action.payload.key]: {
          ...existingData,
          ...action.payload.data,
          _timestamp: Date.now(),
          _version: existingData._version || '1.0'
        }
      };

    case REMOVE_COMPONENT_DATA_KEY:
      const newState = { ...state };
      delete newState[action.payload.key];
      return newState;

    case CLEAR_COMPONENT_DATA:
      return INITIAL_STATE;

    default:
      return state;
  }
};

export default ComponentDataReducer;
