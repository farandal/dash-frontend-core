import { useAxios } from 'dash-axios-hook';
import { useEffect, useState } from 'react';
export interface IDataPackagesByCommunes {
	totalPackages: number;
	totalCreatedPackages: number;
	totalLabelPrintedPackages: number;
	totalPreparedPackages: number;
	totalInWarehousePackages: number;
}

const usePackageByCommunesStats = (
	start = null,
	end = null,
) => {
	const axios = useAxios();

	const [data, setData] = useState<IDataPackagesByCommunes>(null);
	const [error, setError] = useState(null);
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		const loadDashboardStats = async () => {
			try {
				const response = await axios({
					method: 'GET',
					url: `/admin/dashboard/total-contadores-paquetes-por-comuna?start=${start}&end=${end}`,
				});

				if (response.status === 200) {
					setData(response.data);
				}
			} catch (e) {
				setError(e);
			} finally {
				setLoaded(true);
			}
		};
		loadDashboardStats();
	}, []);

	return { data, error, loaded };
};

export default usePackageByCommunesStats;
