import { useAxios } from 'dash-axios-hook';
import { useEffect, useState } from 'react';
import queryString from 'query-string';
import { useStore } from 'react-admin';

export interface IUseDashboardStats {
	autoRefresh: boolean;
	autoRefreshInterval?: number;
	start?: string;
	end?: string;
}

const useDashboardStats = (options: IUseDashboardStats) => {
	const { autoRefresh } = options;
	const axios = useAxios();
	const [data, setData] = useStore('dashboard.stats.data', null);
	const [error, setError] = useState(null);
	const [loaded, setLoaded] = useState(false);

	const loadDashboardStats = async (o:any) => {
		const payload = queryString.stringify(
			{
				...(o.start && { start: o.start }),
				...(o.end && { end: o.end }),
			},
			{ arrayFormat: 'bracket' },
		);

		if (o.autoRefresh) {
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
		loadDashboardStats({ ...options, autoRefresh: true });
		const intervalId = setInterval(() => {
			loadDashboardStats(options);
		}, 10000);

		return () => {
			clearInterval(intervalId);
		};
	}, [autoRefresh]);

	const refresh = () => {
		loadDashboardStats({ ...options, autoRefresh: true });
	};

	return { data, error, loaded, refresh };
};

export default useDashboardStats;
