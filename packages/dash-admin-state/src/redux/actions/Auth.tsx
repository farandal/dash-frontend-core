import IAuthState from '../interfaces/IAuthState';
import { ACTION_UPDATE_AUTH } from '../reducers/Auth';

export function updateAuth(auth: Partial<IAuthState<any, any>>) {  
  return { type: ACTION_UPDATE_AUTH, payload: auth };
}