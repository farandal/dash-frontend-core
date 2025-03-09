import { useCallback, useEffect, useState, useMemo } from 'react';

const isBrowser = typeof window !== 'undefined';

const isLocalStorageAvailable = () => {
	if (!isBrowser) {
		return false;
	}
	const test = `test-${Date.now()}`;
	try {
		localStorage.setItem(test, test);
		localStorage.removeItem(test);
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
			const item = localStorage.getItem(key);
			return item ? JSON.parse(item) : initialValue;
		} catch (error) {
			return initialValue;
		}
	}, [available, initialValue, key]);

	const _initialValue = getValueFromLocalStorage();

	const [storedValue, setStoredValue] = useState(_initialValue);

	useEffect(() => {
		if(available) {
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
			
			localStorage.setItem(key, JSON.stringify(valueToStore));
		
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
