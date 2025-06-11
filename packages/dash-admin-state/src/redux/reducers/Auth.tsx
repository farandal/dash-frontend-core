import IAuthState from "../interfaces/IAuthState";

export const ACTION_UPDATE_AUTH = 'ACTION_UPDATE_AUTH';
export const ACTION_UPDATE_AUTH_AUTH = 'ACTION_UPDATE_AUTH_AUTH';
export const ACTION_UPDATE_AUTH_USER = 'ACTION_UPDATE_AUTH_USER';
export const ACTION_UPDATE_AUTH_AUTHENTICATED = 'ACTION_UPDATE_AUTH_AUTHENTICATED';

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
     case ACTION_UPDATE_AUTH_AUTH:
      return {
        ...state,
        auth: action.payload.auth,
      };
    case ACTION_UPDATE_AUTH_USER:
      return {
        ...state,
        user: action.payload.user,
      };
    case ACTION_UPDATE_AUTH_AUTHENTICATED:
      return {
        ...state,
        authenticated: action.payload.authenticated,
      };
    default:
      return state;
  }
};
export default AuthReducer;
