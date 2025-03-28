import useLocalStorage from '../../hooks/useLocalStorage';
import { IGetAuth } from '../../interfaces/user/IGetAuth';
import { IGetAuthUer } from '../../interfaces/user/IUser';
import React, {
  FC,
  PropsWithChildren,
  useContext
} from 'react';

export class AuthContextClass {
  static values: Partial<IAuthContextProps>;
}

export interface IAuthContextProps {
  authenticated: boolean;
  user: IGetAuthUer;
  auth: IGetAuth;
}

export interface IAuthContext extends Partial<IAuthContextProps> {
  updateValues: (values: Partial<IAuthContextProps>) => void;
}

//const notImplemented = () => {};
/** The AuthContext, is a higher level abstraction of the application to hold the user state */

const defaultValues: IAuthContextProps = {
  authenticated: false,
  user: null,
  auth: null,
};

export const AuthContext = React.createContext<IAuthContext>(null);

export interface IAuthContextProvider extends PropsWithChildren {
  values?: Partial<IAuthContextProps>;
}
export const AuthContextProvider: FC<IAuthContextProvider> = (props) => {
  const { children, values } = props;

  const [currentValues, setCurrentValues] = useLocalStorage(
    'SerializedAuthContext',
    JSON.stringify(values || defaultValues),
  );

  const updateValues = (values: Partial<IAuthContextProps>) => {
    setCurrentValues((state) => {
      return { ...state, ...values };
    });
  };
  return (
    <AuthContext.Provider value={{ ...currentValues, updateValues }}>
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
  return JSON.parse(
    localStorage.getItem('SerializedAuthContext'),
  ) as Partial<IAuthContextProps>;
};

export const updateAuthContext = (values: Partial<IAuthContextProps>) => {
  const prevState = getAuthContext();

  localStorage.setItem(
    'SerializedAuthContext',
    JSON.stringify({ ...prevState, ...values }),
  );
};

export const setAuthContext = (values: Partial<IAuthContextProps>) => {
  localStorage.setItem('SerializedAuthContext', JSON.stringify(values));
};

export default AuthContext;
