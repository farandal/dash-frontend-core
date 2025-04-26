import useLocalStorage from '../../hooks/useLocalStorage';
import { IGetAuth } from '../../interfaces/user/IGetAuth';
import { IGetAuthUser } from '../../interfaces/user/IUser';
import React, {
  FC,
  PropsWithChildren,
  useContext,
  useState,
  useEffect
} from 'react';

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

export const AuthContextLocalStorage = React.createContext<IAuthContext>(null);

export interface IAuthContextProvider extends PropsWithChildren {
  values?: Partial<IAuthContextProps>;
}

export const AuthContextProvider: FC<IAuthContextProvider> = (props) => {
  const { children, values } = props;

  // Use a regular state for the context values
  const [contextValues, setContextValues] = useState<Partial<IAuthContextProps>>(
    values || defaultValues
  );

  // Use localStorage for persistence, but handle serialization/deserialization properly
  const [serializedValues, setSerializedValues] = useLocalStorage(
    'SerializedAuthContext',
    JSON.stringify(values || defaultValues),
  );

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      const parsedValues = typeof serializedValues === 'string'
        ? JSON.parse(serializedValues)
        : serializedValues;

      setContextValues(parsedValues || defaultValues);
    } catch (error) {
      console.error('Error parsing auth context from localStorage:', error);
      setContextValues(defaultValues);
    }
  }, []);

  // Update function that updates both state and localStorage
  const updateValues = (newValues: Partial<IAuthContextProps>) => {
    setContextValues(prevValues => {
      const updatedValues = { ...prevValues, ...newValues };

      // Update localStorage with serialized values
      setSerializedValues(JSON.stringify(updatedValues));

      return updatedValues;
    });
  };

  return (
    <AuthContextLocalStorage.Provider value={{ ...contextValues, updateValues }}>
      {children}
    </AuthContextLocalStorage.Provider>
  );
};

export const AuthContextConsumer = AuthContextLocalStorage.Consumer;

export const useAuthContext = () => {
  const authContext: IAuthContext = useContext(AuthContextLocalStorage);
  return authContext;
};

export const getAuthContext = () => {
  try {
    const serialized = localStorage.getItem('SerializedAuthContext');
    return serialized ? JSON.parse(serialized) as Partial<IAuthContextProps> : defaultValues;
  } catch (error) {
    console.error('Error getting auth context:', error);
    return defaultValues;
  }
};

export const updateAuthContext = (values: Partial<IAuthContextProps>) => {
  try {
    const prevState = getAuthContext();
    const updatedState = { ...prevState, ...values };

    localStorage.setItem(
      'SerializedAuthContext',
      JSON.stringify(updatedState),
    );

    return updatedState;
  } catch (error) {
    console.error('Error updating auth context:', error);
    return values;
  }
};

export const setAuthContext = (values: Partial<IAuthContextProps>) => {
  try {
    // deprectate serialized ...
    localStorage.setItem('SerializedAuthContext', JSON.stringify(values));

    localStorage.setItem('roles', JSON.stringify(values.user.roles));
    localStorage.setItem('authenticated', 'true');
    localStorage.setItem('user', JSON.stringify(values.user));

    return values;
  } catch (error) {
    console.error('Error setting auth context:', error);
    return values;
  }
};

export default AuthContextLocalStorage