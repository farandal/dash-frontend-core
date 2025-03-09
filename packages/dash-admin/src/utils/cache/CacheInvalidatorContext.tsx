
import React, {
	FC,
	PropsWithChildren,
	useContext,
	useEffect
} from 'react';
import useLocalStorage from 'dash-admin/src/hooks/useLocalStorage';

const currentTimestamp = ():string => {
	const currentdate = new Date(); 
	const datetime = currentdate.getFullYear() + ""
                    + (currentdate.getMonth()+1) + "" 
                    + currentdate.getDate() + ""  
                    + currentdate.getHours() + ""  
                    + currentdate.getMinutes() + "" 
                    + currentdate.getSeconds();

										return datetime;
}

export class CacheInvalidatorContextClass {
	static values: Partial<ICacheInvalidatorContextProps>;
}

export interface ICacheInvalidatorStore {
  [x:string]: string
}

export interface ICacheInvalidatorContextProps {
	cacheInvalidatorStore: ICacheInvalidatorStore;
}

export interface ICacheInvalidatorContext extends Partial<ICacheInvalidatorContextProps> {
	updateEntry: (entry: string) => void;
  //removeEntry: (entry: string) => void;
}

const defaultValues: ICacheInvalidatorContextProps = {
	cacheInvalidatorStore: {},
};

export const CacheInvalidatorContext = React.createContext<ICacheInvalidatorContext>(null);

export interface ICacheInvalidatorContextProvider extends PropsWithChildren {
	values?: Partial<ICacheInvalidatorContextProps>;
}
export const CacheInvalidatorContextProvider: FC<ICacheInvalidatorContextProvider> = (props) => {
	const { children, values } = props;

	const initialValue = JSON.stringify(values || defaultValues);
	
	const [currentValues, setCurrentValues] = useLocalStorage(
		'SerializedCacheInvalidatorContext',
		initialValue,
	);

	const updateEntry = (entry: string) => {
		setCurrentValues((state) => {

			//const _state:ICacheInvalidatorContextProps = JSON.parse(state);
			const _state:ICacheInvalidatorContextProps = typeof state === "string" ? JSON.parse(state) : state;
			_state.cacheInvalidatorStore = !!_state.cacheInvalidatorStore ? {..._state.cacheInvalidatorStore, ...{[entry]: currentTimestamp() }} : {[entry]: currentTimestamp() }
			return _state;
		});
	};
	// Deuda Técnica: Tch debt: el currentValues no se propaga con el useEffect. es posible accederlo por el localstorage cuando es requerido
	// sin embargo, cuando se actualiza el currentValue no se puede acceder a él por useState, posiblemente por memoización, no ocurre el re-render. 
	// Bug minor - No afecta la característica.
	return (
		<CacheInvalidatorContext.Provider value={{ ...currentValues, updateEntry }}>
			{children}
		</CacheInvalidatorContext.Provider>
	);
  
};

export const CacheInvalidatorContextConsumer = CacheInvalidatorContext.Consumer;

export const useCacheInvalidatorContext = () => {
	const cacheInvalidatorContext: ICacheInvalidatorContext = useContext(CacheInvalidatorContext);
	return cacheInvalidatorContext;
};

export const getCacheInvalidatorContext = () => {
	const response = JSON.parse(
		localStorage.getItem('SerializedCacheInvalidatorContext')
	) as ICacheInvalidatorContextProps;

	return response;
};

function findKeysWithStringValue(obj, searchString) {
	return Object.keys(obj).filter(key => {
		 return searchString.includes(key);
	});
 }

export const cacheInvalidatorHash = (resource:string): string | null => {

	const store = getCacheInvalidatorContext();
	if(!store) return null;

	const find =  findKeysWithStringValue(store.cacheInvalidatorStore, resource);

	if(!find) return null;
	return store.cacheInvalidatorStore[find[0]]
	
}

export const updateCacheInvalidatorContext = (values: Partial<ICacheInvalidatorContextProps>) => {
	const prevState = getCacheInvalidatorContext();

	localStorage.setItem(
		'SerializedCacheInvalidatorContext',
		JSON.stringify({ ...prevState, ...values }),
	);
};

export const setCacheInvalidatorContext = (values: Partial<ICacheInvalidatorContextProps>) => {
	localStorage.setItem('SerializedCacheInvalidatorContext', JSON.stringify(values));
};

export default CacheInvalidatorContext;
