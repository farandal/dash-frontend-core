import { useCallback, useEffect, useState, useMemo } from 'react';
import { dashStorage } from 'dash-utils';
const isBrowser = typeof window !== 'undefined';

const isLocalStorageAvailable = () => {
  if (!isBrowser) {
    return false;
  }
  const test = `test-${Date.now()}`;
  try {
    dashStorage.setItem(test, test);
    dashStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

const useLocalStorage = (key, initialValue = '') => {
  const available = isLocalStorageAvailable();
  const getValueFromLocalStorage = useCallback(() => {
    try {
      if (!available) {
        return initialValue;
      }
      const item = dashStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  }, [available, initialValue, key]);

  const _initialValue = getValueFromLocalStorage();

  const [storedValue, setStoredValue] = useState(_initialValue);

  useEffect(() => {
    if (available) {
      const value = getValueFromLocalStorage();
      // This should not be necessary, though wwhen local storage available, get the value from localstorage and set to state. 
      setStoredValue(value);
    }
  }, [available]);

  // Listen to localStorage change to apply it
  const changeHandler = useCallback(
    (e) => {

      const { key: changeKey, newValue } = e;
      if (key === changeKey) {

        setStoredValue(JSON.parse(newValue));
      }
    },
    [key],
  );

  // Listen changes
  useEffect(() => {
    if (available) {
      window.addEventListener('storage', changeHandler);
      return () => {
        window.removeEventListener('storage', changeHandler);
      };
    }
  }, [available]); // eslint-disable-line react-hooks/exhaustive-deps

  const setValue = (value) => {
    if (!available) {
      return false;
    }

    const valueToStore =
      value instanceof Function ? value(storedValue) : value;
    //if (valueToStore !== storedValue) {

    dashStorage.setItem(key, JSON.stringify(valueToStore));

    setStoredValue(valueToStore);
    //}
  };
  // Build the output
  /*return useMemo(() => {
    const _storedValue = getValueFromLocalStorage();
    return [storedValue, setValue];
  }, [storedValue, key]);*/
  return [storedValue, setValue];
};

export default useLocalStorage;



/*
import { useCallback, useEffect, useState } from 'react';

function useLocalStorage<T = any>(
  key: string,
  initialValue?: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // Check if we're running in a browser environment
  const isBrowser = typeof window !== 'undefined';

  // Function to safely parse JSON from localStorage
  const getStoredValue = useCallback((): T => {
    if (!isBrowser) {
      return initialValue as T;
    }

    try {
      const item = dashStorage.getItem(key);

      // Return parsed JSON or initialValue if no item exists
      if (!item) {
        return initialValue as T;
      }

      try {
        return JSON.parse(item);
      } catch (parseError) {
        console.error(`Error parsing localStorage key "${key}":`, parseError);
        return initialValue as T;
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue as T;
    }
  }, [key, initialValue, isBrowser]);

  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(getStoredValue());

  // Function to update localStorage and state
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    if (!isBrowser) {
      console.warn(`Cannot set localStorage key "${key}" - not in browser environment`);
      return;
    }

    try {
      // Allow value to be a function for setState-like updates
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      // Save to state
      setStoredValue(valueToStore);

      // Save to localStorage
      dashStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue, isBrowser]);

  // Function to remove the item from localStorage
  const removeValue = useCallback(() => {
    if (!isBrowser) {
      return;
    }

    try {
      dashStorage.removeItem(key);
      setStoredValue(initialValue as T);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue, isBrowser]);

  // Listen for changes to this localStorage key in other tabs/windows
  useEffect(() => {
    if (!isBrowser) {
      return;
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== JSON.stringify(storedValue)) {
        try {
          const newValue = event.newValue ? JSON.parse(event.newValue) : initialValue;
          setStoredValue(newValue as T);
        } catch (error) {
          console.error(`Error parsing storage event value for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue, storedValue, isBrowser]);

  return [storedValue, setValue, removeValue];
}

export default useLocalStorage;
*/
