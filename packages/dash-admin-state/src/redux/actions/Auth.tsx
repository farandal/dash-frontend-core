import IAuthState from '../interfaces/IAuthState';

export function updateAuth(type:any,auth: Partial<IAuthState<any, any>>) {
  return { type: type, payload: auth };
}
