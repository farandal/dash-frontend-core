import IAuthState from "../interfaces/IAuthState";

export const ACTION_UPDATE_AUTH = 'UPDATE_AUTH';

const AuthReducer = (state: IAuthState<any, any> = {
  authenticated: false,
  user: undefined,
  auth: undefined
}, action) => {
  switch (action.type) {
    case ACTION_UPDATE_AUTH:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};
export default AuthReducer;
