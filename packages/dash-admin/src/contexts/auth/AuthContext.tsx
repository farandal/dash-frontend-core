import { useSelector } from 'react-redux';
import { IGetAuth } from '../../interfaces/user/IGetAuth';
import { IGetAuthUser } from '../../interfaces/user/IUser';
import React, {
  FC,
  PropsWithChildren,
  useContext,
} from 'react';
import { IAuthState, IDASHAppState } from 'dash-admin-state';

export class AuthContextClass {
  static values: Partial<IAuthContextProps>;
}

export interface IAuthContextProps {
  authenticated: boolean;
  user: IGetAuthUser;
  auth: IGetAuth;
  token: string;
  roles: any;
}

export interface IAuthContext extends Partial<IAuthContextProps> {
  updateValues: (values: Partial<IAuthContextProps>) => void;
}

const defaultValues: IAuthContextProps = {
  authenticated: false,
  user: null,
  auth: null,
  token: null,
  roles: null
};

export const AuthContext = React.createContext<IAuthContext>(null);

export interface IAuthContextProvider extends PropsWithChildren {
  values?: Partial<IAuthContextProps>;
}

export const AuthContextProvider: FC<IAuthContextProvider> = (props) => {
  const { children } = props;
  const auth: IAuthState<any, any> = useSelector((state: IDASHAppState<any, any, any>) => state.auth);

  const contextValues: Partial<IAuthContextProps> = {
    authenticated: auth.authenticated,
    user: auth.user,
    auth: auth.auth,
    token: auth.user?.token,
    roles: auth.user?.roles
  };

  const updateValues = (newValues: Partial<IAuthContextProps>) => {
    // This should be handled by redux actions/reducers
    console.warn('updateValues is deprecated. Use redux actions instead.');
  };

  return (
    <AuthContext.Provider value={{ ...contextValues, updateValues }}>
      {children}
    </AuthContext.Provider>
  );
};

export const AuthContextConsumer = AuthContext.Consumer;

export const useAuthContext = () => {
  const authContext: IAuthContext = useContext(AuthContext);
  return authContext;
};

export const getAuthContext = () => {
  // This should be handled by redux selectors
  console.warn('getAuthContext is deprecated. Use redux selectors instead.');
  return defaultValues;
};

export const updateAuthContext = (values: Partial<IAuthContextProps>) => {
  // This should be handled by redux actions/reducers
  console.warn('updateAuthContext is deprecated. Use redux actions instead.');
  return values;
};

export const setAuthContext = (values: Partial<IAuthContextProps>) => {
  // This should be handled by redux actions/reducers
  console.warn('setAuthContext is deprecated. Use redux actions instead.');
  return values;
};

export default AuthContext;