import defaultFormState from '../../defaults/defaultFormState';
import { CLEAR_FORM_DATA, SET_FORM_DATA } from '../actions/ActionTypes';
import IFormDataState from '../interfaces/IFormDataState';
const FormDataReducer = (
	state: IFormDataState = defaultFormState,
	action,
) => {
  switch (action.type) {
      case SET_FORM_DATA:
          return {
              ...state,
              ...action.payload
          };
      case CLEAR_FORM_DATA:
          return defaultFormState
      default:
          return state;
  }
};

export default FormDataReducer;
