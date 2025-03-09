import { useEffect, useState } from 'react';
import queryString from 'query-string';
import { useStore } from 'react-admin';
import hashCode from '@app/utils/hasCode';
import { useAxios } from 'dash-axios-hook';

export interface IUseStats<T> {
	url: string;
	autoRefresh: boolean;
	autoRefreshInterval?: number;
	payload?: any;
	/** If not key present, it will create a store with the url or url+payload hash */
	storeKey?: string;
	onRefresh?: (data: T) => any;
}

export function useStats<T>(
	options: IUseStats<T>,
): [T, any, boolean, (ops?:Partial<IUseStats<T>>) => void] {
	//const { url, payload, autoRefresh, storeKey } = options;

	const [currentOption,setCurrentOptions] = useState(options);

	const axios = useAxios();
	const hash = currentOption.payload ? hashCode(currentOption.url+queryString.stringify(currentOption.payload, { arrayFormat: 'bracket' })).toString() : hashCode(currentOption.url).toString() 

	const [data, setData] = useStore(!currentOption.storeKey ? hash : currentOption.storeKey, null);
	const [error, setError] = useState(null);
	const [loaded, setLoaded] = useState(false);

	const loadDashboardStats = async () => {
	
		const _payload = currentOption.payload ? queryString.stringify(currentOption.payload || {}, { arrayFormat: 'bracket' }) : null
		const _url = _payload ? `${currentOption.url}?${_payload}` : `${currentOption.url}`;
		setLoaded(false);
		//if (currentOption.autoRefresh) {
			try {
				const response = await axios({
					method: 'GET',
					url: _url,
				});

				if (currentOption.onRefresh) { currentOption.onRefresh(response.data); }

				if (response.status === 200) {
					setData(response.data);
				}
			
			} catch (e) {
				setError(e);
			} finally {
				setLoaded(true);
			}
		//}
	};

	const[intervalId,setIntervalId] = useState(null);

	useEffect(() => {
		loadDashboardStats();
	},[]);

	useEffect(() => {
		//setCurrentOptions({ ...options, autoRefresh: true });
		//loadDashboardStats();
		const _intervalId = setInterval(() => {
			//setCurrentOptions(options);
			loadDashboardStats();
		}, currentOption.autoRefreshInterval || 60000);
		setIntervalId(_intervalId)
		return () => {
			clearInterval(_intervalId);
		};
	}, [currentOption]);

	const refresh = (ops?:Partial<IUseStats<T>>) => {
		if(intervalId) {
			clearInterval(intervalId);
			setIntervalId(null);
		}
		setCurrentOptions({ ...({...options,...ops} || options)});
		//loadDashboardStats();
	};

	return [data as T, error, loaded, refresh];
}
