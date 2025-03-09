
import { useEffect, useState } from 'react';
//import queryString from 'query-string';
import { useStore } from 'react-admin';
import useAxios from './useAxios';

export interface IUseAxiosGetWithStore {
	method?: string;
	url: string;
	payload?: any;
	storeKey: string;
	dataPath?: string;
}

const resolveObjectPath = (object, path, defaultValue) =>
	path.split('.').reduce((o, p) => (o ? o[p] : defaultValue), object);

const useAxiosGetWithStore = (options: IUseAxiosGetWithStore) => {
	const {
		/*method = 'GET',
		url,
		payload = null,*/
		storeKey,
		dataPath = 'data',
	} = options;
	const axios = useAxios();

	const [error, setError] = useState(null);
	const [loaded, setLoaded] = useState(false);

	const [results, setResults] = useStore(storeKey, null);

	const request = async (ops: IUseAxiosGetWithStore) => {
		//const payload = queryString.stringify(ops.payload, { arrayFormat: 'bracket' });

		try {
			//console.log('useAxiosGetWithStore performing query:', ops);
			const response = await axios({
				method: ops.method,
				url: `${ops.url}${ops.payload ? '?' + ops.payload : ''}`,
			});

			if (response.status >= 200 || response.status < 300) {
				setResults(resolveObjectPath(response, dataPath, null));
			}
		} catch (e:any) {
			setError(e);
		} finally {
			setLoaded(true);
		}
	};

	useEffect(() => {
		//console.log('useAxiosGetWithStore results:', results);
		if (!results) {
			//console.log('Therefore, performing request');
			request(options);
		} else {
			//console.log('returning stored results');
		}
	}, []);

	return { request, results, error, loaded };
};

export default useAxiosGetWithStore;
