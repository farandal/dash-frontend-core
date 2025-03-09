import { useAxios } from 'dash-axios-hook';
import {  useEffect, useState } from 'react';
import queryString from 'query-string';
import { useStore } from 'react-admin';

export interface IUsePackageStats {
	autoRefresh: boolean;
	autoRefreshInterval?: number;
	start?: string;
	end?: string;
}

const usePackageStats = (options: IUsePackageStats) => {
	const { autoRefresh } = options;
	const axios = useAxios();
	const [data, setData] = useStore('dashboard.stats.data', null);
	const [error, setError] = useState(null);
	const [loaded, setLoaded] = useState(false);

	const loadPackageStats = async (o:any) => {
		const payload = queryString.stringify(
			{
				...(o.start && { start: o.start }),
				...(o.end && { end: o.end }),
			},
			{ arrayFormat: 'bracket' },
		);

		//console.log("loadDashboardStats",options.autoRefresh)
		if (options.autoRefresh) {
			try {
				const response = await axios({
					method: 'GET',
					url: `/admin/dashboard?${payload}`,
				});

				if (response.status === 200) {
					setData(response.data);
				}
			} catch (e) {
				setError(e);
			} finally {
				setLoaded(true);
			}
		}
	};

	useEffect(() => {
		//console.log("Firt Dashboard Stats Loads "+autoRefresh);
		loadPackageStats({ ...options, autoRefresh: true });
		const intervalId = setInterval(() => {
			//console.log("Refreshing Dashboard Stats "+autoRefresh)
			loadPackageStats(options);
		}, 10000);

		return () => {
			//console.log("clearInterval");
			clearInterval(intervalId);
		};
	}, [autoRefresh]);

	const refresh = () => {
		loadPackageStats({ ...options, autoRefresh: true });
	};

	return { data, error, loaded, refresh };
};

export default usePackageStats;
